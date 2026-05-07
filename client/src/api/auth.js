// ============================================
// Auth API calls
// ============================================

import { API_BASE_URL, getAuthHeaders } from './config';

export async function loginUser(email, password) {
  // OAuth2PasswordRequestForm expects form-urlencoded data
  const body = new URLSearchParams();
  body.append('username', email); // FastAPI OAuth2 uses "username" field
  body.append('password', password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al iniciar sesión');
  }

  const data = await res.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
}

export async function registerUser({ user_name, email, password, image = '' }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name, email, password, image }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al registrarse');
  }

  return res.json();
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('No autenticado');
  }

  return res.json();
}

export function logoutUser() {
  localStorage.removeItem('access_token');
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}
