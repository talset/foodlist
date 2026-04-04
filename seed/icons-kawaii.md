# Foodlist — Spécifications des icônes (style kawaii japonais)

## Style global

Toutes les icônes suivent un style **kawaii japonais** appliqué **sur la forme réelle du produit** :

- **Format** : PNG, 128×128 px, **fond transparent** (alpha)
- **Règle principale** : le produit garde sa forme, ses couleurs et son apparence reconnaissable. Le kawaii est une **couche ajoutée** (visage sur le corps de l'objet), pas une transformation du produit en personnage
- **Visages** : grands yeux ronds brillants (glossy black dot eyes), petite bouche souriante en U, deux petites joues roses rondes (blush marks) — dessinés sur la surface de l'objet
- **Couleurs** : légèrement plus douces et pastel que le thème default, mais fidèles au produit (une bouteille de bière reste ambrée, une tomate reste rouge)
- **Formes** : légèrement plus rondes et replètes que la réalité, mais reconnaissables
- **Pas de bras, jambes, ni corps humain** — l'objet garde sa silhouette d'origine
- **Pas d'ombre portée**, pas de texte, pas de logo
- **Cadrage** : le sujet doit être centré et occuper environ 75-80% de la surface, avec un espace vide uniforme tout autour — pas coupé sur les bords, pas collé dans un coin
- La transparence et le cadrage sont normalisés automatiquement après génération (`rembg` + centrage)

Prompt de style global appliqué à chaque icône (fond blanc pour faciliter le détourage) :
> *kawaii Japanese sticker icon of the actual product keeping its real shape and form, with a cute face drawn on it — big round glossy black dot eyes, tiny U-shaped smile, two round rosy pink blush cheeks — slightly chubby proportions, soft pastel colors, flat design, clean white background, no shadow, no text, no logo, no arms no legs, isolated product centered with equal margins on all sides*

---

### Famille 1 — Bouteilles boissons

| Fichier | Description détaillée |
|---|---|
| `bouteille-biere.png` | amber glass beer bottle with crown cap, keeping its real bottle shape, with a kawaii face drawn on the bottle body — big glossy eyes, tiny smile, rosy pink cheeks — warm honey-amber color, side view |
| `bouteille-cidre.png` | dark green glass cider bottle with cork stopper, keeping its real bottle shape, with a kawaii face on the bottle body — big eyes, tiny smile, rosy cheeks — soft mossy-green color, side view |
| `bouteille-coca.png` | cola bottle with iconic curved contour shape and vivid red label band wrapped around the middle, keeping its real bottle shape, with a kawaii face on the red label — big glossy eyes, cheerful smile, rosy cheeks — deep cocoa-brown body, bright red label and cap, no brand, side view |
| `bouteille-fanta.png` | orange plastic soda bottle with orange cap, keeping its real bottle shape, with a kawaii face on the bottle body — big round eyes, happy smile, rosy cheeks — vivid tangerine-orange, no logo, side view |
| `bouteille-icetea.png` | golden amber plastic iced tea bottle with brown cap, keeping its real bottle shape, with a kawaii face on the bottle body — half-closed relaxed eyes, tiny smile, rosy cheeks — honey-tea color, side view |
| `bouteille-limonade.png` | pale yellow plastic lemonade bottle with yellow cap, keeping its real bottle shape, with a kawaii face on the bottle body — sparkly eyes, bubbly smile, rosy cheeks — soft citrus-cream color, side view |
| `bouteille-vin-rouge.png` | dark burgundy glass wine bottle with cork, keeping its real slim elegant shape, with a small kawaii face on the bottle body — gentle eyes, sweet smile, rosy cheeks — deep plum-red color, side view |
| `bouteille-vin-blanc.png` | pale sage-green glass wine bottle with cork, keeping its real slim shape, with a small kawaii face on the bottle body — delicate eyes, smile, soft pink blush — celery-green color, side view |
| `bouteille-rhum.png` | stocky dark caramel glass spirits bottle with thick neck, keeping its real bottle shape, with a kawaii face on the bottle body — squinting happy eyes, big grin, rosy cheeks — warm amber-brown, no text, side view |
| `bouteille-sirop.png` | tall slim strawberry-red glass syrup bottle with silver screw cap, keeping its real slender bottle shape, with a small kawaii face on the bottle body — big eyes, shy smile, rosy cheeks, side view |
| `bouteille-huile.png` | tall slim golden glass olive oil bottle with pour spout, keeping its real elegant bottle shape, with a small kawaii face on the bottle body — gentle droopy eyes, serene smile, rosy cheeks — liquid-gold color, side view |
| `huile.png` | golden sunflower oil plastic bottle, keeping its real bottle shape, with a kawaii face on the bottle body — big round eyes, happy smile, rosy cheeks — warm golden-yellow color, side view |
| `jus-fruit.png` | round glass of fresh orange juice with a straw, keeping its real glass shape, with a kawaii face on the glass body — big glossy eyes, sunny smile, rosy cheeks — warm amber-orange color, front view |

---

### Famille 2 — Sauces (squeeze bottles)

| Fichier | Description détaillée |
|---|---|
| `bouteille-sauce-verte.png` | dark green glass pesto jar with gold screw lid, keeping its real round jar shape, with a kawaii face on the jar body — big eyes, happy smile, rosy cheeks — deep forest-green color, side view |
| `bouteille-sauce-orange.png` | orange plastic squeeze bottle with nozzle tip, keeping its real squeeze bottle shape, with a kawaii face on the bottle body — big eyes, cheerful smile, rosy cheeks — soft paprika-orange color, no text, side view |
| `ketchup.png` | red plastic ketchup squeeze bottle with nozzle, keeping its real squeeze bottle shape, with a kawaii face on the bottle body — happy eyes, wide smile, rosy cheeks — vivid tomato-red, no text, side view |
| `sauce-tomate.png` | round glass tomato sauce jar with red lid, keeping its real jar shape, with a kawaii face on the jar body — sweet eyes, smile, rosy cheeks — warm red color, side view |
| `sauce-bolognaise.png` | round glass bolognese jar with dark red lid, keeping its real jar shape, with a kawaii face on the jar body — cozy squinting eyes, satisfied smile, rosy cheeks — deep red-brown, side view |
| `sauce-harissa.png` | small round harissa tin can with flat lid, keeping its real tin shape, with a kawaii face on the tin body — spicy squinting eyes, smug smile, rosy cheeks — deep brick-red, front view |
| `sauce-piquante.png` | slim glass hot sauce bottle with red cap, keeping its real long narrow bottle shape, with a small kawaii face on the bottle body — cheeky eyes, grin, rosy cheeks — vivid orange-red, side view |
| `sauce-sachets.png` | flat red condiment sachet packet, keeping its real rectangular packet shape, with a kawaii face on the front — winking eye, tiny smile, rosy cheeks, top view |
| `mayonnaise.png` | pale yellow plastic mayonnaise squeeze bottle with nozzle, keeping its real squeeze bottle shape, with a kawaii face on the bottle body — sleepy happy eyes, gentle smile, rosy cheeks — cream-yellow, no text, side view |
| `sauce-samourai.png` | peachy-orange plastic squeeze bottle, keeping its real squeeze bottle shape, with a kawaii face on the bottle body — big eyes, cheerful smile, rosy cheeks — warm peach color, no text, side view |
| `sauce-soja.png` | slim dark glass soy sauce bottle with red cap, keeping its real narrow bottle shape, with a small kawaii face on the bottle body — elegant eyes, serene smile, rosy cheeks — deep dark brown, side view |
| `sauce-barbecue.png` | dark brown glass BBQ sauce bottle with black cap, keeping its real bottle shape, with a kawaii face on the bottle body — squinting happy eyes, big grin, rosy cheeks — deep smoky brown, side view |
| `sauce-burger.png` | white plastic squeeze bottle with nozzle, keeping its real squeeze bottle shape, with a kawaii face on the bottle body — big eyes, cheerful smile, rosy cheeks — clean white, no text, side view |

---

### Famille 3 — Conserves

| Fichier | Description détaillée |
|---|---|
| `conserve-soupe.png` | cylindrical tin can with orange soup label, keeping its real can shape, with a kawaii face on the label — big glossy eyes, warm smile, rosy cheeks — cozy orange tones, silver rim, 3/4 view |
| `conserve-cassoulet.png` | tall cylindrical tin can with earthy brown label, keeping its real can shape, with a kawaii face on the label — satisfied eyes, cozy smile, rosy cheeks — terracotta tones, silver rim, 3/4 view |
| `epinards.png` | cylindrical tin can with green spinach label, keeping its real can shape, with a kawaii face on the label — bright energetic eyes, happy smile, rosy cheeks — soft green, silver rim, 3/4 view |
| `petits-pois.png` | cylindrical tin can with pea-green label, keeping its real can shape, with a kawaii face on the label — round cheerful eyes, wide smile, rosy cheeks — bright pea-green, silver rim, 3/4 view |
| `haricots-verts.png` | cylindrical tin can with fresh green label, keeping its real can shape, with a kawaii face on the label — sparkling eyes, happy smile, rosy cheeks — fresh green, silver rim, 3/4 view |
| `haricots-rouges.png` | cylindrical tin can with deep red label, keeping its real can shape, with a kawaii face on the label — round bright eyes, cheerful smile, rosy cheeks — deep red, silver rim, 3/4 view |
| `haricots-tomate.png` | cylindrical tin can with orange-red label, keeping its real can shape, with a kawaii face on the label — happy eyes, big smile, rosy cheeks — orange-red, silver rim, 3/4 view |
| `flageolets.png` | cylindrical tin can with pale green label, keeping its real can shape, with a kawaii face on the label — gentle soft eyes, sweet smile, rosy cheeks — pale green, silver rim, 3/4 view |
| `paella.png` | cylindrical tin can with orange-yellow label, keeping its real can shape, with a kawaii face on the label — excited wide eyes, big smile, rosy cheeks — warm orange-yellow, silver rim, 3/4 view |
| `maquereau.png` | flat oval tin can with teal-blue label, keeping its real flat oval shape, with a kawaii face on the label — sleepy fish-like eyes, tiny smile, rosy cheeks — soft teal-blue, silver metallic body, side view |
| `thon.png` | flat oval tin can with sky-blue label, keeping its real flat oval shape, with a kawaii face on the label — cute wide eyes, happy smile, rosy cheeks — sky-blue, silver metallic body, side view |
| `thon-tomate.png` | flat oval tin can with orange-red label, keeping its real flat oval shape, with a kawaii face on the label — bright eyes, smile, rosy cheeks — orange-red, silver metallic body, side view |
| `concentre-tomate.png` | small metal tomato paste tube with screw cap, keeping its real squeezable tube shape, with a kawaii face on the tube body — big round eyes, cheerful smile, rosy cheeks — bright red, side view |
| `puree-tomate.png` | tall slim Tetra Pak tomato passata carton, keeping its real brick carton shape, with a kawaii face on the front — glossy happy eyes, big smile, rosy cheeks — warm red, side view |

---

### Famille 4 — Fromages

| Fichier | Description détaillée |
|---|---|
| `fromage-rape.png` | fluffy mound of shredded golden cheese, keeping its real wispy pile shape, with a tiny kawaii face peeking from the center — big eyes, smile, rosy cheeks — warm pale yellow, top view |
| `gruyere-rape.png` | fluffy pile of shredded Gruyère, keeping its real wispy mound shape, with a tiny kawaii face in the center — big glossy eyes, smile, rosy cheeks — warm yellow, top view |
| `emmental.png` | rectangular block of pale golden Emmental with round holes visible, keeping its real cheese block shape, with a kawaii face on the cut face — big eyes, cute smile, rosy cheeks — soft yellow, 3/4 view |
| `fromage-frais.png` | small white plastic fresh cheese pot with silver foil lid, keeping its real pot shape, with a kawaii face on the pot body — big glossy eyes, sweet smile, rosy cheeks — clean white, side view |
| `fromage-fondue.png` | ceramic fondue pot with flame underneath, keeping its real round pot shape with two forks, with a kawaii face on the pot body — happy squinting eyes, warm smile, rosy cheeks — sunset orange, front view |
| `fromage-burger.png` | single flat square processed cheese slice, keeping its real flat square shape with melted corners, with a kawaii face drawn on the surface — big round eyes, tiny smile, rosy cheeks — pale warm yellow, top view |
| `fromage-chevre.png` | cylindrical white goat cheese log with grey ash rind, keeping its real log shape, with a small kawaii face on the cut end — big gentle eyes, shy smile, rosy cheeks — clean white, side view |
| `fromage-bleu.png` | wedge of creamy white blue cheese with blue-green veins, keeping its real wedge shape, with a kawaii face on the flat cut side — quirky droopy eyes, cheeky grin, rosy cheeks — ivory with blue-green veins, 3/4 view |
| `fromage-moule.png` | round mozzarella ball in milky brine, keeping its real round ball shape, with a kawaii face on the ball surface — big round glossy eyes, sweet smile, rosy cheeks — pearly-white, side view |
| `fromage-morbier.png` | rectangular Morbier cheese slice with black ash line through the center, keeping its real slice shape, with a kawaii face on the surface — simple big eyes, calm smile, rosy cheeks — soft ivory, front view |
| `fromage-munster.png` | round Munster cheese wheel with vivid orange rind, keeping its real round wheel shape, with a kawaii face on the top — bold happy eyes, big smile, rosy cheeks — warm orange rind, 3/4 top view |
| `babybel.png` | round Babybel cheese disc in red wax coating with pull tab, keeping its real disc shape, with a kawaii face drawn on the red wax surface — adorable big eyes, wide smile, very rosy cheeks — bright strawberry-red, front view |
| `vache-rit.png` | triangular laughing cow cheese portion in silver foil with red label, keeping its real triangle shape, with a kawaii face on the front — big laughing eyes, wide smile, very rosy cheeks — silver foil with red circle, front view |
| `fromage-croc.png` | flat square processed cheese slice in orange-yellow packaging, keeping its real flat square shape, with a kawaii face drawn on the surface — friendly eyes, tiny smile, rosy cheeks — pale yellow, top view |
| `comte.png` | rectangular block of pale ivory Comté with brown rind edge, keeping its real cheese block shape, with a kawaii face on the cut face — calm sophisticated eyes, gentle smile, rosy cheeks — ivory with brown rind, 3/4 view |
| `gruyere.png` | rectangular block of golden Gruyère, keeping its real cheese block shape, with a kawaii face on the surface — warm happy eyes, cozy smile, rosy cheeks — pale yellow, 3/4 view |
| `beaufort.png` | rectangular block of pale ivory Beaufort, keeping its real cheese block shape, with a kawaii face on the cut face — gentle soft eyes, sweet smile, rosy cheeks — pale ivory, 3/4 view |
| `gouda.png` | round Gouda disc with waxy yellow rind, keeping its real disc shape, with a kawaii face on the top surface — big bright eyes, happy smile, rosy cheeks — golden-yellow, 3/4 top view |
| `port-salut.png` | round Port Salut disc with vivid orange rind, keeping its real disc shape, with a kawaii face on the top — cheerful eyes, big smile, rosy cheeks — orange rind with cream interior, 3/4 top view |
| `comte-400.png` | small rectangular Comté block with brown rind, keeping its real compact block shape, with a kawaii face on the cut face — big eyes, happy smile, rosy cheeks — ivory with brown rind, 3/4 view |
| `comte-22.png` | thick wedge slice of Comté cut from a wheel, keeping its real wedge shape with brown outer rind, with a kawaii face on the cut face — round happy eyes, smile, rosy cheeks — pale ivory, 3/4 view |
| `mont-dor.png` | round Mont d'Or cheese in its round spruce bark box, keeping its real box+cheese shape, with a kawaii face on the cheese top — big cozy eyes, happy smile, rosy cheeks — cream-white, 3/4 top view |
| `reblochon.png` | round flat Reblochon wheel with orange-washed rind, keeping its real flat wheel shape, with a kawaii face on the top — sleepy happy eyes, gentle smile, rosy cheeks — cream-beige with orange rind, 3/4 top view |
| `camembert.png` | round Camembert in its round cardboard box (open), keeping its real box+cheese shape, with a kawaii face on the white rind — big curious eyes, happy smile, rosy cheeks — white downy rind, 3/4 top view |
| `tomme-savoie.png` | round Tomme de Savoie wheel with rough grey-brown rind, keeping its real wheel shape, with a kawaii face on the top surface — rustic earthy eyes, warm smile, rosy cheeks — grey-brown rind, pale cream interior, 3/4 top view |
| `tomme-berry-truffe.png` | round truffle cheese wheel with dark grey-black speckled rind, keeping its real wheel shape, with a kawaii face on the top — mysterious squinting eyes, sly smile, rosy cheeks — dark grey rind, pale interior, 3/4 top view |
| `fromage-raclette.png` | half-wheel of pale yellow raclette cheese with flat cut side, keeping its real half-wheel shape, with a kawaii face on the cut face — cozy half-closed eyes, warm smile, rosy cheeks — soft pale yellow, 3/4 view |
| `cheddar.png` | rectangular block of deep orange cheddar, keeping its real block shape, with a kawaii face on the surface — bold energetic eyes, wide smile, rosy cheeks — vivid warm orange, 3/4 view |
| `parmesan.png` | irregular rustic wedge of sandy-beige parmesan with crumbly texture, keeping its real wedge shape, with a kawaii face on the cut face — wise squinting eyes, dignified smile, rosy cheeks — sandy-beige, 3/4 view |

---

### Famille 5 — Charcuterie, Viandes & Poissons

| Fichier | Description détaillée |
|---|---|
| `chorizo.png` | whole chorizo sausage log with paprika-red skin and knotted end, keeping its real sausage shape, with a kawaii face on the side — spicy squinting eyes, sassy grin, rosy cheeks — deep red skin with white fat marbling, side view |
| `saucisson.png` | three overlapping round saucisson slices, keeping their real circular slice shape, with a kawaii face on the top slice — big eyes, happy smile, rosy cheeks — pinkish-beige with fat speckles, top view |
| `rosette.png` | whole rosette sausage log with pale pink casing tied at both ends, keeping its real log shape, with a kawaii face on the side — big round eyes, cheerful smile, rosy cheeks — pale pink, side view |
| `jambon.png` | single soft folded slice of pink cooked ham, keeping its real flat folded shape, with a small kawaii face on the surface — sleepy happy eyes, gentle smile, rosy cheeks — rose-pink, top view |
| `bacon.png` | two wavy bacon rashers side by side, keeping their real wavy flat shape, with a small kawaii face on each rasher — big eyes, happy smile, rosy cheeks — pink and ivory stripes, top view |
| `lardon.png` | pile of small rectangular lardon strips, keeping their real rectangular strip shapes, with a kawaii face on the topmost strip — big round eyes, happy smile, rosy cheeks — rosy-pink and pale white, top view |
| `saucisse.png` | single plump curved pink pork sausage, keeping its real sausage shape, with a kawaii face drawn on the side — big round eyes, cheerful smile, rosy cheeks — warm rosy color, side view |
| `knack.png` | single short chubby frankfurter Knack sausage, keeping its real sausage shape, with a kawaii face on the side — happy wide eyes, big smile, rosy cheeks — pale pink, side view |
| `saucisse-chipolata.png` | single thin coiled chipolata sausage in a spiral, keeping its real coiled shape, with a small kawaii face on the front coil — big eyes, smile, rosy cheeks — soft beige-pink, side view |
| `saucisse-merguez.png` | single thin slightly curved merguez sausage, keeping its real sausage shape, with a small kawaii face on the side — spicy bright eyes, cheeky grin, rosy cheeks — deep brick-red, side view |
| `steak-hache.png` | flat round raw ground beef patty, keeping its real flat disc shape with visible coarse texture, with a kawaii face on the top surface — bold energetic eyes, determined smile, rosy cheeks — deep rosy-red, top view |
| `viande-hachee.png` | mound of raw minced beef, keeping its real loose mound shape with coarse texture, with a small kawaii face on top — big eyes, happy smile, rosy cheeks — deep rosy-red textured surface, top view |
| `poulet.png` | golden roasted chicken drumstick with white bone tip, keeping its real drumstick shape, with a kawaii face on the meat part — big happy eyes, cheerful smile, rosy cheeks — warm golden-brown, side view |
| `agneau.png` | lamb chop cutlet with round meat portion and white rib bone, keeping its real chop shape, with a kawaii face on the meat portion — innocent wide eyes, sweet smile, rosy cheeks — rosy-pink meat, side view |
| `porc.png` | pork loin slice with pink center and pale cream fat rim, keeping its real slice shape, with a kawaii face on the surface — content half-closed eyes, soft smile, rosy cheeks — soft pink, side view |
| `pate.png` | small oval metal pâté tin with pull tab, keeping its real tin shape, with a kawaii face on the tin lid — sleepy cozy eyes, happy smile, rosy cheeks — warm beige, side view |
| `rillettes.png` | small round metal rillettes tin with shredded salmon visible inside, keeping its real open tin shape, with a kawaii face on the rim — surprised wide eyes, open mouth smile, rosy cheeks — rose-salmon color, side view |
| `cordon-bleu.png` | plump oval breaded escalope with golden crumb coating, keeping its real oval escalope shape, with a kawaii face on the surface — big surprised eyes, happy smile, rosy cheeks — golden-brown crispy coating, side view |
| `saumon.png` | plump salmon fillet with coral-pink flesh and pale skin on one side, keeping its real fillet shape, with a small kawaii face on the surface — elegant droopy eyes, serene smile, rosy cheeks — gorgeous coral-pink, 3/4 top view |
| `moules.png` | open mussel shell with midnight-blue exterior and orange flesh inside, keeping its real open shell shape, with a small kawaii face on the flesh — one big eye peeking out, tiny smile, rosy cheeks — midnight-blue shell, side view |
| `poisson-pane.png` | flat rectangular breaded fish fillet with crispy golden-orange crumb coating, keeping its real rectangular brick shape, with a kawaii face on the surface — big glossy eyes, happy smile, rosy cheeks — golden-orange crust, 3/4 view |

---

### Famille 6 — Épicerie sèche & Féculents

| Fichier | Description détaillée |
|---|---|
| `pates.png` | bundle of long dry spaghetti sticks, keeping their real long thin stick shape, with a tiny kawaii face on the bundle — big eyes, smile, rosy cheeks — soft pale cream-yellow, side view |
| `macaroni.png` | handful of small curved macaroni elbow pasta pieces, keeping their real hollow curved tube shape, with a kawaii face on the central piece — big eyes, smile, rosy cheeks — pale cream-yellow, top view |
| `nouilles.png` | square compressed block of dried asian noodles in plastic packaging, keeping its real square block shape, with a kawaii face on the packaging — big eyes, happy smile, rosy cheeks — soft cream, 3/4 view |
| `lasagnes.png` | flat rectangular lasagne pasta package in cardboard, keeping its real flat box shape, with a kawaii face on the packaging — sleepy eyes, gentle smile, rosy cheeks — soft cream cardboard, side view |
| `ravioli.png` | pasta package with window showing plump square ravioli, keeping its real box shape, with a kawaii face on the packaging — big eyes, smile, rosy cheeks — soft warm tones, side view |
| `riz.png` | transparent plastic bag filled with white rice grains, keeping its real rounded bag shape, with a kawaii face on the bag — big bright eyes, happy smile, rosy cheeks — white rice visible inside, side view |
| `semoule.png` | small paper bag of golden couscous, keeping its real small bag shape, with a kawaii face on the bag — round happy eyes, smile, rosy cheeks — warm sandy-golden color, side view |
| `lentilles.png` | transparent plastic bag filled with small green lentils, keeping its real rounded bag shape, with a kawaii face on the bag — calm wise eyes, gentle smile, rosy cheeks — muted sage-green, side view |
| `farine.png` | soft white paper flour bag with wheat illustration, keeping its real paper bag shape, with a kawaii face on the bag — big gentle eyes, sweet smile, rosy cheeks — clean white, side view |
| `sucre.png` | soft white paper sugar bag, keeping its real paper bag shape, with a kawaii face on the bag — sweet sparkling eyes, happy smile, rosy cheeks — clean white, side view |
| `sucre-morceau.png` | open cardboard box with white sugar cubes, keeping its real open box shape, with a kawaii face on the box — big eyes, happy smile, rosy cheeks — one cube sitting outside with its own tiny dot eyes, 3/4 view |
| `chapelure.png` | cardboard breadcrumbs package with small window showing amber crumbs, keeping its real box shape, with a kawaii face on the packaging — warm golden eyes, cozy smile, rosy cheeks — golden amber tones, side view |
| `puree-instant.png` | single serving sachet of instant mashed potato flakes, keeping its real flat sachet shape, with a kawaii face on the sachet — sleepy content eyes, happy smile, rosy cheeks — cream and warm yellow, side view |
| `potee-mais-popcorn.png` | microwave popcorn paper bag, keeping its real plump rectangular bag shape, with a kawaii face on the front — excited wide eyes, big open smile, rosy cheeks — warm cream and golden, 3/4 view |

---

### Famille 7 — Boulangerie

| Fichier | Description détaillée |
|---|---|
| `pain.png` | golden baguette with diagonal score cuts, keeping its real long baguette shape, with a kawaii face on the side — big happy eyes, wide smile, rosy cheeks — warm golden-brown crust, diagonal view |
| `pain-mie.png` | sliced white sandwich bread loaf in transparent bag, keeping its real loaf-in-bag shape, with a kawaii face on the front slices — big glossy eyes, happy smile, rosy cheeks — fluffy white slices visible, side view |
| `pain-burger.png` | round burger bun with sesame seeds, keeping its real round bun shape, with a kawaii face on the front — big round happy eyes, wide smile, rosy cheeks — warm golden-cream color, 3/4 view |
| `pain-lait.png` | plump oval milk bread roll with shiny golden glaze, keeping its real oval roll shape, with a kawaii face on the front — big shiny eyes, sweet smile, rosy cheeks — golden glaze surface, 3/4 view |
| `brioche.png` | braided golden brioche loaf with deep glossy caramel glaze, keeping its real braided loaf shape, with a kawaii face on the front braid section — excited sparkly eyes, big happy smile, very rosy cheeks — deep glossy caramel, 3/4 top view |
| `galette-kebab.png` | round flat pita bread with golden spots, keeping its real flat disc shape, with a kawaii face drawn on the surface — big simple eyes, goofy grin, rosy cheeks — pale cream with golden spots, top view |
| `pate-pizza.png` | round ball of raw pizza dough with light flour dusting, keeping its real round dough ball shape, with a kawaii face on the front — happy sleepy eyes, content smile, rosy cheeks — soft cream-white, 3/4 top view |
| `pate-feuilletee.png` | rolled out rectangular puff pastry sheet with visible golden layered edges, keeping its real flat rectangular shape, with a kawaii face drawn on the surface — amazed wide eyes, surprised open mouth, rosy cheeks — butter-cream color with golden layers, 3/4 view |

---

### Famille 8 — Produits laitiers

| Fichier | Description détaillée |
|---|---|
| `lait.png` | white milk Tetra Pak carton with blue stripe at top, keeping its real carton shape, with a kawaii face on the front — big friendly eyes, happy smile, rosy cheeks — clean white body, blue stripe, side view |
| `lait-coco.png` | white cylindrical coconut milk tin can with coconut illustration, keeping its real can shape, with a kawaii face on the label — tropical bright eyes, happy smile, rosy cheeks — clean white, side view |
| `beurre.png` | rectangular butter block wrapped in gold and silver foil, keeping its real rectangular wrapped block shape, with a kawaii face on the front — sleepy warm eyes, cozy smile, soft pink cheeks — warm golden-yellow foil, side view |
| `creme-fraiche.png` | round white plastic fresh cream pot with silver foil lid, keeping its real pot shape, with a kawaii face on the pot body — big glossy eyes, sweet smile, rosy cheeks — clean white, side view |
| `creme-liquide.png` | small cream-colored UHT carton brick with pour spout, keeping its real small brick carton shape, with a kawaii face on the front — big eyes, happy smile, rosy cheeks — warm ivory, side view |
| `oeuf.png` | egg carton half-open showing six smooth white eggs inside, keeping its real open carton shape, each egg with a tiny kawaii face — big dot eyes, tiny smile — on its surface, warm cream cardboard, 3/4 top view |
| `yaourt.png` | single white plastic yogurt pot with silver foil lid, keeping its real pot shape, with a kawaii face on the pot body — big glossy eyes, sweet smile, rosy cheeks — clean white, side view |
| `yaourt-fruits.png` | small individual plastic fruit yogurt pot with colorful fruity label, keeping its real pot shape, with a kawaii face on the label — excited bright eyes, big happy smile, very rosy cheeks — colorful berries on label, side view |
| `yaourt-nature.png` | small individual plain white yogurt pot, keeping its real pot shape, with a kawaii face on the clean white surface — simple calm eyes, gentle smile, soft pink cheeks — minimalist white, side view |
| `yop.png` | small plump drinkable yogurt bottle with screw cap, keeping its real bottle shape, with a kawaii face on the bottle body — big cheerful eyes, happy smile, rosy cheeks — soft white and colorful, side view |
| `fromage-blanc.png` | large round plastic fromage blanc tub with blue and white label, keeping its real large tub shape, with a kawaii face on the label — big friendly eyes, wide smile, very rosy cheeks — clean white tub, side view |
| `chantilly.png` | white aerosol whipped cream can with red cap and cream nozzle, keeping its real aerosol can shape, with a kawaii face on the can body — big sleepy eyes, happy smile, rosy cheeks — clean white can with red cap, side view |

---

### Famille 9 — Épices & Condiments

| Fichier | Description détaillée |
|---|---|
| `poivre.png` | wooden pepper mill with plump round body and peppercorns at base, keeping its real mill shape, with a kawaii face on the mill body — big round eyes, happy smile, rosy cheeks — warm walnut-brown, side view |
| `cinq-baies.png` | wooden pepper mill filled with colorful mixed peppercorns, keeping its real mill shape, with a kawaii face on the mill body — colorful sparkly eyes, happy smile, rosy cheeks — walnut-brown body, side view |
| `curcuma.png` | small round glass spice jar filled with vivid golden-yellow turmeric powder, keeping its real jar shape, with a kawaii face on the jar body — bright sunny eyes, wide smile, rosy cheeks — vivid golden-yellow, front view |
| `curry.png` | small round glass spice jar filled with warm orange-yellow curry powder, keeping its real jar shape, with a kawaii face on the jar body — warm golden eyes, happy smile, rosy cheeks — golden amber, front view |
| `paprika.png` | small round glass spice jar filled with vivid brick-red paprika powder, keeping its real jar shape, with a kawaii face on the jar body — bold fiery eyes, big smile, rosy cheeks — vivid brick-red, front view |
| `piment.png` | small round glass spice jar filled with fiery red chili powder, keeping its real jar shape, with a kawaii face on the jar body — intense spicy eyes, cheeky grin, very rosy red cheeks — vivid red, front view |
| `gingembre.png` | knobbly fresh ginger root with irregular bumpy shape, keeping its real root shape, with a kawaii face on the largest bulge — quirky big eyes, mischievous grin, rosy cheeks — golden-beige skin, side view |
| `sel.png` | round cylindrical salt tin with perforated holes on the round top lid, keeping its real shaker tin shape, with a kawaii face on the tin body — calm gentle eyes, soft smile, rosy cheeks — soft navy-blue and white, front view |
| `sel-lv.png` | rectangular cardboard dishwasher salt box, keeping its real box shape, with a kawaii face on the box front — practical friendly eyes, smile, rosy cheeks — soft blue and white, side view |
| `ail.png` | round plump garlic head with papery white skin and tiny root base, keeping its real garlic bulb shape, with a kawaii face on the front — big round eyes, happy smile, rosy cheeks — soft white ivory skin, front view |
| `basilic.png` | small bunch of fresh bright green basil leaves with stem, keeping its real bunch shape, with a kawaii face on the central largest leaf — big happy eyes, smile, rosy cheeks — vivid emerald-green, top view |
| `persil.png` | small bunch of fresh curly green parsley, keeping its real fluffy bunch shape, with a kawaii face on the front — bright cheerful eyes, smile, rosy cheeks — vivid bright green, top view |
| `ciboulette.png` | small bunch of thin green chive stalks tied together, keeping its real tied bunch shape, with a kawaii face drawn on the front stalks — big eyes, smile, rosy cheeks — vivid emerald green, top view |
| `menthe.png` | small sprig of fresh bright green mint with plump rounded leaves, keeping its real sprig shape, with a kawaii face on the central leaf — refreshing cool eyes, cool smile, light rosy cheeks — vivid green, top view |
| `origan.png` | small round glass jar of dried oregano, keeping its real jar shape, with a kawaii face on the jar body — earthy calm eyes, gentle smile, rosy cheeks — muted green, front view |
| `oignon.png` | round plump onion with golden-brown papery skin and tiny root base, keeping its real round onion shape, with a kawaii face on the front — teary happy eyes, big smile, rosy cheeks — golden-brown skin, front view |
| `echalote.png` | elongated shallot with copper-brown papery skin and pointed tip, keeping its real elongated shape, with a kawaii face on the front — big eyes, sweet smile, rosy cheeks — soft copper-brown skin, front view |
| `cube-bouillon.png` | tiny individual golden stock cube in shiny yellow foil wrapper, keeping its real small square cube shape, with a kawaii face on the front — big eyes relative to its tiny size, excited smile, rosy cheeks — bright golden-yellow foil, front view |
| `fond-veau.png` | small round glass jar of rich amber veal stock, keeping its real jar shape, with a kawaii face on the jar body — rich warm eyes, cozy smile, rosy cheeks — deep amber color, front view |
| `fond-volaille.png` | small round glass jar of golden chicken stock, keeping its real jar shape, with a kawaii face on the jar body — bright happy eyes, warm smile, rosy cheeks — golden amber color, front view |
| `moutarde.png` | round ceramic mustard jar with mustard-yellow lid, keeping its real plump jar shape, with a kawaii face on the jar body — pungent squinting eyes, sassy grin, rosy cheeks — warm mustard-yellow, side view |

---

### Famille 10 — Légumes & Fruits frais

| Fichier | Description détaillée |
|---|---|
| `tomate.png` | single round plump tomato with green calyx on top, keeping its real round tomato shape, with a kawaii face on the front — big glossy eyes, big happy smile, very rosy cheeks — vivid warm red, front view |
| `carotte.png` | single plump orange carrot with fluffy green leafy tops, keeping its real carrot shape, with a kawaii face on the carrot body — bright energetic eyes, happy smile, rosy cheeks — vivid orange, diagonal view |
| `pomme-de-terre.png` | single round plump potato with earthy beige skin and surface eyes, keeping its real potato shape, with a kawaii face on the front — sleepy content eyes, cozy smile, soft rosy cheeks — soft earthy beige, side view |
| `aubergine.png` | single plump deep purple eggplant with green calyx, keeping its real eggplant shape, with a kawaii face on the front — elegant long eyes, mysterious smile, rosy cheeks — rich violet-purple, side view |
| `courgette.png` | single plump green zucchini with striped pattern, keeping its real elongated zucchini shape, with a kawaii face on the side — relaxed half-open eyes, gentle smile, rosy cheeks — soft dark and light green stripes, side view |
| `brocoli.png` | single plump broccoli floret with green crown and pale stem, keeping its real broccoli shape, with a kawaii face on the green crown top — big eyes, happy smile, rosy cheeks — lush deep green, front view |
| `poivron.png` | single plump shiny red bell pepper with green stem, keeping its real bell pepper shape, with a kawaii face on the front — big glossy eyes, wide happy smile, very rosy cheeks — vivid warm red, front view |
| `salade.png` | single round lettuce head with layered open leaves, keeping its real lettuce head shape, with a kawaii face peeking from the center leaves — sleepy layered eyes, gentle smile, rosy cheeks — fresh pale and mid-green, top view |
| `champignon.png` | single plump white button mushroom with smooth cap and visible gills underneath, keeping its real mushroom shape, with a kawaii face on the smooth cap top — big round eyes, happy smile, rosy cheeks — cream ivory, side view |
| `citron.png` | single plump oval yellow lemon with tiny stem nub, keeping its real lemon shape, with a kawaii face on the front — bright zesty eyes, cheerful smile, very rosy cheeks — vivid sunshine-yellow, front view |
| `cornichon.png` | single small plump green gherkin with bumpy textured skin, keeping its real gherkin shape, with a kawaii face on the side — small beady eyes, cheeky grin, rosy cheeks — fresh bright green, side view |
| `avocat.png` | avocado cut in half showing green flesh and large brown pit, keeping its real halved avocado shape, with a kawaii face on the pit — big dot eyes on the pit, huge happy smile, rosy cheeks — creamy green flesh, front view |
| `banane.png` | single plump yellow banana with curved shape and brown tip, keeping its real banana shape, with a kawaii face on the front — sleepy happy eyes, cozy smile, rosy cheeks — vivid warm yellow, side view |
| `poire.png` | single plump pear with soft yellow-green skin and tiny stem, keeping its real pear shape, with a kawaii face on the front — gentle soft eyes, sweet smile, rosy cheeks — soft yellow-green, front view |
| `pomme.png` | single round plump red apple with small green leaf and brown stem, keeping its real apple shape, with a kawaii face on the front — big glossy eyes, wide smile, very rosy cheeks — vivid warm red, front view |
| `kiwi.png` | kiwi cut in half showing bright green flesh with black seeds in a star pattern and white center, keeping its real halved kiwi shape, with a kawaii face formed by the seed arrangement — the seeds become big glossy eyes, the white center a smile, very rosy cheeks — bright green flesh, front view |
| `fruits.png` | woven basket filled with a red apple, yellow banana, orange, and grape cluster, keeping their real fruit shapes each with a tiny kawaii face — big dot eyes, tiny smile, rosy cheeks — warm cozy tones, 3/4 top view |

---

### Famille 11 — Apéro & Snacks

| Fichier | Description détaillée |
|---|---|
| `chips.png` | inflated foil snack bag, keeping its real plump bag shape, with a kawaii face on the bag front — big excited eyes, happy open smile, rosy cheeks — warm golden and soft tones, no brand, side view |
| `cacahuete.png` | handful of peanuts in shell, keeping their real peanut shapes, the central one with a kawaii face on the shell — round eyes, smile, rosy cheeks — warm beige, one split open showing golden nuts inside, top view |
| `pistache.png` | handful of pistachio nuts, keeping their real nut shapes, the central split one with a kawaii face — smiling eyes, happy grin, rosy cheeks — vivid green kernel showing, warm beige shells, top view |
| `noisette.png` | handful of round hazelnuts, keeping their real round nut shapes, the central cracked one with a kawaii face on the shell — cozy happy eyes, smile, rosy cheeks — rich warm brown, golden nut inside, top view |
| `noix-cajou.png` | handful of cashew nuts, keeping their real curved kidney shapes, the largest one with a kawaii face — curved eyes matching the nut curve, smile, rosy cheeks — soft ivory cream, top view |

---

### Famille 12 — Petit-déjeuner & Épicerie sucrée

| Fichier | Description détaillée |
|---|---|
| `cereales.png` | cereal cardboard box with illustrated bowl window, keeping its real box shape, with a kawaii face on the box front — big eyes, happy smile, rosy cheeks — warm golden tones, side view |
| `barre-cereales.png` | granola bar in shiny wrapper, keeping its real rectangular bar shape, with a kawaii face on the wrapper front — big happy eyes, wide smile, rosy cheeks — warm golden-oat tones, side view |
| `chocolat.png` | dark chocolate bar with one square broken off, keeping its real flat bar shape with grid pattern, with a kawaii face on the bar surface — big eyes, happy smile, rosy cheeks — deep cocoa-brown, top view |
| `nutella.png` | round glass hazelnut spread jar with brown body and red lid, keeping its real jar shape, with a kawaii face on the jar body — rich warm eyes, happy smile, very rosy cheeks — warm brown jar, red lid, no brand text, side view |
| `confiture.png` | round glass strawberry jam jar with checkered fabric lid cover, keeping its real jar shape with fabric top, with a kawaii face on the jar body — sweet sparkling eyes, happy smile, rosy cheeks — vivid warm red jam visible, side view |
| `creme-marron.png` | soft chestnut cream tube slightly squeezed, keeping its real soft tube shape, with a kawaii face on the tube body — cozy squinting eyes, content smile, rosy cheeks — warm brown tones, side view |
| `beurre-cacahuete.png` | open glass peanut butter jar showing creamy spread inside, keeping its real open jar shape, with a kawaii face on the jar body — big happy eyes, smile, rosy cheeks — warm golden-cream spread visible, 3/4 top view |
| `miel.png` | hexagonal glass honey jar with honey dipper resting on rim, keeping its real hexagonal jar shape, with a kawaii face on the jar body — warm golden sparkling eyes, sweet smile, very rosy cheeks — radiant amber honey color, side view |
| `bonbons.png` | transparent bag filled with colorful mixed candy sweets, keeping its real bag shape, with a kawaii face on the bag — big excited eyes, huge happy smile, very rosy cheeks — colorful candies visible inside, side view |
| `gateaux.png` | biscuit box with clear window showing round golden cookies, keeping its real box shape, with a kawaii face on the box — big eyes, happy smile, rosy cheeks — warm golden-cream tones, side view |
| `madeleines.png` | package with one plump shell-shaped golden madeleine visible, keeping its real package shape, with a kawaii face on the packaging — big eyes, happy smile, rosy cheeks — warm buttery golden, side view |
| `compote.png` | squeezable apple sauce pouch with twist cap, keeping its real pouch shape, with a kawaii face on the pouch front — big round eyes, happy smile, rosy cheeks — soft green and cream, side view |
| `flan-sachet.png` | flat sachet of flan custard powder, keeping its real flat packet shape, with a kawaii face on the front — wobbly happy eyes, joyful smile, rosy cheeks — warm cream and yellow, front view |
| `creme-anglaise.png` | small yellow and cream UHT custard carton, keeping its real small carton shape, with a kawaii face on the front — warm sunny eyes, happy smile, rosy cheeks — warm yellow color, side view |
| `glace.png` | round ice cream tub with swirl on the lid, keeping its real tub shape, with a kawaii face on the tub body — big happy eyes, wide smile, very rosy cheeks — soft pastel colors, 3/4 view |
| `cafe.png` | round glass jar filled with golden-brown instant coffee granules, keeping its real jar shape, with a kawaii face on the jar body — drowsy half-open eyes, content smile, rosy cheeks — warm rich brown, side view |
| `capuccino.png` | flat sachet of cappuccino powder with cup illustration, keeping its real flat sachet shape, with a kawaii face on the front — frothy happy eyes, smile, rosy cheeks — warm cream and coffee-brown, front view |
| `the.png` | rectangular tea box with a tea bag dangling over the edge, keeping its real box shape with dangling tag, with a kawaii face on the box front — big cozy eyes, smile, rosy cheeks — warm earthy tones, 3/4 view |

---

### Famille 13 — Surgelés

| Fichier | Description détaillée |
|---|---|
| `frites.png` | plastic bag of frozen french fries with fries illustrated on the front, keeping its real bag shape, with a kawaii face on the bag — big eyes, happy smile, rosy cheeks — soft blue frosty tones with golden fries, side view |
| `pizza.png` | flat rectangular frozen pizza box with pizza illustration, keeping its real flat box shape, with a kawaii face on the box front — excited big eyes, wide happy smile, rosy cheeks — warm red and golden tones, 3/4 view |
| `gyoza.png` | two plump crescent-shaped gyoza dumplings with pleated edges, keeping their real gyoza dumpling shape, each with a small kawaii face on the smooth side — big round eyes, happy smile, rosy cheeks — soft cream and golden-brown, 3/4 view |
| `nuggets.png` | three plump golden chicken nuggets in irregular shapes, keeping their real nugget shapes, each with a small kawaii face on the surface — big round eyes, happy smile, rosy cheeks — vivid golden-orange crispy coating, top view |
| `rosti.png` | round flat potato rösti pancake with crispy textured surface, keeping its real flat disc shape, with a kawaii face on the surface — big crispy happy eyes, wide smile, very rosy cheeks — vivid golden-brown, top view |

---

### Famille 14 — Hygiène personnelle

| Fichier | Description détaillée |
|---|---|
| `brosse-dents.png` | toothbrush with plump handle and white bristles, keeping its real toothbrush shape, with a kawaii face on the handle body — big bright eyes, happy smile, rosy cheeks — soft sky-blue and white, diagonal view |
| `dentifrice.png` | pastel blue and white toothpaste tube slightly squeezed with small toothpaste swirl at tip, keeping its real tube shape, with a kawaii face on the tube body — big round eyes, happy smile, rosy cheeks — pastel blue and white, side view |
| `coton-tige.png` | cylindrical cardboard box of cotton swabs with one swab beside it, keeping its real box and swab shapes, with a kawaii face on the box — big eyes, happy smile, rosy cheeks — cream and white, side view |
| `coton.png` | stack of three round soft cotton pads, keeping their real round pad stack shape, with a kawaii face on the top pad — soft cloud-like big eyes, gentle smile, rosy cheeks — clean bright white, 3/4 top view |
| `deodorant.png` | roll-on deodorant bottle with transparent round ball top, keeping its real roll-on shape, with a kawaii face on the bottle body — big eyes, happy smile, rosy cheeks — soft white and light grey, side view |
| `gel-douche.png` | shower gel bottle with flip top cap, keeping its real bottle shape, with a kawaii face on the bottle body — big glossy eyes, cheerful smile, rosy cheeks — soft colorful pastel, side view |
| `gel-coiffant.png` | round compact plastic hair gel tub with flat lid, keeping its real round tub shape, with a kawaii face on the tub body — stylish eyes, cool smile, rosy cheeks — soft translucent blue-green, 3/4 top view |
| `shampoing.png` | shampoo bottle with pump dispenser, keeping its real pump bottle shape, with a kawaii face on the bottle body — big bouncy eyes, happy smile, rosy cheeks — pastel color, side view |
| `spray-demelant.png` | hair detangler spray bottle with small trigger nozzle, keeping its real spray bottle shape, with a kawaii face on the bottle body — big gentle eyes, sweet smile, rosy cheeks — soft pastel, side view |
| `creme-main.png` | hand cream tube slightly squeezed with tiny cream curl at tip, keeping its real squeezable tube shape, with a kawaii face on the tube body — soft gentle eyes, sweet smile, rosy cheeks — soft white and pink, side view |
| `pansement.png` | rectangular cardboard box of adhesive bandages with one bandage beside it, keeping its real box shape, with a kawaii face on the box — brave determined eyes, heroic smile, rosy cheeks — warm beige and cream, side view |
| `savon-liquide.png` | liquid soap pump dispenser bottle with foam bubble at nozzle, keeping its real pump bottle shape, with a kawaii face on the bottle body — big bubbly eyes, happy smile, rosy cheeks — soft pastel, side view |
| `gel-hydroalcoolique.png` | small hand sanitizer bottle with flip cap, keeping its real small bottle shape, with a kawaii face on the bottle body — clean sparkling eyes, fresh smile, rosy cheeks — soft blue and white, side view |
| `dissolvant.png` | small transparent nail polish remover bottle, keeping its real small bottle shape, with a kawaii face on the bottle body — sleepy calm eyes, gentle smile, rosy cheeks — soft white and grey, side view |

---

### Famille 15 — Entretien ménager

| Fichier | Description détaillée |
|---|---|
| `produit-vaisselle.png` | dish soap bottle with flip top cap and soap bubble at nozzle, keeping its real bottle shape, with a kawaii face on the bottle body — sparkly clean eyes, happy smile, rosy cheeks — fresh soft green, side view |
| `liquide-rincage.png` | rinse aid bottle with flip cap, keeping its real bottle shape, with a kawaii face on the bottle body — bright shining eyes, happy smile, rosy cheeks — soft sky-blue, side view |
| `lessive.png` | laundry detergent powder box with colorful geometric design, keeping its real box shape, with a kawaii face on the box front — energetic happy eyes, big smile, rosy cheeks — soft colorful pastel, side view |
| `tablettes-lv.png` | dishwasher tablet package with one plump tablet beside it, keeping the real box and tablet shapes, with a kawaii face on the box and a smaller one on the tablet — big eyes, smile, rosy cheeks — soft blue and white, 3/4 view |
| `tablettes-anti-calcaire.png` | descaler tablet package with one small tablet beside it, keeping the real box and tablet shapes, with a kawaii face on the box and a smaller one on the tablet — determined eyes, smile, rosy cheeks — white and blue, 3/4 view |
| `spray-nettoyant.png` | cleaning spray bottle with trigger handle, keeping its real spray bottle shape, with a kawaii face on the bottle body — efficient determined eyes, confident smile, rosy cheeks — soft sky-blue, side view |
| `nettoyant-javel.png` | bleach bottle with flip cap, keeping its real bottle shape, with a kawaii face on the bottle body — powerful squinting eyes, tough smile, rosy cheeks — soft white and yellow, side view |
| `nettoyant-sol.png` | floor cleaner bottle with flip cap, keeping its real bottle shape, with a kawaii face on the bottle body — cheerful eyes, happy smile, rosy cheeks — soft lavender-purple, side view |
| `produit-vitre.png` | glass cleaner spray bottle with trigger handle, keeping its real spray bottle shape, with a kawaii face on the bottle body — crystal clear sparkling eyes, bright smile, rosy cheeks — soft sky-blue, side view |
| `produit-wc.png` | toilet cleaner bottle with angled bent nozzle, keeping its real distinctive bent-neck bottle shape, with a kawaii face on the bottle body — brave heroic eyes, determined smile, rosy cheeks — soft blue-green, side view |
| `antikal.png` | descaler spray bottle with trigger handle, keeping its real spray bottle shape, with a kawaii face on the bottle body — lime-fighting squinting eyes, fierce grin, rosy cheeks — soft white, side view |
| `destop.png` | tall drain cleaner bottle with rounded shape, keeping its real tall bottle shape, with a kawaii face on the bottle body — powerful battle-ready eyes, strong smile, rosy cheeks — soft blue, side view |
| `eponge.png` | rectangular kitchen sponge with green scrubbing pad on top and yellow foam base, keeping its real sponge shape, with a kawaii face on the green scrubby side — happy two-toned eyes, cheerful smile, rosy cheeks — bright green and soft yellow, 3/4 view |
| `papier-aluminium.png` | aluminum foil roll in cardboard dispenser box with metallic sheet slightly unrolled, keeping its real box+roll shape, with a kawaii face on the box — shiny sparkly eyes, happy smile, rosy cheeks — metallic silver sheet, warm grey tones, 3/4 view |
| `papier-cuisson.png` | baking parchment roll in cardboard box with paper slightly unrolled, keeping its real box+roll shape, with a kawaii face on the box — calm reliable eyes, gentle smile, rosy cheeks — clean white paper, warm cream tones, 3/4 view |
| `papier-film.png` | cling film roll in cardboard dispenser with transparent film slightly unrolled, keeping its real box+roll shape, with a kawaii face on the box — wide eyes, cheerful smile, rosy cheeks — transparent film, soft grey and cream, 3/4 view |
| `pq.png` | single roll of toilet paper, keeping its real round roll shape with cardboard tube visible in the center, with a kawaii face on the roll surface — big round eyes, happy smile, very rosy cheeks — clean bright white with soft texture pattern, side view |
| `sopalin.png` | single roll of kitchen paper towel, keeping its real round roll shape, with a kawaii face on the roll surface — big absorbent eyes, helpful smile, rosy cheeks — clean white with soft pattern, side view |
| `serviette.png` | small stack of folded white paper napkins, keeping its real neat folded stack shape, with a kawaii face on the top napkin — neat tidy eyes, polite smile, rosy cheeks — clean bright white, 3/4 top view |
| `sac-poubelle.png` | roll of black trash bags in cardboard box, keeping its real box+roll shape, with a kawaii face on the box — big eyes, happy smile, rosy cheeks — matte black bags visible, simple look, side view |
| `sac-congelation.png` | transparent zip lock freezer bag lying flat and slightly open with blue zip seal at top, keeping its real flat bag shape, with a kawaii face on the bag surface — wide open eyes, happy smile, rosy cheeks — transparent body, blue seal, top view |
| `sac-aspirateur.png` | grey fabric vacuum cleaner dust bag with cardboard mounting collar, keeping its real plump bag shape (not the vacuum machine), with a kawaii face on the bag — soft fluffy eyes, content smile, rosy cheeks — warm grey fabric, front view |
| `lingettes.png` | flat rectangular wet wipes pack with flip lid, keeping its real flat pack shape, with a kawaii face on the pack surface — big glossy eyes, fresh clean smile, rosy cheeks — soft white and pastel, 3/4 top view |

---

### Famille 16 — Divers

| Fichier | Description détaillée |
|---|---|
| `pile.png` | cylindrical AA battery with positive nub on top, keeping its real battery cylinder shape, with a kawaii face on the battery body — energetic lightning-bolt shaped eyes, big excited smile, rosy cheeks — warm golden body with standard battery markings, 3/4 view |
| `briquet.png` | plastic disposable lighter with visible fuel chamber, keeping its real lighter shape, with a kawaii face on the lighter body — cheerful eyes, happy smile, rosy cheeks — plump rounded body, warm amber fuel visible, small flame at the top, side view |
| `colle.png` | glue tube with red screw cap, keeping its real tube shape, slightly squeezed, with a kawaii face on the tube body — sticky wide eyes, cheerful smile, rosy cheeks — soft white body with red cap, side view |
| `tupperware.png` | rectangular transparent plastic food container with fitting lid, keeping its real container shape, with a kawaii face on the transparent body — big eyes visible through the clear plastic, happy smile, rosy cheeks — clear and warm tones, 3/4 view |
