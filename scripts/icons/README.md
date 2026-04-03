# Génération des icônes

Les icônes sont générées à partir de `seed/icons.md` et placées dans `uploads/icons/default/`.
Les scripts sont **idempotents** : un fichier déjà présent est ignoré — on peut relancer sans risque.

---

## Options de génération (CLI)

Chaque script accepte les mêmes arguments :

```bash
# Tout générer
python generate_hf.py

# Seulement une famille (substring, insensible à la casse)
python generate_hf.py --family bouteille
python generate_hf.py --family fromage

# Un seul icône précis
python generate_hf.py --icon fromage-rond.png

# Lister toutes les familles et leurs icônes
python generate_hf.py --list
```

Les icônes déjà présentes dans `uploads/icons/default/` sont toujours ignorées — relancer est sans risque.

---

## Options de service disponibles

| Script | Service | Coût | Limite | Qualité |
|---|---|---|---|---|
| `generate_hf.py` | HuggingFace Inference API | Crédits mensuels inclus (limités) — PRO à $9/mois pour 20× plus | Quota mensuel | Bonne |
| `generate_replicate.py` | Replicate | ~$0.003/image → **~$0.50 total** | Aucune | Très bonne |

---

## Option 1 — HuggingFace (gratuit)

### 1. Créer un token

1. Aller sur [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Créer un token **Read** (gratuit, compte HF suffisant)
3. Accepter les conditions du modèle FLUX : [black-forest-labs/FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)

### 2. Installer les dépendances

```bash
pip install huggingface_hub pillow tqdm
```

### 3. Lancer

```bash
cd /chemin/vers/foodlist
HF_TOKEN=hf_xxxxxxxxxxxx python scripts/icons/generate_hf.py
```

### Notes

- Le free tier donne un quota de **crédits mensuels** (pas quotidien). Une fois épuisé, il faut soit acheter des crédits pré-payés, soit passer à HF PRO ($9/mois, 20× plus de crédits).
- Si le quota est dépassé, passer directement à `generate_replicate.py` (~$0.50 pour toutes les icônes).
- Si le modèle est en cours de chargement (erreur 503), le script attend automatiquement.
- Si rate limité (erreur 429), le script attend 30s et reprend.

---

## Option 2 — Replicate (~$0.50 total)

### 1. Créer un compte et un token

1. Aller sur [replicate.com](https://replicate.com) et créer un compte
2. Générer un API token dans [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
3. Ajouter un moyen de paiement (facturation à l'usage, pas d'abonnement)

### 2. Installer les dépendances

```bash
pip install replicate requests pillow tqdm
```

### 3. Lancer

```bash
cd /chemin/vers/foodlist
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx python scripts/icons/generate_replicate.py
```

Le script affiche le coût estimé et demande confirmation avant de commencer.

---

## Option 3 — Local avec diffusers (gratuit, GPU requis)

Si tu as une carte graphique avec ≥8 Go de VRAM :

```bash
pip install diffusers transformers torch accelerate pillow tqdm
```

```python
from diffusers import FluxPipeline
import torch

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16
)
pipe.to("cuda")

image = pipe(
    "flat design icon, minimalist illustration, ...",
    num_inference_steps=4,
    guidance_scale=0.0,
).images[0]

image.save("icon.png")
```

Adapter `generate_hf.py` en remplaçant l'appel API par ce pipeline local.

---

## Résultat attendu

Après exécution, les icônes sont placées directement dans `uploads/icons/default/` :

```
uploads/icons/default/
├── bouteille-biere.png
├── bouteille-cidre.png
├── fromage-rond.png
├── ...
```

Elles sont automatiquement disponibles dans l'application via `/api/icons/bouteille-biere.png`.
