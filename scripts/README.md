# 🍔 Foodlist Icons Generator

## ✨ Features

- 📥 Récupère automatiquement la spec depuis GitHub
- 🧠 Parse les icônes à générer
- 🎨 Génère les images via OpenAI
- 📏 Resize en **128x128 PNG transparent**
- 📂 Classement automatique par familles
- 🔁 Retry en cas d’erreur
- ⏱️ Gestion du rate limiting (sleep)

## 📦 Prérequis

```
pip install openai tqdm pillow requests
```

Création de la clé API
https://platform.openai.com/api-keys

## ⚙️  Configuration

```
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxx"
python generate_icons.py
```

advanced config
```
SLEEP = 1        # délai entre chaque génération
RETRIES = 3      # nombre de tentatives
OUTPUT_DIR = "icons"
```
