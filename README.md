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
| Phase 4 | Stock & liste de courses (statuts, CRUD) | ✅ Fait — [valider](#valider-phase-4) |
| Phase 5 | Recettes (CRUD, ingrédients, multiplicateur) | ✅ Fait — [valider](#valider-phase-5) |
| Phase 6 | PWA & finitions (manifest, optimisation mobile) | ✅ Fait — [valider](#valider-phase-6) |

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

## Valider Phase 4

**Stock & liste de courses : CRUD stock, statuts, liste de courses.**

### Tests automatisés

```bash
make test
```

Résultat attendu : les 6 suites passent.

```
 PASS src/__tests__/register.test.ts
 PASS src/__tests__/categories.test.ts
 PASS src/__tests__/products.test.ts
 PASS src/__tests__/import.test.ts
 PASS src/__tests__/stock.test.ts
 PASS src/__tests__/shopping.test.ts
```

### Test manuel

```bash
make dev
```

Vérifier dans le navigateur :

1. `http://localhost:3000/stock` — liste du stock (vide au départ)
2. Ajouter un article via l'API :
   ```bash
   curl -X POST http://localhost:3000/api/stock \
     -H "Content-Type: application/json" \
     -d '{"product_id": 1, "quantity": 2, "status": "in_stock"}' \
     -b "next-auth.session-token=<token>"
   ```
3. Changer le statut (low, out_of_stock, shopping_list) via le select
4. `http://localhost:3000/shopping` — liste des articles `shopping_list`
5. Cocher un article → disparaît de la liste (statut → `in_stock`)

---

## Valider Phase 5

**Recettes : CRUD, ingrédients, ajout à la liste de courses.**

### Tests automatisés

```bash
make test
```

Résultat attendu : les 8 suites passent.

```
 PASS src/__tests__/register.test.ts
 PASS src/__tests__/categories.test.ts
 PASS src/__tests__/products.test.ts
 PASS src/__tests__/import.test.ts
 PASS src/__tests__/stock.test.ts
 PASS src/__tests__/shopping.test.ts
 PASS src/__tests__/recipes.test.ts
 PASS src/__tests__/shopping-recipes.test.ts
```

### Test manuel

```bash
make dev
```

Vérifier dans le navigateur :

1. `http://localhost:3000/recipes` — liste des recettes
2. Cliquer `+ Nouvelle recette` → créer une recette avec ingrédients
3. Sur la page détail → section "Ajouter à la liste de courses", choisir un multiplicateur → cliquer `+ Ajouter`
4. `http://localhost:3000/shopping` — vérifier que les ingrédients apparaissent

---

## Valider Phase 6

**PWA & finitions : manifest, navigation mobile, installation.**

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

1. `http://localhost:3000` → redirige automatiquement vers `/shopping`
2. Barre de navigation en bas avec 4 onglets : Courses / Stock / Produits / Recettes
3. L'onglet actif est mis en évidence (bleu)
4. Sur mobile (Chrome DevTools > mobile view) : l'interface s'adapte correctement
5. Dans Chrome : icône "Installer l'application" visible dans la barre d'adresse (PWA installable)
6. Vérifier le manifest : `http://localhost:3000/manifest.webmanifest`

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

### 5. Premier démarrage — checklist

Une fois l'application lancée, effectuer ces étapes dans l'ordre.

---

#### a) Créer le compte admin

L'inscription est **fermée par défaut** : seul le tout premier accès à `/register` est libre (base vide).

1. Ouvrir `http://mon-serveur:3000/register`
2. Remplir le formulaire (email + mot de passe) **ou** continuer avec Google
3. Après inscription → redirigé vers `/setup`

---

#### b) Créer le foyer

Sur la page `/setup` :

1. Choisir "Créer un foyer"
2. Donner un nom (ex : `Famille Martin`)
3. Valider → vous êtes maintenant admin du foyer

---

#### c) Importer le catalogue produits

L'application est livré avec 231 produits pré-définis dans `seed/products.json`. Il faut les importer une fois.

Récupérer d'abord le cookie de session dans le navigateur (DevTools → Application → Cookies → `next-auth.session-token`), puis :

```bash
curl -X POST http://mon-serveur:3000/api/import \
  -H "Content-Type: application/json" \
  -d @seed/products.json \
  -b "next-auth.session-token=<votre-token>"
```

Résultat attendu :
```json
{"created": 231, "skipped": 0, "errors": []}
```

> **Note :** Cette étape n'est pas obligatoire — vous pouvez créer vos produits manuellement. Mais l'import donne une base complète pour démarrer rapidement.

---

#### d) Récupérer le lien d'invitation

L'interface n'affiche pas encore le lien d'invitation (amélioration prévue). Pour l'obtenir, interroger la base de données :

```bash
mysql -h DB_HOST -u DB_USER -p DB_NAME \
  -e "SELECT name, invite_token FROM households;"
```

Le lien à partager est :
```
http://mon-serveur:3000/register?token=<invite_token>
```

---

#### e) Inviter les membres du foyer

Envoyer le lien d'invitation à chaque membre. Quand ils cliquent dessus :

1. Ils remplissent le formulaire d'inscription (email + mot de passe)
2. Ils sont automatiquement ajoutés au foyer — aucune étape supplémentaire

> **Google SSO pour les membres invités :** ils doivent d'abord créer leur compte via le lien d'invitation (email + mot de passe). Ensuite, lors des connexions suivantes, Google se lie automatiquement par email.

---

#### Ce qui manque encore (améliorations futures)

- Affichage du lien d'invitation directement dans l'interface
- Page paramètres du foyer (renommer, voir les membres, révoquer l'invitation)
- Réinitialisation de mot de passe

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

Permet de se connecter avec un compte Google au lieu de créer un mot de passe. L'email Google est rapproché d'un compte email/mot de passe existant (fusion automatique).

### 1. Créer un projet Google Cloud

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Cliquer sur le sélecteur de projet en haut → **Nouveau projet**
3. Donner un nom (ex : `Foodlist`) → **Créer**

### 2. Activer l'API Google Identity

1. Dans le projet, aller dans **APIs & Services > Bibliothèque**
2. Chercher `Google Identity` ou `People API` → **Activer**

### 3. Configurer l'écran de consentement OAuth

1. **APIs & Services > Écran de consentement OAuth**
2. Type d'utilisateur : **Externe** (même pour un usage personnel)
3. Remplir les champs obligatoires : nom de l'application, email de support
4. Dans **Domaines autorisés** : ajouter le domaine de votre serveur si exposé publiquement
5. Étape **Champs d'application** : ajouter `.../auth/userinfo.email` et `.../auth/userinfo.profile`
6. Étape **Utilisateurs test** : ajouter votre adresse Gmail (tant que l'app n'est pas vérifiée par Google, seuls les comptes listés ici peuvent se connecter)
7. **Enregistrer et continuer**

### 4. Créer les identifiants OAuth 2.0

1. **APIs & Services > Identifiants > Créer des identifiants > ID client OAuth 2.0**
2. Type d'application : **Application Web**
3. Nom : `Foodlist`
4. **Origines JavaScript autorisées** : `http://mon-serveur:3000` (ou votre domaine HTTPS)
5. **URI de redirection autorisés** : `http://mon-serveur:3000/api/auth/callback/google`
   - Si HTTPS : `https://mon-domaine/api/auth/callback/google`
6. **Créer** → copier le **Client ID** et le **Client secret**

### 5. Configurer l'application

Dans `.env` :

```env
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

Redémarrer :

```bash
make stop && make run
```

Le bouton **Continuer avec Google** apparaît automatiquement sur la page de connexion.

### Notes

- Le projet Google Cloud est créé avec votre compte, mais les credentials appartiennent à l'**application** : tous les membres de votre foyer peuvent se connecter avec leur propre compte Google.
- Tant que l'écran de consentement est en mode **Test**, seuls les comptes Gmail explicitement ajoutés dans "Utilisateurs test" peuvent utiliser la connexion Google. Ajoutez-y les adresses Gmail de tous les membres de votre foyer. C'est suffisant pour un usage familial — pas besoin de passer en production ni de faire valider l'app par Google.
- Si vous utilisez HTTPS (recommandé), remplacer toutes les URLs `http://` par `https://` dans les paramètres Google Cloud et dans `NEXTAUTH_URL`.

---

## Structure du projet

Voir [SPECS.md — Structure du projet](./SPECS.md#structure-du-projet).
