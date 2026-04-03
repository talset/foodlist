"""
Generate icons using HuggingFace Inference API (FLUX.1-schnell)
Free tier: ~100-200 requests/day with a free HF account.
Get your token at https://huggingface.co/settings/tokens
Set env: HF_TOKEN=hf_xxx
"""

import os
import re
import time
from pathlib import Path
from io import BytesIO

import requests
from PIL import Image
from tqdm import tqdm

# =========================
# CONFIG
# =========================

HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    raise SystemExit("❌ HF_TOKEN environment variable not set.")

MODEL = "black-forest-labs/FLUX.1-schnell"
API_URL = f"https://api-inference.huggingface.co/models/{MODEL}"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

SPEC_FILE = Path(__file__).parent.parent.parent / "seed" / "icons.md"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "uploads" / "icons" / "default"
SLEEP = 2       # seconds between requests (be nice to free tier)
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

        # Skip header/separator rows
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
            response = requests.post(
                API_URL,
                headers=HEADERS,
                json={"inputs": prompt},
                timeout=60,
            )

            if response.status_code == 503:
                # Model loading — wait and retry
                wait = response.json().get("estimated_time", 20)
                print(f"\n⏳ Model loading, waiting {wait:.0f}s...")
                time.sleep(min(wait, 30))
                continue

            if response.status_code == 429:
                print(f"\n⏸  Rate limited, waiting 30s...")
                time.sleep(30)
                continue

            response.raise_for_status()

            img_bytes = resize_to_128(response.content)
            output_path.write_bytes(img_bytes)
            return "ok"

        except Exception as e:
            print(f"\n❌ {icon['filename']} attempt {attempt+1}/{RETRIES}: {e}")
            time.sleep(5)

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
        print("Re-run the script to retry failed icons (already generated ones are skipped).")


if __name__ == "__main__":
    main()
