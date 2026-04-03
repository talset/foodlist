"""
Generate icons using Replicate API (FLUX.1-schnell)
~$0.003/image → 157 icons ≈ $0.50 total
Get your token at https://replicate.com/account/api-tokens

Usage:
  REPLICATE_API_TOKEN=r8_xxx python generate_replicate.py                        # all icons
  REPLICATE_API_TOKEN=r8_xxx python generate_replicate.py --family bouteille     # one family
  REPLICATE_API_TOKEN=r8_xxx python generate_replicate.py --icon fromage-rond.png  # one icon
  REPLICATE_API_TOKEN=r8_xxx python generate_replicate.py --list                 # list families
"""

import os
import sys
import time
from pathlib import Path
from io import BytesIO

import requests
import replicate
from PIL import Image
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent))
from _parse import load_icons, build_parser, filter_icons
from _subjects import SUBJECTS

# =========================
# CONFIG
# =========================

REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN")

MODEL = "black-forest-labs/flux-schnell"

OUTPUT_DIR = Path(__file__).parent.parent.parent / "uploads" / "icons" / "default"
SLEEP = 1
RETRIES = 3
COST_PER_IMAGE = 0.003

STYLE = (
    "flat design app icon, minimalist illustration, white background, "
    "clean and simple, no shadow, vibrant saturated colors, slight rounded outline"
)


def build_prompt(icon):
    slug = icon["filename"].replace(".png", "")
    subject = SUBJECTS.get(slug)
    detail = icon["desc"].strip()

    if subject:
        return f"{subject}, {detail}, {STYLE}"
    else:
        words = slug.replace("-", " ")
        return f"{words}, {detail}, {STYLE}"

# =========================
# GENERATION
# =========================

def resize_to_128(image_bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGBA")
    img = img.resize((128, 128), Image.LANCZOS)
    out = BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def generate_icon(icon):
    output_path = OUTPUT_DIR / icon["filename"]

    if output_path.exists():
        return "skip"

    prompt = build_prompt(icon)

    for attempt in range(RETRIES):
        try:
            output = replicate.run(
                MODEL,
                input={
                    "prompt": prompt,
                    "num_outputs": 1,
                    "aspect_ratio": "1:1",
                    "output_format": "png",
                    "output_quality": 90,
                },
            )

            img_url = output[0]
            if hasattr(img_url, "url"):
                img_url = img_url.url

            img_bytes = requests.get(img_url, timeout=30).content
            output_path.write_bytes(resize_to_128(img_bytes))
            return "ok"

        except Exception as e:
            print(f"\n❌ {icon['filename']} attempt {attempt+1}/{RETRIES}: {e}")
            time.sleep(3)

    return "fail"

# =========================
# MAIN
# =========================

def main():
    parser = build_parser("Generate icons via Replicate API (~$0.003/image)")
    args = parser.parse_args()

    if not args.list and not REPLICATE_API_TOKEN:
        raise SystemExit("❌ REPLICATE_API_TOKEN environment variable not set.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    icons = load_icons()
    icons = filter_icons(icons, args)

    already = sum(1 for i in icons if (OUTPUT_DIR / i["filename"]).exists())
    todo = len(icons) - already
    print(f"🧩 {len(icons)} icons selected — {already} already done, {todo} to generate")

    if todo == 0:
        print("Nothing to do.")
        return

    cost = todo * COST_PER_IMAGE
    print(f"💰 Estimated cost: ~${cost:.2f} ({todo} icons × ${COST_PER_IMAGE})")
    confirm = input("Continue? [y/N] ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        return

    success = fail = skip = 0
    for icon in tqdm(icons, desc="Generating"):
        result = generate_icon(icon)
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
