export async function transformDeck(deck) {
  const cards = typeof deck.cards === 'string' ? JSON.parse(deck.cards) : deck.cards;
  const commanderName = (deck.deck_name || "").trim();

  let colors = ['W'];
  try {
    const scryRes = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}`);
    if (scryRes.ok) {
      const scryData = await scryRes.json();
      colors = scryData.color_identity || ['C'];
    }
  } catch (e) {
    console.error("Error fetching commander colors", e);
  }

  return {
    id: deck.id,
    name: deck.deck_name,
    commander: commanderName,
    commanderImage: `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}&format=image&version=art_crop`,
    bracket: deck.bracket || '2',
    type: deck.type,
    partner: deck.partner,
    is_public: deck.is_public === 1,
    owner_username: deck.owner_username,
    cardCount: cards.reduce((sum, c) => sum + (parseInt(c.quantity) || 1), 0),
    cards: cards.map((c, idx) => ({
      id: `card-${deck.id}-${idx}`,
      name: c.name,
      quantity: parseInt(c.quantity) || 1,
      type: c.type || '',
      details: c.details || '',
      manaCost: c.mana_cost || '',
      image: c.version || `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(c.name)}&format=image&version=normal`,
      version: c.version || '',
    })),
    colors: colors,
    created_at: deck.created_at,
    original_deck_id: deck.original_deck_id
  };
}
