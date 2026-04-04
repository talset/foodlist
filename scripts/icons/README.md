# Génération des icônes

Les icônes sont générées à partir de fichiers de spec dans `seed/` et placées dans `uploads/icons/<theme>/`.
Les scripts sont **idempotents** : un fichier déjà présent est ignoré — relancer est sans risque.

---

## Fichiers de spec

| Fichier | Thème | Description |
|---------|-------|-------------|
| `seed/icons-default.md` | `default` | Style cute flat design — ~177 icônes |
| `seed/icons-kawaii.md` | `kawaii` | Style kawaii japonais — ~177 icônes |
| `seed/icons-<theme>.md` | `<theme>` | Spec pour tout thème supplémentaire |

Chaque spec définit :
- un **style global** (prompt commun appliqué à toutes les icônes) via un blockquote `> *...*`
- une **liste d'icônes** par famille (tableaux Markdown)

Le style est lu automatiquement depuis la spec — chaque thème a son propre style prompt.

---

## Options CLI

Les deux scripts acceptent les mêmes arguments :

```bash
# Thème par défaut (spec: seed/icons-default.md → uploads/icons/default/)
python generate_hf.py --theme default

# Thème kawaii (spec: seed/icons-kawaii.md → uploads/icons/kawaii/)
python generate_hf.py --theme kawaii

# Filtrer par famille
python generate_hf.py --theme kawaii --family fromage

# Un seul icône
python generate_hf.py --theme kawaii --icon fromage-rond.png

# Spec explicite (override)
python generate_hf.py --theme kawaii --spec seed/my-spec.md

# Lister les familles et icônes disponibles (sans token)
python generate_hf.py --list
python generate_hf.py --theme kawaii --list
```

---

## Services disponibles

| Script | Service | Coût | Notes |
|--------|---------|------|-------|
| `generate_hf.py` | HuggingFace Inference API | Crédits mensuels inclus (free) ou PRO $9/mois | Quota mensuel |
| `generate_replicate.py` | Replicate | ~$0.003/image → ~$0.50 pour 177 icônes | Facturation à l'usage |

---

## Option 1 — HuggingFace (gratuit)

### 1. Créer un token

1. Aller sur [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Créer un token **Read** (gratuit)
3. Accepter les conditions : [black-forest-labs/FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)

### 2. Installer les dépendances

```bash
pip install huggingface_hub pillow rembg tqdm
```

### 3. Lancer

```bash
cd /chemin/vers/foodlist

# Thème default
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py

# Thème kawaii
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py --theme kawaii
```

### Notes

- En cas de quota dépassé, passer à `generate_replicate.py` (~$0.50 total).
- Erreur 503 (modèle en chargement) → le script attend automatiquement.
- Erreur 429 (rate limit) → le script attend 30s et reprend.

---

## Option 2 — Replicate (~$0.50)

### 1. Créer un compte et un token

1. Aller sur [replicate.com](https://replicate.com)
2. Générer un token dans [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
3. Ajouter un moyen de paiement

### 2. Installer les dépendances

```bash
pip install replicate requests pillow rembg tqdm
```

### 3. Lancer

```bash
cd /chemin/vers/foodlist

# Thème default
REPLICATE_API_TOKEN=r8_xxx python3 scripts/icons/generate_replicate.py

# Thème kawaii
REPLICATE_API_TOKEN=r8_xxx python3 scripts/icons/generate_replicate.py --theme kawaii
```

Le script affiche le coût estimé et demande confirmation avant de commencer.

---

## Pipeline de génération

Pour chaque icône :
1. **Génération** — FLUX produit une image avec fond blanc (nécessaire pour une bonne séparation)
2. **Détourage** — `rembg` supprime le fond → PNG avec canal alpha transparent
3. **Resize** — redimensionné à 128×128 px

Le fond blanc dans le prompt améliore la qualité du détourage par `rembg`.

## Résultat attendu

```
uploads/icons/default/
├── bouteille-biere.png    # PNG transparent 128×128
├── fromage-rond.png
└── ...

uploads/icons/kawaii/
├── bouteille-biere.png    # version kawaii si présente dans la spec
└── ...
```

Les icônes sont immédiatement disponibles dans l'app via `/api/icons/<filename>?theme=kawaii`.
