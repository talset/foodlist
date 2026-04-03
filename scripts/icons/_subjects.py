"""
English subject descriptions for each icon.
Prompt built as: "[subject], [visual detail from icons.md], [style]"

Rules applied:
- Always name the food/product explicitly, never the animal source
- Specify viewpoint (side view, top view, 3/4 view)
- Include dominant color
- Avoid "or" (confuses the model — pick one option)
- Add "no text, no logo, no label text" where brand confusion is likely
- Avoid terms that could generate logos, cartoon characters or live animals
"""

SUBJECTS = {
    # -------------------------------------------------------------------------
    # Bouteilles boissons — same bottle silhouette, different color
    # -------------------------------------------------------------------------
    "bouteille-biere":
        "single amber glass beer bottle with silver metal cap, side view, no label text",
    "bouteille-cidre":
        "single dark green glass cider bottle with cork, side view, no label text",
    "bouteille-cola":
        "single dark brown plastic cola soda bottle with black cap, side view, generic no brand logo",
    "bouteille-fanta":
        "single orange plastic soda bottle with orange cap, side view, generic no brand logo",
    "bouteille-icetea":
        "single golden amber plastic iced tea bottle with brown cap, side view, no logo",
    "bouteille-limonade":
        "single pale yellow plastic lemonade bottle with yellow cap, side view, no logo",
    "bouteille-vin-rouge":
        "single dark bordeaux glass wine bottle with cork, tall slender shape, side view",
    "bouteille-vin-blanc":
        "single pale green glass white wine bottle with cork, tall slender shape, side view",
    "bouteille-rhum":
        "single dark brown glass rum spirits bottle with wide base and short neck, side view",
    "bouteille-sirop":
        "single tall slim red transparent glass syrup bottle with screw cap, side view",
    "bouteille-huile":
        "single tall slim golden glass olive oil bottle with pouring spout, side view",

    # -------------------------------------------------------------------------
    # Sauces — squeeze bottle shape, different color
    # -------------------------------------------------------------------------
    "bouteille-sauce-rouge":
        "single red plastic squeeze condiment bottle with nozzle tip, side view, no label text",
    "bouteille-sauce-jaune":
        "single yellow plastic squeeze condiment bottle with nozzle tip, side view, no label text",
    "bouteille-sauce-brune":
        "single dark brown plastic squeeze condiment bottle with nozzle tip, side view, no label text",
    "bouteille-sauce-verte":
        "single dark green glass pesto sauce jar with metal lid, side view",
    "bouteille-sauce-orange":
        "single orange plastic squeeze condiment bottle with nozzle tip, side view, no label text",

    # -------------------------------------------------------------------------
    # Conserves — cylindrical tin can, different label
    # -------------------------------------------------------------------------
    "conserve-legumes":
        "single cylindrical tin can with green label showing vegetable silhouette, side view, 3/4 angle",
    "conserve-tomate":
        "single cylindrical tin can with red label showing tomato silhouette, side view, 3/4 angle",
    "conserve-poisson":
        "single flat oval tin can with blue label showing fish silhouette, side view",
    "conserve-soupe":
        "single cylindrical tin can with orange label showing soup bowl silhouette, side view",
    "conserve-cassoulet":
        "single tall cylindrical tin can with brown earthy label, side view, 3/4 angle",
    "conserve-plat":
        "single cylindrical tin can with beige neutral label, side view, 3/4 angle",

    # -------------------------------------------------------------------------
    # Fromages
    # -------------------------------------------------------------------------
    "fromage-rond":
        "round flat white cheese wheel with beige rind, 3/4 top view, no animal no logo",
    "fromage-bloc":
        "solid rectangular pale yellow cheese block, 3/4 side view",
    "fromage-rape":
        "small pile of grated shredded yellow cheese on a flat surface, top view",
    "fromage-frais":
        "small white plastic fresh cheese pot with foil lid, side view",
    "fromage-burger":
        "single flat square yellow processed cheese slice, top view",
    "fromage-chevre":
        "cylindrical white goat cheese log roll with grey ash-covered rind, side view, no goat animal",
    "fromage-bleu":
        "irregular wedge of white cheese with visible blue green mold veins, 3/4 view",
    "fromage-moule":
        "smooth white mozzarella cheese ball sitting in clear liquid, side view",
    "fromage-morbier":
        "rectangular cheese slice showing a distinct black horizontal ash line through the center, front view",
    "fromage-munster":
        "round cheese wheel with bright orange washed rind, 3/4 top view",
    "babybel":
        "small round cheese disc coated in bright red wax with pull tab, front view",
    "fromage-raclette":
        "half wheel of pale yellow raclette cheese cut flat side showing, 3/4 view",
    "cheddar":
        "solid rectangular block of deep orange cheddar cheese, 3/4 side view",
    "parmesan":
        "irregular rough-edged pale beige parmesan cheese wedge with grainy texture, 3/4 view",

    # -------------------------------------------------------------------------
    # Charcuterie / Viandes / Poissons
    # -------------------------------------------------------------------------
    "chorizo":
        "three overlapping round slices of red and white marbled chorizo sausage, top view",
    "saucisson":
        "three overlapping round slices of dry salami sausage, pinkish beige, top view",
    "jambon":
        "single folded slice of pink cooked ham, top view, no whole pig no animal",
    "bacon":
        "two raw pink and white striped bacon rashers side by side, top view",
    "lardon":
        "small cubed pink bacon lardons pieces in a white tray, top view",
    "saucisse":
        "single curved pink pork sausage link, side view, no pig no animal",
    "saucisse-chipolata":
        "single thin beige coiled chipolata sausage, side view",
    "saucisse-merguez":
        "single thin dark red-brown spicy merguez sausage, side view",
    "steak-hache":
        "single flat raw minced ground beef patty disc, red meat texture visible, top view, NOT a burger NOT a cow NOT grilled",
    "poulet":
        "single golden roasted chicken drumstick with visible bone, side view, NOT a cartoon chicken NOT a live bird",
    "agneau":
        "single lamb chop cutlet with bone and pink meat, side view, NOT a sheep NOT a lamb animal",
    "porc":
        "single raw pork loin chop slice with fat rim, side view, NOT a pig NOT an animal",
    "pate":
        "small oval metal tin of pork pate terrine with pull tab lid, side view",
    "rillettes":
        "small glass jar with pink salmon rillettes paste inside, open lid, side view",
    "cordon-bleu":
        "single flat breaded golden escalope stuffed chicken cutlet, oval shape, side view, NOT a cooking school logo NOT a ribbon",
    "saumon":
        "single pink salmon fish fillet with visible skin on one side, 3/4 top view, NOT a whole fish NOT a cartoon",
    "moules":
        "single open black mussel shell with orange flesh inside, side view",
    "poisson-pane":
        "single rectangular golden breaded fish fillet stick, 3/4 view",

    # -------------------------------------------------------------------------
    # Épicerie sèche
    # -------------------------------------------------------------------------
    "pates":
        "pasta cardboard package with transparent window showing penne pasta inside, side view",
    "macaroni":
        "pasta cardboard package with transparent window showing macaroni elbow pasta, side view",
    "nouilles":
        "compressed square block of dried asian noodles in plastic packaging, 3/4 view",
    "lasagnes":
        "flat lasagna pasta sheets cardboard package, side view",
    "ravioli":
        "ravioli filled pasta package with transparent window showing square pasta, side view",
    "riz":
        "transparent plastic rice bag with visible white rice grains inside, side view",
    "semoule":
        "small paper bag of couscous semolina with yellow grains visible, side view",
    "lentilles":
        "transparent plastic bag of small green lentils, side view",
    "farine":
        "white paper flour bag with simple wheat ear illustration, no brand text, side view",
    "sucre":
        "white paper sugar bag with simple granulated sugar texture visible, side view",
    "sucre-morceau":
        "open cardboard box of white cube sugar lumps with one cube beside it, 3/4 view",
    "chapelure":
        "cardboard package of golden breadcrumbs with crumbs visible through window, side view",
    "puree-instant":
        "single serving sachet of instant potato flakes, white with simple potato illustration, side view",
    "potee-mais-popcorn":
        "microwave popcorn paper bag with popped popcorn pieces visible on front, 3/4 view",

    # -------------------------------------------------------------------------
    # Boulangerie
    # -------------------------------------------------------------------------
    "pain":
        "single golden brown baguette bread loaf with diagonal score cuts on top, diagonal angle view",
    "pain-mie":
        "sliced white sandwich bread loaf in transparent plastic bag, side view",
    "pain-burger":
        "single round soft burger bun with sesame seeds on top, slight 3/4 view",
    "pain-lait":
        "single oval golden soft brioche milk bread roll with shiny glaze, 3/4 view",
    "brioche":
        "braided golden brioche bread loaf with dark glaze, 3/4 top view",
    "galette-kebab":
        "single round thin flat pita flatbread, slight top view",
    "pate-pizza":
        "single smooth round ball of raw pizza dough with flour dusting, 3/4 top view",
    "pate-feuilletee":
        "rolled out rectangular puff pastry sheet with visible layered edges, 3/4 view",

    # -------------------------------------------------------------------------
    # Produits laitiers
    # -------------------------------------------------------------------------
    "lait":
        "single white milk carton Tetra Pak with colored stripe at top, side view",
    "lait-coco":
        "single white cylindrical tin can with coconut illustration on label, side view",
    "beurre":
        "single rectangular butter block wrapped in gold and silver foil paper, side view",
    "creme-fraiche":
        "single white plastic pot of sour cream with foil sealed lid, side view",
    "creme-liquide":
        "single small cream colored UHT carton brick with pour spout, side view",
    "oeuf":
        "cardboard egg box half open showing six white eggs inside, 3/4 top view",
    "yaourt":
        "single white plastic yogurt pot with aluminum foil lid, side view",
    "yop":
        "single small plastic drinkable yogurt bottle with screw cap, side view",
    "fromage-blanc":
        "single large white plastic tub of fromage blanc with blue and white label, side view",
    "chantilly":
        "single white aerosol whipped cream spray can with red cap, side view",

    # -------------------------------------------------------------------------
    # Épices & condiments
    # -------------------------------------------------------------------------
    "epice":
        "single small glass spice jar with orange yellow powder inside and red screw lid, side view",
    "herbe":
        "small bunch of fresh green basil herb leaves tied with string, front view, no animal no cartoon",
    "poivre":
        "single wooden pepper mill grinder with black peppercorns base, side view",
    "sel":
        "rectangular blue cardboard salt box with simple design, side view",
    "ail":
        "single whole garlic head bulb with papery white skin and root base, front view",
    "oignon":
        "single whole brown onion with dry papery skin and root, front view",
    "bouillon":
        "single small golden stock bouillon cube unwrapped from yellow foil, front view",
    "moutarde":
        "single yellow ceramic mustard jar with mustard yellow lid, side view",

    # -------------------------------------------------------------------------
    # Légumes & Fruits frais
    # -------------------------------------------------------------------------
    "tomate":
        "single whole round bright red tomato with green calyx stem on top, front view",
    "carotte":
        "single whole orange carrot with green leafy tops, diagonal side view",
    "pomme-de-terre":
        "single whole raw beige potato with rough skin and eyes, side view",
    "aubergine":
        "single whole deep purple eggplant aubergine with green calyx, side view",
    "courgette":
        "single whole green zucchini courgette, side view",
    "brocoli":
        "single green broccoli floret head with short stem, front view",
    "poivron":
        "single whole shiny red bell pepper with green stem, front view",
    "salade":
        "single whole green lettuce head with open leaves, slight top view",
    "champignon":
        "single whole white button mushroom with visible gills under cap, side view",
    "citron":
        "single whole yellow lemon with slightly textured skin, front view",
    "cornichon":
        "single small bumpy green gherkin cornichon, side view",
    "avocat":
        "single avocado cut in half showing yellow green flesh and large brown pit, front view",
    "banane":
        "single yellow curved banana with brown tip, side view",
    "poire":
        "single whole yellow green pear with brown stem, front view",
    "pomme":
        "single whole shiny red apple with green leaf and brown stem, front view",
    "kiwi":
        "single kiwi fruit cut in half cross section showing bright green flesh with black seeds and white center, front view",
    "fruits":
        "woven basket containing apple banana orange and grapes, 3/4 top view",

    # -------------------------------------------------------------------------
    # Apéro & snacks
    # -------------------------------------------------------------------------
    "chips":
        "inflated foil snack chips bag, side view, no brand logo no text",
    "cacahuete":
        "handful of peanuts in shell with one split open showing nuts inside, top view",
    "pistache":
        "handful of pistachio nuts half open showing green kernel inside, top view",
    "noisette":
        "handful of round brown hazelnuts with one cracked open, top view",
    "noix-cajou":
        "handful of ivory colored cashew nuts curved kidney shape, top view",

    # -------------------------------------------------------------------------
    # Petit-déjeuner & épicerie sucrée
    # -------------------------------------------------------------------------
    "cereales":
        "cereal cardboard box with a bowl of corn flakes illustrated on front, side view",
    "barre-cereales":
        "single granola cereal bar in shiny wrapper, side view",
    "chocolat":
        "dark chocolate bar with one square broken off, top view showing grid pattern",
    "nutella":
        "round glass jar of brown hazelnut chocolate spread with white label and red lid, side view, no brand text",
    "confiture":
        "glass jar of red strawberry jam with checkered red fabric lid cover, side view",
    "creme-marron":
        "tube of brown chestnut cream paste with chestnut illustration, side view",
    "beurre-cacahuete":
        "open glass jar of smooth peanut butter showing beige creamy spread, 3/4 top view",
    "miel":
        "hexagonal glass honey jar filled with golden honey, bear-shaped optional, side view",
    "bonbons":
        "transparent bag filled with colorful mixed candy sweets, side view",
    "gateaux":
        "cardboard biscuit cookie package with clear window showing round golden cookies, side view",
    "madeleines":
        "cardboard package of madeleines with one shell-shaped madeleine cake visible, side view",
    "compote":
        "single squeezable apple sauce pouch with twist cap, side view",
    "flan-sachet":
        "small flat sachet of flan custard powder preparation with simple dessert illustration, front view",
    "creme-anglaise":
        "small yellow and white UHT carton of custard sauce, side view",
    "glace":
        "round ice cream tub container with lid showing a swirl of ice cream, 3/4 view",
    "cafe":
        "glass jar of instant coffee granules with golden screw lid, side view",
    "capuccino":
        "small single serving flat sachet of cappuccino powder with coffee cup illustration, front view",
    "the":
        "rectangular tea box with one tea bag hanging over the edge, 3/4 view",

    # -------------------------------------------------------------------------
    # Surgelés
    # -------------------------------------------------------------------------
    "frites":
        "plastic frozen french fries bag with golden fries illustrated on front, side view",
    "pizza":
        "flat rectangular frozen pizza cardboard box with pizza photo on front, 3/4 top view",
    "gyoza":
        "two crescent shaped gyoza dumplings with pleated edges, 3/4 view",
    "nuggets":
        "three golden breaded chicken nuggets irregular shapes, top view",
    "rosti":
        "single round flat golden crispy potato rosti pancake, top view",

    # -------------------------------------------------------------------------
    # Hygiène personnelle
    # -------------------------------------------------------------------------
    "brosse-dents":
        "single toothbrush with blue and white handle and white bristles, diagonal side view",
    "dentifrice":
        "single toothpaste tube with cap, blue and white, side view",
    "coton-tige":
        "cylindrical cardboard box of cotton swabs with one cotton swab beside it, side view",
    "coton":
        "stack of three round white cotton pads, slight 3/4 top view",
    "deodorant":
        "single roll-on deodorant bottle with transparent ball, side view",
    "gel-douche":
        "single shower gel plastic bottle with colored flip top cap, side view",
    "shampoing":
        "single shampoo plastic bottle with pump dispenser, side view",
    "spray-demelant":
        "single hair detangler spray bottle with trigger nozzle, side view",
    "creme-main":
        "single hand cream tube squeezed slightly with cream coming out of tip, side view",
    "pansement":
        "rectangular cardboard box of adhesive bandages with one bandage beside it, 3/4 view",
    "savon-liquide":
        "single pump dispenser bottle of liquid soap with foam at nozzle, side view",
    "gel-hydroalcoolique":
        "single small hand sanitizer gel plastic bottle with flip cap, side view",
    "dissolvant":
        "single small transparent bottle of nail polish remover acetone with simple label, side view, NOT nail polish NOT colorful",

    # -------------------------------------------------------------------------
    # Entretien ménager
    # -------------------------------------------------------------------------
    "produit-vaisselle":
        "single green dish washing liquid soap plastic bottle with flip cap, side view",
    "lessive":
        "single laundry detergent powder cardboard box with colorful geometric design, side view",
    "tablettes-lv":
        "flat cardboard package of dishwasher tablets with one tablet sitting beside it, 3/4 view",
    "spray-nettoyant":
        "single blue multi-surface cleaning spray bottle with trigger handle, side view",
    "antikal":
        "single white descaler spray bottle with trigger handle, side view",
    "destop":
        "single tall blue drain cleaning liquid bottle with warning diamond shape, side view",
    "eponge":
        "single rectangular kitchen sponge with green scrubbing pad on top and yellow foam base, 3/4 view",
    "papier-aluminium":
        "aluminum foil roll in cardboard dispenser box with metallic silver sheet unfolded at corner, 3/4 view",
    "papier-cuisson":
        "baking parchment paper roll in cardboard box with white paper unrolled slightly, 3/4 view",
    "papier-film":
        "transparent cling film roll in cardboard dispenser box with plastic film unrolled slightly, 3/4 view",
    "pq":
        "single roll of toilet paper, clean white, side view",
    "sopalin":
        "single roll of paper kitchen towel on holder, white with simple pattern, side view",
    "serviette":
        "small stack of folded white paper dinner napkins, 3/4 top view",
    "sac-poubelle":
        "roll of black plastic trash garbage bags in cardboard box, side view",
    "sac-congelation":
        "single transparent zip lock freezer bag lying flat, slightly open, top view",
    "sac-aspirateur":
        "single grey fabric vacuum cleaner dust collection bag with cardboard mounting collar, front view, NOT a vacuum cleaner machine",
    "lingettes":
        "flat rectangular wet wipes plastic pack with flip open lid, 3/4 top view",
    "sel-lv":
        "cardboard box of dishwasher salt with blue and white design, side view",

    # -------------------------------------------------------------------------
    # Divers
    # -------------------------------------------------------------------------
    "pile":
        "single cylindrical AA battery with positive nub terminal on top, slight 3/4 side view",
    "briquet":
        "single plastic disposable lighter with visible fuel chamber, side view",
    "colle":
        "single glue tube with red screw cap, side view",
    "tupperware":
        "single rectangular transparent plastic food storage container with tight fitting lid, 3/4 view",
}
