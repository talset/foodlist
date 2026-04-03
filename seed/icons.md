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
| `bouteille-biere.png` | single amber glass beer bottle with silver metal cap, side view, no label text | Jaune | Capsule métallique visible, mousse légère suggérée |
| `bouteille-cidre.png` | single dark green glass cider bottle with cork, side view, no label text | Blanc/beige | Capsule |
| `bouteille-cola.png` | single dark brown plastic cola soda bottle with black cap, side view, generic no brand logo | Rouge avec filet blanc | Incontournable |
| `bouteille-fanta.png` | single orange plastic soda bottle with orange cap, side view, generic no brand logo | Orange vif | |
| `bouteille-icetea.png` | single golden amber plastic iced tea bottle with brown cap, side view, no logo | Brun/ocre | |
| `bouteille-limonade.png` | single pale yellow plastic lemonade bottle with yellow cap, side view, no logo | Jaune citron | Bulles suggérées |
| `bouteille-vin-rouge.png` | single dark bordeaux glass wine bottle with cork, tall slender shape, side view | Étiquette crème/ivoire | Forme vin (col long) |
| `bouteille-vin-blanc.png` | single pale green glass white wine bottle with cork, tall slender shape, side view | Étiquette verte | Forme vin |
| `bouteille-rhum.png` | single dark brown glass rum spirits bottle with wide base and short neck, side view | Dorée, mention rhum | Forme spiritueux (col court, épaule tombante) |
| `bouteille-sirop.png` | single tall slim red transparent glass syrup bottle with screw cap, side view | Rose/rouge | Forme fine et haute |
| `bouteille-huile.png` | single tall slim golden glass olive oil bottle with pouring spout, side view | Vert olive ou blanc | Forme fine et haute, bouchon doseur |

---

### Famille 2 — Squeeze bottle (sauces)

**Forme de base** : flacon souple en plastique avec bec verseur, vu de 3/4.

| Fichier | Couleur | Produits |
|---|---|---|
| `bouteille-sauce-rouge.png` | single red plastic squeeze condiment bottle with nozzle tip, side view, no label text | Ketchup, Sauce tomate, Sauce bolo, Sauce harissa, Sauce piquante, Sauce sachets |
| `bouteille-sauce-jaune.png` | single yellow plastic squeeze condiment bottle with nozzle tip, side view, no label text | Mayonnaise, Sauce samouraï |
| `bouteille-sauce-brune.png` | single dark brown plastic squeeze condiment bottle with nozzle tip, side view, no label text | Sauce barbecue, Sauce burger, Sauce soja |
| `bouteille-sauce-verte.png` | single dark green glass pesto sauce jar with metal lid, side view | Pesto |
| `bouteille-sauce-orange.png` | single orange plastic squeeze condiment bottle with nozzle tip, side view, no label text | Sauce tikka masala |

---

### Famille 3 — Boîte de conserve cylindrique

**Forme de base** : boîte cylindrique vue légèrement de 3/4, étiquette qui fait le tour.

| Fichier | Couleur étiquette | Motif | Produits |
|---|---|---|---|
| `conserve-legumes.png` | single cylindrical tin can with green label showing vegetable silhouette, side view, 3/4 angle | Silhouette de haricot ou légume | Épinards, Flageolets, Haricots, Haricots rouges, Haricots tomate, Petits pois |
| `conserve-tomate.png` | single cylindrical tin can with red label showing tomato silhouette, side view, 3/4 angle | Tomate | Concentré de tomate, Purée de tomate |
| `conserve-poisson.png` | single flat oval tin can with blue label showing fish silhouette, side view | Poisson | Maquereau, Thon, Thon tomate |
| `conserve-soupe.png` | single cylindrical tin can with orange label showing soup bowl silhouette, side view | Bol de soupe | Soupe |
| `conserve-cassoulet.png` | single tall cylindrical tin can with brown earthy label, side view, 3/4 angle | Haricot et saucisse | Cassoulet |
| `conserve-plat.png` | single cylindrical tin can with beige neutral label, side view, 3/4 angle | Générique | Paëlla, Ravioli, Pâté |

---

### Famille 4 — Fromages

| Fichier | Description visuelle | Produits |
|---|---|---|
| `fromage-rond.png` | round flat white cheese wheel with beige rind, 3/4 top view, no animal no logo | Camembert, Mont d'or, Reblochon, Tomme de savoie, Tomme du Berry |
| `fromage-bloc.png` | solid rectangular pale yellow cheese block, 3/4 side view | Comté (toutes variantes), Beaufort, Gouda, Port salut, Gruyère |
| `fromage-rape.png` | small pile of grated shredded yellow cheese on a flat surface, top view | Gruyère rapé, Fromage rapé, Emmental (800g) |
| `fromage-frais.png` | small white plastic fresh cheese pot with foil lid, side view | Fromage blanc, Fromage frais, Fromage fondue |
| `fromage-burger.png` | single flat square yellow processed cheese slice, top view | Fromage burger, Fromage croc |
| `fromage-chevre.png` | cylindrical white goat cheese log roll with grey ash-covered rind, side view, no goat animal | Chèvre |
| `fromage-bleu.png` | irregular wedge of white cheese with visible blue green mold veins, 3/4 view | Roquefort |
| `fromage-moule.png` | smooth white mozzarella cheese ball sitting in clear liquid, side view | Mozzarella |
| `fromage-morbier.png` | rectangular cheese slice showing a distinct black horizontal ash line through the center, front view | Morbier |
| `fromage-munster.png` | round cheese wheel with bright orange washed rind, 3/4 top view | Munster |
| `babybel.png` | small round cheese disc coated in bright red wax with pull tab, front view | Babybel, Vache qui rit |
| `fromage-raclette.png` | half wheel of pale yellow raclette cheese cut flat side showing, 3/4 view | Raclette |
| `cheddar.png` | solid rectangular block of deep orange cheddar cheese, 3/4 side view | Cheddar |
| `parmesan.png` | irregular rough-edged pale beige parmesan cheese wedge with grainy texture, 3/4 view | Parmesan |

---

### Famille 5 — Charcuterie & Viandes & Poissons

| Fichier | Description | Produits |
|---|---|---|
| `chorizo.png` | three overlapping round slices of red and white marbled chorizo sausage, top view | Chorizo |
| `saucisson.png` | three overlapping round slices of dry salami sausage, pinkish beige, top view | Saucisson, Rosette |
| `jambon.png` | single folded slice of pink cooked ham, top view, no whole pig no animal | Jambon |
| `bacon.png` | two raw pink and white striped bacon rashers side by side, top view | Bacon |
| `lardon.png` | small cubed pink bacon lardons pieces in a white tray, top view | Lardon |
| `saucisse.png` | single curved pink pork sausage link, side view, no pig no animal | Saucisse, Knack |
| `saucisse-chipolata.png` | single thin beige coiled chipolata sausage, side view | Chipolata |
| `saucisse-merguez.png` | single thin dark red-brown spicy merguez sausage, side view | Merguez |
| `steak-hache.png` | single flat raw minced ground beef patty disc, red meat texture visible, top view, NOT a burger NOT a cow NOT grilled | Steak haché, Viande hachée |
| `poulet.png` | single golden roasted chicken drumstick with visible bone, side view, NOT a cartoon chicken NOT a live bird | Poulet |
| `agneau.png` | single lamb chop cutlet with bone and pink meat, side view, NOT a sheep NOT a lamb animal | Agneau |
| `porc.png` | single raw pork loin chop slice with fat rim, side view, NOT a pig NOT an animal | Porc |
| `pate.png` | small oval metal tin of pork pate terrine with pull tab lid, side view | Pâté |
| `rillettes.png` | small glass jar with pink salmon rillettes paste inside, open lid, side view | Rillettes saumons |
| `cordon-bleu.png` | single flat breaded golden escalope stuffed chicken cutlet, oval shape, side view, NOT a cooking school logo NOT a ribbon | Cordon bleu |
| `saumon.png` | single pink salmon fish fillet with visible skin on one side, 3/4 top view, NOT a whole fish NOT a cartoon | Saumon |
| `moules.png` | single open black mussel shell with orange flesh inside, side view | Moules |
| `poisson-pane.png` | single rectangular golden breaded fish fillet stick, 3/4 view | Poisson pané |

---

### Famille 6 — Épicerie sèche & Féculents

| Fichier | Description | Produits |
|---|---|---|
| `pates.png` | pasta cardboard package with transparent window showing penne pasta inside, side view | Pâtes, Macaroni, Lasagnes, Ravioli |
| `nouilles.png` | compressed square block of dried asian noodles in plastic packaging, 3/4 view | Nouilles |
| `riz.png` | transparent plastic rice bag with visible white rice grains inside, side view | Riz, Semoule |
| `lentilles.png` | transparent plastic bag of small green lentils, side view | Lentilles |
| `farine.png` | white paper flour bag with simple wheat ear illustration, no brand text, side view | Farine, Chapelure |
| `sucre.png` | white paper sugar bag with simple granulated sugar texture visible, side view | Sucre en poudre, Sucre morceau |
| `puree-instant.png` | single serving sachet of instant potato flakes, white with simple potato illustration, side view | Purée |
| `chapelure.png` | cardboard package of golden breadcrumbs with crumbs visible through window, side view | Chapelure — peut partager `farine.png` |

---

### Famille 7 — Boulangerie

| Fichier | Description | Produits |
|---|---|---|
| `pain.png` | single golden brown baguette bread loaf with diagonal score cuts on top, diagonal angle view | Pain, Pain de mie, Galette kebab |
| `pain-mie.png` | sliced white sandwich bread loaf in transparent plastic bag, side view | Pain de mie |
| `pain-burger.png` | single round soft burger bun with sesame seeds on top, slight 3/4 view | Pain burger |
| `pain-lait.png` | single oval golden soft brioche milk bread roll with shiny glaze, 3/4 view | Pain au lait |
| `brioche.png` | braided golden brioche bread loaf with dark glaze, 3/4 top view | Brioche |
| `galette-kebab.png` | single round thin flat pita flatbread, slight top view | Galette kebab |
| `pate-pizza.png` | single smooth round ball of raw pizza dough with flour dusting, 3/4 top view | Pâte à pizza |
| `pate-feuilletee.png` | rolled out rectangular puff pastry sheet with visible layered edges, 3/4 view | Pâte feuilletée |

---

### Famille 8 — Produits laitiers

| Fichier | Description | Produits |
|---|---|---|
| `lait.png` | single white milk carton Tetra Pak with colored stripe at top, side view | Lait |
| `lait-coco.png` | single white cylindrical tin can with coconut illustration on label, side view | Lait de coco |
| `beurre.png` | single rectangular butter block wrapped in gold and silver foil paper, side view | Beurre |
| `creme-fraiche.png` | single white plastic pot of sour cream with foil sealed lid, side view | Crème fraîche |
| `creme-liquide.png` | single small cream colored UHT carton brick with pour spout, side view | Crème liquide |
| `oeuf.png` | cardboard egg box half open showing six white eggs inside, 3/4 top view | Œufs |
| `yaourt.png` | single white plastic yogurt pot with aluminum foil lid, side view | Yaourt, Yaourt nature, Yaourt aux fruits |
| `yop.png` | single small plastic drinkable yogurt bottle with screw cap, side view | Yop |
| `fromage-blanc.png` | single large white plastic tub of fromage blanc with blue and white label, side view | Fromage blanc |
| `chantilly.png` | single white aerosol whipped cream spray can with red cap, side view | Chantilly |

---

### Famille 9 — Épices, herbes & condiments

| Fichier | Description | Produits |
|---|---|---|
| `epice.png` | single small glass spice jar with orange yellow powder inside and red screw lid, side view | Curcuma, Curry, Paprika, Piment en poudre, Gingembre |
| `herbe.png` | small bunch of fresh green basil herb leaves tied with string, front view, no animal no cartoon | Basilic, Menthe, Persil, Ciboulette, Origan |
| `poivre.png` | single wooden pepper mill grinder with black peppercorns base, side view | Poivre, 5 baies |
| `sel.png` | rectangular blue cardboard salt box with simple design, side view | Sel, Sel LV |
| `ail.png` | single whole garlic head bulb with papery white skin and root base, front view | Ail |
| `oignon.png` | single whole brown onion with dry papery skin and root, front view | Oignons, Échalote |
| `bouillon.png` | single small golden stock bouillon cube unwrapped from yellow foil, front view | Cube bouillon, Fond de veau, Fond de volaille |
| `moutarde.png` | single yellow ceramic mustard jar with mustard yellow lid, side view | Moutarde |
| `bouteille-huile.png` | single tall slim golden glass olive oil bottle with pouring spout, side view | Huile, Huile d'olive |

---

### Famille 10 — Légumes & Fruits frais

Un fichier par produit, pas de partage.

| Fichier | Description |
|---|---|
| `tomate.png` | single whole round bright red tomato with green calyx stem on top, front view |
| `carotte.png` | single whole orange carrot with green leafy tops, diagonal side view |
| `pomme-de-terre.png` | single whole raw beige potato with rough skin and eyes, side view |
| `aubergine.png` | single whole deep purple eggplant aubergine with green calyx, side view |
| `courgette.png` | single whole green zucchini courgette, side view |
| `brocoli.png` | single green broccoli floret head with short stem, front view |
| `poivron.png` | single whole shiny red bell pepper with green stem, front view |
| `salade.png` | single whole green lettuce head with open leaves, slight top view |
| `champignon.png` | single whole white button mushroom with visible gills under cap, side view |
| `citron.png` | single whole yellow lemon with slightly textured skin, front view |
| `cornichon.png` | single small bumpy green gherkin cornichon, side view |
| `avocat.png` | single avocado cut in half showing yellow green flesh and large brown pit, front view |
| `banane.png` | single yellow curved banana with brown tip, side view |
| `poire.png` | single whole yellow green pear with brown stem, front view |
| `pomme.png` | single whole shiny red apple with green leaf and brown stem, front view |
| `kiwi.png` | single kiwi fruit cut in half cross section showing bright green flesh with black seeds and white center, front view |
| `fruits.png` | woven basket containing apple banana orange and grapes, 3/4 top view |

---

### Famille 11 — Apéro & Snacks

| Fichier | Description | Produits |
|---|---|---|
| `chips.png` | inflated foil snack chips bag, side view, no brand logo no text | Chips |
| `cacahuete.png` | handful of peanuts in shell with one split open showing nuts inside, top view | Cacahuètes, Beurre de cacahuète |
| `pistache.png` | handful of pistachio nuts half open showing green kernel inside, top view | Pistaches |
| `noisette.png` | handful of round brown hazelnuts with one cracked open, top view | Noisettes |
| `noix-cajou.png` | handful of ivory colored cashew nuts curved kidney shape, top view | Noix de cajou |

---

### Famille 12 — Petit-déjeuner & Épicerie sucrée

| Fichier | Description | Produits |
|---|---|---|
| `cereales.png` | cereal cardboard box with a bowl of corn flakes illustrated on front, side view | Céréales, Barres céréales |
| `barre-cereales.png` | single granola cereal bar in shiny wrapper, side view | Barres céréales — peut partager `cereales.png` |
| `chocolat.png` | dark chocolate bar with one square broken off, top view showing grid pattern | Chocolat |
| `nutella.png` | round glass jar of brown hazelnut chocolate spread with white label and red lid, side view, no brand text | Nutella |
| `confiture.png` | glass jar of red strawberry jam with checkered red fabric lid cover, side view | Confiture |
| `creme-marron.png` | tube of brown chestnut cream paste with chestnut illustration, side view | Crème de marron |
| `beurre-cacahuete.png` | open glass jar of smooth peanut butter showing beige creamy spread, 3/4 top view | Beurre de cacahuète |
| `miel.png` | hexagonal glass honey jar filled with golden honey, bear-shaped optional, side view | Miel |
| `bonbons.png` | transparent bag filled with colorful mixed candy sweets, side view | Bonbons |
| `gateaux.png` | cardboard biscuit cookie package with clear window showing round golden cookies, side view | Gâteaux, Madeleines |
| `compote.png` | single squeezable apple sauce pouch with twist cap, side view | Compote |
| `flan-sachet.png` | small flat sachet of flan custard powder preparation with simple dessert illustration, front view | Sachet flan |
| `creme-anglaise.png` | small yellow and white UHT carton of custard sauce, side view | Crème anglaise |
| `glace.png` | round ice cream tub container with lid showing a swirl of ice cream, 3/4 view | Glaces |
| `cafe.png` | glass jar of instant coffee granules with golden screw lid, side view | Café soluble, Cappuccino |
| `the.png` | rectangular tea box with one tea bag hanging over the edge, 3/4 view | Thé |

---

### Famille 13 — Surgelés

| Fichier | Description | Produits |
|---|---|---|
| `frites.png` | plastic frozen french fries bag with golden fries illustrated on front, side view | Frites |
| `pizza.png` | flat rectangular frozen pizza cardboard box with pizza photo on front, 3/4 top view | Pizza |
| `gyoza.png` | two crescent shaped gyoza dumplings with pleated edges, 3/4 view | Gyoza |
| `nuggets.png` | three golden breaded chicken nuggets irregular shapes, top view | Nuggets |
| `rosti.png` | single round flat golden crispy potato rosti pancake, top view | Rösti |

---

### Famille 14 — Hygiène personnelle

| Fichier | Description | Produits |
|---|---|---|
| `brosse-dents.png` | single toothbrush with blue and white handle and white bristles, diagonal side view | Brosse à dent |
| `dentifrice.png` | single toothpaste tube with cap, blue and white, side view | Dentifrice |
| `coton-tige.png` | cylindrical cardboard box of cotton swabs with one cotton swab beside it, side view | Coton tige |
| `coton.png` | stack of three round white cotton pads, slight 3/4 top view | Cotons |
| `deodorant.png` | single roll-on deodorant bottle with transparent ball, side view | Déodorant |
| `gel-douche.png` | single shower gel plastic bottle with colored flip top cap, side view | Gel douche, Shampoing, Spray démêlant, Gel |
| `creme-main.png` | single hand cream tube squeezed slightly with cream coming out of tip, side view | Crème main |
| `pansement.png` | rectangular cardboard box of adhesive bandages with one bandage beside it, 3/4 view | Pansement |
| `savon-liquide.png` | single pump dispenser bottle of liquid soap with foam at nozzle, side view | Savon liquide, Gel hydroalcoolique |
| `dissolvant.png` | single small transparent bottle of nail polish remover acetone with simple label, side view, NOT nail polish NOT colorful | Dissolvant |

---

### Famille 15 — Entretien ménager

| Fichier | Description | Produits |
|---|---|---|
| `produit-vaisselle.png` | single green dish washing liquid soap plastic bottle with flip cap, side view | Produit vaisselle, Liquide de rinçage |
| `lessive.png` | single laundry detergent powder cardboard box with colorful geometric design, side view | Lessive |
| `tablettes-lv.png` | flat cardboard package of dishwasher tablets with one tablet sitting beside it, 3/4 view | Tablettes LV, Tablettes anti-calcaire, Sel LV |
| `spray-nettoyant.png` | single blue multi-surface cleaning spray bottle with trigger handle, side view | Antikal, Destop, Nettoyant dégraissant, Nettoyant javel, Nettoyant sol, Produit vitre, Produit WC |
| `eponge.png` | single rectangular kitchen sponge with green scrubbing pad on top and yellow foam base, 3/4 view | Éponge |
| `papier-aluminium.png` | aluminum foil roll in cardboard dispenser box with metallic silver sheet unfolded at corner, 3/4 view | Papier aluminium, Papier cuisson, Papier film |
| `pq.png` | single roll of toilet paper, clean white, side view | PQ, Sopalin |
| `serviette.png` | small stack of folded white paper dinner napkins, 3/4 top view | Serviette |
| `sac-poubelle.png` | roll of black plastic trash garbage bags in cardboard box, side view | Sac poubelle, Sachet congélation |
| `sac-aspirateur.png` | single grey fabric vacuum cleaner dust collection bag with cardboard mounting collar, front view, NOT a vacuum cleaner machine | Sac aspirateur |
| `lingettes.png` | flat rectangular wet wipes plastic pack with flip open lid, 3/4 top view | Lingettes |

---

### Famille 16 — Divers

| Fichier | Description | Produits |
|---|---|---|
| `pile.png` | single cylindrical AA battery with positive nub terminal on top, slight 3/4 side view | Pile rechargeable |
| `briquet.png` | single plastic disposable lighter with visible fuel chamber, side view | Briquet / Allumettes |
| `colle.png` | single glue tube with red screw cap, side view | Colle |
| `tupperware.png` | single rectangular transparent plastic food storage container with tight fitting lid, 3/4 view | Boîte tupperware |

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
