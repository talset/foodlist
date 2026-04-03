"""
Generate icons using HuggingFace Inference API (FLUX.1-schnell)
Free tier: ~100-200 requests/day with a free HF account.
Get your token at https://huggingface.co/settings/tokens

Usage:
  HF_TOKEN=hf_xxx python generate_hf.py                        # all icons
  HF_TOKEN=hf_xxx python generate_hf.py --family bouteille     # one family
  HF_TOKEN=hf_xxx python generate_hf.py --icon fromage-rond.png  # one icon
  HF_TOKEN=hf_xxx python generate_hf.py --list                 # list families
"""

import os
import sys
import time
from pathlib import Path
from io import BytesIO

import requests
from PIL import Image
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent))
from _parse import load_icons, build_parser, filter_icons

# =========================
# CONFIG
# =========================

HF_TOKEN = os.environ.get("HF_TOKEN")

MODEL = "black-forest-labs/FLUX.1-schnell"
API_URL = f"https://api-inference.huggingface.co/models/{MODEL}"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

OUTPUT_DIR = Path(__file__).parent.parent.parent / "uploads" / "icons" / "default"
SLEEP = 2
RETRIES = 3

BASE_PROMPT = (
    "flat design icon, minimalist illustration, transparent background, "
    "clean and simple, no shadow, vibrant colors, slight rounded outline, icon style"
)

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

    prompt = f"{BASE_PROMPT}, {icon['desc']}"

    for attempt in range(RETRIES):
        try:
            response = requests.post(
                API_URL,
                headers=HEADERS,
                json={"inputs": prompt},
                timeout=60,
            )

            if response.status_code == 503:
                wait = response.json().get("estimated_time", 20)
                print(f"\n⏳ Model loading, waiting {wait:.0f}s...")
                time.sleep(min(wait, 30))
                continue

            if response.status_code == 429:
                print(f"\n⏸  Rate limited, waiting 30s...")
                time.sleep(30)
                continue

            response.raise_for_status()

            output_path.write_bytes(resize_to_128(response.content))
            return "ok"

        except Exception as e:
            print(f"\n❌ {icon['filename']} attempt {attempt+1}/{RETRIES}: {e}")
            time.sleep(5)

    return "fail"

# =========================
# MAIN
# =========================

def main():
    parser = build_parser("Generate icons via HuggingFace Inference API (free)")
    args = parser.parse_args()

    if not args.list and not HF_TOKEN:
        raise SystemExit("❌ HF_TOKEN environment variable not set.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    icons = load_icons()
    icons = filter_icons(icons, args)

    already = sum(1 for i in icons if (OUTPUT_DIR / i["filename"]).exists())
    todo = len(icons) - already
    print(f"🧩 {len(icons)} icons selected — {already} already done, {todo} to generate")

    if todo == 0:
        print("Nothing to do.")
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
