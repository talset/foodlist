# Foodlist — Spécifications de génération des icônes

## Style global

Toutes les icônes suivent le même style visuel :

- **Format** : PNG, 128×128 px, fond transparent
- **Style** : flat design, illustration minimaliste
- **Contours** : trait légèrement arrondi, 2–3 px, couleur légèrement plus foncée que le remplissage
- **Couleurs** : palette limitée (2–4 couleurs par icône), teintes saturées mais pas criardes
- **Perspective** : légèrement isométrique ou vue de 3/4 pour les objets volumétriques (bouteilles, boîtes), vue de face pour les produits plats
- **Pas d'ombre portée**, pas de dégradé complexe — aplats simples acceptés

Prompt de base à préfixer pour chaque icône :
> *flat design icon, minimalist illustration, transparent background, 128x128, clean and simple, no shadow, vibrant colors, slight rounded outline*

---

## Familles d'icônes à dériver

Certaines familles partagent une **forme commune** et ne varient que par la couleur ou l'étiquette.
Créer d'abord la forme de base, puis décliner.

---

### Famille 1 — Bouteille générique (boissons)

**Forme de base** : bouteille arrondie avec étiquette rectangulaire, bouchon visible.
Décliner en changeant la couleur du verre et de l'étiquette.

| Fichier | Couleur verre | Couleur étiquette | Notes |
|---|---|---|---|
| `bouteille-biere.png` | Ambre/marron | Jaune | Capsule métallique visible, mousse légère suggérée |
| `bouteille-cidre.png` | Vert bouteille | Blanc/beige | Capsule |
| `bouteille-cola.png` | Marron très foncé (quasi noir) | Rouge avec filet blanc | Incontournable |
| `bouteille-fanta.png` | Transparent/orange | Orange vif | |
| `bouteille-icetea.png` | Ambre doré | Brun/ocre | |
| `bouteille-limonade.png` | Vert clair ou transparent | Jaune citron | Bulles suggérées |
| `bouteille-vin-rouge.png` | Bordeaux foncé | Étiquette crème/ivoire | Forme vin (col long) |
| `bouteille-vin-blanc.png` | Vert clair ou transparent | Étiquette verte | Forme vin |
| `bouteille-rhum.png` | Brun foncé | Dorée, mention rhum | Forme spiritueux (col court, épaule tombante) |
| `bouteille-sirop.png` | Transparent/rouge rosé | Rose/rouge | Forme fine et haute |
| `bouteille-huile.png` | Doré/ambré | Vert olive ou blanc | Forme fine et haute, bouchon doseur |

---

### Famille 2 — Squeeze bottle (sauces)

**Forme de base** : flacon souple en plastique avec bec verseur, vu de 3/4.

| Fichier | Couleur | Produits |
|---|---|---|
| `bouteille-sauce-rouge.png` | Rouge | Ketchup, Sauce tomate, Sauce bolo, Sauce harissa, Sauce piquante, Sauce sachets |
| `bouteille-sauce-jaune.png` | Jaune | Mayonnaise, Sauce samouraï |
| `bouteille-sauce-brune.png` | Brun/marron | Sauce barbecue, Sauce burger, Sauce soja |
| `bouteille-sauce-verte.png` | Vert | Pesto |
| `bouteille-sauce-orange.png` | Orange chaud | Sauce tikka masala |

---

### Famille 3 — Boîte de conserve cylindrique

**Forme de base** : boîte cylindrique vue légèrement de 3/4, étiquette qui fait le tour.

| Fichier | Couleur étiquette | Motif | Produits |
|---|---|---|---|
| `conserve-legumes.png` | Vert | Silhouette de haricot ou légume | Épinards, Flageolets, Haricots, Haricots rouges, Haricots tomate, Petits pois |
| `conserve-tomate.png` | Rouge | Tomate | Concentré de tomate, Purée de tomate |
| `conserve-poisson.png` | Bleu | Poisson | Maquereau, Thon, Thon tomate |
| `conserve-soupe.png` | Orange | Bol de soupe | Soupe |
| `conserve-cassoulet.png` | Marron/terra cotta | Haricot et saucisse | Cassoulet |
| `conserve-plat.png` | Gris/beige | Générique | Paëlla, Ravioli, Pâté |

---

### Famille 4 — Fromages

| Fichier | Description visuelle | Produits |
|---|---|---|
| `fromage-rond.png` | Meule ronde plate, vue de 3/4, croûte beige | Camembert, Mont d'or, Reblochon, Tomme de savoie, Tomme du Berry |
| `fromage-bloc.png` | Bloc rectangulaire jaune/ivoire, coins légèrement arrondis | Comté (toutes variantes), Beaufort, Gouda, Port salut, Gruyère |
| `fromage-rape.png` | Tas de fromage râpé en forme de petit monticule | Gruyère rapé, Fromage rapé, Emmental (800g) |
| `fromage-frais.png` | Pot blanc à couvercle, forme yaourt | Fromage blanc, Fromage frais, Fromage fondue |
| `fromage-burger.png` | Tranche carrée fine, jaune | Fromage burger, Fromage croc |
| `fromage-chevre.png` | Bûchette cylindrique, croûte blanche cendrée | Chèvre |
| `fromage-bleu.png` | Bloc irrégulier avec veines bleues visibles | Roquefort |
| `fromage-moule.png` | Boule blanche luisante dans un fond d'eau, sachet | Mozzarella |
| `fromage-morbier.png` | Tranche avec raie noire horizontale au centre | Morbier |
| `fromage-munster.png` | Meule ronde à croûte orange vif | Munster |
| `babybel.png` | Petit disque rouge avec la cire caractéristique | Babybel, Vache qui rit |
| `fromage-raclette.png` | Demi-meule coupée, vue de 3/4 | Raclette |
| `cheddar.png` | Bloc/tranche orange, texture légèrement marbréee | Cheddar |
| `parmesan.png` | Morceau granuleux beige cassé (forme irrégulière) | Parmesan |

---

### Famille 5 — Charcuterie & Viandes & Poissons

| Fichier | Description | Produits |
|---|---|---|
| `chorizo.png` | Tranches rondes rouges marbrées, légèrement en éventail | Chorizo |
| `saucisson.png` | Tranches de saucisson beige/brun, en éventail | Saucisson, Rosette |
| `jambon.png` | Tranche de jambon rose roulée ou pliée | Jambon |
| `bacon.png` | Deux tranches striées rose/blanc, légèrement gondolées | Bacon |
| `lardon.png` | Petits cubes/dés roses en barquette | Lardon |
| `saucisse.png` | Saucisse courbe rose/brun clair | Saucisse, Knack |
| `saucisse-chipolata.png` | Saucisse courbe plus fine, beige | Chipolata |
| `saucisse-merguez.png` | Saucisse fine rouge-brun, bout pointu | Merguez |
| `steak-hache.png` | Steak rond/ovale avec marques de grille, rouge-brun | Steak haché, Viande hachée |
| `poulet.png` | Cuisse de poulet dorée, os visible | Poulet |
| `agneau.png` | Côtelette d'agneau avec manche décoré | Agneau |
| `porc.png` | Tranche de rôti de porc rosée | Porc |
| `pate.png` | Petite boîte de conserve ovale (pâté style Hénaff) | Pâté |
| `rillettes.png` | Pot en verre avec couvercle, intérieur beige | Rillettes saumons |
| `cordon-bleu.png` | Escalope panée rectangle/ovale, doré | Cordon bleu |
| `saumon.png` | Pavé de saumon rose saumon, côté peau visible | Saumon |
| `moules.png` | Moule ouverte, coquille noire, chair orangée | Moules |
| `poisson-pane.png` | Rectangle pané doré, filet de poisson | Poisson pané |

---

### Famille 6 — Épicerie sèche & Féculents

| Fichier | Description | Produits |
|---|---|---|
| `pates.png` | Paquet de pâtes avec fenêtre transparente laissant voir des penne | Pâtes, Macaroni, Lasagnes, Ravioli |
| `nouilles.png` | Bloc de nouilles asiatiques emballé, style ramen | Nouilles |
| `riz.png` | Sachet de riz transparent avec grains blancs visibles | Riz, Semoule |
| `lentilles.png` | Sachet de lentilles vertes, quelques lentilles au premier plan | Lentilles |
| `farine.png` | Sac de farine blanc avec logo épi de blé | Farine, Chapelure |
| `sucre.png` | Sac de sucre blanc avec logo | Sucre en poudre, Sucre morceau |
| `puree-instant.png` | Sachet de flocons de purée, illustration de pomme de terre | Purée |
| `chapelure.png` | Boîte ou sachet jaune/doré, miettes visibles | Chapelure — peut partager `farine.png` |

---

### Famille 7 — Boulangerie

| Fichier | Description | Produits |
|---|---|---|
| `pain.png` | Baguette en diagonale, croûte dorée, entailles visibles | Pain, Pain de mie, Galette kebab |
| `pain-mie.png` | Tranches de pain de mie en sachet transparent | Pain de mie |
| `pain-burger.png` | Petit pain rond avec graines de sésame | Pain burger |
| `pain-lait.png` | Petit pain brioché ovale, doré et brillant | Pain au lait |
| `brioche.png` | Brioche tressée vue de 3/4, dorée | Brioche |
| `galette-kebab.png` | Pain pita/galette plate et ronde, légèrement gonflé | Galette kebab |
| `pate-pizza.png` | Boule de pâte légèrement farinée, sur plan de travail | Pâte à pizza |
| `pate-feuilletee.png` | Rouleau de pâte déroulé partiellement, feuillets visibles | Pâte feuilletée |

---

### Famille 8 — Produits laitiers

| Fichier | Description | Produits |
|---|---|---|
| `lait.png` | Brique Tetra Pak blanche, trait de couleur en haut | Lait |
| `lait-coco.png` | Boîte de conserve blanche avec noix de coco illustrée | Lait de coco |
| `beurre.png` | Plaquette de beurre enveloppée dans papier doré/argenté | Beurre |
| `creme-fraiche.png` | Pot opaque blanc à couvercle bleu/blanc | Crème fraîche |
| `creme-liquide.png` | Petite brique UHT crème/beige | Crème liquide |
| `oeuf.png` | Boîte à œufs entrouverte, 6 œufs visibles | Œufs |
| `yaourt.png` | Pot de yaourt en plastique avec couvercle en aluminium | Yaourt, Yaourt nature, Yaourt aux fruits |
| `yop.png` | Petite bouteille yaourt à boire avec bouchon | Yop |
| `fromage-blanc.png` | Pot large blanc, forme tronconique | Fromage blanc |
| `chantilly.png` | Bombe aérosol blanche avec bouchon rouge | Chantilly |

---

### Famille 9 — Épices, herbes & condiments

| Fichier | Description | Produits |
|---|---|---|
| `epice.png` | Petit pot d'épices en verre avec couvercle rouge, poudre orangée visible | Curcuma, Curry, Paprika, Piment en poudre, Gingembre |
| `herbe.png` | Brins d'herbes fraîches vertes en bouquet | Basilic, Menthe, Persil, Ciboulette, Origan |
| `poivre.png` | Moulin à poivre en bois, vue de 3/4 | Poivre, 5 baies |
| `sel.png` | Boîte de sel bleue (style La Baleine), cristaux visibles | Sel, Sel LV |
| `ail.png` | Tête d'ail complète, quelques gousses éclatées | Ail |
| `oignon.png` | Oignon rond brun avec tige, coupe transversale suggérée | Oignons, Échalote |
| `bouillon.png` | Cube de bouillon doré dans papier aluminium déplié | Cube bouillon, Fond de veau, Fond de volaille |
| `moutarde.png` | Pot en grès jaune à couvercle, style Maille | Moutarde |
| `bouteille-huile.png` | *(voir Famille 1)* | Huile, Huile d'olive |

---

### Famille 10 — Légumes & Fruits frais

Un fichier par produit, pas de partage.

| Fichier | Description |
|---|---|
| `tomate.png` | Tomate ronde rouge, pédoncule vert visible |
| `carotte.png` | Carotte avec feuilles en haut, orange vif |
| `pomme-de-terre.png` | Pomme de terre avec quelques yeux, beige |
| `aubergine.png` | Aubergine violette avec calice vert |
| `courgette.png` | Courgette verte avec une fleur |
| `brocoli.png` | Tête de brocoli verte, tige courte |
| `poivron.png` | Poivron rouge brillant avec pédoncule vert |
| `salade.png` | Laitue vue de dessus, feuilles vertes ouvertes |
| `champignon.png` | Champignon de Paris de profil, blanc/beige |
| `citron.png` | Citron jaune entier, peau texturée |
| `cornichon.png` | Cornichon vert noueux, ou pot de cornichons |
| `avocat.png` | Demi-avocat avec noyau visible, chair verte |
| `banane.png` | Banane jaune courbée, légèrement tachetée |
| `poire.png` | Poire verte/jaune, forme classique avec pédoncule |
| `pomme.png` | Pomme rouge brillante avec feuille |
| `kiwi.png` | Kiwi coupé en deux, chair verte avec graines noires |
| `fruits.png` | Panier tressé avec pomme, raisin et banane (générique) |

---

### Famille 11 — Apéro & Snacks

| Fichier | Description | Produits |
|---|---|---|
| `chips.png` | Sachet de chips gonflé, chips débordant en haut | Chips |
| `cacahuete.png` | Petites cacahuètes dans leur coque, beige | Cacahuètes, Beurre de cacahuète |
| `pistache.png` | Pistaches vertes entrouverte, coque beige | Pistaches |
| `noisette.png` | Noisettes rondes marron avec feuilles | Noisettes |
| `noix-cajou.png` | Noix de cajou en forme de croissant, beige/doré | Noix de cajou |

---

### Famille 12 — Petit-déjeuner & Épicerie sucrée

| Fichier | Description | Produits |
|---|---|---|
| `cereales.png` | Boîte de céréales colorée, quelques corn flakes qui tombent | Céréales, Barres céréales |
| `barre-cereales.png` | Barre enveloppée dans papier brillant, graines visibles | Barres céréales — peut partager `cereales.png` |
| `chocolat.png` | Tablette de chocolat noir, carré cassé sur le côté | Chocolat |
| `nutella.png` | Pot marron/rouge caractéristique avec couvercle | Nutella |
| `confiture.png` | Pot en verre à couvercle rouge, confiture fraise visible | Confiture |
| `creme-marron.png` | Tube de crème de marron, illustration de marron | Crème de marron |
| `beurre-cacahuete.png` | Pot ouvert avec couche de beurre de cacahuète beige | Beurre de cacahuète |
| `miel.png` | Pot hexagonal en verre doré, bouchon à visser | Miel |
| `bonbons.png` | Sachet transparent coloré avec bonbons multicolores | Bonbons |
| `gateaux.png` | Paquet de biscuits/gâteaux avec fenêtre, quelques biscuits visibles | Gâteaux, Madeleines |
| `compote.png` | Gourde de compote refermable, pomme illustrée | Compote |
| `flan-sachet.png` | Sachet de préparation poudre, illustration de flan | Sachet flan |
| `creme-anglaise.png` | Petite brique ou bouteille crème/jaune pâle | Crème anglaise |
| `glace.png` | Pot de glace avec couvercle, boule débordant légèrement | Glaces |
| `cafe.png` | Bocal en verre de café soluble, couvercle doré | Café soluble, Cappuccino |
| `the.png` | Boîte métal de thé avec sachet pendant sur le côté | Thé |

---

### Famille 13 — Surgelés

| Fichier | Description | Produits |
|---|---|---|
| `frites.png` | Sachet de frites surgelées avec quelques frites tombant | Frites |
| `pizza.png` | Boîte de pizza surgelée vue de 3/4, pizza visible dans coin | Pizza |
| `gyoza.png` | Deux gyoza en demi-lune, plis visibles | Gyoza |
| `nuggets.png` | Trois morceaux de nuggets panés dorés | Nuggets |
| `rosti.png` | Galette de pommes de terre dorée, croustillante | Rösti |

---

### Famille 14 — Hygiène personnelle

| Fichier | Description | Produits |
|---|---|---|
| `brosse-dents.png` | Brosse à dent blanche/bleue, angle 45° | Brosse à dent |
| `dentifrice.png` | Tube de dentifrice blanc, bout décapuchonné | Dentifrice |
| `coton-tige.png` | Boîte cylindrique de cotons-tiges, un coton-tige en avant | Coton tige |
| `coton.png` | Disques de coton empilés, blanc cotonneux | Cotons |
| `deodorant.png` | Déodorant bille ou roll-on, flacon ovale | Déodorant |
| `gel-douche.png` | Flacon de gel douche/shampoing souple, bouchon à clapet | Gel douche, Shampoing, Spray démêlant, Gel |
| `creme-main.png` | Tube de crème, bout pressé avec crème qui sort légèrement | Crème main |
| `pansement.png` | Boîte de pansements + un pansement sur côté | Pansement |
| `savon-liquide.png` | Flacon pompe blanc, mousse suggérée | Savon liquide, Gel hydroalcoolique |
| `dissolvant.png` | Petit flacon discret, coton imbibé à côté | Dissolvant |

---

### Famille 15 — Entretien ménager

| Fichier | Description | Produits |
|---|---|---|
| `produit-vaisselle.png` | Flacon vert avec bouchon doseur, bulles | Produit vaisselle, Liquide de rinçage |
| `lessive.png` | Boîte ou bidon de lessive, illustration vêtement propre | Lessive |
| `tablettes-lv.png` | Paquet de tablettes blanches, une tablette en avant | Tablettes LV, Tablettes anti-calcaire, Sel LV |
| `spray-nettoyant.png` | Flacon spray, gâchette visible — décliner en couleurs pour chaque produit si souhaité, sinon une seule couleur bleue générique | Antikal, Destop, Nettoyant dégraissant, Nettoyant javel, Nettoyant sol, Produit vitre, Produit WC |
| `eponge.png` | Éponge bicolore vert/jaune vue de 3/4 | Éponge |
| `papier-aluminium.png` | Rouleau avec coin déplié brillant/argenté | Papier aluminium, Papier cuisson, Papier film |
| `pq.png` | Rouleau de papier toilette, feuille légèrement décollée | PQ, Sopalin |
| `serviette.png` | Paquet de serviettes en papier plié | Serviette |
| `sac-poubelle.png` | Rouleau de sacs poubelle avec un sac à moitié déroulé | Sac poubelle, Sachet congélation |
| `sac-aspirateur.png` | Sac plissé gris/blanc avec rebord de fixation | Sac aspirateur |
| `lingettes.png` | Paquet de lingettes avec couvercle à rabat | Lingettes |

---

### Famille 16 — Divers

| Fichier | Description | Produits |
|---|---|---|
| `pile.png` | Pile AA cylindrique, bornes + et - visibles | Pile rechargeable |
| `briquet.png` | Briquet plastique vue de 3/4 | Briquet / Allumettes |
| `colle.png` | Tube de colle avec bouchon rouge | Colle |
| `tupperware.png` | Boîte plastique transparente avec couvercle clipsé | Boîte tupperware |

---

## Résumé par priorité

### Priorité 1 — Produits du quotidien (à créer en premier)
Fruits & légumes, produits laitiers de base (lait, beurre, œufs, yaourt, crème), viandes courantes (poulet, steak, jambon), boissons principales.

### Priorité 2 — Conserves & Épicerie
Familles conserves et sauces (dériver depuis les formes de base).

### Priorité 3 — Fromages
Beaucoup de produits partagent `fromage-rond.png` et `fromage-bloc.png` — commencer par ceux-là.

### Priorité 4 — Hygiène & Entretien
Moins urgents visuellement, plusieurs icônes génériques couvrent de nombreux produits.

---

## Outils recommandés pour la génération

- **DALL-E 3 / GPT-4o** : bon pour les illustrations détaillées, utiliser le prompt de base + description par icône
- **Midjourney** : excellent pour le style flat design cohérent, utiliser `--style raw --ar 1:1`
- **Adobe Firefly** : fond transparent natif, bon contrôle du style
- **Script SVG manuel** : pour les familles dérivées (bouteilles, conserves, sauces) — créer le SVG de base et changer les couleurs par script
