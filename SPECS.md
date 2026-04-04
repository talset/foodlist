# Foodlist — Spécifications

## Vision

Application web progressive (PWA) de gestion du stock alimentaire et des courses, accessible depuis mobile et ordinateur, auto-hébergeable via Docker avec une base de données MySQL existante.

L'app permet à un foyer de suivre ce qui manque dans le frigo/placards, de gérer des recettes, et d'avoir une liste de courses consolidée automatiquement.

---

## Objectifs

- Suivre le statut des produits (ok / out of stock) au niveau du foyer
- Gérer des recettes et calculer les ingrédients nécessaires selon le nombre de parts
- Visualiser rapidement ce qui manque depuis mobile
- Partager la liste en temps réel entre plusieurs appareils
- Auto-hébergeable sur serveur personnel via Docker + MySQL existant

---

## Architecture technique

### Stack

| Couche | Techno | Rôle |
|--------|--------|------|
| Frontend | Next.js (React) + PWA | Interface mobile-first, installable |
| Backend | Next.js API Routes | API REST, logique métier |
| Base de données | MySQL | Stockage (instance existante) |
| Auth | NextAuth.js | Google SSO + email/mot de passe |
| Temps réel | Server-Sent Events (SSE) | Sync entre appareils |
| Déploiement | Docker | Image unique, config par variables d'env |

### Déploiement Docker

- Une seule image Docker (frontend + backend Next.js)
- Connexion à un MySQL existant via variables d'environnement
- Pas de MySQL embarqué dans l'image
- `docker-compose.yml` fourni pour faciliter le déploiement

### Variables d'environnement

```env
# Base de données MySQL
DB_HOST=192.168.x.x
DB_PORT=3306
DB_NAME=foodlist
DB_USER=foodlist_user
DB_PASSWORD=secret

# Application
NEXTAUTH_SECRET=changeme
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Icônes uploadées par les utilisateurs (monté en volume Docker — custom uniquement)
ICONS_DIR=/app/uploads/icons/custom
```

---

## Design & UX

- **Mobile-first** : interface pensée pour une utilisation rapide au téléphone, gestes tactiles
- **Simple et épuré** : le moins de clics possible pour les actions courantes
- **Navigation principale** : 3 onglets — Liste / Produits / Recettes
- **Couleurs de statut** : vert = OK, rouge/orange = out of stock
- **Recherche/autocomplete** partout où on ajoute un produit

---

## Fonctionnalités

### F1 — Authentification

**Modèle d'accès : inscription sur invitation uniquement**

- [ ] Connexion via Google SSO (compte personnel)
- [ ] Connexion email + mot de passe
- [ ] Session persistante (JWT/cookie)
- [ ] Invitation des utilisateurs via lien — **réservée aux admins globaux uniquement**

#### Bootstrap premier utilisateur

Si la base de données ne contient aucun utilisateur, l'inscription est ouverte librement (email ou Google). Ce premier compte devient automatiquement **admin global** de l'instance (`is_admin = 1`) et admin du foyer qu'il crée sur `/setup`.

#### Utilisateurs invités

Seul un **admin global** peut générer un lien d'invitation depuis la page `/admin`. Le lien `/register?token=<invite_token>` :
- Affiche le formulaire d'inscription (sinon, la page affiche "accès sur invitation")
- Valide le token côté serveur avant de créer le compte
- Auto-rejoint le foyer associé au token sans passer par `/setup`

#### Google SSO et comptes invités

Google SSO est autorisé pour :
- Le premier utilisateur (bootstrap)
- Les utilisateurs ayant déjà un compte (connexion classique, liaison automatique par email)

Un utilisateur invité qui veut utiliser Google doit d'abord créer son compte avec le lien d'invitation (email + mot de passe), puis Google se liera automatiquement à son email lors de la connexion suivante.

### F1b — Rôles et droits

L'application distingue deux niveaux d'accès :

#### Admin global (`is_admin = 1`)

- Accès à la page `/admin`
- CRUD complet sur les produits et catégories (catalogue global)
- CRUD complet sur les recettes (instance globale)
- Gestion des utilisateurs : promouvoir/rétrograder admin, supprimer
- Gestion des foyers : créer, supprimer, gérer les membres, générer et révoquer les invitations
- Gestion des icônes : vue par thème, remplacer ou ajouter des fichiers dans un thème
- Peut modifier/supprimer les produits, catégories et recettes créés par d'autres utilisateurs

#### Membre (`is_admin = 0`)

- Consulter le catalogue produits et catégories (lecture seule)
- Consulter les recettes (lecture seule)
- Mettre à jour le stock de son foyer (statut ok/out_of_stock, quantités +1/-1)
- Gérer la liste de courses de son foyer (ajouter/retirer des recettes, mode courses)
- Modifier son propre profil (nom affiché, thème visuel, thème d'icônes)

> **Note sur `household_members.role`** : le rôle `admin` au niveau du foyer est conservé en base mais n'accorde pas de droits supplémentaires à ce stade. Il pourra servir de base pour des fonctionnalités futures (ex: renommer le foyer). Tout ce qui dépasse la gestion du stock est réservé à l'admin global.

### F2 — Catalogue de produits (global à l'instance)

Un catalogue commun à tous les utilisateurs et tous les foyers de l'instance, enrichi collaborativement. Un produit ajouté est visible par tous les foyers. Le statut (stock) reste lui scopé par foyer (voir F3).

- [ ] Fiche produit : nom, catégorie, icône (image PNG/WebP), et **unité de référence** :
  - `ref_unit` : unité de mesure (L, g, kg, ml, unité, pièce…)
  - `ref_quantity` : quantité en `ref_unit` que représente 1 item physique
  - Exemples : lait → `1 L`, oignon → `1 unité`, gateau-pallet → `150 g`
  - Ces deux champs sont modifiables si le conditionnement du produit change
- [ ] Recherche/autocomplete sur le nom du produit
- [ ] Ajouter / modifier / supprimer un produit — **réservé aux admins globaux**
- [ ] Import de produits en masse via fichier JSON — **réservé aux admins globaux**
- [ ] Icône personnalisable par produit — **optionnelle**, voir F2b ci-dessous
- [ ] Si aucune icône n'est définie, affichage d'un placeholder générique (aucun blocage à la création)

### F2b — Gestion des icônes produits

**Structure des répertoires :**

```
uploads/icons/
├── default/        # Icônes livrées avec l'application — embarquées dans l'image Docker au build
│   ├── apple.png   # (chemin dans l'image : /app/uploads/icons/default/)
│   ├── milk.png
│   └── ...
├── <theme>/        # Packs d'icônes supplémentaires (ex: kawaii/) — embarqués dans l'image au build
│   ├── apple.png   # Si présent, remplace default/apple.png quand ce thème est actif
│   └── ...
└── custom/         # Icônes persistées via volume Docker (ICONS_DIR)
    ├── <uuid>.png  # Icônes custom produits — noms UUID, aucune collision avec les noms sémantiques
    └── themes/
        └── <theme>/
            └── apple.png  # Overrides admin uploadés via l'interface — prioritaires sur les icônes embarquées
```

**Absence de collision custom ↔ thème :** les icônes custom uploadées pour les produits sont **toujours renommées en UUID** côté serveur. Les icônes des packs (default, thèmes) utilisent des noms sémantiques (`apple.png`). Ces deux espaces sont disjoints.

- Les icônes `default/` et les packs de thèmes sont **committés dans le dépôt** et embarqués dans l'image Docker au build. Les thèmes disponibles sont ceux présents à ce moment — un nouveau thème nécessite un rebuild
- Les icônes `custom/` (UUID produits) et `custom/themes/` (overrides admin) sont dans le volume monté sur `ICONS_DIR`, persistées entre redémarrages
- Le volume Docker monte `custom/` : `./uploads/icons/custom:/app/uploads/icons/custom`
- Toutes les icônes sont servies via une **route unique** : `/api/icons/<ref>?theme=<theme>` avec l'ordre de résolution :
  1. `$ICONS_DIR/themes/<theme>/<ref>` (override admin uploadé — prioritaire)
  2. `uploads/icons/<theme>/<ref>` (pack embarqué dans l'image)
  3. `uploads/icons/default/<ref>`
  4. `$ICONS_DIR/<ref>` (UUID custom produit)

**Génération des icônes :**

Les icônes sont générées via des scripts Python utilisant des modèles IA (FLUX.1-schnell). Les specs des icônes par thème sont dans `seed/icons-<theme>.md`.

```bash
# Générer toutes les icônes du thème par défaut
python scripts/icons/generate_hf.py

# Générer pour un thème spécifique (ex: kawaii)
python scripts/icons/generate_hf.py --theme kawaii

# Filtrer par famille ou icône précise
python scripts/icons/generate_hf.py --theme kawaii --family fromage
python scripts/icons/generate_hf.py --theme kawaii --icon fromage-rond.png
```

Le `--theme` détermine le répertoire de sortie (`uploads/icons/<theme>/`) et le fichier de spec (`seed/icons-<theme>.md`). Voir `scripts/icons/README.md` pour les options complètes.

**Sélecteur d'icône (lors de la création/édition d'un produit, admin uniquement) :**
- [ ] Onglet **Icônes du thème** : grille de toutes les icônes du thème actif de l'admin (fallback sur `default/` si l'icône est absente du thème), chargées dynamiquement via l'API
- [ ] Onglet **Upload** : uploader une image custom (PNG/JPG/WebP, redimensionnée à 128×128 au stockage)
- [ ] Aperçu de l'icône sélectionnée avant validation
- [ ] Un produit n'a qu'une seule icône active : icône sémantique (default/thème) OU image custom UUID
- [ ] Si aucune icône n'est définie, affichage d'une icône générique (placeholder)

**Catégories de produits :**

Les catégories sont gérées en base de données (table `categories`). Une liste de catégories par défaut est insérée au premier lancement via `schema.sql`. Il est possible d'en ajouter de nouvelles depuis l'interface (page Produits > Paramètres catégories).

Catégories par défaut :
- Fruits & Légumes
- Viandes & Poissons
- Produits laitiers
- Épicerie / Conserves
- Surgelés
- Boissons
- Apéro
- Boulangerie
- Desserts / Pâtisserie
- Condiments & Sauces
- Hygiène / Entretien
- Autre

Gestion des catégories — **réservée aux admins globaux** :
- [ ] Ajouter une catégorie personnalisée (nom libre)
- [ ] Renommer une catégorie existante
- [ ] Supprimer une catégorie vide (sans produits associés)
- [ ] Les catégories sont partagées par tous les utilisateurs de l'instance

### F3 — Statut produits (global au foyer)

#### Sélection des produits du foyer

Le stock d'un foyer est un **sous-ensemble du catalogue global**. Chaque foyer choisit les produits qu'il souhaite suivre ; les produits des autres foyers ne sont jamais visibles.

**Flux de sélection (page Produits) :**
- Chaque ligne produit affiche un bouton **"+ Stock"** si le produit n'est pas encore suivi par le foyer
- Si le produit est déjà dans le stock, un badge **"Dans le stock"** (vert) remplace le bouton
- Bouton **"+ Tout ajouter au stock (N)"** en en-tête : ajoute en un clic tous les produits visibles (filtrés) qui ne sont pas encore dans le stock du foyer
- Le filtre catégorie de la page Produits permet d'ajouter une catégorie entière en un clic
- [ ] Lors de l'ajout, le produit est créé dans le stock avec `quantity = 0`, `status = in_stock`

Le statut de chaque produit est global au foyer, indépendamment des recettes ou listes.

**Trois statuts disponibles :**

| Statut | DB | UI | Couleur | Déclencheur |
|--------|----|----|---------|-------------|
| En stock | `in_stock` | "OK" | vert | quantité > 0, ou passage manuel |
| Faible | `low` | "Peu" | orange | passage manuel, ou automatique si quantité ≤ seuil (futur) |
| Épuisé | `out_of_stock` | "Épuisé" | rouge | quantité = 0, ou passage manuel |

- [ ] Changer le statut en un tap depuis la liste
- [ ] **Quantité en stock** : champ optionnel représentant un nombre d'unités physiques (paquets, bouteilles, boîtes…)
  - Boutons **+1 / -1** pour incrémenter/décrémenter rapidement
  - Quand la quantité atteint 0, le statut passe automatiquement à **`out_of_stock`**
  - Quand on incrémente depuis 0, le statut repasse à **`in_stock`**
  - Quantité minimale : 0 (ne peut pas être négative)
  - Le statut `low` est passé manuellement pour l'instant ; un seuil par produit est prévu (voir F12)
- [ ] Vue principale : produits triés par statut (out of stock en haut)
- [ ] **Barre de recherche** en haut de la vue pour filtrer les produits affichés en temps réel (filtre live sur le nom)
- [ ] **Strip de filtres catégories** : ligne horizontale scrollable sous la recherche
  - Un chip par catégorie : icône du produit représentatif + nom court de la catégorie
  - Chip "Tous" en premier (sélectionné par défaut)
  - Sélection exclusive (une seule catégorie à la fois)
  - Les deux filtres (recherche + catégorie) se combinent

### F4 — Liste de courses consolidée

La liste de courses est générée automatiquement à partir :
1. Des produits marqués **out of stock**
2. Des ingrédients manquants des recettes ajoutées

**Affichage de la liste :**
- Chaque ligne = un produit avec :
  - Icône + nom
  - Statut (out of stock / ok) + quantité en stock si > 0 (ex : `×2`)
  - **Bulle de quantité recette** : affichée à côté du nom si le produit est requis par une recette ajoutée
    - Exprimée en unité de la recette (L, g, pièces…)
    - Quantité minimale affichée : 1 (ex : `● 2L` ou `● 1 pièce`)
    - Exemple : `🥛 Lait — out of stock  ● 2L`
    - Si plusieurs recettes utilisent le même produit, les quantités sont additionnées
- Regroupement par catégorie

**Filtres de la liste de courses :**

Les trois filtres sont indépendants et se combinent entre eux.

- [ ] **Barre de recherche** : filtre live sur le nom du produit
- [ ] **Strip de filtres catégories** : ligne horizontale scrollable
  - Chip "Tous" + un chip par catégorie présente dans la liste (icône + nom court)
  - Seules les catégories ayant au moins un article dans la liste sont affichées
- [ ] **Filtre recette** : affiché uniquement si au moins une recette est active dans la liste
  - Strip horizontal scrollable sous les catégories
  - Chip "Toutes" + un chip par recette active (nom de la recette)
  - Sélectionner une recette → affiche uniquement les ingrédients liés à cette recette
  - Pratique pour faire les courses rayon par rayon en suivant une recette

**Mode courses (filtre "À acheter") :**
- [ ] Toggle en haut de la liste pour n'afficher que les articles encore à acheter (out of stock ou avec bulle de quantité recette)
- [ ] Cocher un article → statut passe à OK **et l'article disparaît instantanément** de la vue
  - La bulle de quantité recette disparaît pour cet ingrédient
  - Si tous les ingrédients d'une recette active sont cochés → la recette est **automatiquement retirée** de la liste (reset)
- [ ] Toutes les actions (cocher un article, mise à jour stock) sont synchronisées en temps réel via SSE sur tous les appareils du foyer
- [ ] Le toggle d'affichage "mode courses" est une préférence locale à l'appareil (UI uniquement, pas de donnée persistée)

### F5 — Recettes

Les recettes sont **globales à l'instance** (comme le catalogue produits). Toutes les recettes sont visibles par tous les foyers. La création, modification et suppression de recettes est **réservée aux admins globaux**.

#### Création / édition (admin uniquement)
- [ ] Créer une recette : nom, description courte, photo (optionnelle)
- [ ] Section **étapes** en Markdown libre (titres, listes, gras, etc.) pour rédiger la préparation
- [ ] Rendu Markdown affiché proprement lors de la consultation de la recette
- [ ] Ajouter des ingrédients à une recette : produit (du catalogue) + quantité
  - L'unité est pré-remplie automatiquement avec la `ref_unit` du produit et n'est pas modifiable
  - La quantité est exprimée dans cette unité (ex : 2 pour 2L de lait, 300 pour 300g de farine)
- [ ] Définir le nombre de parts de base de la recette

#### Vue détail d'une recette
- [ ] Liste des ingrédients avec leur **statut stock actuel** :
  - Ingrédient **out of stock** → affiché en rouge
  - Ingrédient **OK** → affiché normalement
- [ ] Modifier la quantité d'un ingrédient directement depuis la recette (+1/-1 ou saisie libre) → met à jour le stock global
- [ ] **Icône "réalisable"** : si tous les ingrédients de la recette sont en statut OK, un indicateur visuel (ex : ✅ ou badge vert) apparaît sur la recette pour signaler qu'elle est prête à être cuisinée

#### Ajout à la liste de courses
- [ ] Depuis la liste, ajouter une recette avec un multiplicateur :
  - Nombre de fois la recette (ex: ×2)
  - Ou nombre de personnes (ex: pour 6 personnes, recette de base pour 4 → ×1.5)
- [ ] Quand une recette est ajoutée, ses ingrédients out of stock apparaissent dans la liste avec la quantité calculée
- [ ] Plusieurs recettes peuvent être ajoutées, les quantités s'additionnent

#### Comportement lors des courses
- [ ] Cocher un ingrédient dans la liste → statut OK, bulle de quantité recette disparaît pour cet ingrédient
- [ ] Quand **tous les ingrédients** d'une recette active sont cochés (OK) → la recette est **automatiquement retirée** de la liste (reset), sans action manuelle

**Exemple :**
> Lait est "out of stock" dans le stock global.
> J'ajoute la recette Cheesecake ×2 (qui nécessite 1L de lait par recette).
> La liste affiche : `🥛 Lait — out of stock ● 2L`
> Je coche le Lait → statut OK, la bulle disparaît.
> Si tous les autres ingrédients du Cheesecake sont aussi OK → la recette est retirée de la liste.

### F6 — Import / Export

#### Import
- [ ] Import du catalogue de produits via fichier JSON
- [ ] Import de recettes via fichier JSON (réimporter un export précédent)

#### Export
- [ ] **Export liste de courses** : état actuel (produits `out_of_stock` + quantités recettes) au format JSON
- [ ] **Export recettes** : toutes les recettes de l'instance au format JSON (ingrédients, étapes, parts de base), réimportable

**Format JSON — import/export produits :**
```json
[
  {
    "name": "Lait entier",
    "category": "Produits laitiers",
    "ref_unit": "L",
    "ref_quantity": 1,
    "icon_ref": "milk.png"
  },
  {
    "name": "Oignon",
    "category": "Fruits & Légumes",
    "ref_unit": "unité",
    "ref_quantity": 1,
    "icon_ref": "onion.png"
  },
  {
    "name": "Gateau-pallet",
    "category": "Desserts / Pâtisserie",
    "ref_unit": "g",
    "ref_quantity": 150,
    "icon_ref": null
  }
]
```

**Format JSON — import/export recettes :**
```json
[
  {
    "name": "Cheesecake",
    "description": "Cheesecake classique new-yorkais",
    "base_servings": 8,
    "steps_markdown": "## Préparation\n\n1. Mélanger...\n\n## Cuisson\n\n...",
    "ingredients": [
      { "product": "Lait entier", "quantity": 0.5 },
      { "product": "Fromage frais", "quantity": 500 }
    ]
  }
]
```

**Format JSON — export liste de courses :**
```json
[
  {
    "product": "Lait entier",
    "category": "Produits laitiers",
    "status": "out_of_stock",
    "quantity": 0,
    "recipe_quantity": 2.0,
    "ref_unit": "L"
  }
]
```

> L'unité est omise dans l'export recettes car elle est portée par le produit (`ref_unit`). À l'import, si le produit n'existe pas encore dans le catalogue, il est créé avec `ref_unit = "unité"` et `ref_quantity = 1` par défaut — à corriger manuellement ensuite.

### F7 — Synchronisation temps réel

- [ ] Mise à jour automatique sur tous les appareils connectés (SSE)
- [ ] Pas de notifications push

### F8 — PWA

- [ ] Installable sur l'écran d'accueil (iOS / Android)
- [ ] Fonctionne correctement sur petit écran
- [ ] Interface tactile optimisée

---

## Modèle de données (MySQL)

### `users`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| email | VARCHAR(255) UNIQUE | Email |
| password_hash | VARCHAR(255) NULL | Null si connexion Google |
| google_id | VARCHAR(255) NULL | ID Google OAuth |
| name | VARCHAR(100) | Nom affiché |
| is_admin | TINYINT(1) DEFAULT 0 | 1 = admin global de l'instance |
| site_theme | VARCHAR(50) DEFAULT 'default' | Thème visuel choisi (voir F10) |
| icon_theme | VARCHAR(50) DEFAULT 'default' | Pack d'icônes choisi (voir F10) |
| created_at | DATETIME | Date de création |

### `categories` (catégories de produits)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| name | VARCHAR(100) UNIQUE | Nom de la catégorie |
| is_default | TINYINT(1) DEFAULT 0 | 1 si catégorie livrée par défaut |
| sort_order | INT DEFAULT 0 | Ordre d'affichage |
| created_at | DATETIME | Date de création |

### `products` (catalogue global)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| name | VARCHAR(255) UNIQUE | Nom du produit |
| category_id | INT FK categories.id | Catégorie |
| ref_unit | VARCHAR(50) | Unité de mesure de référence (L, g, kg, unité…) |
| ref_quantity | DECIMAL(10,3) DEFAULT 1 | Quantité en `ref_unit` que représente 1 item physique (ex : 1 bouteille de lait = 1 L → `ref_quantity = 1` ; 1 paquet de gâteaux = 150 g → `ref_quantity = 150`) |
| icon_ref | VARCHAR(500) NULL | Nom du fichier icône (ex : `milk.png` ou `<uuid>.png`) — résolu via `/api/icons/<ref>` |
| created_by | INT FK users.id | Ajouté par |
| created_at | DATETIME | Date de création |

### `stock` (statut global par foyer)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| product_id | INT FK products.id | Produit |
| household_id | INT FK households.id | Foyer |
| status | ENUM('in_stock','low','out_of_stock') | Statut actuel — `out_of_stock` automatique si quantity = 0 ; `low` = stock présent mais faible (quantity > 0 mais en alerte) ; `in_stock` = stock normal |
| quantity | INT UNSIGNED DEFAULT 0 | Nombre d'unités physiques en stock (paquets, bouteilles…) |
| updated_by | INT FK users.id | Dernière modif par |
| updated_at | DATETIME | Date de modif |

### `households` (foyers / groupes)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| name | VARCHAR(255) | Nom du foyer |
| created_by | INT FK users.id | Créateur |
| invite_token | VARCHAR(64) UNIQUE | Token d'invitation |
| created_at | DATETIME | Date de création |

### `household_members`
| Colonne | Type | Description |
|---------|------|-------------|
| household_id | INT FK households.id | Foyer |
| user_id | INT FK users.id | Membre |
| role | ENUM('admin','member') | Rôle |
| joined_at | DATETIME | Date d'adhésion |

### `recipes`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| name | VARCHAR(255) | Nom de la recette |
| description | TEXT NULL | Description courte |
| steps_markdown | LONGTEXT NULL | Étapes de la recette en Markdown libre |
| photo_url | VARCHAR(500) NULL | Photo |
| base_servings | INT | Nombre de parts de base |
| created_by | INT FK users.id | Créateur |
| created_at | DATETIME | Date de création |

### `recipe_ingredients`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| recipe_id | INT FK recipes.id | Recette |
| product_id | INT FK products.id | Produit (du catalogue) |
| quantity | DECIMAL(10,3) | Quantité pour `base_servings`, exprimée dans la `ref_unit` du produit |

> L'unité n'est pas stockée ici : elle est toujours celle du produit (`ref_unit`). Lors de l'ajout d'un ingrédient à une recette, l'unité est pré-remplie et non modifiable — cela garantit que la conversion en items physiques (`quantity / ref_quantity`) est toujours possible sans ambiguïté.

### `shopping_recipes` (recettes ajoutées à la liste en cours)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| household_id | INT FK households.id | Foyer |
| recipe_id | INT FK recipes.id | Recette |
| multiplier | DECIMAL(5,2) | Multiplicateur (ex: 1.5 pour 6 pers / recette de 4) |
| added_by | INT FK users.id | Ajouté par |
| added_at | DATETIME | Date d'ajout |

---

## Structure du projet

```
foodlist/
├── SPECS.md
├── README.md
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/               # NextAuth
│   │   │   ├── admin/              # API admin (users, households, icons)
│   │   │   ├── products/           # CRUD catalogue (admin)
│   │   │   ├── categories/         # CRUD catégories (admin)
│   │   │   ├── stock/              # Statut produits (membres)
│   │   │   ├── recipes/            # CRUD recettes (admin) + lecture (tous)
│   │   │   ├── shopping/           # Liste de courses (membres)
│   │   │   ├── profile/            # Profil utilisateur
│   │   │   ├── import/             # Import JSON (admin)
│   │   │   ├── icons/              # Serve + upload icônes
│   │   │   └── sse/                # Server-Sent Events
│   │   ├── (auth)/                 # Pages login / register / setup
│   │   ├── admin/                  # Page administration (admin uniquement)
│   │   ├── profile/                # Page profil utilisateur
│   │   ├── list/                   # Page liste de courses
│   │   ├── products/               # Page catalogue produits
│   │   ├── recipes/                # Page recettes
│   │   ├── globals.css             # CSS global + variables de thèmes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ProductCard/            # Carte produit avec statut
│   │   ├── RecipeCard/             # Carte recette
│   │   ├── SearchAutocomplete/     # Recherche produits
│   │   ├── StatusToggle/           # Bouton ok/out-of-stock
│   │   ├── IconPicker/             # Sélecteur icône (thème actif / upload)
│   │   ├── BottomNav.tsx           # Navigation principale mobile
│   │   └── ThemeProvider.tsx       # Injection du thème avant hydration
│   ├── lib/
│   │   ├── db.ts                   # Connexion MySQL
│   │   ├── auth.ts                 # Config NextAuth
│   │   ├── icon.ts                 # Utilitaires résolution icônes
│   │   └── sse.ts                  # Utilitaires SSE
│   └── types/
│       └── index.ts
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/
├── uploads/                        # Icônes persistées ou embarquées
│   └── icons/
│       ├── default/                # Icônes par défaut (embarquées dans l'image au build)
│       ├── <theme>/                # Packs de thèmes (embarqués dans l'image au build)
│       └── custom/                 # Icônes uploadées (volume Docker monté sur ICONS_DIR)
├── seed/
│   └── products.json               # Catalogue initial (~230 produits) importable via /api/import
└── sql/
    └── schema.sql                  # Script d'initialisation MySQL
```

---

## Phases de développement

### Phase 1 — Fondations ✅
- Setup Next.js + TypeScript
- Connexion MySQL (`lib/db.ts`)
- Dockerfile + docker-compose
- Script SQL `schema.sql`
- `.env.example`

### Phase 2 — Authentification ✅
- NextAuth.js : Google OAuth + email/mot de passe
- Bootstrap premier utilisateur (admin global auto)
- Gestion des foyers (création sur `/setup`, invitation par lien admin)

### Phase 3 — Catalogue produits ✅
- CRUD produits + catégories (admin uniquement)
- Recherche / autocomplete
- Import JSON
- Gestion des icônes (default, custom UUID, thèmes)

### Phase 4 — Stock & Liste de courses ✅
- Gestion des statuts in_stock/low/out_of_stock par foyer
- Vue liste de courses consolidée avec filtres
- Synchronisation SSE

### Phase 5 — Recettes ✅
- CRUD recettes + ingrédients (admin uniquement)
- Ajout recette à la liste avec multiplicateur
- Calcul et affichage des quantités requises

### Phase 6 — Admin & Profil ✅
- Page `/admin` : utilisateurs, foyers, catalogue, icônes
- Page `/profile` : nom, thème visuel, thème d'icônes
- Thèmes CSS (`globals.css` + `ThemeProvider`)

### Phase 7 — PWA & Finitions
- Manifest PWA + icônes
- Optimisation mobile
- Tests multi-appareils

---

### F9 — Administration

Un **admin global** est un utilisateur avec `is_admin = 1`. Le premier utilisateur inscrit reçoit automatiquement ce rôle. Les admins peuvent promouvoir/rétrograder d'autres utilisateurs (avec protection : dernier admin ne peut pas être retiré, et on ne peut pas se rétrograder soi-même).

La page `/admin` est protégée par middleware (redirection vers `/` si non admin).

#### Onglet Vue d'ensemble

- 4 compteurs : utilisateurs, foyers, produits, recettes

#### Onglet Utilisateurs

- Liste de tous les utilisateurs (nom, email, foyer, badge admin)
- Actions : promouvoir/rétrograder admin, supprimer un utilisateur

#### Onglet Foyers

- Liste de tous les foyers avec leurs membres
- Actions par foyer :
  - Copier le lien d'invitation
  - Régénérer le token d'invitation
  - Retirer un membre d'un foyer
  - Supprimer un foyer (supprime aussi stock et shopping_recipes associés)
  - Créer un nouveau foyer (sans y ajouter l'admin automatiquement)

#### Onglet Catalogue (produits)

- [ ] Liste des produits sans icône — avec export des noms pour générer les fichiers d'icônes manquants
- [ ] Liste des produits en doublon probable (noms proches)
- [ ] Supprimer un produit (uniquement s'il n'est référencé dans aucun stock ni recette)

#### Onglet Icônes

- [ ] Vue par thème disponible (répertoires détectés dans `uploads/icons/` hors `default/` et `custom/`)
- [ ] Pour chaque thème : grille des icônes présentes dans `default/`, avec indication de si le thème a une version propre ou un override admin
- [ ] Possibilité d'uploader un override admin pour une icône d'un thème donné — le fichier est stocké dans `$ICONS_DIR/themes/<theme>/` (volume persisté), et prend priorité sur l'icône embarquée
- [ ] Bouton "Supprimer l'override" pour revenir à l'icône embarquée du thème
- [ ] Détection des icônes `custom/` (UUID) non référencées par aucun produit → bouton "Supprimer les orphelins"

#### Fonctionnalités futures (non implémentées)

- Paramètres globaux de l'instance (nom de l'app, logo, etc.)

---

### F10 — Thèmes

#### Thèmes visuels (site_theme)

6 thèmes CSS disponibles, sélectionnables depuis le profil :

| Thème | Description |
|-------|-------------|
| `default` | Blanc classique (bleu) |
| `dark` | Mode sombre (slate) |
| `pure` | Blanc épuré (gris) |
| `light` | Bleu ciel |
| `happy` | Orange chaleureux |
| `japon` | Rouge et blanc discret |

Les thèmes sont implémentés via CSS custom properties sur `[data-theme="..."]`. Le thème est appliqué avant hydration via un cookie `foodlist-theme` lu par un inline script dans le layout.

#### Thèmes d'icônes (icon_theme)

Les icônes sont organisées en répertoires sous `uploads/icons/`. L'utilisateur peut choisir un pack d'icônes dans son profil (indépendamment du thème visuel).

Un pack d'icônes est un répertoire `uploads/icons/<theme>/` contenant des fichiers aux mêmes noms sémantiques que `default/` (ex: `apple.png`). Un pack n'a pas besoin de couvrir toutes les icônes : si un fichier est absent du pack, l'icône `default/` est utilisée en fallback.

**Les packs sont embarqués dans l'image Docker au build.** Aucun thème ne peut être créé depuis l'interface — seul l'ajout/remplacement de fichiers dans les thèmes existants est possible via l'admin (voir F9). Pour ajouter un nouveau thème, il faut créer le répertoire dans le dépôt et rebuilder l'image.

L'ordre de résolution est décrit dans F2b. La liste des packs disponibles est détectée dynamiquement en lisant les sous-dossiers de `uploads/icons/` (hors `default/` et `custom/`).

---

### F11 — Profil utilisateur

La page `/profile` permet à chaque utilisateur de :
- Modifier son nom affiché
- Choisir son thème visuel parmi les 6 disponibles (avec aperçu de couleurs)
- Choisir son pack d'icônes parmi les répertoires disponibles dans `uploads/icons/`
- Accéder à la page d'administration (bouton visible uniquement pour les admins)

Après sauvegarde, le JWT est rafraîchi via `update()` de `useSession()` pour que les préférences soient immédiatement actives.

---

### F12 — Idées & fonctionnalités futures

#### Paramètres globaux de l'instance

Page admin pour configurer : nom de l'application, logo, couleur primaire de base. Stocké dans une table `settings` (clé/valeur).

#### Réinitialisation de mot de passe

Flux standard : formulaire "mot de passe oublié" → email avec lien tokenisé → formulaire de réinitialisation. Nécessite une config SMTP dans les variables d'environnement.
