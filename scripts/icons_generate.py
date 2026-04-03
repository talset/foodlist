import os
import re
import time
import base64
import requests
from pathlib import Path
from openai import OpenAI
from tqdm import tqdm
from PIL import Image
from io import BytesIO

# =========================
# CONFIG
# =========================

SPEC_URL = "https://raw.githubusercontent.com/talset/foodlist/refs/heads/main/seed/icons.md"
OUTPUT_DIR = Path("icons")
SLEEP = 1
RETRIES = 3

BASE_PROMPT = (
    "flat design icon, minimalist illustration, transparent background, "
    "clean and simple, no shadow, vibrant colors, slight rounded outline"
)

client = OpenAI()

# =========================
# UTILS
# =========================

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return text


def resize_to_128(image_bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGBA")
    img = img.resize((128, 128), Image.LANCZOS)

    output = BytesIO()
    img.save(output, format="PNG")
    return output.getvalue()


# =========================
# PARSE SPEC
# =========================

def fetch_spec():
    print("📥 Fetching spec...")
    res = requests.get(SPEC_URL)
    res.raise_for_status()
    return res.text


def extract_icons(markdown):
    """
    Extract icons from markdown tables:
    | fichier | description |
    """
    icons = []

    lines = markdown.split("\n")
    current_family = "misc"

    for line in lines:
        # Detect family
        if line.startswith("###"):
            current_family = slugify(line.replace("#", "").strip())
            continue

        # Detect table rows
        if "|" in line and ".png" in line:
            parts = [p.strip() for p in line.split("|")]

            if len(parts) < 3:
                continue

            filename = parts[1]
            description = parts[2]

            if filename.endswith(".png"):
                name = filename.replace(".png", "")
                icons.append({
                    "name": name,
                    "desc": description,
                    "family": current_family
                })

    return icons


# =========================
# GENERATION
# =========================

def generate_icon(icon):
    name = icon["name"]
    desc = icon["desc"]
    family = icon["family"]

    folder = OUTPUT_DIR / family
    folder.mkdir(parents=True, exist_ok=True)

    output_path = folder / f"{name}.png"

    if output_path.exists():
        return True

    prompt = f"{BASE_PROMPT}, {desc}"

    for attempt in range(RETRIES):
        try:
            result = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                size="1024x1024",
                background="transparent"
            )

            img_b64 = result.data[0].b64_json
            img_bytes = base64.b64decode(img_b64)

            img_128 = resize_to_128(img_bytes)

            with open(output_path, "wb") as f:
                f.write(img_128)

            return True

        except Exception as e:
            print(f"❌ {name} failed ({attempt+1}/{RETRIES}): {e}")
            time.sleep(2)

    return False


# =========================
# MAIN
# =========================

def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    markdown = fetch_spec()
    icons = extract_icons(markdown)

    print(f"🧩 Found {len(icons)} icons")

    success = 0

    for icon in tqdm(icons):
        ok = generate_icon(icon)
        if ok:
            success += 1
        time.sleep(SLEEP)

    print(f"\n✅ Done: {success}/{len(icons)} icons generated")


if __name__ == "__main__":
    main()
