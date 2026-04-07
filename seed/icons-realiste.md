# Foodlist — Spécifications des icônes (style réaliste)

## Style global

Toutes les icônes suivent un style **photoréaliste**, comme une photo de studio produit :

- **Format** : PNG, 128×128 px, **fond transparent** (alpha)
- **Style** : rendu 3D photoréaliste ou photographie produit studio — textures réelles, matières authentiques (verre, plastique, métal, tissu, peau de fruit)
- **Éclairage** : lumière douce directionnelle venant du haut-gauche, légère ombre portée douce sous l'objet, petits reflets de surface sur les matières brillantes
- **Couleurs** : couleurs naturelles fidèles au produit réel — pas de saturation artificielle, pas de pastel
- **Détail** : surface texturée visible (grain du pain, peau d'un fruit, étiquette légèrement froissée, condensation sur une bouteille froide, pores d'un fromage)
- **Pas de texte de marque**, pas de logo reconnaissable — les emballages sont génériques mais réalistes (étiquette neutre, couleur et forme correcte)
- **Cadrage** : le sujet est centré et occupe environ 75-80% de la surface, avec un espace vide uniforme tout autour — pas coupé sur les bords
- La transparence et le cadrage sont normalisés automatiquement après génération (`rembg` + centrage)

Prompt de style global appliqué à chaque icône (fond blanc demandé pour faciliter le détourage) :
> *photorealistic 3D render, studio product photography style, accurate real-world materials and textures, soft directional lighting from upper-left, subtle drop shadow, realistic surface details (condensation, grain, gloss, matte), natural accurate colors, clean white background, no brand text, no logo, isolated subject centered with equal margins*

---

### Famille 1 — Bouteilles boissons

| Fichier | Description détaillée |
|---|---|
| `bouteille-biere.png` | amber glass beer bottle with a silver crown cap, realistic glass texture catching the light with internal amber-golden liquid visible, slight label area in warm cream paper, subtle condensation droplets on lower half, side view |
| `bouteille-cidre.png` | dark forest-green glass cider bottle with cork stopper and wire cage, thick glass with slight green tint, long elegant neck, realistic glass texture with subtle refraction, side view |
| `bouteille-coca.png` | iconic contour cola bottle shape in dark brown glass, deep cocoa-brown liquid visible through the glass, bright red plastic screw cap, realistic glass texture with specular highlights, no brand, side view |
| `bouteille-fanta.png` | semi-transparent orange plastic soda bottle with orange liquid inside, textured plastic surface, orange screw cap, slight label impression around the middle, realistic plastic sheen, side view |
| `bouteille-icetea.png` | tall clear plastic iced tea bottle with golden amber tea visible inside, slight condensation on the lower half, brown screw cap, transparent label area, realistic PET plastic texture, side view |
| `bouteille-limonade.png` | pale yellow-green glass lemonade bottle with a metal crown cap, slight carbonation bubbles visible inside, clear glass with subtle lime-green tint from the liquid, side view |
| `bouteille-vin-rouge.png` | slim dark burgundy glass wine bottle with a natural cork and foil capsule at the neck, deep plum-red glass, elegant tapered shape, minimal paper label, realistic glass texture, side view |
| `bouteille-vin-blanc.png` | slender pale green glass wine bottle with cork and gold foil capsule, soft celery-green glass, elegant tapered neck, subtle label, realistic glass sheen, side view |
| `bouteille-rhum.png` | stocky dark amber glass spirits bottle with a short wide neck and metal screw cap, warm caramel-brown glass, thick heavy base, slight paper label wrap, realistic glass texture, side view |
| `bouteille-sirop.png` | tall slim glass syrup bottle with a small silver screw cap, deep translucent raspberry-red liquid visible through the glass, elegant narrow shape, side view |
| `bouteille-huile.png` | tall slim glass olive oil bottle with a pouring spout, warm golden liquid inside, clear glass showing the golden oil, slight paper label, realistic glass texture with oil sheen, side view |
| `huile.png` | plastic sunflower oil bottle with warm golden-yellow oil visible inside, semi-transparent white plastic, printed label with sunflower motif, small screw cap, side view |
| `jus-fruit.png` | transparent glass of freshly squeezed orange juice with visible pulp particles, warm amber-orange color, tiny bubbles at the surface, natural condensation on the outside of the glass, front view |
| `sweeps.png` | yellow plastic lemonade-style bottle with a vivid red label band around the middle, translucent yellow plastic showing slight liquid inside, no brand text, realistic PET plastic texture, side view |

---

### Famille 2 — Sauces (squeeze bottles)

| Fichier | Description détaillée |
|---|---|
| `bouteille-sauce-verte.png` | dark green glass pesto jar with a gold metal twist-off lid, slightly opaque green glass revealing chunky basil paste inside, paper label wrap, realistic glass jar texture, side view |
| `bouteille-sauce-orange.png` | orange plastic squeeze bottle with a flip nozzle cap, smooth matte orange plastic, slight label area, realistic HDPE plastic texture, side view |
| `ketchup.png` | red squeezable ketchup bottle in HDPE plastic with a flip cap, realistic tomato-red opaque plastic, slightly glossy surface, generic label, side view |
| `sauce-tomate.png` | round glass jar of tomato passata with a red metal screw lid, deep red sauce visible through clear glass, slight condensation, paper label, realistic jar texture, side view |
| `sauce-bolognaise.png` | round glass jar of meat sauce with a dark red-brown lid, rich deep red-brown sauce visible through glass, paper label, realistic glass texture, side view |
| `sauce-harissa.png` | small round metal tin of harissa paste with a flat pull-tab lid, matte metal tin surface, brick-red color, printed label on the side, front view |
| `sauce-piquante.png` | slim glass hot sauce bottle with a red plastic cap, clear glass showing vivid orange-red sauce inside, small paper label, realistic glass, side view |
| `sauce-sachets.png` | small red plastic condiment sachet, shiny printed foil packaging, slightly squeezable feel, realistic foil texture with subtle wrinkles, top view |
| `mayonnaise.png` | cream-white squeezable plastic mayonnaise bottle with a flip nozzle, opaque white plastic, slight glossy sheen, generic label, side view |
| `sauce-samourai.png` | orange-pink plastic squeeze bottle, semi-opaque plastic, flip nozzle cap, slightly textured HDPE plastic surface, side view |
| `sauce-soja.png` | slim dark glass soy sauce bottle with a red plastic cap, deep near-black caramel glass, narrow elegant shape, paper label, realistic heavy glass texture, side view |
| `sauce-soja-sucre.png` | slim dark glass bottle of sweet soy sauce with a red plastic cap, deep dark brown glass with a warm amber tint, slightly rounder shape, paper label with honey-gold accent, realistic heavy glass texture, side view |
| `sauce-sriracha.png` | tall slim red plastic sriracha hot sauce squeeze bottle with a bright green cap, vivid bright red body, tapered nozzle, iconic rooster silhouette on the label, realistic plastic texture, side view |
| `sauce-barbecue.png` | dark brown glass BBQ sauce bottle with a black plastic cap, slightly faceted glass, deep dark sauce visible, paper label, realistic glass, side view |
| `sauce-burger.png` | white squeezable plastic bottle with a small nozzle, opaque HDPE white plastic, slight label area, realistic plastic texture, side view |

---

### Famille 3 — Conserves

| Fichier | Description détaillée |
|---|---|
| `conserve-soupe.png` | cylindrical steel tin can with a warm orange printed label showing a soup bowl, metallic silver top and bottom rims, realistic lithographed tin texture, 3/4 view |
| `conserve-cassoulet.png` | tall cylindrical tin can with an earthy brown label, matte printed paper label with visible texture, silver metallic rims, realistic steel can, 3/4 view |
| `epinards.png` | cylindrical tin can with a green printed label featuring a spinach leaf illustration, silver rims, matte label texture, realistic metal can, 3/4 view |
| `petits-pois.png` | cylindrical tin can with a bright pea-green printed label with pea illustrations, silver top, realistic lithographed tin, 3/4 view |
| `haricots-verts.png` | cylindrical tin can with a fresh green paper label featuring green bean artwork, silver metallic rims, realistic tin can, 3/4 view |
| `haricots-rouges.png` | cylindrical tin can with a deep red label featuring kidney bean illustrations, metallic rims, realistic paper label texture, 3/4 view |
| `haricots-tomate.png` | cylindrical tin can with an orange-red label showing beans in tomato sauce, silver metallic rims, realistic printed tin, 3/4 view |
| `flageolets.png` | cylindrical tin can with a pale green paper label featuring flageolet bean illustrations, silver rims, realistic tin can texture, 3/4 view |
| `paella.png` | cylindrical tin can with a warm yellow-orange label featuring a paella pan illustration, silver rims, realistic lithographed metal, 3/4 view |
| `maquereau.png` | flat oval tin can with a teal-blue paper label showing a detailed mackerel illustration, silver metallic body, printed seam visible, side view |
| `thon.png` | flat oval tin can with a sky-blue paper label showing a tuna fish illustration, silver metallic body, slight ring-pull visible, side view |
| `thon-tomate.png` | flat oval tin can with an orange-red label featuring tuna and tomato artwork, silver body, realistic flat tin texture, side view |
| `concentre-tomate.png` | metal squeeze tube of tomato paste, slightly crinkled aluminum tube with red and orange printing, small plastic screw cap, realistic foil tube texture, side view |
| `puree-tomate.png` | tall slim Tetra Pak brick of tomato passata in warm red, matte printed cardboard, square base, beveled edges, pouring spout, realistic carton texture, side view |

---

### Famille 4 — Fromages

| Fichier | Description détaillée |
|---|---|
| `emmental-rape.png` | small pile of shredded golden emmental cheese, thin wispy strands with realistic fibrous texture, pale yellow color with slight translucency at the edges, top view |
| `gruyere-rape.png` | fluffy pile of long shredded Gruyère strands, realistic cheese texture with slight elasticity visible, warm pale yellow color, scattered natural pile, top view |
| `emmental.png` | rectangular block of pale yellow Emmental cheese showing characteristic large holes on the cut face, smooth surface with slight waxy sheen, warm cream-yellow tones, 3/4 side view |
| `fromage-fondue.png` | ceramic fondue pot in warm orange-brown with a small spirit burner underneath, visible melted cheese inside the pot, two long forks resting on the rim, realistic ceramic glaze texture, front view |
| `fromage-burger.png` | single square processed cheese slice with slightly melted rounded corners, wrapped in thin transparent plastic, pale warm yellow-orange color, realistic plastic film texture, top view |
| `fromage-chevre.png` | cylindrical white goat cheese log with a slightly wrinkled natural rind and ash-grey coating, clean cream interior visible at one end, realistic mold-rind texture, side view |
| `fromage-bleu.png` | wedge of blue cheese with creamy white body and distinctive blue-green penicillin veining, crumbly natural texture at the cut face, realistic mold-ripened surface, 3/4 view |
| `fromage-moule.png` | smooth fresh mozzarella ball with a glossy pearly-white surface, sitting in a shallow pool of milky brine, slightly elastic-looking surface, 3/4 view |
| `fromage-morbier.png` | rectangular slice of Morbier cheese showing the characteristic thin black ash line through the center, ivory-cream paste, smooth surface, realistic cheese texture, front view |
| `fromage-munster.png` | round flat cheese wheel with a vivid washed orange rind, soft paste visible at the edge, slightly sticky-looking rind surface, 3/4 top view |
| `babybel.png` | round mini cheese disc fully coated in bright red wax, slight pull-tab detail, smooth waxy surface, realistic wax coating texture, front view |
| `vache-rit.png` | individually wrapped triangular cheese portion in shiny silver foil, round red printed label on the front with cow illustration, foil slightly creased, realistic metallic foil texture, front view |
| `fromage-croc.png` | individual processed cheese slice in separate orange-yellow plastic wrapper, square shape, realistic plastic film with slight print, top view |
| `comte.png` | rectangular block of Comté cheese with natural rough brown rind on the outer edge, firm ivory-cream paste, realistic pressed cheese texture, 3/4 side view |
| `beaufort.png` | rectangular block of Beaufort cheese, pale ivory color, firm pressed texture, natural rind at the edge, 3/4 side view |
| `gouda.png` | round disc of Gouda with a golden-yellow wax rind, smooth waxy surface, slight edge detail showing the paste, 3/4 top view |
| `port-salut.png` | round flat Port Salut disc with a vivid orange washed rind and pale cream interior visible at the edge, realistic semi-soft texture, 3/4 top view |
| `mont-dor.png` | round Mont d'Or cheese in its signature round spruce bark box, soft downy cream-white rind peeking from the slightly opened box, realistic bark texture on the box, 3/4 top view |
| `reblochon.png` | round flat Reblochon wheel with a soft orange-pink washed rind, cream-beige body, slight paper wrapper underneath, realistic semi-soft texture, 3/4 top view |
| `camembert.png` | round Camembert in its iconic thin cardboard box, one side open to show the white downy rind, realistic white penicillin surface texture, 3/4 top view |
| `tomme-savoie.png` | round Tomme de Savoie wheel with a rough grey-brown natural rind, pale cream interior at the edge, realistic rustic mountain cheese texture, 3/4 top view |
| `tomme-berry-truffe.png` | round cheese wheel with a dark grey-black rind flecked with truffle pieces, pale cream interior at the edge, realistic earthy texture, 3/4 top view |
| `fromage-raclette.png` | half-wheel of raclette cheese, flat cut side showing the pale yellow melting paste, natural rind on the curved side, realistic semi-firm texture, 3/4 view |
| `cheddar.png` | rectangular block of deep orange Cheddar with a smooth slightly waxy surface, vivid orange-amber color, slight natural rind at the edge, 3/4 view |
| `parmesan.png` | irregular wedge of Parmigiano Reggiano, rough grainy surface where it was broken off the wheel, pale sandy-cream color, dense crystalline texture, 3/4 view |
| `boursin.png` | small round white plastic Boursin pot with a smooth lid, clean white exterior with green herb illustrations (chives and fresh herbs) printed on the pot, realistic soft-touch plastic container, front view |
| `philadelphia.png` | small white plastic tub of Philadelphia cream cheese with a rounded shape, blue logo band around the middle, silver foil lid, realistic packaging texture, front view |

---

### Famille 5 — Charcuterie, Viandes & Poissons

| Fichier | Description détaillée |
|---|---|
| `chorizo.png` | whole dry chorizo sausage, deep paprika-red skin with visible natural casing wrinkles and tied string at one end, slight marbling of fat, realistic dried sausage texture, side view |
| `saucisson.png` | three overlapping round slices of dry saucisson, pale pink with white fat specks, realistic cut meat texture showing the coarse grind, slight glistening surface, top view |
| `rosette.png` | whole rosette sausage log in natural casing tied at both ends, with two round slices cut showing deep red meat interior and white fat specks, realistic dry-cured meat texture, side view |
| `jambon.png` | single thin folded slice of cooked ham, pale pink color, slight sheen on the smooth surface, realistic cooked ham texture visible at the fold, top view |
| `bacon.png` | two strips of raw streaky bacon with alternating pink meat and white fat layers, slight curl at the edges, realistic raw pork texture, top view |
| `lardon.png` | several small rectangular lardon cubes with visible pink meat and white fat alternating layers, loose natural pile, realistic raw pork texture, top view |
| `saucisse.png` | single plump pork sausage with smooth pink skin, visible linking twist at one end, slight natural casing texture, side view |
| `knack.png` | single pale pink frankfurter Knack sausage, smooth uniform skin with slight sheen, short and plump, side view |
| `saucisse-chipolata.png` | thin coiled chipolata sausage in natural casing, slightly irregular shape, pale beige-pink color, realistic thin casing texture, side view |
| `saucisse-merguez.png` | single merguez sausage, deep brick-red color from spices, slightly irregular surface showing spice rub, side view |
| `steak-hache.png` | single round raw ground beef patty, deep rosy-red color, clearly visible coarse minced meat grain and texture, natural irregular surface, not grilled, top view |
| `viande-hachee.png` | loose pile of raw minced beef, deep rosy-red color, clearly visible coarse ground meat texture, realistic raw meat appearance, top view |
| `poulet.png` | single golden-brown roasted chicken drumstick with a plump meat end, visible crispy skin texture with golden-brown color, white bone tip showing, realistic roasted poultry, side view |
| `agneau.png` | single lamb chop cutlet with rosy-pink meat, slight fat marbling, clean white rib bone handle, realistic raw lamb texture, side view |
| `porc.png` | single raw pork loin slice with pink center and pale fat rim, realistic raw pork texture with slight moisture, side view |
| `pate.png` | small oval metal tin of pâté with a smooth lid and ring-pull, matte steel surface, printed wrap label, realistic metal container, side view |
| `rillettes.png` | small round glass jar with visible shredded pink salmon rillettes inside, metal lid slightly ajar, realistic chunky fish texture in the jar, side view |
| `cordon-bleu.png` | single oval breaded escalope with golden crispy crumb coating, realistic deep-fried breading texture, slight oil sheen, side view |
| `saumon.png` | single salmon fillet with vivid coral-pink flesh, white skin side visible, realistic fish muscle texture and natural fat lines, 3/4 top view |
| `moules.png` | single open mussel shell with glossy blue-black exterior and orange-yellow cooked flesh inside, realistic shell iridescence, side view |
| `poisson-pane.png` | rectangular breaded fish fillet with golden-orange crispy coating, realistic crumb texture, slightly uneven surface, 3/4 view |
| `nems.png` | two golden crispy fried spring rolls (nems) side by side, realistic bubbled fried wrapper texture, plump cylindrical shape, warm golden-brown color, slight oil sheen, 3/4 view |

---

### Famille 6 — Épicerie sèche & Féculents

| Fichier | Description détaillée |
|---|---|
| `pates.png` | bundle of long dry spaghetti pasta lightly held together, pale cream-yellow color, slight grain texture on the surface, slightly fanned out, side view |
| `macaroni.png` | handful of dry elbow macaroni, pale cream-yellow, hollow tube shape clearly visible, slight surface grain, scattered naturally, top view |
| `nouilles.png` | square compressed block of dried instant noodles in a plastic wrapper, cream tightly wound noodles visible through translucent packaging, 3/4 view |
| `lasagnes.png` | flat rectangular pasta sheets in a cardboard box, pale cream-yellow, slight cardboard texture on the packaging, side view |
| `ravioli.png` | pasta package showing plump square ravioli through a clear window, cream pasta with crimped edges, slight moisture, side view |
| `riz.png` | transparent plastic bag filled with white rice grains, shiny plastic surface with slight crinkle, white rice visible clearly, side view |
| `semoule.png` | small paper bag of golden couscous, plain paper packaging with slight print, warm sandy-yellow grain visible through the top, side view |
| `lentilles.png` | transparent plastic bag of green lentils, matte plastic, tiny dark green-grey lentils visible through the bag, side view |
| `farine.png` | paper flour bag with a slightly dusty surface, clean white with wheat illustration print, slight flour dust at the fold, side view |
| `sucre.png` | paper sugar bag with slightly granular visible texture at the top, clean white packaging, printed text area, side view |
| `sucre-morceau.png` | open cardboard box with white sugar cubes neatly stacked inside, one cube sitting outside the box, realistic compressed sugar texture, 3/4 view |
| `chapelure.png` | cardboard box of breadcrumbs with a small clear window showing warm golden-amber crumbs, realistic paper packaging, side view |
| `puree-instant.png` | small sachet of instant mashed potato powder, printed flexible plastic packaging, slight crinkle, side view |
| `potee-mais-popcorn.png` | microwave popcorn paper bag, plain printed paper, slightly puffed shape with fold lines, warm cream and golden print, 3/4 view |

---

### Famille 7 — Boulangerie

| Fichier | Description détaillée |
|---|---|
| `pain.png` | single golden baguette with characteristic diagonal score marks on the crust, realistic crusty texture with golden-brown color, slight flour dusting, diagonal view |
| `pain-mie.png` | loaf of sliced white sandwich bread in a transparent plastic bag, soft white slices visible through the bag, sealed with a plastic clip, side view |
| `pain-burger.png` | single round burger bun with sesame seeds on top, smooth golden top crust, soft interior texture at the cut edge, 3/4 view |
| `pain-lait.png` | single plump oval milk bread roll with a shiny egg-glazed golden surface, smooth and soft-looking, side view |
| `brioche.png` | braided brioche loaf with a deep golden caramel glaze, visible braid texture, slightly crispy top, realistic soft enriched bread texture, 3/4 top view |
| `galette-kebab.png` | single round thin pita flatbread, pale cream with characteristic golden spots from the griddle, slightly puffed center, slight top view |
| `pate-pizza.png` | round ball of pizza dough dusted with flour, slightly sticky surface, natural dough texture, cream-white color, 3/4 top view |
| `pate-feuilletee.png` | rectangular sheet of rolled puff pastry showing beautiful golden layered lamination at the edges, pale butter-cream color, slight flour dusting, 3/4 view |

---

### Famille 8 — Produits laitiers

| Fichier | Description détaillée |
|---|---|
| `lait.png` | white Tetra Pak milk carton with a small plastic screw cap, matte printed cardboard, clean white and blue design, slight edge creases, side view |
| `lait-coco.png` | white cylindrical tin can of coconut milk with a printed label featuring a coconut illustration, metallic silver top, realistic printed tin, side view |
| `beurre.png` | rectangular butter block wrapped in gold foil, slightly creased metallic foil texture, warm golden color, slight cold butter feel, side view |
| `creme-fraiche.png` | small white plastic pot of crème fraîche with a silver foil peel-off lid, plain plastic pot, slight label wrap, side view |
| `creme-liquide.png` | small UHT cream carton brick with a small opening flap, matte printed cardboard, warm cream and white design, realistic carton texture, side view |
| `oeuf.png` | half-open cardboard egg box showing six smooth white eggs nestled in molded grey cardboard, realistic egg surface texture, 3/4 top view |
| `yaourt.png` | single white plastic yogurt pot with a silver foil lid, plain white plastic, slight label wrap, side view |
| `yaourt-fruits.png` | small plastic yogurt pot with a colorful printed label showing fruit, white pot with berry print, slight moisture on the outside, side view |
| `yaourt-nature.png` | small plastic yogurt pot with a plain white minimal label, clean white plastic, simple elegant look, side view |
| `yop.png` | small plastic drinkable yogurt bottle with a screw cap, semi-opaque white plastic, colorful label, rounded bottle shape, side view |
| `fromage-blanc.png` | large round white plastic tub of fromage blanc with a peel-off foil lid, plain white plastic, slight label, side view |
| `chantilly.png` | white aerosol whipped cream can with a red plastic nozzle cap, slight metal can texture, red and white printed label, small cream swirl illustration, side view |

---

### Famille 9 — Épices & Condiments

| Fichier | Description détaillée |
|---|---|
| `poivre.png` | wooden pepper mill with a classic barrel shape, warm walnut-brown wood grain texture, chrome-silver top mechanism, black peppercorn at the base, side view |
| `cinq-baies.png` | clear acrylic pepper grinder filled with mixed whole peppercorns in red, black, white and green, visible grinder mechanism at top, realistic pepper variety, side view |
| `curcuma.png` | small flexible plastic spice sachet filled with finely ground bright golden-yellow turmeric powder, printed pouch with spice name, side view |
| `curry.png` | small flexible plastic spice sachet filled with deep golden-yellow curry powder, printed packaging, slightly rounded pouch, side view |
| `paprika.png` | small clear glass spice jar with a metal screw lid, vivid brick-red paprika powder inside, slight dusting on the inside of the glass, front view |
| `piment.png` | small glass spice jar with metal lid, vivid bright red chili powder inside, slight dusting, realistic glass jar, front view |
| `gingembre.png` | single fresh ginger root with knobbly irregular knobs, golden-beige thin papery skin, slight fibrous texture visible at cut ends, side view |
| `sel.png` | classic round navy-blue and white cardboard salt canister with perforated metal top for sprinkling, slight denting on the metal shaker lid, realistic cardboard texture, top-front view |
| `levure.png` | small paper sachet of baking yeast powder, cream-colored with printed text and golden stripe, realistic paper texture with slight crinkles, front view |
| `muscade.png` | small round whole nutmeg seed with warm brown marbled surface, realistic woody texture with fine veining, slightly oval, side view |
| `sel-lv.png` | rectangular cardboard box of dishwasher salt, matte printed cardboard, blue and white design, slight crease at the edges, side view |
| `ail.png` | single garlic head with papery off-white skin, visible clove divisions under the thin skin, slight root fiber at the base, realistic dry garlic texture, front view |
| `basilic.png` | small bunch of fresh basil leaves, vivid deep green, slight sheen on the leaves, visible leaf veins, fresh-cut stem, top view |
| `persil.png` | small bunch of fresh curly parsley, bright green, fluffy curled leaf texture, slight moisture on the leaves, top view |
| `ciboulette.png` | small bunch of fresh chive stalks, vivid emerald green, thin hollow stalks, slight moisture, bound lightly at the base, top view |
| `menthe.png` | small sprig of fresh mint with plump oval leaves, vivid bright green, visible leaf texture and veins, slight moisture, top view |
| `origan.png` | small glass jar of dried oregano, earthy grey-green dried herb visible inside, metal lid, slight herb dust on inner glass, front view |
| `oignon.png` | single round onion with dry papery golden-brown outer skin, slight crinkle in the skin, visible layers at the root, realistic onion texture, front view |
| `echalote.png` | single shallot with smooth copper-brown papery skin, slight elongated shape, visible papery layers, pointed tip, front view |
| `cube-bouillon.png` | single stock cube in a shiny gold foil wrapper, crinkled metallic foil texture, small square shape, front view |
| `fond-veau.png` | small glass jar of rich amber veal stock, deep warm caramel-brown liquid inside, metal lid, slight label, realistic glass jar, front view |
| `fond-volaille.png` | small glass jar of golden chicken stock, warm amber-golden liquid, metal lid, slight label, realistic glass jar, front view |
| `moutarde.png` | classic ceramic Dijon mustard jar with a wide body, pale mustard-yellow lid, slight glaze on the ceramic surface, small printed paper label, side view |

---

### Famille 10 — Légumes & Fruits frais

| Fichier | Description détaillée |
|---|---|
| `tomate.png` | single round tomato, vivid warm red with realistic smooth skin, glossy surface with slight highlights, green calyx with natural leaf texture, front view |
| `tomate-cerise.png` | small cluster of several cherry tomatoes on a shared green stem, vivid deep red, realistic smooth glossy skin with natural specular highlights, front view |
| `carotte.png` | single carrot with natural orange skin, slight surface imperfections, thin root tip, fluffy green leafy tops, realistic root vegetable texture, diagonal view |
| `pomme-de-terre.png` | single potato with natural earthy beige-brown skin, slight dirt in the skin texture, shallow eyes, realistic rough skin, side view |
| `aubergine.png` | single eggplant with deep purple-black glossy skin, natural green calyx, realistic smooth glossy surface with specular highlight, side view |
| `courgette.png` | single courgette with natural dark and light green striped skin, slight stem end, realistic smooth vegetable skin, side view |
| `brocoli.png` | single broccoli floret with dense deep green crown and pale green stem, realistic grainy floret texture, slight moisture, front view |
| `poivron.png` | single red bell pepper with glossy vivid red skin, natural green stem, realistic smooth pepper surface with characteristic ridges, front view |
| `salade.png` | single iceberg lettuce head with pale and mid-green layered leaves, crisp-looking texture, slight moisture on outer leaves, slight top view |
| `champignon.png` | single white button mushroom with smooth cap and visible gills underneath, slight earthy color, realistic soft mushroom texture, side view |
| `citron.png` | single lemon with natural textured yellow skin, slightly bumpy realistic peel, small natural stem indentation at the top, front view |
| `cornichon.png` | single small pickled gherkin with characteristic bumpy textured skin, vivid deep green, wet slightly glossy surface from brine, side view |
| `avocat.png` | avocado cut in half showing creamy yellow-green flesh with a large smooth brown pit, natural rough dark green skin visible on outside, realistic flesh texture, front view |
| `banane.png` | single banana with natural yellow skin, slight brown speckling, characteristic curved shape, realistic peel texture, side view |
| `poire.png` | single pear with natural yellow-green skin, slight russet spotting, realistic smooth-grainy pear skin texture, small brown stem, front view |
| `pomme.png` | single apple with vivid red skin with natural color variation, slight natural waxy sheen, green leaf and brown stem, realistic apple skin texture, front view |
| `kiwi.png` | kiwi cut in half showing bright green flesh with tiny black seeds in a radial pattern and white core, realistic flesh texture, front view |
| `fraise.png` | single ripe strawberry with deep red flesh, tiny white seeds embedded in the realistic textured surface, bright green leafy crown, slight glossy surface highlight, front view |
| `cerise.png` | two ripe red cherries joined by a green stem, realistic glossy red skin with natural color variation and specular highlights, front view |

---

### Famille 11 — Apéro & Snacks

| Fichier | Description détaillée |
|---|---|
| `chips.png` | inflated foil snack bag in green and silver colors, realistic crinkled metallic foil texture, printed label area with chip illustrations, slightly rounded bag, side view |
| `cacahuete.png` | handful of peanuts in shell with natural beige-brown papery skin, one split open showing two golden nuts inside, realistic dry shell texture, top view |
| `pistache.png` | several pistachio nuts half-open, natural beige shell showing vivid green kernel, slight roasted coloring, realistic nut texture, top view |
| `noisette.png` | handful of whole hazelnuts with natural rich brown shell, one cracked showing golden interior, realistic hard shell texture, top view |
| `noix-cajou.png` | handful of cashew nuts with characteristic curved kidney shape, pale ivory-cream color, slight roasted golden tint, realistic smooth nut texture, top view |
| `amandes.png` | handful of whole almonds with brown papery skin, classic teardrop shape, warm toasted brown tones, realistic wrinkled skin texture, top view |

---

### Famille 12 — Petit-déjeuner & Épicerie sucrée

| Fichier | Description détaillée |
|---|---|
| `cereales.png` | rectangular cereal cardboard box with a clear window showing golden corn flakes, matte printed cardboard, realistic box shape, side view |
| `barre-cereales.png` | single granola bar in a shiny printed wrapper, slightly crinkled plastic film, visible cereal and oat texture through the wrapper edges, side view |
| `chocolat-noir.png` | dark chocolate bar with one square broken off, deep dark brown surface showing glossy chocolate texture, realistic bar markings, top view |
| `chocolat-lait.png` | milk chocolate bar with one square broken off, warm light brown surface showing smooth glossy texture, realistic bar markings, top view |
| `chocolat-blanc.png` | white chocolate bar with one square broken off, creamy ivory-white surface showing smooth glossy texture, realistic bar markings, top view |
| `palet-breton.png` | thick round butter cookie with golden-orange crust, slightly cracked surface showing rich buttery crumb, realistic baked texture, top view |
| `speculoos.png` | elongated rectangular spiced biscuit with embossed windmill pattern on top, deep warm cinnamon-brown color, realistic crunchy texture, top view |
| `nutella.png` | round glass jar of hazelnut chocolate spread, slightly opaque glass showing dark brown contents, red and gold lid, slight label wrap, no brand, side view |
| `confiture.png` | glass jar of strawberry jam with visible red jam inside, checkered red fabric lid cover held with an elastic band, realistic glass jar, side view |
| `creme-marron.png` | soft squeezable tube of chestnut cream, slightly squeezed aluminum tube with warm brown printing, small screw cap, side view |
| `beurre-cacahuete.png` | open glass jar of peanut butter showing creamy beige spread inside with natural oil separation at the top, slight label, 3/4 top view |
| `miel.png` | hexagonal glass honey jar filled with warm liquid amber honey, natural golden color, small wooden honey dipper resting on the rim, realistic glass jar, side view |
| `bonbons.png` | transparent plastic bag filled with colorful mixed hard candy sweets, shiny wrapper, various bright colors visible through the bag, side view |
| `gateaux.png` | cardboard biscuit box with a clear window showing round golden cookies, realistic printed packaging, side view |
| `madeleines.png` | cardboard package with one shell-shaped madeleine visible through a window, realistic golden-buttery color, slight powdered sugar, side view |
| `compote.png` | squeezable pouch of apple sauce with a twist cap, printed flexible plastic, slight pouch shape, side view |
| `flan-sachet.png` | flat printed plastic sachet of flan custard powder, small dessert illustration, slight crinkle, front view |
| `creme-anglaise.png` | small UHT carton of custard sauce, matte cardboard with yellow and cream print, small flap opening, side view |
| `glace.png` | round ice cream tub with slight frost on the outside, printed cardboard lid showing a cream swirl, slight frozen condensation, 3/4 view |
| `cafe.png` | round glass jar of instant coffee granules, warm golden-brown granules visible inside, gold metal screw lid, slight coffee residue inside the glass, side view |
| `capuccino.png` | small flat sachet of cappuccino powder mix, printed flexible packaging with cup illustration, slight crinkle, front view |
| `the.png` | rectangular tea box in warm earth tones, paper box with printed design, one tea bag hanging over the edge with a paper tag, realistic cardboard, 3/4 view |
| `tisane.png` | rectangular herbal tea box in soft lavender and sage-green tones, paper box with a chamomile flower illustration, one tea bag hanging over the edge with a paper tag, realistic cardboard texture, 3/4 view |

---

### Famille 13 — Surgelés

| Fichier | Description détaillée |
|---|---|
| `frites.png` | plastic bag of frozen french fries with frost on the outside, printed bag showing golden fries, slightly stiff from freezing, side view |
| `pizza.png` | flat frozen pizza box, 3/4 view, printed cardboard with visible pizza illustration showing cheese and toppings, realistic matte cardboard packaging |
| `gyoza.png` | two plump crescent gyoza dumplings with carefully pleated edges, pale cream skin with slight golden patches from pan-frying, realistic dumpling texture, 3/4 view |
| `nuggets.png` | three golden chicken nuggets in irregular shapes, realistic crispy golden crumb coating, slight oil sheen, realistic fried texture, top view |
| `rosti.png` | single round potato rösti, deep golden-brown color, visible shredded potato texture on the surface, realistic fried appearance, top view |

---

### Famille 14 — Hygiène personnelle

| Fichier | Description détaillée |
|---|---|
| `brosse-dents.png` | toothbrush with a blue and white handle, bristle head with multi-length nylon bristles in white and blue, realistic plastic handle texture, diagonal side view |
| `dentifrice.png` | toothpaste tube in pale blue and white, slightly squeezed flexible tube with a small curl of white toothpaste at the nozzle, realistic foil tube texture, side view |
| `coton-tige.png` | cylindrical cardboard box of cotton swabs, one swab lying beside it showing white cotton ends and a paper stick, realistic cardboard box, side view |
| `coton.png` | small stack of three round white cotton pads, realistic soft fibrous texture, clean bright white, slight shadow between pads, 3/4 top view |
| `deodorant.png` | roll-on deodorant bottle with transparent ball applicator, white and grey plastic body, slight label, side view |
| `gel-douche.png` | shower gel bottle with rounded body and flip cap, semi-transparent plastic showing slight color of the gel inside, slight label, side view |
| `gel-coiffant.png` | small plastic tub of hair gel with a flat lid, slightly translucent blue-green gel visible inside, realistic soft-touch plastic, 3/4 top view |
| `shampoing.png` | shampoo bottle with pump dispenser, slightly glossy plastic, generic label area, realistic HDPE plastic texture, side view |
| `spray-demelant.png` | detangling spray bottle with a small trigger nozzle, translucent plastic showing slight liquid inside, slight label area, side view |
| `creme-main.png` | hand cream tube in white and soft colors, slightly squeezed with a small curl of white cream at the nozzle tip, realistic flexible tube, side view |
| `pansement.png` | cardboard box of adhesive bandages, one bandage lying beside it showing the beige fabric and protective strips, realistic printed cardboard, 3/4 view |
| `savon-liquide.png` | pump soap dispenser with rounded body, slight foam bubble at the nozzle, translucent plastic, slight label, side view |
| `gel-hydroalcoolique.png` | small hand sanitizer bottle with flip cap, slightly translucent plastic, blue and white label area, side view |
| `dissolvant.png` | small clear glass bottle of nail polish remover with a flat metal screw cap, clear liquid inside, minimal paper label, side view |

---

### Famille 15 — Entretien ménager

| Fichier | Description détaillée |
|---|---|
| `produit-vaisselle.png` | dish soap bottle in green HDPE plastic with a flip top cap, slight semi-translucency showing green liquid inside, realistic plastic texture, side view |
| `liquide-rincage.png` | rinse aid bottle in blue plastic with a flip cap, slight semi-translucency, clean simple form, side view |
| `lessive.png` | laundry detergent powder box with colorful print, matte cardboard surface, slightly worn box edges, side view |
| `tablettes-lv.png` | cardboard package of dishwasher tablets, one tablet lying beside it showing the multi-layer pressed tablet, realistic printed packaging, 3/4 view |
| `tablettes-anti-calcaire.png` | cardboard package of descaler tablets, one small tablet lying beside it, realistic printed flat packaging, 3/4 view |
| `spray-nettoyant.png` | cleaning spray bottle with trigger handle, blue translucent plastic, liquid visible inside, no text, side view |
| `nettoyant-javel.png` | bleach bottle in white plastic with a flip cap, slight label area, realistic HDPE plastic, side view |
| `nettoyant-sol.png` | floor cleaner bottle in purple plastic with a flip cap, slightly glossy plastic surface, side view |
| `produit-vitre.png` | glass cleaner spray bottle with trigger handle, blue translucent plastic showing slight blue liquid, side view |
| `produit-wc.png` | toilet duck cleaner bottle with characteristic angled nozzle, blue-green plastic, slight label, distinctive bent neck, side view |
| `antikal.png` | descaler spray bottle in white plastic with trigger handle, slight label area, realistic plastic, side view |
| `destop.png` | drain cleaner bottle in blue plastic with a rounded shape, slight label area, realistic HDPE plastic, side view |
| `eponge.png` | rectangular kitchen sponge with a bright green abrasive scrubbing pad on top and a yellow foam base, visible foam pores on the yellow side, realistic sponge texture, 3/4 view |
| `papier-aluminium.png` | aluminum foil roll in a cardboard dispenser box, metallic silver foil edge slightly unfolded, realistic metallic sheen, 3/4 view |
| `papier-cuisson.png` | parchment paper roll in a cardboard box, white silicone paper slightly unrolled showing smooth surface, 3/4 view |
| `papier-film.png` | cling film roll in a cardboard dispenser, nearly invisible transparent film edge, realistic cardboard box, 3/4 view |
| `pq.png` | single roll of toilet paper, clean white with embossed texture pattern, tight center tube visible at one end, side view |
| `sopalin.png` | large vertical roll of kitchen paper towels standing on one flat end, white with subtle embossed pattern, visible wound layers along the side, realistic paper texture, side view |
| `serviette.png` | small neat stack of folded white paper napkins, clean white, subtle embossed texture, realistic paper stack, 3/4 top view |
| `sac-poubelle.png` | roll of black plastic bin bags in a cardboard box, matte black plastic visible at the roll end, realistic printed cardboard box, side view |
| `sac-congelation.png` | transparent zip-lock freezer bag lying flat, blue zip-seal strip visible at the top, slight plastic crinkle, realistic polyethylene texture, top view |
| `lingettes.png` | flat rectangular wet wipes pack with a resealable flip lid, slightly damp look, white and colored printed plastic packaging, 3/4 top view |
| `sanytol.png` | white plastic disinfectant spray bottle with trigger handle, blue and green label area with cross motif, realistic HDPE plastic texture, side view |
| `nettoyant-parquet.png` | white plastic floor cleaner spray bottle with trigger handle, light label area, realistic plastic, side view |
| `gratoire.png` | flat rectangular green scrubbing pad, rough coarse abrasive green surface with visible synthetic fiber texture for scratching, flat shape with slight foam underside visible, 3/4 view |

---

### Famille 16 — Divers

| Fichier | Description détaillée |
|---|---|
| `pile.png` | AA battery in matte black and gold colors, realistic cylindrical metal body, positive nub on top, slight metallic sheen, 3/4 side view |
| `briquet.png` | disposable plastic lighter with transparent fuel chamber showing amber fuel level, visible flint wheel at the top, realistic BIC-style form, side view |
| `colle.png` | glue tube in white plastic with a red screw cap, slightly squeezed flexible tube, realistic plastic tube texture, side view |
| `tupperware.png` | rectangular transparent plastic food container with a snap-on lid, clear PET plastic showing contents inside, slight condensation on the lid, 3/4 view |

### Famille 17 — Nouveaux produits

| Filename | Description |
|---|---|
| `boudoirs.png` | elongated ladyfinger biscuit with golden-orange sponge body and generous white powdered sugar coating on top, realistic baked texture, side view |
| `mascarpone.png` | small blue plastic pot of mascarpone cream cheese with a white vertical band running down the center, realistic smooth plastic texture, front view |
| `cervelas.png` | thick red smoked sausage (cervelas) with a white paper label band wrapped around the middle, realistic glossy red casing, side view |
| `tomme-aux-fleurs.png` | round wheel of Tomme cheese with rustic grey-brown natural rind decorated with small dried flower petals pressed into the surface, creamy interior visible at the edge, 3/4 view |

### Famille 18 — Animaux

| Filename | Description |
|---|---|
| `litiere-chat.png` | plastic bag of cat litter with a cat photo on the front label, realistic packaging with grey and blue tones, front view |
| `litiere-chanvre.png` | paper bag of hemp bedding litter for rabbits with a rabbit photo on the label, realistic brown kraft paper bag, front view |
| `croquettes-chat.png` | bag of dry cat food kibble with a cat photo on the front, realistic packaging with orange and brown tones, front view |
| `croquettes-chien.png` | bag of dry dog food kibble with a dog photo on the front, realistic packaging with brown and red tones, front view |
| `granule-lapin.png` | bag of rabbit pellet food with a rabbit photo on the front, realistic packaging with green and brown tones, front view |
| `foin.png` | compressed bag of golden hay with wisps visible through clear packaging, realistic natural golden-yellow color, front view |
| `sachet-herbe.png` | small clear bag of dried dandelion herbs for rabbits with green leaves visible inside, realistic transparent packaging, front view |
| `pate-chien.png` | metal tin can of dog pâté with a dog photo on the label, realistic aluminium can with brown and gold label, front view |
| `pate-chat.png` | small foil pouch of cat pâté with a cat photo on the front, realistic foil packaging with pink and purple tones, front view |
