"""
Generate icons using HuggingFace InferenceClient (FLUX.1-schnell)
Free tier: ~100-200 requests/day with a free HF account.
Get your token at https://huggingface.co/settings/tokens

Install: pip install huggingface_hub pillow tqdm

Usage:
  HF_TOKEN=hf_xxx python generate_hf.py                                    # all icons, standard spec
  HF_TOKEN=hf_xxx python generate_hf.py --spec detailed                    # all icons, cute spec
  HF_TOKEN=hf_xxx python generate_hf.py --spec detailed --family fromage   # one family, cute spec
  HF_TOKEN=hf_xxx python generate_hf.py --icon fromage-rond.png            # one icon
  python generate_hf.py --list                                              # list families (no token needed)
  python generate_hf.py --spec detailed --list                              # list families in detailed spec
"""

import os
import sys
import time
from pathlib import Path
from io import BytesIO

from huggingface_hub import InferenceClient
from PIL import Image
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent))
from _parse import load_icons, build_parser, filter_icons, get_style

# =========================
# CONFIG
# =========================

HF_TOKEN = os.environ.get("HF_TOKEN")
MODEL = "black-forest-labs/FLUX.1-schnell"

OUTPUT_DIR = Path(__file__).parent.parent.parent / "uploads" / "icons" / "default"
SLEEP = 2
RETRIES = 3


def build_prompt(icon, style):
    return f"{icon['desc'].strip()}, {style}"

# =========================
# GENERATION
# =========================

def resize_to_128(pil_image):
    img = pil_image.convert("RGBA").resize((128, 128), Image.LANCZOS)
    out = BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def generate_icon(client, icon, style):
    output_path = OUTPUT_DIR / icon["filename"]

    if output_path.exists():
        return "skip"

    prompt = build_prompt(icon, style)

    for attempt in range(RETRIES):
        try:
            image = client.text_to_image(prompt, model=MODEL)
            output_path.write_bytes(resize_to_128(image))
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

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    style = get_style(args.spec)
    icons = load_icons(args.spec)
    icons = filter_icons(icons, args)

    already = sum(1 for i in icons if (OUTPUT_DIR / i["filename"]).exists())
    todo = len(icons) - already
    print(f"🧩 {len(icons)} icons selected — {already} already done, {todo} to generate")
    print(f"📋 Spec: {args.spec}")

    if todo == 0:
        print("Nothing to do.")
        return

    client = InferenceClient(api_key=HF_TOKEN)

    success = fail = skip = 0
    for icon in tqdm(icons, desc="Generating"):
        result = generate_icon(client, icon, style)
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
