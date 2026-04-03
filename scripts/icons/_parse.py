"""Shared spec parsing and CLI argument handling."""

import re
import argparse
from pathlib import Path

SPEC_FILE = Path(__file__).parent.parent.parent / "seed" / "icons.md"


def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return text


def extract_icons(markdown):
    icons = []
    current_family = "misc"
    current_family_label = "Misc"

    for line in markdown.split("\n"):
        if line.startswith("###"):
            current_family_label = line.replace("#", "").strip()
            current_family = slugify(current_family_label)
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
            "family_label": current_family_label,
        })

    return icons


def load_icons():
    if not SPEC_FILE.exists():
        raise SystemExit(f"❌ Spec file not found: {SPEC_FILE}")
    return extract_icons(SPEC_FILE.read_text(encoding="utf-8"))


def build_parser(description):
    parser = argparse.ArgumentParser(description=description)
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--family", "-f",
        metavar="NAME",
        help="Generate only icons from families matching NAME (substring, case-insensitive). "
             "Use --list to see available families.",
    )
    group.add_argument(
        "--icon", "-i",
        metavar="FILE",
        help="Generate a single icon by filename, e.g. bouteille-biere.png",
    )
    group.add_argument(
        "--list", "-l",
        action="store_true",
        help="List all families and their icons, then exit.",
    )
    return parser


def filter_icons(icons, args):
    if args.list:
        from collections import OrderedDict
        families = OrderedDict()
        for ic in icons:
            families.setdefault(ic["family_label"], []).append(ic["filename"])
        for label, files in families.items():
            print(f"\n  {label} ({len(files)})")
            for f in files:
                print(f"    {f}")
        raise SystemExit(0)

    if args.icon:
        needle = args.icon if args.icon.endswith(".png") else args.icon + ".png"
        filtered = [ic for ic in icons if ic["filename"] == needle]
        if not filtered:
            raise SystemExit(f"❌ Icon not found in spec: {needle}")
        return filtered

    if args.family:
        needle = args.family.lower()
        filtered = [ic for ic in icons if needle in ic["family"]]
        if not filtered:
            available = sorted({ic["family"] for ic in icons})
            raise SystemExit(
                f"❌ No family matching '{needle}'.\nAvailable:\n"
                + "\n".join(f"  {f}" for f in available)
            )
        return filtered

    return icons
