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

export async function fetchDeck(deckId) {
  const res = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Mazo no encontrado');
  return res.json();
}

export async function createDeck({ deck_name, type = 'commander', bracket = '', partner = 0, cards = [] }) {
  const res = await fetch(`${API_BASE_URL}/decks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ deck_name, type, bracket, partner, cards }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al crear mazo');
  }
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
