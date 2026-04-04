"""
Generate icons using HuggingFace InferenceClient (FLUX.1-schnell)
Free tier: ~100-200 requests/day with a free HF account.
Get your token at https://huggingface.co/settings/tokens

Install: pip install huggingface_hub pillow rembg tqdm

Usage:
  HF_TOKEN=hf_xxx python generate_hf.py                          # default theme (icons-detailed.md → uploads/icons/default/)
  HF_TOKEN=hf_xxx python generate_hf.py --theme kawaii            # kawaii theme (icons-kawaii.md → uploads/icons/kawaii/)
  HF_TOKEN=hf_xxx python generate_hf.py --theme kawaii --family fromage
  HF_TOKEN=hf_xxx python generate_hf.py --theme kawaii --icon fromage-rond.png
  HF_TOKEN=hf_xxx python generate_hf.py --spec my-spec.md         # explicit spec file override
  python generate_hf.py --list                                    # list families (no token needed)
  python generate_hf.py --theme kawaii --list                     # list families in kawaii spec
"""

import os
import sys
import time
from pathlib import Path
from io import BytesIO

from huggingface_hub import InferenceClient
from PIL import Image
from rembg import remove as rembg_remove
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent))
from _parse import load_icons_for_args, build_parser, filter_icons, resolve_output_dir, STYLE

# =========================
# CONFIG
# =========================

HF_TOKEN = os.environ.get("HF_TOKEN")
MODEL = "black-forest-labs/FLUX.1-schnell"
SLEEP = 2
RETRIES = 3


def build_prompt(icon, style):
    return f"{icon['desc'].strip()}, {style}"

# =========================
# GENERATION
# =========================

def process_image(pil_image):
    """Remove background with rembg, then resize to 128×128 transparent PNG."""
    img_bytes = BytesIO()
    pil_image.save(img_bytes, format="PNG")
    transparent = rembg_remove(img_bytes.getvalue())
    img = Image.open(BytesIO(transparent)).convert("RGBA").resize((128, 128), Image.LANCZOS)
    out = BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def generate_icon(client, icon, output_dir, style):
    output_path = output_dir / icon["filename"]

    if output_path.exists():
        return "skip"

    prompt = build_prompt(icon, style)

    for attempt in range(RETRIES):
        try:
            image = client.text_to_image(prompt, model=MODEL)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(process_image(image))
            return "ok"

        except Exception as e:
            msg = str(e)
            if "Rate limit" in msg or "429" in msg:
                print(f"\n⏸  Rate limited, waiting 30s...")
                time.sleep(30)
            else:
                print(f"\n❌ {icon['filename']} attempt {attempt+1}/{RETRIES}: {e}")
                time.sleep(5)

    return "fail"

# =========================
# MAIN
# =========================

def main():
    parser = build_parser("Generate icons via HuggingFace InferenceClient (free)")
    args = parser.parse_args()

    if not args.list and not HF_TOKEN:
        raise SystemExit("❌ HF_TOKEN environment variable not set.")

    output_dir = resolve_output_dir(args.theme)
    output_dir.mkdir(parents=True, exist_ok=True)

    icons, spec, style = load_icons_for_args(args)
    icons = filter_icons(icons, args)

    already = sum(1 for i in icons if (output_dir / i["filename"]).exists())
    todo = len(icons) - already
    print(f"🎨 Theme: {args.theme}  →  {output_dir}")
    print(f"📋 Spec: {spec}")
    print(f"🧩 {len(icons)} icons selected — {already} already done, {todo} to generate")

    if todo == 0:
        print("Nothing to do.")
        return

    client = InferenceClient(api_key=HF_TOKEN)

    success = fail = skip = 0
    for icon in tqdm(icons, desc="Generating"):
        result = generate_icon(client, icon, output_dir, style)
        if result == "ok":
            success += 1
        elif result == "skip":
            skip += 1
        else:
            fail += 1
        time.sleep(SLEEP)

    print(f"\n✅ Done: {success} generated, {skip} skipped, {fail} failed")
    if fail:
        print("Re-run to retry failed icons (existing ones are skipped).")


if __name__ == "__main__":
    main()
