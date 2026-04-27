// Imágenes de comandantes de Scryfall (dominio público)
const SCRYFALL_IMG = (name) =>
  `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&format=image&version=art_crop`;

export const MOCK_DECKS = [
  {
    id: '1',
    name: 'Atraxa Proliferate',
    commander: 'Atraxa, Praetors\' Voice',
    commanderImage: SCRYFALL_IMG('Atraxa, Praetors\' Voice'),
    budget: 'carete',
    colors: ['W', 'U', 'B', 'G'],
    cardCount: 100,
    cards: [
      { id: 'c1', name: 'Doubling Season', type: 'Enchantment', manaCost: '{4}{G}', cmc: 5, image: SCRYFALL_IMG('Doubling Season') },
      { id: 'c2', name: 'Deepglow Skate', type: 'Creature', manaCost: '{4}{U}', cmc: 5, image: SCRYFALL_IMG('Deepglow Skate') },
      { id: 'c3', name: 'Teferi\'s Protection', type: 'Instant', manaCost: '{2}{W}', cmc: 3, image: SCRYFALL_IMG('Teferi\'s Protection') },
      { id: 'c4', name: 'Cyclonic Rift', type: 'Instant', manaCost: '{1}{U}', cmc: 2, image: SCRYFALL_IMG('Cyclonic Rift') },
      { id: 'c5', name: 'Demonic Tutor', type: 'Sorcery', manaCost: '{1}{B}', cmc: 2, image: SCRYFALL_IMG('Demonic Tutor') },
      { id: 'c6', name: 'Sol Ring', type: 'Artifact', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Sol Ring') },
      { id: 'c7', name: 'Astral Cornucopia', type: 'Artifact', manaCost: '{X}{X}{X}', cmc: 0, image: SCRYFALL_IMG('Astral Cornucopia') },
      { id: 'c8', name: 'Hardened Scales', type: 'Enchantment', manaCost: '{G}', cmc: 1, image: SCRYFALL_IMG('Hardened Scales') },
      { id: 'c9', name: 'Winding Constrictor', type: 'Creature', manaCost: '{B}{G}', cmc: 2, image: SCRYFALL_IMG('Winding Constrictor') },
      { id: 'c10', name: 'Inexorable Tide', type: 'Enchantment', manaCost: '{3}{U}{U}', cmc: 5, image: SCRYFALL_IMG('Inexorable Tide') },
      { id: 'c11', name: 'Sword of Truth and Justice', type: 'Artifact — Equipment', manaCost: '{3}', cmc: 3, image: SCRYFALL_IMG('Sword of Truth and Justice') },
      { id: 'c12', name: 'Command Tower', type: 'Land', manaCost: '', cmc: 0, image: SCRYFALL_IMG('Command Tower') },
    ],
  },
  {
    id: '2',
    name: 'Krenko Goblins',
    commander: 'Krenko, Mob Boss',
    commanderImage: SCRYFALL_IMG('Krenko, Mob Boss'),
    budget: 'normal',
    colors: ['R'],
    cardCount: 100,
    cards: [
      { id: 'c13', name: 'Goblin Chieftain', type: 'Creature', manaCost: '{1}{R}{R}', cmc: 3, image: SCRYFALL_IMG('Goblin Chieftain') },
      { id: 'c14', name: 'Goblin Warchief', type: 'Creature', manaCost: '{1}{R}{R}', cmc: 3, image: SCRYFALL_IMG('Goblin Warchief') },
      { id: 'c15', name: 'Skirk Prospector', type: 'Creature', manaCost: '{R}', cmc: 1, image: SCRYFALL_IMG('Skirk Prospector') },
      { id: 'c16', name: 'Purphoros, God of the Forge', type: 'Legendary Enchantment Creature', manaCost: '{3}{R}', cmc: 4, image: SCRYFALL_IMG('Purphoros, God of the Forge') },
      { id: 'c17', name: 'Impact Tremors', type: 'Enchantment', manaCost: '{1}{R}', cmc: 2, image: SCRYFALL_IMG('Impact Tremors') },
      { id: 'c18', name: 'Goblin Recruiter', type: 'Creature', manaCost: '{1}{R}', cmc: 2, image: SCRYFALL_IMG('Goblin Recruiter') },
      { id: 'c19', name: 'Mana Echoes', type: 'Enchantment', manaCost: '{2}{R}{R}', cmc: 4, image: SCRYFALL_IMG('Mana Echoes') },
      { id: 'c20', name: 'Sol Ring', type: 'Artifact', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Sol Ring') },
      { id: 'c21', name: 'Lightning Greaves', type: 'Artifact — Equipment', manaCost: '{2}', cmc: 2, image: SCRYFALL_IMG('Lightning Greaves') },
      { id: 'c22', name: 'Throne of the God-Pharaoh', type: 'Legendary Artifact', manaCost: '{2}', cmc: 2, image: SCRYFALL_IMG('Throne of the God-Pharaoh') },
    ],
  },
  {
    id: '3',
    name: 'Meren Graveyard',
    commander: 'Meren of Clan Nel Toth',
    commanderImage: SCRYFALL_IMG('Meren of Clan Nel Toth'),
    budget: 'normal',
    colors: ['B', 'G'],
    cardCount: 100,
    cards: [
      { id: 'c23', name: 'Sakura-Tribe Elder', type: 'Creature', manaCost: '{1}{G}', cmc: 2, image: SCRYFALL_IMG('Sakura-Tribe Elder') },
      { id: 'c24', name: 'Spore Frog', type: 'Creature', manaCost: '{G}', cmc: 1, image: SCRYFALL_IMG('Spore Frog') },
      { id: 'c25', name: 'Eternal Witness', type: 'Creature', manaCost: '{1}{G}{G}', cmc: 3, image: SCRYFALL_IMG('Eternal Witness') },
      { id: 'c26', name: 'Gray Merchant of Asphodel', type: 'Creature', manaCost: '{3}{B}{B}', cmc: 5, image: SCRYFALL_IMG('Gray Merchant of Asphodel') },
      { id: 'c27', name: 'Buried Alive', type: 'Sorcery', manaCost: '{2}{B}', cmc: 3, image: SCRYFALL_IMG('Buried Alive') },
      { id: 'c28', name: 'Fleshbag Marauder', type: 'Creature', manaCost: '{2}{B}', cmc: 3, image: SCRYFALL_IMG('Fleshbag Marauder') },
      { id: 'c29', name: 'Sol Ring', type: 'Artifact', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Sol Ring') },
      { id: 'c30', name: 'Skullclamp', type: 'Artifact — Equipment', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Skullclamp') },
      { id: 'c31', name: 'Living Death', type: 'Sorcery', manaCost: '{3}{B}{B}', cmc: 5, image: SCRYFALL_IMG('Living Death') },
      { id: 'c32', name: 'Command Tower', type: 'Land', manaCost: '', cmc: 0, image: SCRYFALL_IMG('Command Tower') },
    ],
  },
  {
    id: '4',
    name: 'Ur-Dragon Tribal',
    commander: 'The Ur-Dragon',
    commanderImage: SCRYFALL_IMG('The Ur-Dragon'),
    budget: 'carete',
    colors: ['W', 'U', 'B', 'R', 'G'],
    cardCount: 100,
    cards: [
      { id: 'c33', name: 'Scion of the Ur-Dragon', type: 'Legendary Creature', manaCost: '{W}{U}{B}{R}{G}', cmc: 5, image: SCRYFALL_IMG('Scion of the Ur-Dragon') },
      { id: 'c34', name: 'Drakuseth, Maw of Flames', type: 'Legendary Creature', manaCost: '{4}{R}{R}{R}', cmc: 7, image: SCRYFALL_IMG('Drakuseth, Maw of Flames') },
      { id: 'c35', name: 'Utvara Hellkite', type: 'Creature', manaCost: '{6}{R}{R}', cmc: 8, image: SCRYFALL_IMG('Utvara Hellkite') },
      { id: 'c36', name: 'Dragon Tempest', type: 'Enchantment', manaCost: '{1}{R}', cmc: 2, image: SCRYFALL_IMG('Dragon Tempest') },
      { id: 'c37', name: 'Temur Ascendancy', type: 'Enchantment', manaCost: '{G}{U}{R}', cmc: 3, image: SCRYFALL_IMG('Temur Ascendancy') },
      { id: 'c38', name: 'Sol Ring', type: 'Artifact', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Sol Ring') },
      { id: 'c39', name: 'Arcane Signet', type: 'Artifact', manaCost: '{2}', cmc: 2, image: SCRYFALL_IMG('Arcane Signet') },
      { id: 'c40', name: 'Frontier Siege', type: 'Enchantment', manaCost: '{3}{G}', cmc: 4, image: SCRYFALL_IMG('Frontier Siege') },
      { id: 'c41', name: 'Crux of Fate', type: 'Sorcery', manaCost: '{3}{B}{B}', cmc: 5, image: SCRYFALL_IMG('Crux of Fate') },
      { id: 'c42', name: 'Command Tower', type: 'Land', manaCost: '', cmc: 0, image: SCRYFALL_IMG('Command Tower') },
    ],
  },
  {
    id: '5',
    name: 'Teysa Aristocrats',
    commander: 'Teysa Karlov',
    commanderImage: SCRYFALL_IMG('Teysa Karlov'),
    budget: 'normal',
    colors: ['W', 'B'],
    cardCount: 100,
    cards: [
      { id: 'c43', name: 'Cruel Celebrant', type: 'Creature', manaCost: '{W}{B}', cmc: 2, image: SCRYFALL_IMG('Cruel Celebrant') },
      { id: 'c44', name: 'Zulaport Cutthroat', type: 'Creature', manaCost: '{1}{B}', cmc: 2, image: SCRYFALL_IMG('Zulaport Cutthroat') },
      { id: 'c45', name: 'Pitiless Plunderer', type: 'Creature', manaCost: '{3}{B}', cmc: 4, image: SCRYFALL_IMG('Pitiless Plunderer') },
      { id: 'c46', name: 'Smothering Tithe', type: 'Enchantment', manaCost: '{3}{W}', cmc: 4, image: SCRYFALL_IMG('Smothering Tithe') },
      { id: 'c47', name: 'Viscera Seer', type: 'Creature', manaCost: '{B}', cmc: 1, image: SCRYFALL_IMG('Viscera Seer') },
      { id: 'c48', name: 'Reassembling Skeleton', type: 'Creature', manaCost: '{1}{B}', cmc: 2, image: SCRYFALL_IMG('Reassembling Skeleton') },
      { id: 'c49', name: 'Sol Ring', type: 'Artifact', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Sol Ring') },
      { id: 'c50', name: 'Skullclamp', type: 'Artifact — Equipment', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Skullclamp') },
      { id: 'c51', name: 'Dictate of Erebos', type: 'Enchantment', manaCost: '{3}{B}{B}', cmc: 5, image: SCRYFALL_IMG('Dictate of Erebos') },
      { id: 'c52', name: 'Command Tower', type: 'Land', manaCost: '', cmc: 0, image: SCRYFALL_IMG('Command Tower') },
    ],
  },
  {
    id: '6',
    name: 'Niv-Mizzet Combo',
    commander: 'Niv-Mizzet, Parun',
    commanderImage: SCRYFALL_IMG('Niv-Mizzet, Parun'),
    budget: 'carete',
    colors: ['U', 'R'],
    cardCount: 100,
    cards: [
      { id: 'c53', name: 'Curiosity', type: 'Enchantment', manaCost: '{U}', cmc: 1, image: SCRYFALL_IMG('Curiosity') },
      { id: 'c54', name: 'Ophidian Eye', type: 'Enchantment', manaCost: '{2}{U}', cmc: 3, image: SCRYFALL_IMG('Ophidian Eye') },
      { id: 'c55', name: 'Tandem Lookout', type: 'Creature', manaCost: '{2}{U}', cmc: 3, image: SCRYFALL_IMG('Tandem Lookout') },
      { id: 'c56', name: 'Rhystic Study', type: 'Enchantment', manaCost: '{2}{U}', cmc: 3, image: SCRYFALL_IMG('Rhystic Study') },
      { id: 'c57', name: 'Counterspell', type: 'Instant', manaCost: '{U}{U}', cmc: 2, image: SCRYFALL_IMG('Counterspell') },
      { id: 'c58', name: 'Wheel of Fortune', type: 'Sorcery', manaCost: '{2}{R}', cmc: 3, image: SCRYFALL_IMG('Wheel of Fortune') },
      { id: 'c59', name: 'Sol Ring', type: 'Artifact', manaCost: '{1}', cmc: 1, image: SCRYFALL_IMG('Sol Ring') },
      { id: 'c60', name: 'Arcane Signet', type: 'Artifact', manaCost: '{2}', cmc: 2, image: SCRYFALL_IMG('Arcane Signet') },
      { id: 'c61', name: 'Mystic Remora', type: 'Enchantment', manaCost: '{U}', cmc: 1, image: SCRYFALL_IMG('Mystic Remora') },
      { id: 'c62', name: 'Command Tower', type: 'Land', manaCost: '', cmc: 0, image: SCRYFALL_IMG('Command Tower') },
    ],
  },
];

export const COLOR_MAP = {
  W: { label: 'Blanco', image: 'https://svgs.scryfall.io/card-symbols/W.svg' },
  U: { label: 'Azul', image: 'https://svgs.scryfall.io/card-symbols/U.svg' },
  B: { label: 'Negro', image: 'https://svgs.scryfall.io/card-symbols/B.svg' },
  R: { label: 'Rojo', image: 'https://svgs.scryfall.io/card-symbols/R.svg' },
  G: { label: 'Verde', image: 'https://svgs.scryfall.io/card-symbols/G.svg' },
};

export const BUDGET_INFO = {
  normal: { label: 'Normal', description: 'Presupuesto estándar para jugar entre amigos' },
  carete: { label: 'Carete', description: 'Mazo de alto presupuesto con cartas premium' },
};

export const ASSISTANT_RESPONSES = [
  '¡Buena elección! Ese comandante tiene mucho potencial en el formato actual.',
  'Te recomiendo revisar la curva de maná de tu mazo. Una buena distribución es clave para partidas fluidas.',
  'Para ese bracket, considera añadir más interacción. Cartas como Swords to Plowshares o Counterspell son muy eficientes.',
  'La base de tierras es fundamental. Asegúrate de tener suficiente fixing de colores para tu identidad de color.',
  'Si buscas mejorar la consistencia del mazo, las tutoras son clave. Demonic Tutor y Enlightened Tutor son opciones populares.',
  'El ramp en las primeras rondas marca la diferencia. Sol Ring, Arcane Signet y Mana Crypt son esenciales.',
  '¿Has considerado añadir más protección para tu comandante? Lightning Greaves y Swiftfoot Boots son muy útiles.',
  'Para mazos de criaturas, no olvides incluir card draw. Rhystic Study y Sylvan Library son excelentes opciones.',
];

export const COMMANDER_RECOMMENDATIONS = `¡Por supuesto! Aquí tienes 10 de los comandantes más populares y divertidos:
1. **Atraxa, Praetors' Voice**: Reina de los contadores y Superfriends.
2. **Edgar Markov**: El mejor tribal de vampiros, muy agresivo.
3. **The Ur-Dragon**: Para los amantes de los dragones grandes.
4. **Yuriko, the Tiger's Shadow**: Ninjas, sigilo y mucho daño directo.
5. **Krenko, Mob Boss**: Goblins infinitos y muy rápido.
6. **Meren of Clan Nel Toth**: Magia de cementerio y sacrificio.
7. **Lathril, Blade of the Elves**: Tokens de elfos y combo.
8. **Niv-Mizzet, Parun**: Robo masivo de cartas y daño directo.
9. **Korvold, Fae-Cursed King**: Sacrificio agresivo y robo de cartas.
10. **Kenrith, the Returned King**: 5 colores, versatilidad total y política.`;

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-0',
    role: 'assistant',
    content: '¡Hola! Soy tu asistente de Commander. Pregúntame cualquier cosa sobre tus mazos, estrategias, cartas o el formato en general. 🧙‍♂️',
    timestamp: new Date().toISOString(),
  },
];
