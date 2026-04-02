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

# Icônes (monté en volume Docker)
ICONS_DIR=/app/uploads/icons
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

- [ ] Connexion via Google SSO (compte personnel)
- [ ] Connexion email + mot de passe (fallback)
- [ ] Inscription email/mot de passe
- [ ] Session persistante (JWT/cookie)
- [ ] Invitation d'autres utilisateurs au foyer via lien

### F2 — Catalogue de produits (global)

Un catalogue commun à tous les utilisateurs de l'instance, enrichi collaborativement.

- [ ] Fiche produit : nom, catégorie, unité de mesure, icône (emoji ou image uploadée)
- [ ] Recherche/autocomplete sur le nom du produit
- [ ] Ajouter un nouveau produit si absent du catalogue
- [ ] Import de produits en masse via fichier JSON
- [ ] Icône personnalisable par produit — voir F2b ci-dessous

### F2b — Gestion des icônes produits

**Structure des répertoires (volume Docker monté sur `ICONS_DIR`) :**

```
uploads/icons/
├── default/        # Icônes livrées avec l'application (embarquées dans l'image Docker)
│   ├── apple.png
│   ├── milk.png
│   └── ...
└── custom/         # Icônes uploadées par les utilisateurs
    ├── <uuid>.png
    └── ...
```

- Les icônes `default/` sont **copiées dans l'image Docker** au build (ne nécessitent pas de volume)
- Les icônes `custom/` sont stockées dans le volume monté, persistées entre redémarrages
- Toutes les icônes sont servies via une route publique Next.js : `/api/icons/default/<nom>` et `/api/icons/custom/<uuid>`

**Sélecteur d'icône (lors de la création/édition d'un produit) :**
- [ ] Onglet **Emoji** : saisir ou rechercher un emoji directement
- [ ] Onglet **Icônes par défaut** : grille de toutes les icônes présentes dans `default/`, chargées dynamiquement via l'API
- [ ] Onglet **Upload** : uploader une image custom (PNG/JPG/WebP, redimensionnée à 128×128 au stockage)
- [ ] Aperçu de l'icône sélectionnée avant validation
- [ ] Un produit n'a qu'une seule icône active : emoji OU icône par défaut OU image custom

**Catégories de produits :**
- Fruits & Légumes
- Viandes & Poissons
- Produits laitiers
- Épicerie / Conserves
- Surgelés
- Boissons
- Desserts / Pâtisserie
- Hygiène / Entretien
- Autre

### F3 — Statut produits (global au foyer)

Le statut de chaque produit est global au foyer, indépendamment des recettes ou listes.

- [ ] Deux états par produit : **OK** (en stock) / **Out of stock** (manquant)
- [ ] Changer le statut en un tap depuis la liste
- [ ] **Quantité en stock** : champ optionnel représentant un nombre d'unités physiques (paquets, bouteilles, boîtes…)
  - Boutons **+1 / -1** pour incrémenter/décrémenter rapidement
  - Quand la quantité atteint 0, le statut passe automatiquement à **out of stock**
  - Quand on incrémente depuis 0, le statut repasse à **OK**
  - Quantité minimale : 0 (ne peut pas être négative)
- [ ] Vue principale : produits triés par statut (out of stock en haut)
- [ ] Filtrage par catégorie

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
- Cocher un article = le passer en OK dans le stock global (et remettre la quantité à 1)
- Regroupement par catégorie

### F5 — Recettes

- [ ] Créer une recette : nom, description courte, photo (optionnelle)
- [ ] Section **étapes** en Markdown libre (titres, listes, gras, etc.) pour rédiger la préparation
- [ ] Rendu Markdown affiché proprement lors de la consultation de la recette
- [ ] Ajouter des ingrédients à une recette : produit (du catalogue) + quantité + unité
- [ ] Définir le nombre de parts de base de la recette
- [ ] Depuis la liste, ajouter une recette avec un multiplicateur :
  - Nombre de fois la recette (ex: ×2)
  - Ou nombre de personnes (ex: pour 6 personnes, recette de base pour 4 → ×1.5)
- [ ] Quand une recette est ajoutée, ses ingrédients apparaissent dans la liste de courses avec la quantité calculée, en plus du statut actuel du produit
- [ ] Plusieurs recettes peuvent être ajoutées, les quantités s'additionnent

**Exemple :**
> Lait est "out of stock" dans le stock global.
> J'ajoute la recette Cheesecake ×2 (qui nécessite 1L de lait par recette).
> La liste affiche : `🥛 Lait — out of stock | 2L pour recettes`

### F6 — Import / Export

#### Import
- [ ] Import du catalogue de produits via fichier JSON
- [ ] Import de recettes via fichier JSON (réimporter un export précédent)

#### Export
- [ ] **Export liste de courses** : état actuel de la liste (produits out of stock + quantités recettes) au format JSON
- [ ] **Export recettes** : toutes les recettes du foyer au format JSON (ingrédients, étapes, parts de base), réimportable

**Format JSON — import/export produits :**
```json
[
  {
    "name": "Lait entier",
    "category": "Produits laitiers",
    "unit": "L",
    "emoji": "🥛"
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
      { "product": "Lait entier", "quantity": 0.5, "unit": "L" },
      { "product": "Fromage frais", "quantity": 500, "unit": "g" }
    ]
  }
]
```

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
| created_at | DATETIME | Date de création |

### `products` (catalogue global)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| name | VARCHAR(255) UNIQUE | Nom du produit |
| category | VARCHAR(100) | Catégorie |
| unit | VARCHAR(50) | Unité par défaut (kg, L, pièce…) |
| emoji | VARCHAR(10) NULL | Emoji associé |
| icon_url | VARCHAR(500) NULL | URL image uploadée (si custom) |
| created_by | INT FK users.id | Ajouté par |
| created_at | DATETIME | Date de création |

### `stock` (statut global par foyer)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| product_id | INT FK products.id | Produit |
| household_id | INT FK households.id | Foyer |
| status | ENUM('ok','out_of_stock') | Statut actuel (auto si quantity = 0) |
| quantity | INT UNSIGNED DEFAULT 0 | Nombre d'unités physiques en stock (0 = out of stock) |
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
| quantity | DECIMAL(10,3) | Quantité pour base_servings |
| unit | VARCHAR(50) | Unité |

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
│   │   │   ├── products/           # CRUD catalogue
│   │   │   ├── stock/              # Statut produits
│   │   │   ├── recipes/            # CRUD recettes
│   │   │   ├── shopping/           # Liste de courses
│   │   │   ├── import/             # Import JSON
│   │   │   ├── icons/              # Serve + upload icônes (default & custom)
│   │   │   └── sse/                # Server-Sent Events
│   │   ├── (auth)/                 # Pages login / register
│   │   ├── list/                   # Page liste de courses
│   │   ├── products/               # Page catalogue produits
│   │   ├── recipes/                # Page recettes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ProductCard/            # Carte produit avec statut
│   │   ├── RecipeCard/             # Carte recette
│   │   ├── SearchAutocomplete/     # Recherche produits
│   │   ├── StatusToggle/           # Bouton ok/out-of-stock
│   │   └── EmojiPicker/            # Sélecteur emoji/image
│   ├── lib/
│   │   ├── db.ts                   # Connexion MySQL
│   │   ├── auth.ts                 # Config NextAuth
│   │   └── sse.ts                  # Utilitaires SSE
│   └── types/
│       └── index.ts
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/
├── uploads/                        # Volume Docker monté (persisté sur le serveur)
│   └── icons/
│       ├── default/                # Icônes par défaut (copiées dans l'image au build)
│       └── custom/                 # Icônes uploadées par les utilisateurs
└── sql/
    └── schema.sql                  # Script d'initialisation MySQL
```

---

## Phases de développement

### Phase 1 — Fondations
- Setup Next.js + TypeScript
- Connexion MySQL (`lib/db.ts`)
- Dockerfile + docker-compose
- Script SQL `schema.sql`
- `.env.example`

### Phase 2 — Authentification
- NextAuth.js : Google OAuth + email/mot de passe
- Gestion des foyers (création, invitation par lien)

### Phase 3 — Catalogue produits
- CRUD produits (avec catégories, emoji, upload icône)
- Recherche / autocomplete
- Import JSON

### Phase 4 — Stock & Liste de courses
- Gestion des statuts ok/out of stock par foyer
- Vue liste de courses consolidée
- Synchronisation SSE

### Phase 5 — Recettes
- CRUD recettes + ingrédients
- Ajout recette à la liste avec multiplicateur
- Calcul et affichage des quantités requises

### Phase 6 — PWA & Finitions
- Manifest PWA + icônes
- Optimisation mobile
- Tests multi-appareils
