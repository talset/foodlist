---
name: new-icons
description: >
  Generate icon specifications for new products and append them to all 3 theme
  spec files (seed/icons-default.md, seed/icons-kawaii.md, seed/icons-realiste.md).
  Invoke when the user provides a list of new products that need icons.
---

# new-icons

The user provides a list of new products (name + optional description/context). For each product, generate a detailed icon description for **each of the 3 icon themes** and append the rows to the correct family section in each spec file.

---

## Step 1 — Parse the input

The user may give products in any format: a plain list, a table, inline descriptions, or a products.json snippet. Extract:
- **filename**: derive from the French product name in kebab-case + `.png` (e.g. "Crème fraîche" → `creme-fraiche.png`). Use common abbreviations if the existing files do so (check patterns in the files). Strip accents in the filename.
- **product context**: what it looks like (packaging, color, shape, material).

---

## Step 2 — Identify the target family

Read the end of `seed/icons-default.md` to see the current family list. For each product, decide which existing family it belongs to:

| Family | Typical contents |
|---|---|
| Famille 1 — Bouteilles boissons | drinks in bottles |
| Famille 2 — Sauces | squeeze bottles, sauce jars |
| Famille 3 — Conserves | tins, glass jars |
| Famille 4 — Fromages | cheeses of all kinds |
| Famille 5 — Charcuterie / Viandes / Poissons | meats, fish, cold cuts |
| Famille 6 — Épicerie sèche | dry goods, pasta, grains |
| Famille 7 — Boulangerie | bread, pastries |
| Famille 8 — Produits laitiers | dairy (not cheese) |
| Famille 9 — Épices & Condiments | spices, condiments |
| Famille 10 — Légumes & Fruits frais | fresh produce |
| Famille 11 — Apéro & Snacks | crisps, aperitif snacks |
| Famille 12 — Petit-déjeuner & Épicerie sucrée | breakfast, sweet grocery |
| Famille 13 — Surgelés | frozen products |
| Famille 14 — Hygiène personnelle | personal care |
| Famille 15 — Entretien ménager | household cleaning |
| Famille 16 — Divers | misc (batteries, lighters, …) |
| Famille 17 — Nouveaux produits | fallback for anything that doesn't fit |
| Famille 18 — Animaux | pet food and supplies |

If none fits, use **Famille 17 — Nouveaux produits**.

---

## Step 3 — Write descriptions for each theme

For each product, write **three descriptions** — one per theme — following the style rules below.

### Theme: default (`icons-default.md`)
**Style:** cute flat design sticker, plump rounded shapes, soft pastel colors, no shadow, no gradient, no text, no logo. Subject centered, 75–80% of frame.

**Formula:** `cute [shape/container] [color+material], [distinctive feature], [color palette], [view angle]`

Example: `cute plump glass jar of strawberry jam with a cheerful red lid and a tiny handwritten label, soft raspberry-red tones, front view`

- Always mention the container type, dominant color, and one or two distinctive features.
- Keep it visual and specific enough to generate a recognizable icon.

### Theme: kawaii (`icons-kawaii.md`)
**Style:** Same real object shape as default, but with a kawaii face drawn **on** the object body: big round glossy black dot eyes, tiny U-shaped smile, two small round rosy pink blush cheeks. No arms, no legs. Slightly chubby but still recognizable.

**Formula:** Take the default description, add `with a kawaii face drawn on [surface] — big glossy eyes, tiny smile, rosy pink cheeks`, and optionally note the expression (happy, sleepy, excited) to match the product's character.

Example: `glass jar of strawberry jam keeping its real jar shape, with a kawaii face drawn on the front — big glossy eyes, cheerful smile, rosy pink cheeks — warm red lid, soft raspberry tones, front view`

### Theme: realiste (`icons-realiste.md`)
**Style:** Photorealistic 3D render / studio product photo. Accurate textures (glass shine, plastic sheen, paper wrinkles, condensation, grain). Soft directional lighting from upper-left, subtle drop shadow. Natural colors, no brand text, no logo.

**Formula:** Describe materials and surfaces precisely. Mention: material (glass, plastic, metal, paper, cardboard, fabric), surface quality (matte, glossy, translucent, rough), lighting effects (refraction, condensation, specular highlights), and view angle.

Example: `glass jar of strawberry jam with a realistic red metal screw lid, deep ruby-red jam visible through the transparent glass, slight condensation on the glass surface, realistic glass texture with subtle specular highlights, front view`

---

## Step 4 — Append to the spec files

For each of the 3 spec files:
1. Read the file to locate the correct family section.
2. Find the last `|` table row in that section.
3. Insert the new row(s) **after** the last existing row in that family, before the next `---` or `###` heading.

Do **not** add a new family heading if the family already exists — just append rows to it.
If using Famille 17 (Nouveaux produits) and it doesn't exist yet in a file, add it at the end.

---

## Step 5 — Report

After editing all 3 files, summarize what was added:
- List each product → filename → which family it was added to.
- Note any filename that already existed in the files (potential duplicate).
- Remind the user to generate the actual PNG files and place them in `uploads/icons/default/` (and optionally the theme subdirectories).
