/**
 * Voice synonym mappings — review & edit before use.
 *
 * Structure:
 *   say  — what the user might say (lowercase, accent-free after norm())
 *   try  — canonical product names to try, in priority order
 *          (first one found in the household's stock wins)
 *
 * Rules:
 *  - `say` values are matched against the normalised voice query
 *  - `try` values are matched against normalised product names (same fuzzy passes as usual)
 *  - Synonyms are only tried when the normal fuzzy search returns nothing
 */

export interface VoiceSynonym {
  say: string
  try: string[]
}

export const VOICE_SYNONYMS: VoiceSynonym[] = [

  // ── Fromages / Produits laitiers ────────────────────────────────────────────

  // Generic "râpé" → prefer whatever grated cheese they stock
  { say: 'fromage rape',      try: ['Emmental râpé', 'Gruyère râpé'] },
  { say: 'rape',              try: ['Emmental râpé', 'Gruyère râpé'] },

  // "gruyère" is used colloquially for both gruyère râpé AND emmental in France
  { say: 'gruyere',           try: ['Gruyère râpé', 'Emmental râpé', 'Emmental'] },
  { say: 'gruyere rape',      try: ['Gruyère râpé', 'Emmental râpé'] },

  // Emmental / emmental râpé confusion
  { say: 'emmental',          try: ['Emmental', 'Emmental râpé'] },
  { say: 'emmental rape',     try: ['Emmental râpé', 'Emmental'] },

  // Shortened dairy names
  { say: 'mozza',             try: ['Mozzarella'] },
  { say: 'parme',             try: ['Parmesan'] },
  { say: 'parmigiano',        try: ['Parmesan'] },
  { say: 'faisselle',         try: ['Fromage blanc'] },
  { say: 'creme epaisse',     try: ['Crème fraîche'] },
  { say: 'creme fleurette',   try: ['Crème liquide'] },
  { say: 'creme entiere',     try: ['Crème liquide'] },
  { say: 'lait entier',       try: ['Lait'] },
  { say: 'lait demi ecreme',  try: ['Lait'] },
  { say: 'lait ecreme',       try: ['Lait'] },

  // ── Viandes & Charcuterie ───────────────────────────────────────────────────

  { say: 'jambon blanc',      try: ['Jambon'] },
  { say: 'jambon cuit',       try: ['Jambon'] },
  { say: 'jambon de paris',   try: ['Jambon'] },
  { say: 'hachis',            try: ['Viande hachée', 'Steak haché'] },
  { say: 'bifteck',           try: ['Steak haché'] },
  { say: 'steaks haches',     try: ['Steak haché'] },
  { say: 'blanc de poulet',   try: ['Poulet'] },
  { say: 'escalope',          try: ['Poulet'] },
  { say: 'escalope de poulet',try: ['Poulet'] },
  { say: 'cuisse de poulet',  try: ['Poulet'] },
  { say: 'lardon',            try: ['Lardons'] },
  { say: 'poitrine fumee',    try: ['Lardons', 'Bacon'] },
  { say: 'filet de saumon',   try: ['Saumon'] },
  { say: 'pave de saumon',    try: ['Saumon'] },
  { say: 'chipolata',         try: ['Chipolatas'] },

  // ── Épicerie / Pâtes & Féculents ────────────────────────────────────────────

  // Generic pasta types → "Pâtes" or "Macaroni"
  { say: 'spaghetti',         try: ['Pâtes'] },
  { say: 'spaghettis',        try: ['Pâtes'] },
  { say: 'tagliatelle',       try: ['Pâtes'] },
  { say: 'tagliatelles',      try: ['Pâtes'] },
  { say: 'penne',             try: ['Pâtes'] },
  { say: 'rigatoni',          try: ['Pâtes'] },
  { say: 'fusilli',           try: ['Pâtes'] },
  { say: 'farfalle',          try: ['Pâtes'] },
  { say: 'coquillettes',      try: ['Macaroni', 'Pâtes'] },
  { say: 'riz basmati',       try: ['Riz'] },
  { say: 'riz long',          try: ['Riz'] },

  // Potatoes
  { say: 'pomme de terre',    try: ['Patates'] },
  { say: 'pommes de terre',   try: ['Patates'] },
  { say: 'pommes de terres',  try: ['Patates'] },

  // Tomato products
  { say: 'tomates concassees',try: ['Purée de tomate', 'Concentré de tomate', 'Sauce tomate'] },
  { say: 'coulis de tomate',  try: ['Purée de tomate', 'Sauce tomate'] },
  { say: 'coulis',            try: ['Purée de tomate', 'Sauce tomate'] },

  // Coffee
  { say: 'nescafe',           try: ['Café soluble'] },
  { say: 'cafe instantane',   try: ['Café soluble'] },
  { say: 'cafe',              try: ['Café soluble', 'Cappuccino'] },

  // Chocolate
  { say: 'chocolat',          try: ['Chocolat noir', 'Chocolat au lait', 'Chocolat blanc'] },

  // ── Fruits & Légumes ────────────────────────────────────────────────────────

  { say: 'salade',            try: ['Salades'] },
  { say: 'salade verte',      try: ['Salades'] },
  { say: 'laitue',            try: ['Salades'] },
  { say: 'frisee',            try: ['Salades'] },
  { say: 'tomate',            try: ['Tomates'] },
  { say: 'oignon',            try: ['Oignons'] },
  { say: 'champignon',        try: ['Champignons'] },
  { say: 'champignon de paris',try: ['Champignons'] },
  { say: 'courgettes',        try: ['Courgette'] },
  { say: 'aubergines',        try: ['Aubergine'] },
  { say: 'poivron',           try: ['Poivrons'] },
  { say: 'carotte',           try: ['Carottes'] },
  { say: 'fraises',           try: ['Fraise'] },
  { say: 'cerises',           try: ['Cerise'] },
  { say: 'bananes',           try: ['Banane'] },
  { say: 'avocats',           try: ['Avocat'] },
  { say: 'kiwis',             try: ['Kiwi'] },
  { say: 'poires',            try: ['Poire'] },

  // ── Hygiène / Entretien ─────────────────────────────────────────────────────

  { say: 'pq',                try: ['Papier toilette'] },
  { say: 'papier wc',         try: ['Papier toilette'] },
  { say: 'papier hygienique', try: ['Papier toilette'] },
  { say: 'essuie tout',       try: ['Sopalin'] },
  { say: 'essuie-tout',       try: ['Sopalin'] },
  { say: 'liquide vaisselle', try: ['Produit vaisselle'] },
  { say: 'liquide a vaisselle',try: ['Produit vaisselle'] },
  { say: 'lessive liquide',   try: ['Lessive'] },

  // ── Boissons ────────────────────────────────────────────────────────────────

  { say: 'coca',              try: ['Coca-Cola'] },
  { say: 'cola',              try: ['Coca-Cola'] },
  { say: 'pepsi',             try: ['Coca-Cola'] },
  { say: 'biere',             try: ['Bières'] },
  { say: 'bieres',            try: ['Bières'] },
  { say: 'vin',               try: ['Vin rouge', 'Vin blanc'] },
  { say: 'jus',               try: ['Jus de fruit'] },
  { say: 'ice tea',           try: ['Ice Tea'] },
  { say: 'the',               try: ['Thé', 'Tisane'] },

  // ── Surgelés ────────────────────────────────────────────────────────────────

  { say: 'frites',            try: ['Frites surgelées'] },
  { say: 'glace',             try: ['Glaces'] },
  { say: 'sorbet',            try: ['Glaces'] },
  { say: 'pizza surgelee',    try: ['Pizza'] },

]
