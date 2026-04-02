# Foodlist

Application web progressive (PWA) de gestion du stock alimentaire et des courses, partagée entre plusieurs appareils (mobile + ordinateur).

> Pour le détail complet des fonctionnalités, voir [SPECS.md](./SPECS.md).

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

# Répertoire des icônes (monté en volume Docker)
ICONS_DIR=/app/uploads/icons
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

Le volume Docker monte un dossier local vers `/app/uploads/icons` dans le container.

```
<dossier_local>/icons/
├── default/    # Icônes fournies par défaut avec l'application
└── custom/     # Icônes uploadées par les utilisateurs via l'interface
```

Dans `docker-compose.yml`, le volume est configuré ainsi :

```yaml
volumes:
  - ./uploads/icons:/app/uploads/icons
```

### Ajouter des icônes par défaut

Les icônes par défaut sont embarquées dans l'image Docker lors du build (dossier `uploads/icons/default/` du dépôt). Pour en ajouter :

1. Placer les images (PNG/WebP recommandé, 128×128 px) dans `uploads/icons/default/`
2. Rebuilder l'image :
   ```bash
   docker compose up -d --build
   ```

Elles seront automatiquement disponibles dans le sélecteur d'icônes de l'interface.

### Icônes uploadées par les utilisateurs

Les icônes uploadées via l'interface sont stockées dans `uploads/icons/custom/` sur le serveur hôte (via le volume). Elles sont persistées entre les redémarrages du container.

> **Backup** : penser à inclure le dossier `uploads/icons/custom/` dans vos sauvegardes.

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
