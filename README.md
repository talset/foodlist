# Foodlist

Application web progressive (PWA) de gestion du stock alimentaire et des courses, partagée entre plusieurs appareils (mobile + ordinateur).

> Pour le détail complet des fonctionnalités, voir [SPECS.md](./SPECS.md).

---

## Vérification Phase 1

Toutes les vérifications utilisent Docker uniquement — pas besoin d'installer Node.js ou MySQL localement.
Le fichier `docker-compose.validate.yml` définit les services de test.

### 1. Build Next.js (npm install + next build)

```bash
docker compose -f docker-compose.validate.yml run --rm build
```

Résultat attendu : `✅ Build OK`, dossier `.next/standalone/` présent dans le projet.

### 2. Schéma SQL

```bash
docker compose -f docker-compose.validate.yml up -d mysql
docker compose -f docker-compose.validate.yml run --rm schema
docker compose -f docker-compose.validate.yml down
```

Résultat attendu : `✅ Schema appliqué`, puis la liste des 9 tables :
`users`, `categories`, `households`, `household_members`, `products`, `stock`, `recipes`, `recipe_ingredients`, `shopping_recipes`.

Le schéma est idempotent — peut être rejoué sans erreur.

### 3. Démarrage complet en développement (app + DB)

```bash
docker compose -f docker-compose.validate.yml up mysql dev
```

Ouvrir `http://localhost:3000` — la page doit afficher `Foodlist`.

Arrêter avec `Ctrl+C`, puis nettoyer :

```bash
docker compose -f docker-compose.validate.yml down -v
```

> Le volume `node_modules` est géré par Docker pour éviter les conflits avec un éventuel `node_modules` local.

---

## Statut du développement

| Phase | Description | Statut |
|-------|-------------|--------|
| Phase 1 | Fondations (Next.js, MySQL, Docker, schema SQL) | ✅ Fait — [voir vérifications](#vérification-phase-1) |
| Phase 2 | Authentification (NextAuth, foyers, invitations) | 🔜 À faire |
| Phase 3 | Catalogue produits (CRUD, catégories, icônes, import JSON) | ⏳ En attente |
| Phase 4 | Stock & liste de courses (statuts, SSE) | ⏳ En attente |
| Phase 5 | Recettes (CRUD, ingrédients, multiplicateur) | ⏳ En attente |
| Phase 6 | PWA & finitions (manifest, optimisation mobile) | ⏳ En attente |

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/)
- Un serveur MySQL accessible depuis le container (base de données existante)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/talset/foodlist.git
cd foodlist
```

### 2. Configurer l'environnement

Copier le fichier d'exemple et remplir les valeurs :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
# Base de données MySQL (instance existante)
DB_HOST=192.168.x.x
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist_user
DB_PASSWORD=secret

# Application
NEXTAUTH_SECRET=une_chaine_aleatoire_longue
NEXTAUTH_URL=http://mon-serveur:3000

# Google OAuth (optionnel, pour la connexion via Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Répertoire des icônes uploadées par les utilisateurs (volume Docker — custom uniquement)
ICONS_DIR=/app/uploads/icons/custom
```

### 3. Initialiser la base de données

Exécuter le script SQL sur votre instance MySQL :

```bash
mysql -h 192.168.x.x -u foodlist_user -p foodlist < sql/schema.sql
```

### 4. Lancer l'application

```bash
docker compose up -d
```

L'application est accessible sur `http://mon-serveur:3000`.

---

## Mise à jour

```bash
git pull
docker compose down
docker compose up -d --build
```

---

## Icônes et images

### Structure des répertoires

Les icônes sont séparées en deux emplacements distincts :

| Type | Chemin dans l'image | Source | Persistance |
|------|--------------------|---------||------------|
| Défaut | `/app/uploads/icons/default/` | Committées dans le dépôt, copiées au build | Embarquées dans l'image |
| Custom | `/app/uploads/icons/custom/` (`ICONS_DIR`) | Uploadées via l'interface | Volume Docker |

Le volume Docker ne monte **que** le dossier `custom/` — les icônes par défaut restent intactes dans l'image :

```yaml
volumes:
  - ./uploads/icons/custom:/app/uploads/icons/custom
```

### Icônes par défaut

Les icônes par défaut sont committées dans le dépôt sous `uploads/icons/default/` et **embarquées dans l'image Docker au build**. Elles ne nécessitent pas de volume et ne peuvent pas être écrasées par un montage.

Pour en ajouter ou modifier :

1. Placer les images (PNG/WebP recommandé, 128×128 px) dans `uploads/icons/default/`
2. Committer les fichiers dans le dépôt
3. Rebuilder l'image :
   ```bash
   docker compose up -d --build
   ```

Elles seront automatiquement disponibles dans le sélecteur d'icônes de l'interface.

### Icônes uploadées par les utilisateurs

Les icônes uploadées via l'interface sont stockées dans `uploads/icons/custom/` sur le serveur hôte (via le volume) et persistées entre les redémarrages du container.

> **Backup** : inclure le dossier `uploads/icons/custom/` dans vos sauvegardes.

---

## Google OAuth (optionnel)

Pour activer la connexion via Google :

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API **Google+ API** ou **Google Identity**
3. Créer des identifiants OAuth 2.0 (type : application web)
4. Ajouter l'URI de redirection autorisée : `http://mon-serveur:3000/api/auth/callback/google`
5. Renseigner `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`
6. Redémarrer le container

---

## Structure du projet

Voir [SPECS.md — Structure du projet](./SPECS.md#structure-du-projet).
