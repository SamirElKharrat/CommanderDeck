// ============================================
// Chat API calls
// ============================================

import { API_BASE_URL, getAuthHeaders } from './config';

export async function sendChatMessage(prompt, deckId = null) {
  // Inject deck context directly into the prompt as requested
  const finalPrompt = deckId ? `[Contexto Deck ID: ${deckId}] ${prompt}` : prompt;

  const body = {
    prompt: finalPrompt,
    deck_id: deckId
  };

  const res = await fetch(`${API_BASE_URL}/chat/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error en el chat');
  }

  return res.json(); // { response: string, thread_id: string }
}
