# Foodlist

Application web progressive (PWA) de gestion du stock alimentaire et des courses, partagée entre plusieurs appareils (mobile + ordinateur). Auto-hébergeable via Docker + MySQL existant.

> Détail complet des fonctionnalités : [SPECS.md](./SPECS.md)

---

## Développement local

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/)

Aucune installation de Node.js ou MySQL requise — tout passe par Docker.

### Démarrer le serveur de dev

```bash
cp .env.example .env   # configurer DB_HOST, NEXTAUTH_SECRET, etc.
make dev               # démarre MySQL + Next.js avec hot reload
```

L'application est accessible sur `http://localhost:3000`.

### Lancer les tests

```bash
make test
```

Les tests sont des **tests d'intégration** contre une base MySQL dédiée (`foodlist_test`) — aucune configuration supplémentaire. Résultat attendu : 8 suites, toutes vertes.

### Build de production

```bash
make build
```

### Référence des commandes

| Commande | Description |
|----------|-------------|
| `make dev` | Serveur de dev avec hot reload |
| `make test` | Tests Jest (MySQL auto) |
| `make build` | Compile TypeScript + next build |
| `make run` | Lance en production |
| `make stop` | Arrête la production |
| `make logs` | Affiche les logs production |
| `make clean` | Supprime tous les containers + volumes |

---

## Installation (production)

### 1. Cloner le dépôt

```bash
git clone https://github.com/talset/foodlist.git
cd foodlist
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Éditer `.env` :

```env
DB_HOST=192.168.x.x        # IP du serveur MySQL
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist_user
DB_PASSWORD=secret

NEXTAUTH_SECRET=            # générer : openssl rand -base64 32
NEXTAUTH_URL=http://mon-serveur:3000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Initialiser la base de données

```bash
mysql -h 192.168.x.x -u foodlist_user -p foodlist < sql/schema.sql
```

### 4. Lancer

```bash
make run
```

L'application est accessible sur `http://mon-serveur:3000`.

### 5. Premier démarrage

**a) Créer le compte admin**

L'inscription est fermée par défaut. Le tout premier accès à `/register` est libre (base vide) — ce compte devient automatiquement **admin global**.

**b) Créer le foyer**

Après inscription → redirigé vers `/setup`. Créer un foyer (ex : `Famille Martin`).

**c) Importer le catalogue produits** *(optionnel)*

231 produits pré-définis dans `seed/products.json`. Pour les importer, récupérer le cookie de session dans le navigateur (DevTools → Application → Cookies → `next-auth.session-token`) puis :

```bash
curl -X POST http://mon-serveur:3000/api/import \
  -H "Content-Type: application/json" \
  -d @seed/products.json \
  -b "next-auth.session-token=<votre-token>"
```

**d) Inviter les membres**

Depuis la page `/admin` → onglet Foyers → copier le lien d'invitation et l'envoyer aux membres.

### Mise à jour

```bash
git pull
make stop && make run
```

---

## Icônes

Les icônes des produits sont servies via `/api/icons/<ref>?theme=<theme>`.

| Type | Emplacement | Persistance |
|------|------------|-------------|
| Par défaut | `uploads/icons/default/` | Embarquées dans l'image Docker |
| Thèmes | `uploads/icons/<theme>/` | Embarquées dans l'image Docker |
| Overrides admin | `uploads/icons/custom/themes/<theme>/` | Volume Docker (persisté) |
| Custom produits | `uploads/icons/custom/` | Volume Docker (persisté) |

Le volume Docker ne monte que `custom/` :
```yaml
volumes:
  - ./uploads/icons/custom:/app/uploads/icons/custom
```

**Générer des icônes IA :**
```bash
# Thème default
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py

# Thème kawaii
HF_TOKEN=hf_xxx python3 scripts/icons/generate_hf.py --theme kawaii
```

Voir `scripts/icons/README.md` pour les options complètes.

> **Backup** : inclure `uploads/icons/custom/` dans vos sauvegardes.

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

```bash
make stop && make run
```

> Tant que l'écran de consentement est en mode **Test**, seuls les comptes Gmail listés dans "Utilisateurs test" peuvent utiliser Google. Pour un usage familial, c'est suffisant — pas besoin de validation Google.
