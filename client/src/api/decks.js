// ============================================
// Decks API calls
// ============================================

import { API_BASE_URL, getAuthHeaders } from './config';

export async function fetchDecks() {
  const res = await fetch(`${API_BASE_URL}/decks`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar mazos');
  return res.json();
}

export async function fetchPublicDecks({ bracket = '', search = '', colors = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (bracket) params.append('bracket', bracket);
  if (search) params.append('search', search);
  if (colors) params.append('colors', colors);
  params.append('page', page);
  params.append('limit', limit);

  const res = await fetch(`${API_BASE_URL}/decks/public?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar mazos públicos');
  return res.json();
}

export async function fetchDeck(deckId) {
  const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Mazo no encontrado');
  return res.json();
}

export async function createDeck({ deck_name, type = 'commander', bracket = '', partner = 0, cards = [], is_public = false }) {
  const res = await fetch(`${API_BASE_URL}/decks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ deck_name, type, bracket, partner, cards, is_public }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al crear mazo');
  }
  return res.json();
}

export async function copyDeck(deckId, isPublic = false) {
  const res = await fetch(`${API_BASE_URL}/decks/${deckId}/copy`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_public: isPublic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al copiar mazo');
  }
  return res.json();
}

export async function toggleDeckVisibility(deckId, isPublic) {
  const res = await fetch(`${API_BASE_URL}/decks/${deckId}/visibility`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_public: isPublic }),
  });
  if (!res.ok) throw new Error('Error al cambiar visibilidad del mazo');
  return res.json();
}

export async function updateDeck(deckId, updates) {
  const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Error al actualizar mazo');
  return res.json();
}

export async function deleteDeck(deckId) {
  const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar mazo');
  return res.json();
}

export async function removeCardFromDeck(deckId, cardName, quantity) {
  const params = new URLSearchParams({ deck_id: deckId, card_name: cardName, quantity });
  const res = await fetch(`${API_BASE_URL}/decks/remove-card?${params}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al quitar carta');
  return res.json();
}
