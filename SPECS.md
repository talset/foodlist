# Foodlist — Spécifications

## Vision

Application web progressive (PWA) de liste de courses partagée, accessible depuis mobile et ordinateur, auto-hébergeable via Docker avec une base de données MySQL existante.

---

## Objectifs

- Créer et partager des listes de courses entre plusieurs utilisateurs
- Accessible depuis au moins 2 mobiles et un ordinateur
- Synchronisation en temps réel entre les appareils
- Auto-hébergeable sur serveur personnel via Docker
- Connexion à une base de données MySQL existante

---

## Architecture technique

### Stack

| Couche | Techno | Rôle |
|--------|--------|------|
| Frontend | Next.js (React) + PWA | Interface utilisateur, installable sur mobile |
| Backend | Next.js API Routes | API REST, logique métier |
| Base de données | MySQL | Stockage des données (instance existante) |
| Temps réel | Server-Sent Events ou polling | Synchronisation entre appareils |
| Déploiement | Docker | Image unique, configuration par variables d'environnement |

### Déploiement Docker

- Une seule image Docker pour l'application (frontend + backend Next.js)
- Configuration via variables d'environnement (`.env`)
- Connexion à un serveur MySQL existant (pas de MySQL embarqué dans l'image)
- Exemple `docker-compose.yml` fourni pour faciliter le déploiement

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
```

---

## Fonctionnalités

### F1 — Authentification

- [ ] Inscription avec email + mot de passe
- [ ] Connexion / déconnexion
- [ ] Session persistante (JWT ou cookie)

### F2 — Listes de courses

- [ ] Créer une nouvelle liste (nommée)
- [ ] Afficher ses listes
- [ ] Supprimer une liste

### F3 — Partage

- [ ] Inviter un autre utilisateur à partager une liste (via lien ou code)
- [ ] Plusieurs utilisateurs peuvent accéder à la même liste
- [ ] Voir qui a modifié quoi (optionnel v2)

### F4 — Articles

- [ ] Ajouter un article à une liste (nom, quantité, unité)
- [ ] Cocher un article (acheté)
- [ ] Décocher un article
- [ ] Supprimer un article
- [ ] Catégoriser un article (ex : fruits, viandes, épicerie, surgelés…)

### F5 — Synchronisation temps réel

- [ ] Mise à jour automatique de la liste sur tous les appareils connectés
- [ ] Pas besoin de rafraîchir manuellement

### F6 — PWA / Mobile

- [ ] Installable sur l'écran d'accueil (iOS / Android)
- [ ] Fonctionne correctement sur petit écran
- [ ] Interface tactile friendly

---

## Modèle de données (MySQL)

### `users`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| email | VARCHAR(255) UNIQUE | Email |
| password_hash | VARCHAR(255) | Mot de passe hashé (bcrypt) |
| name | VARCHAR(100) | Nom affiché |
| created_at | DATETIME | Date de création |

### `lists`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| name | VARCHAR(255) | Nom de la liste |
| created_by | INT FK users.id | Créateur |
| created_at | DATETIME | Date de création |

### `list_members`
| Colonne | Type | Description |
|---------|------|-------------|
| list_id | INT FK lists.id | Liste |
| user_id | INT FK users.id | Utilisateur |
| joined_at | DATETIME | Date d'ajout |

### `items`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK AUTO_INCREMENT | Identifiant |
| list_id | INT FK lists.id | Liste parente |
| name | VARCHAR(255) | Nom de l'article |
| quantity | DECIMAL(10,2) | Quantité |
| unit | VARCHAR(50) | Unité (kg, L, pièce…) |
| category | VARCHAR(100) | Catégorie |
| checked | BOOLEAN | Acheté ou non |
| created_by | INT FK users.id | Ajouté par |
| updated_at | DATETIME | Dernière modification |

### `share_tokens`
| Colonne | Type | Description |
|---------|------|-------------|
| token | VARCHAR(64) PK | Token unique |
| list_id | INT FK lists.id | Liste concernée |
| expires_at | DATETIME | Expiration (nullable = permanent) |
| created_at | DATETIME | Date de création |

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
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── auth/
│   │   │   ├── lists/
│   │   │   └── items/
│   │   ├── (auth)/           # Pages auth (login, register)
│   │   ├── lists/            # Pages listes
│   │   └── layout.tsx
│   ├── components/           # Composants React
│   ├── lib/                  # Utilitaires (db, auth…)
│   └── types/                # Types TypeScript
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/
└── sql/
    └── schema.sql            # Script d'initialisation MySQL
```

---

## Phases de développement

### Phase 1 — Fondations
- Setup Next.js + TypeScript
- Connexion MySQL
- Dockerfile + docker-compose
- Script SQL de création des tables

### Phase 2 — Authentification
- Inscription / connexion
- Sessions JWT

### Phase 3 — Listes & Articles
- CRUD listes
- CRUD articles
- Interface mobile-first

### Phase 4 — Partage & Temps réel
- Système d'invitation par lien
- Synchronisation temps réel (SSE ou polling)

### Phase 5 — PWA & Finitions
- Manifest PWA
- Icônes
- Tests sur mobile
