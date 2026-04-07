# Foodlist

Application web progressive (PWA) de gestion du stock alimentaire et des courses, partagée entre plusieurs appareils (mobile + ordinateur). Auto-hébergeable via Docker + MySQL.

> Détail complet des fonctionnalités : [SPECS.md](./SPECS.md)

---

## Démarrage rapide (production)

### Avec MySQL externe

**1. Créer le fichier d'environnement :**

```bash
cat > foodlist.env << 'EOF'
DB_HOST=192.168.x.x
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist_user
DB_PASSWORD=secret
NEXTAUTH_SECRET=CHANGE_ME
NEXTAUTH_URL=http://mon-serveur:3000
EOF

# Générer un secret stable
sed -i "s/CHANGE_ME/$(openssl rand -base64 32)/" foodlist.env
```

**2. Lancer :**

```bash
docker run -d \
  --name foodlist \
  -p 3000:3000 \
  --env-file foodlist.env \
  -v foodlist-icons:/app/uploads/icons \
  -v foodlist-recipes:/app/uploads/recipes \
  --restart unless-stopped \
  talset/foodlist:latest
```

La base de données est automatiquement initialisée au premier démarrage.

### Avec Docker Compose (MySQL inclus)

```bash
cp .env.example .env
# Éditer .env : générer NEXTAUTH_SECRET, adapter NEXTAUTH_URL
docker compose up -d
```

L'application est accessible sur `http://mon-serveur:3000`.

---

## Configuration

Copier `.env.example` → `.env` et adapter :

```env
# Base de données MySQL
DB_HOST=192.168.x.x        # IP du serveur MySQL (ou "mysql" si Docker Compose)
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist_user
DB_PASSWORD=secret

# Application
NEXTAUTH_SECRET=            # Générer : openssl rand -base64 32
NEXTAUTH_URL=http://mon-serveur:3000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Volumes Docker

| Volume | Chemin conteneur | Contenu |
|--------|-----------------|---------|
| Icons | `/app/uploads/icons` | Icônes produits (thèmes + custom) |
| Recipes | `/app/uploads/recipes` | Photos de recettes |

> **Backup** : inclure ces volumes dans vos sauvegardes.

---

## Premier démarrage

### 1. Créer le compte admin

L'inscription est fermée par défaut. Le tout premier accès à `/register` est libre (base vide) — ce compte devient automatiquement **admin global**.

### 2. Créer le foyer

Après inscription → redirigé vers `/setup`. Créer un foyer (ex : `Famille Martin`).

### 3. Importer le catalogue *(optionnel)*

Depuis `/admin` → onglet **Import / Export** :
- **↓ Catalogue de base** : importe ~250 produits alimentaires courants
- **↓ Catalogue de base** (recettes) : importe les recettes de base

### 4. Inviter les membres

Depuis `/admin` → onglet **Foyers** → copier le lien d'invitation et l'envoyer aux membres.

---

## Build & publication de l'image Docker

### Build local

```bash
docker build -t talset/foodlist:latest .
```

### Push vers Docker Hub

```bash
docker login
docker build -t talset/foodlist:latest .
docker push talset/foodlist:latest

# Avec un tag de version
docker tag talset/foodlist:latest talset/foodlist:1.0.0
docker push talset/foodlist:1.0.0
```

### Build multi-architecture (amd64 + arm64)

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t talset/foodlist:latest \
  -t talset/foodlist:1.0.0 \
  --push .
```

---

## Développement

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/)

Aucune installation de Node.js ou MySQL requise — tout passe par Docker.

### Démarrer le serveur de dev

```bash
make dev    # démarre MySQL + Next.js avec hot reload
```

L'application est accessible sur `http://localhost:3000`.

### Lancer les tests

```bash
make test
```

Tests d'intégration contre une base MySQL dédiée (`foodlist_test`).

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `make dev` | Serveur de dev avec hot reload |
| `make test` | Tests Jest (MySQL auto) |
| `make build` | Compile TypeScript + next build |
| `make run` | Build + lance en production (Docker Compose) |
| `make stop` | Arrête les containers production |
| `make logs` | Affiche les logs production |
| `make clean` | Supprime tous les containers + volumes |

---

## Mise à jour

### Depuis Docker Hub

```bash
docker pull talset/foodlist:latest
docker stop foodlist && docker rm foodlist
# Relancer avec la même commande docker run (voir Démarrage rapide)
# Le fichier foodlist.env et les volumes sont conservés
```

### Depuis Docker Compose

```bash
git pull
docker compose up -d --build
```

### Migration de la base

Le fichier `sql/schema.sql` est idempotent (`CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`). Il est appliqué automatiquement au démarrage de l'application — aucune migration manuelle nécessaire.

---

## Icônes & photos

### Icônes produits

Servies via `/api/icons/<ref>?theme=<theme>` avec résolution par priorité :
1. `uploads/icons/custom/themes/<theme>/<ref>` (override admin)
2. `uploads/icons/<theme>/<ref>` (pack embarqué)
3. `uploads/icons/default/<ref>` (défaut)
4. `uploads/icons/custom/<ref>` (custom produit)

### Photos de recettes

Servies via `/api/recipes/photos/<filename>`, stockées dans `uploads/recipes/`.

### Génération IA

```bash
# Icônes (128×128, fond transparent)
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py                    # thème default
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py --theme kawaii     # thème kawaii

# Photos de recettes (400×400)
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py --recipes

# Lister les icônes/photos disponibles
python3 scripts/icons/generate_hf.py --list
python3 scripts/icons/generate_hf.py --recipes --list
```

Voir [`scripts/icons/README.md`](scripts/icons/README.md) pour les options complètes et le service Replicate.

---

## Google OAuth *(optionnel)*

Permet la connexion avec un compte Google. L'email est rapproché d'un compte existant (fusion automatique).

### Configuration Google Cloud

1. [console.cloud.google.com](https://console.cloud.google.com/) → Nouveau projet
2. **APIs & Services > Bibliothèque** → activer `Google Identity` / `People API`
3. **APIs & Services > Écran de consentement OAuth** → type Externe, ajouter les adresses Gmail des membres dans "Utilisateurs test"
4. **APIs & Services > Identifiants > Créer > ID client OAuth 2.0** → Application Web
   - Origines autorisées : `http://mon-serveur:3000`
   - URI de redirection : `http://mon-serveur:3000/api/auth/callback/google`
5. Copier **Client ID** et **Client secret** dans `.env`

> Tant que l'écran de consentement est en mode **Test**, seuls les comptes Gmail listés dans "Utilisateurs test" peuvent utiliser Google. Pour un usage familial, c'est suffisant.

---

## Architecture

```
foodlist/
├── src/app/           # Pages Next.js (App Router)
│   ├── api/           # API Routes
│   ├── (auth)/        # Login / Register
│   ├── admin/         # Administration
│   ├── stock/         # Gestion du stock
│   ├── shopping/      # Liste de courses
│   ├── recipes/       # Recettes
│   ├── products/      # Catalogue produits
│   └── profile/       # Profil utilisateur
├── sql/schema.sql     # Schéma MySQL (idempotent)
├── seed/              # Données de base (produits, recettes, specs icônes)
├── uploads/           # Icônes et photos (volume Docker)
├── scripts/icons/     # Génération d'icônes IA
├── Dockerfile         # Image de production multi-stage
├── docker-compose.yml # Production (app + MySQL)
└── docker-compose.validate.yml  # Dev / test / build
```

## Licence

MIT
