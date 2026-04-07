# Foodlist

Application web progressive (PWA) de gestion du stock alimentaire et des courses, partagée entre plusieurs appareils (mobile + ordinateur). Auto-hébergeable via Docker + MySQL.

> Détail complet des fonctionnalités : [SPECS.md](./SPECS.md)

---

## Démarrage rapide (production)

**1. Créer le fichier d'environnement :**

```bash
cat > foodlist.env << 'EOF'
DB_HOST=foodlist-mysql
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist
DB_PASSWORD=secret
NEXTAUTH_SECRET=CHANGE_ME
NEXTAUTH_URL=http://mon-serveur:3000
EOF

# Générer un secret stable
sed -i "s/CHANGE_ME/$(openssl rand -base64 32)/" foodlist.env
```

**2. Créer un réseau Docker :**

```bash
docker network create foodlist-net
```

**3. Lancer MySQL :**

```bash
docker run -d \
  --name foodlist-mysql \
  --network foodlist-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=foodlist \
  -e MYSQL_USER=foodlist \
  -e MYSQL_PASSWORD=secret \
  -v foodlist-db:/var/lib/mysql \
  --restart unless-stopped \
  mysql:9.6
```

**4. Lancer Foodlist :**

```bash
docker run -d \
  --name foodlist \
  --network foodlist-net \
  -p 3000:3000 \
  --env-file foodlist.env \
  -v foodlist-uploads:/app/uploads \
  --restart unless-stopped \
  talset/foodlist:latest
```

La base de données est automatiquement initialisée au premier démarrage.

L'application est accessible sur `http://mon-serveur:3000`.

> Pour utiliser un MySQL existant (hors Docker), adapter `DB_HOST` dans `foodlist.env` avec l'IP du serveur et retirer `--network foodlist-net`.

---

## Configuration

Variables d'environnement (fichier `foodlist.env`) :

```env
# Base de données MySQL
DB_HOST=foodlist-mysql      # Nom du container MySQL ou IP du serveur
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist
DB_PASSWORD=secret

# Application
NEXTAUTH_SECRET=            # Générer : openssl rand -base64 32
NEXTAUTH_URL=http://mon-serveur:3000

```

### Volume Docker

| Volume | Chemin conteneur | Contenu |
|--------|-----------------|---------|
| `foodlist-uploads` | `/app/uploads` | Icônes produits, photos de recettes |
| `foodlist-db` | `/var/lib/mysql` | Données MySQL |

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

## Mise à jour

```bash
docker pull talset/foodlist:latest
docker stop foodlist && docker rm foodlist
docker run -d \
  --name foodlist \
  --network foodlist-net \
  -p 3000:3000 \
  --env-file foodlist.env \
  -v foodlist-uploads:/app/uploads \
  --restart unless-stopped \
  talset/foodlist:latest
```

Le fichier `foodlist.env` et les volumes sont conservés.

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
├── sql/schema.sql     # Schéma MySQL (idempotent, auto-appliqué au démarrage)
├── seed/              # Données de base (produits, recettes, specs icônes)
├── uploads/           # Icônes et photos (volume Docker)
├── scripts/icons/     # Génération d'icônes IA
├── Dockerfile         # Image de production multi-stage
├── docker-compose.yml # Dev avec Docker Compose
└── docker-compose.validate.yml  # Dev / test / build
```

## Licence

MIT
