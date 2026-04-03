# Foodlist

Application web progressive (PWA) de gestion du stock alimentaire et des courses, partagée entre plusieurs appareils (mobile + ordinateur).

> Pour le détail complet des fonctionnalités, voir [SPECS.md](./SPECS.md).

---

## Commandes rapides

```bash
make build   # Compile TypeScript + next build
make test    # Lance les tests Jest (MySQL auto)
make dev     # Serveur de développement avec hot reload
make run     # Lance en production
make stop    # Arrête la production
make clean   # Supprime containers + volumes
```

> Toutes les commandes utilisent Docker — aucune installation locale de Node.js ou MySQL requise.

---

## Statut du développement

| Phase | Description | Statut |
|-------|-------------|--------|
| Phase 1 | Fondations (Next.js, MySQL, Docker, schema SQL) | ✅ Fait — [valider](#valider-phase-1) |
| Phase 2 | Authentification (NextAuth, foyers, invitations) | ✅ Fait — [valider](#valider-phase-2) |
| Phase 3 | Catalogue produits (CRUD, catégories, icônes, import JSON) | ✅ Fait — [valider](#valider-phase-3) |
| Phase 4 | Stock & liste de courses (statuts, SSE) | 🔜 À faire |
| Phase 5 | Recettes (CRUD, ingrédients, multiplicateur) | ⏳ En attente |
| Phase 6 | PWA & finitions (manifest, optimisation mobile) | ⏳ En attente |

---

## Valider Phase 1

**Fondations : Next.js, schema SQL, Docker.**

### Build

```bash
make build
```

Résultat attendu : `✅ Build OK`, dossier `.next/standalone/` créé.

### Schema SQL

```bash
make schema
```

Résultat attendu : `✅ Schema appliqué`, liste des 9 tables :
`users`, `categories`, `households`, `household_members`, `products`, `stock`, `recipes`, `recipe_ingredients`, `shopping_recipes`.

### Démarrage dev

```bash
make dev
```

Ouvrir `http://localhost:3000` — la page affiche `Foodlist`. Arrêter avec `Ctrl+C`.

---

## Valider Phase 2

**Authentification : inscription, connexion, foyers.**

### Build

```bash
make build
```

Résultat attendu : `✅ Build OK` sans erreur TypeScript.

### Test manuel

```bash
make dev
```

Vérifier dans le navigateur :

1. `http://localhost:3000/register` — créer un compte email/mot de passe
2. Après inscription → redirigé vers `/setup` (pas de foyer)
3. Créer un foyer → redirigé vers `/`
4. Se déconnecter, se reconnecter via `/login`
5. Tester le lien d'invitation : copier le `invite_token` depuis la DB, ouvrir `http://localhost:3000/setup?token=<token>` avec un autre compte

---

## Valider Phase 3

**Catalogue produits : CRUD, icônes, import JSON.**

### Tests automatisés

```bash
make test
```

Résultat attendu : 30 tests passent (register, categories, products, import).

```
 PASS src/__tests__/register.test.ts
 PASS src/__tests__/categories.test.ts
 PASS src/__tests__/products.test.ts
 PASS src/__tests__/import.test.ts
```

### Test manuel

```bash
make dev
```

Vérifier dans le navigateur :

1. `http://localhost:3000/products` — liste des produits (vide au départ)
2. Cliquer `+ Ajouter` → créer un produit avec icône
3. Modifier un produit → changer l'icône via upload
4. Importer le catalogue initial :
   ```bash
   curl -X POST http://localhost:3000/api/import \
     -H "Content-Type: application/json" \
     -d @seed/products.json \
     -b "next-auth.session-token=<token>"
   ```

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
NEXTAUTH_SECRET=une_chaine_aleatoire_longue  # générer avec : openssl rand -base64 32
NEXTAUTH_URL=http://mon-serveur:3000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Répertoire des icônes custom (volume Docker)
ICONS_DIR=/app/uploads/icons/custom
```

### 3. Initialiser la base de données

```bash
mysql -h 192.168.x.x -u foodlist_user -p foodlist < sql/schema.sql
```

### 4. Lancer l'application

```bash
make run
```

L'application est accessible sur `http://mon-serveur:3000`.

---

## Mise à jour

```bash
git pull
make stop
make run
```

---

## Tests

Les tests sont des tests d'intégration qui tournent contre une base MySQL dédiée (`foodlist_test`), sans aucune installation locale.

```bash
make test
```

Le service `test` dans `docker-compose.validate.yml` :
- Démarre automatiquement un MySQL 9.6 de test
- Crée la base `foodlist_test` et applique le schema
- Lance Jest (`npm test`) et retourne son code de sortie

Couverture actuelle :
| Fichier | Tests |
|---------|-------|
| `register.test.ts` | Inscription, doublons, validations |
| `categories.test.ts` | CRUD catégories, auth |
| `products.test.ts` | CRUD produits, filtres, validations |
| `import.test.ts` | Import bulk, doublons, catégories auto |

---

## Icônes et images

Les icônes sont séparées en deux emplacements :

| Type | Chemin | Source | Persistance |
|------|--------|--------|-------------|
| Défaut | `/app/uploads/icons/default/` | Committées dans le dépôt, copiées au build | Embarquées dans l'image |
| Custom | `/app/uploads/icons/custom/` (`ICONS_DIR`) | Uploadées via l'interface | Volume Docker |

Le volume ne monte **que** `custom/` — les icônes par défaut restent intactes :

```yaml
volumes:
  - ./uploads/icons/custom:/app/uploads/icons/custom
```

Pour ajouter des icônes par défaut : placer les PNG 128×128 dans `uploads/icons/default/`, committer, puis `make run`.

> **Backup** : inclure `uploads/icons/custom/` dans vos sauvegardes.

---

## Google OAuth (optionnel)

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer des identifiants OAuth 2.0 (application web)
3. Ajouter l'URI de redirection : `http://mon-serveur:3000/api/auth/callback/google`
4. Renseigner `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`
5. Redémarrer : `make stop && make run`

---

## Structure du projet

Voir [SPECS.md — Structure du projet](./SPECS.md#structure-du-projet).
