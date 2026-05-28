# Foodlist — CLAUDE.md

## Project overview

Foodlist is a household food inventory and recipe management app. Multiple users share a **household** and collaboratively track stock, a shopping list, and recipes.

**Stack:** Next.js 15.3 (App Router) · React 19 · TypeScript 5.8 · MySQL 8 (`mysql2` promise) · NextAuth 4 · Jest 30

---

## Key directories

```
src/
  app/           # Next.js App Router: pages + API routes
  components/    # Shared React components
  lib/           # Utilities: auth, db, icon, themes, search, voice
  types/         # TypeScript types (DbRow types + API response types)
  __tests__/     # Jest integration tests (require a real MySQL test DB)
seed/
  products.json          # ~230 seed products
  recipes.json           # seed recipes
  icons-default.md       # icon specs — cute flat design style
  icons-kawaii.md        # icon specs — kawaii (face on object) style
  icons-realiste.md      # icon specs — photorealistic style
uploads/
  icons/
    default/      # default theme PNGs (128×128, transparent bg)
    kawaii/       # kawaii theme PNGs
    realiste/     # realistic theme PNGs
    custom/       # user-uploaded custom icons (UUID filenames)
    custom/themes/<theme>/  # admin-uploaded per-theme overrides
sql/             # DB schema and migrations
```

---

## Database

MySQL 8. Core tables:

| Table | Purpose |
|---|---|
| `users` | Auth + preferences (`site_theme`, `icon_theme`) |
| `households` | Shared household context (invite_token) |
| `household_members` | Users ↔ households with roles |
| `categories` | Product categories (seeded defaults) |
| `products` | Product catalogue (`icon_ref` = PNG filename) |
| `stock` | Per-household inventory with status |
| `recipes` / `recipe_ingredients` | Recipes linked to products |
| `shopping_items` / `shopping_recipes` | Shopping list |

**Run tests:** `DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD=test DB_NAME=foodlist_test npx jest --runInBand --forceExit`

---

## Icon system

### How it works

- A product stores `icon_ref` = a PNG filename (e.g. `amandes.png`).
- `src/lib/icon.ts:iconUrl(ref, theme)` builds `/api/icons/<ref>?theme=<theme>`.
- `GET /api/icons/[ref]` resolves the file through a priority chain:
  1. Admin override: `uploads/icons/custom/themes/<theme>/<filename>`
  2. Embedded theme: `uploads/icons/<theme>/<filename>`
  3. Default fallback: `uploads/icons/default/<filename>`
  4. Custom (UUID): `uploads/icons/custom/<filename>`
- `GET /api/icons` lists available icons and whether each has a given theme variant.

### Three icon themes

Each theme has a spec file in `seed/` that documents every icon with a detailed generation prompt:

| Theme | File | Style |
|---|---|---|
| `default` | `seed/icons-default.md` | Cute flat design, plump rounded shapes, soft pastel colors, no shadows |
| `kawaii` | `seed/icons-kawaii.md` | Same real object shape as default + kawaii face drawn on it (big dot eyes, U smile, rosy cheeks). No arms/legs. |
| `realiste` | `seed/icons-realiste.md` | Photorealistic 3D render / studio product photo, accurate textures, soft directional lighting |

All icons: PNG 128×128, transparent background, subject centered at ~75–80% of frame. Background is removed after generation via `rembg`.

### Spec file format

Each file groups icons into **families** (e.g. "Famille 1 — Bouteilles boissons"). Each family is a markdown table:

```markdown
### Famille N — Name

| Fichier | Description détaillée |
|---|---|
| `filename.png` | detailed visual description for image generation |
```

New icons that don't fit an existing family go in **Famille 17 — Nouveaux produits** (in `icons-default.md`) or the equivalent section in the other files.

### Adding new icons

1. Add a row to the appropriate family in all 3 spec files (`icons-default.md`, `icons-kawaii.md`, `icons-realiste.md`).
2. Place the generated PNG (128×128, transparent bg) in `uploads/icons/default/`.
3. Optionally add theme variants in `uploads/icons/kawaii/` and `uploads/icons/realiste/`.
4. Set `icon_ref` on the product (in `seed/products.json` or via the UI/admin).

Use `/new-icons` to generate specs for multiple new products at once (see below).

---

## Themes (site UI)

9 site themes defined in `src/lib/themes.ts`: `dark`, `pure`, `light`, `happy`, `japon`, `girly`, `kawaii`, `foret`, `space`. Each defines CSS variables injected at layout level. Users pick their theme in `/profile`.

---

## Admin page (`/admin`)

Admin-only. Tabs: Overview (stats), Users, Households, Catalogue (seed/export products+recipes), Icons (sync from Docker, manage missing/orphan icons), Recipe photos. Requires `session.user.isAdmin = true`.

---

## `/new-icons` skill

Invoke with `/new-icons` followed by a list of products and descriptions to generate icon specs for all 3 theme files. See `.claude/skills/new-icons/SKILL.md`.
