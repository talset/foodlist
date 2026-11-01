"""
Generate icons using a local/self-hosted ComfyUI server.

Unlike generate_hf.py (HuggingFace) and generate_replicate.py (Replicate paid API),
this script talks to a ComfyUI instance you run yourself — no per-image cost, no quota.
It assembles a minimal SDXL text2img workflow, submits it over the ComfyUI HTTP +
WebSocket API, then applies the same post-processing as the other scripts
(rembg background removal + 128×128 transparent PNG for icons, 400×400 for recipe photos).

Install: pip install websocket-client requests pillow rembg tqdm

The ComfyUI server URL is resolved in this order:
  1. --url argument
  2. COMFYUI_URL environment variable
  3. interactive prompt (defaults to http://192.168.2.8:8188)

Usage:
  python generate_comfyui.py                                   # default theme, asks for URL
  python generate_comfyui.py --url http://192.168.2.8:8188     # explicit server
  COMFYUI_URL=http://192.168.2.8:8188 python generate_comfyui.py --theme kawaii
  python generate_comfyui.py --theme kawaii --family fromage
  python generate_comfyui.py --icon mms.png
  python generate_comfyui.py --checkpoint "sdxl\\realiste\\juggernautXL_ragnarok.safetensors"
  python generate_comfyui.py --list                            # list families (no server needed)
"""

import os
import sys
import time
import json
import uuid
from pathlib import Path
from io import BytesIO

import requests
import websocket  # websocket-client
from PIL import Image

from rembg import remove as _rembg_remove


def rembg_remove(data):
    """Run rembg with C-level stderr suppressed (onnxruntime CUDA warning on first call)."""
    devnull = os.open(os.devnull, os.O_WRONLY)
    saved = os.dup(2)
    os.dup2(devnull, 2)
    os.close(devnull)
    try:
        return _rembg_remove(data)
    finally:
        os.dup2(saved, 2)
        os.close(saved)
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent))
from _parse import (
    load_icons_for_args, build_parser, filter_icons, resolve_output_dir,
    infer_theme_from_spec, resolve_recipes_spec, resolve_recipes_output_dir,
    discover_themes, DEFAULT_THEME, ALL_THEME, STYLE,
)

# =========================
# CONFIG
# =========================

DEFAULT_URL = "http://192.168.2.8:8188"

# Default checkpoint: a neutral, high-quality realistic SDXL model.
# Override with --checkpoint. Must exist on the ComfyUI server
# (see GET /object_info/CheckpointLoaderSimple for the available list).
DEFAULT_CHECKPOINT = "sdxl\\realiste\\juggernautXL_ragnarok.safetensors"

# Per-theme checkpoint preferences. The kawaii theme looks best with an
# anime/manga SDXL model; realistic themes with a photo model. Each entry is a
# list of candidates tried in order — the first one present on the server wins,
# otherwise we fall back to DEFAULT_CHECKPOINT. An explicit --checkpoint always
# takes precedence over this mapping.
THEME_CHECKPOINTS = {
    "kawaii": [
        "sdxl\\manga\\albedobaseXL_v31Large.safetensors",
        "sdxl\\manga\\novaAnimeXL_ilV190.safetensors",
        "sdxl\\manga\\waiIllustriousSDXL_v170.safetensors",
    ],
}

# SDXL generation defaults — 1024×1024 gives rembg a clean subject to cut out.
GEN_SIZE = 1024
STEPS = 30
CFG = 7.0
SAMPLER = "dpmpp_2m"
SCHEDULER = "karras"

NEGATIVE = "watermark, signature, blurry, low quality, multiple objects, cropped, realistic human face, photorealistic face"

RETRIES = 3
JOB_TIMEOUT = 300  # seconds per image


def build_prompt(icon, style):
    return f"{icon['desc'].strip()}, {style}"


# =========================
# COMFYUI WORKFLOW
# =========================

def build_workflow(prompt, checkpoint, seed, size=GEN_SIZE):
    """Return a minimal SDXL text2img workflow in ComfyUI API (prompt) format."""
    return {
        "1": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": checkpoint},
            "_meta": {"title": "Load checkpoint"},
        },
        "2": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt, "clip": ["1", 1]},
            "_meta": {"title": "Positive"},
        },
        "3": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": NEGATIVE, "clip": ["1", 1]},
            "_meta": {"title": "Negative"},
        },
        "4": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": size, "height": size, "batch_size": 1},
            "_meta": {"title": "Latent"},
        },
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": STEPS,
                "cfg": CFG,
                "sampler_name": SAMPLER,
                "scheduler": SCHEDULER,
                "denoise": 1.0,
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["3", 0],
                "latent_image": ["4", 0],
            },
            "_meta": {"title": "Sampler"},
        },
        "6": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["5", 0], "vae": ["1", 2]},
            "_meta": {"title": "Decode"},
        },
        "7": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": "foodlist_icon", "images": ["6", 0]},
            "_meta": {"title": "Save"},
        },
    }


class ComfyClient:
    """Minimal ComfyUI client: submit a workflow, wait over WebSocket, fetch the image."""

    def __init__(self, url):
        self.url = url.rstrip("/")
        self.client_id = str(uuid.uuid4())
        self.ws_url = self._ws_url(self.url)

    @staticmethod
    def _ws_url(http_url):
        u = http_url.rstrip("/")
        if u.startswith("https://"):
            return "wss://" + u[8:]
        if u.startswith("http://"):
            return "ws://" + u[7:]
        return "ws://" + u

    def ping(self):
        """Raise if the server is not reachable."""
        requests.get(f"{self.url}/system_stats", timeout=8).raise_for_status()

    def available_checkpoints(self):
        r = requests.get(f"{self.url}/object_info/CheckpointLoaderSimple", timeout=15)
        r.raise_for_status()
        data = r.json()
        return data["CheckpointLoaderSimple"]["input"]["required"]["ckpt_name"][0]

    def generate(self, workflow, timeout=JOB_TIMEOUT):
        """Submit the workflow and return the raw PNG bytes of the first saved image."""
        ws = websocket.WebSocket()
        ws.connect(f"{self.ws_url}/ws?clientId={self.client_id}", timeout=15)
        ws.settimeout(timeout)
        try:
            resp = requests.post(
                f"{self.url}/prompt",
                json={"prompt": workflow, "client_id": self.client_id},
                timeout=30,
            )
            resp.raise_for_status()
            prompt_id = resp.json()["prompt_id"]

            # Wait for the "executing" message with node == None for our prompt.
            deadline = time.time() + timeout
            while time.time() < deadline:
                raw = ws.recv()
                if not isinstance(raw, str):
                    continue  # binary preview frame
                msg = json.loads(raw)
                mtype = msg.get("type")
                data = msg.get("data", {})
                if data.get("prompt_id") not in (None, prompt_id):
                    continue
                if mtype == "execution_error":
                    raise RuntimeError(data.get("exception_message", "execution error"))
                if mtype == "executing" and data.get("node") is None \
                        and data.get("prompt_id") == prompt_id:
                    break
                if mtype == "execution_success" and data.get("prompt_id") == prompt_id:
                    break
            else:
                raise TimeoutError("ComfyUI job timed out")

            return self._fetch_image(prompt_id)
        finally:
            try:
                ws.close()
            except Exception:
                pass

    def _fetch_image(self, prompt_id):
        """Pull the first output image from /history (retrying while it flushes)."""
        for _ in range(10):
            hist = requests.get(f"{self.url}/history/{prompt_id}", timeout=30).json()
            outputs = hist.get(prompt_id, {}).get("outputs", {})
            for node_output in outputs.values():
                for img in node_output.get("images", []):
                    params = {
                        "filename": img["filename"],
                        "subfolder": img.get("subfolder", ""),
                        "type": img.get("type", "output"),
                    }
                    r = requests.get(f"{self.url}/view", params=params, timeout=30)
                    r.raise_for_status()
                    return r.content
            time.sleep(0.6)
        raise RuntimeError("job finished but no image found in history")


# =========================
# IMAGE POST-PROCESSING
# =========================

def process_image(image_bytes, size=128, padding_ratio=0.10):
    """Remove background, center the subject with uniform padding, save as 128×128 transparent PNG."""
    transparent = rembg_remove(image_bytes)
    img = Image.open(BytesIO(transparent)).convert("RGBA")

    bbox = img.getchannel('A').getbbox()
    if bbox:
        img = img.crop(bbox)

    padding = int(size * padding_ratio)
    max_dim = size - 2 * padding
    img.thumbnail((max_dim, max_dim), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - img.width) // 2
    y = (size - img.height) // 2
    canvas.paste(img, (x, y), img)

    out = BytesIO()
    canvas.save(out, format="PNG")
    return out.getvalue()


def process_recipe_image(image_bytes, size=400):
    """Simple resize to size×size for recipe photos — no background removal."""
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize((size, size), Image.LANCZOS)
    out = BytesIO()
    img.save(out, format="PNG", optimize=True)
    return out.getvalue()


# =========================
# GENERATION
# =========================

def generate_icon(client, checkpoint, icon, output_dir, style, size=128):
    output_path = output_dir / icon["filename"]
    if output_path.exists():
        return "skip"

    prompt = build_prompt(icon, style)
    # Deterministic-ish seed derived from the filename, so re-runs reproduce.
    seed = abs(hash(icon["filename"])) % (2**31)

    for attempt in range(RETRIES):
        try:
            img_bytes = client.generate(build_workflow(prompt, checkpoint, seed))
            output_path.parent.mkdir(parents=True, exist_ok=True)
            processed = process_recipe_image(img_bytes, size=size) if size > 128 \
                else process_image(img_bytes, size=size)
            output_path.write_bytes(processed)
            return "ok"
        except Exception as e:
            print(f"\n❌ {icon['filename']} attempt {attempt+1}/{RETRIES}: {e}")
            time.sleep(3)

    return "fail"


# =========================
# SERVER URL / CHECKPOINT RESOLUTION
# =========================

def resolve_url(args):
    """Resolve the ComfyUI server URL: --url > COMFYUI_URL > interactive prompt."""
    if args.url:
        return args.url
    env = os.environ.get("COMFYUI_URL")
    if env:
        return env
    try:
        entered = input(f"ComfyUI server URL [{DEFAULT_URL}]: ").strip()
    except EOFError:
        entered = ""
    return entered or DEFAULT_URL


def resolve_checkpoint(client, requested, theme=None):
    """Pick the checkpoint to use.

    Priority:
      1. explicit `requested` (--checkpoint), if present on the server
      2. a theme-specific candidate from THEME_CHECKPOINTS (first one present)
      3. DEFAULT_CHECKPOINT
      4. first non-inpainting SDXL checkpoint, else the first available one
    """
    available = client.available_checkpoints()
    if requested:
        if requested in available:
            return requested
        print(f"⚠  Checkpoint '{requested}' not found on server.")
    # Theme-specific preference (e.g. anime model for kawaii)
    for candidate in THEME_CHECKPOINTS.get(theme, []):
        if candidate in available:
            return candidate
    if DEFAULT_CHECKPOINT in available:
        return DEFAULT_CHECKPOINT
    # Last resort: first non-inpainting SDXL checkpoint, else the very first one.
    for ck in available:
        low = ck.lower()
        if "sdxl" in low and "inpaint" not in low:
            print(f"→ Falling back to: {ck}")
            return ck
    if available:
        print(f"→ Falling back to: {available[0]}")
        return available[0]
    raise SystemExit("❌ No checkpoints available on the ComfyUI server.")


# =========================
# MAIN
# =========================

def run_theme(theme, args, client):
    saved = args.theme
    args.theme = theme
    output_dir = resolve_output_dir(theme)
    output_dir.mkdir(parents=True, exist_ok=True)
    icons, spec, style = load_icons_for_args(args)
    icons = filter_icons(icons, args)
    args.theme = saved

    checkpoint = resolve_checkpoint(client, args.checkpoint, theme)

    already = sum(1 for i in icons if (output_dir / i["filename"]).exists())
    todo = len(icons) - already
    print(f"\n🎨 Theme: {theme}  →  {output_dir}")
    print(f"📋 Spec: {spec}")
    print(f"🧠 Checkpoint: {checkpoint}")
    print(f"🧩 {len(icons)} icons selected — {already} already done, {todo} to generate")

    if todo == 0:
        print("Nothing to do.")
        return 0, already, 0

    to_generate = [i for i in icons if not (output_dir / i["filename"]).exists()]
    success = fail = 0
    for icon in tqdm(to_generate, desc=f"Generating ({theme})"):
        result = generate_icon(client, checkpoint, icon, output_dir, style)
        if result == "ok":
            success += 1
        else:
            fail += 1

    return success, already, fail


def main():
    parser = build_parser("Generate icons via a local/self-hosted ComfyUI server (free)")
    parser.add_argument(
        "--url", default=None, metavar="URL",
        help=f"ComfyUI server URL. Falls back to $COMFYUI_URL, then prompts (default {DEFAULT_URL}).",
    )
    parser.add_argument(
        "--checkpoint", default=None, metavar="NAME",
        help=f"Checkpoint name as listed by the server. Default: {DEFAULT_CHECKPOINT}",
    )
    args = parser.parse_args()

    # --list works offline, like the other scripts.
    if args.list:
        if args.theme == ALL_THEME:
            themes = discover_themes()
        else:
            themes = [args.theme]
        for theme in themes:
            print(f"\n{'='*40}\n🎨 Theme: {theme}\n{'='*40}")
            args.theme = theme
            icons, _, _ = load_icons_for_args(args)
            filter_icons(icons, args)
        return

    url = resolve_url(args)
    client = ComfyClient(url)
    try:
        client.ping()
    except Exception as e:
        raise SystemExit(f"❌ Cannot reach ComfyUI at {url}: {e}")
    print(f"🔌 Connected to ComfyUI at {url}")

    if args.recipes:
        from _parse import load_icons, resolve_recipes_spec as _rrs
        checkpoint = resolve_checkpoint(client, args.checkpoint)
        print(f"🧠 Checkpoint: {checkpoint}")
        spec = _rrs()
        output_dir = resolve_recipes_output_dir()
        output_dir.mkdir(parents=True, exist_ok=True)
        icons, style = load_icons(spec)
        icons = filter_icons(icons, args)

        already = sum(1 for i in icons if (output_dir / i["filename"]).exists())
        todo = len(icons) - already
        print(f"📸 Recipes  →  {output_dir}")
        print(f"📋 Spec: {spec}")
        print(f"🧩 {len(icons)} icons selected — {already} already done, {todo} to generate")
        if todo == 0:
            print("Nothing to do.")
            return

        to_generate = [i for i in icons if not (output_dir / i["filename"]).exists()]
        success = fail = 0
        for icon in tqdm(to_generate, desc="Generating"):
            result = generate_icon(client, checkpoint, icon, output_dir, style, size=400)
            if result == "ok":
                success += 1
            else:
                fail += 1
        print(f"\n✅ Done: {success} generated, {already} skipped, {fail} failed")
        if fail:
            print("Re-run to retry failed icons (existing ones are skipped).")
        return

    # Resolve theme list
    if args.theme == ALL_THEME:
        themes = discover_themes()
        print(f"🌐 Generating for all themes: {', '.join(themes)}")
    else:
        if args.spec and args.theme == DEFAULT_THEME:
            args.theme = infer_theme_from_spec(args.spec) or args.theme
        themes = [args.theme]

    total_success = total_already = total_fail = 0
    for theme in themes:
        s, a, f = run_theme(theme, args, client)
        total_success += s
        total_already += a
        total_fail += f

    if len(themes) > 1:
        print(f"\n{'='*40}")
        print(f"✅ All themes done: {total_success} generated, {total_already} skipped, {total_fail} failed")
        if total_fail:
            print("Re-run to retry failed icons (existing ones are skipped).")


if __name__ == "__main__":
    main()
