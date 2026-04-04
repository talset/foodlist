"""Shared spec parsing and CLI argument handling."""

import re
import argparse
from pathlib import Path

_ROOT = Path(__file__).parent.parent.parent
_SEED = _ROOT / "seed"

DEFAULT_SPEC = "icons-detailed.md"
DEFAULT_THEME = "default"

STYLE = (
    "cute flat design sticker icon, soft pastel illustration, white background, "
    "plump rounded friendly shapes, gentle muted pastel colors, no shadow, "
    "cozy charming style, clean lines, no text, no logo"
)


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


def resolve_spec(spec_arg):
    """Resolve --spec argument to a Path.

    Accepts:
    - a bare filename  → looked up in seed/
    - a relative path  → relative to cwd
    - an absolute path → used as-is
    """
    p = Path(spec_arg)
    if p.is_absolute():
        return p
    if p.parent == Path("."):
        # bare filename: look in seed/
        candidate = _SEED / p
        if candidate.exists():
            return candidate
    return p  # relative to cwd, caller will get an error if missing


def load_icons(spec=DEFAULT_SPEC):
    spec_file = resolve_spec(spec)
    if not spec_file.exists():
        raise SystemExit(f"❌ Spec file not found: {spec_file}")
    return extract_icons(spec_file.read_text(encoding="utf-8"))


def load_icons_for_args(args):
    """Load icons using the theme + spec args combo."""
    spec = resolve_spec_for_theme(args.theme, getattr(args, 'spec', None))
    return load_icons(spec), spec


def resolve_output_dir(theme):
    """Return the output directory Path for a given theme name."""
    root = Path(__file__).parent.parent.parent
    if theme == DEFAULT_THEME:
        return root / "uploads" / "icons" / "default"
    return root / "uploads" / "icons" / theme


def resolve_spec_for_theme(theme, explicit_spec=None):
    """Return the spec file to use: explicit > seed/icons-<theme>.md > default spec."""
    if explicit_spec and explicit_spec != DEFAULT_SPEC:
        return explicit_spec
    if theme != DEFAULT_THEME:
        themed_spec = f"icons-{theme}.md"
        candidate = _SEED / themed_spec
        if candidate.exists():
            return themed_spec
    return DEFAULT_SPEC


def build_parser(description):
    parser = argparse.ArgumentParser(description=description)

    parser.add_argument(
        '--theme', '-t',
        default=DEFAULT_THEME,
        metavar='THEME',
        help=(
            f"Icon theme to generate (name of the output directory under uploads/icons/). "
            f"Default: {DEFAULT_THEME}. "
            f"Uses seed/icons-<theme>.md as spec if it exists, else falls back to {DEFAULT_SPEC}."
        ),
    )

    parser.add_argument(
        '--spec', '-s',
        default=None,
        metavar='FILE',
        help=(
            f"Override spec file (filename in seed/ or path). "
            f"If omitted, uses seed/icons-<theme>.md or {DEFAULT_SPEC}."
        ),
    )

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
