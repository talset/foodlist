"""
Generate icons using Replicate API (FLUX.1-schnell)
~$0.003/image → 157 icons ≈ $0.50 total
Get your token at https://replicate.com/account/api-tokens
Set env: REPLICATE_API_TOKEN=r8_xxx
"""

import os
import re
import time
from pathlib import Path
from io import BytesIO

import requests
import replicate
from PIL import Image
from tqdm import tqdm

# =========================
# CONFIG
# =========================

if not os.environ.get("REPLICATE_API_TOKEN"):
    raise SystemExit("❌ REPLICATE_API_TOKEN environment variable not set.")

MODEL = "black-forest-labs/flux-schnell"

SPEC_FILE = Path(__file__).parent.parent.parent / "seed" / "icons.md"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "uploads" / "icons" / "default"
SLEEP = 1
RETRIES = 3

BASE_PROMPT = (
    "flat design icon, minimalist illustration, transparent background, "
    "128x128, clean and simple, no shadow, vibrant colors, slight rounded outline, "
    "white background, icon style"
)

# =========================
# PARSE SPEC
# =========================

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return text


def extract_icons(markdown):
    icons = []
    current_family = "misc"

    for line in markdown.split("\n"):
        if line.startswith("###"):
            current_family = slugify(line.replace("#", "").strip())
            continue

        if "|" not in line or ".png" not in line:
            continue

        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 3:
            continue

        filename = parts[1].strip("`")
        description = parts[2]

        if not filename.endswith(".png"):
            continue

        if filename.startswith("-") or description.startswith("-"):
            continue

        icons.append({
            "filename": filename,
            "desc": description,
            "family": current_family,
        })

    return icons

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

            # output is a list of URLs or file-like objects
            img_url = output[0]
            if hasattr(img_url, "url"):
                img_url = img_url.url

            img_bytes = requests.get(img_url, timeout=30).content
            img_128 = resize_to_128(img_bytes)
            output_path.write_bytes(img_128)
            return "ok"

        except Exception as e:
            print(f"\n❌ {icon['filename']} attempt {attempt+1}/{RETRIES}: {e}")
            time.sleep(3)

    return "fail"

# =========================
# MAIN
# =========================

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if not SPEC_FILE.exists():
        raise SystemExit(f"❌ Spec file not found: {SPEC_FILE}")

    markdown = SPEC_FILE.read_text(encoding="utf-8")
    icons = extract_icons(markdown)
    print(f"🧩 Found {len(icons)} icons in spec")

    already = sum(1 for i in icons if (OUTPUT_DIR / i["filename"]).exists())
    todo = len(icons) - already
    print(f"✅ Already generated: {already} — Remaining: {todo}")

    # Cost estimate
    cost = todo * 0.003
    print(f"💰 Estimated cost: ~${cost:.2f} ({todo} icons × $0.003)")
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
        print("Re-run the script to retry failed icons (already generated ones are skipped).")


if __name__ == "__main__":
    main()
