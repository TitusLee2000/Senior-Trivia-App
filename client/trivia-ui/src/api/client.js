const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5251';

const TOKEN_KEY = 'trivia_token';
const EMAIL_KEY = 'trivia_email';
const ROLES_KEY = 'trivia_roles';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token, email, roles) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles || []));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLES_KEY);
}

export function getStoredRoles() {
  try {
    return JSON.parse(localStorage.getItem(ROLES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY) || '';
}

function parseErrorMessage(text, statusText) {
  if (!text) return statusText;
  try {
    const data = JSON.parse(text);
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join(' ');
    if (data?.title) return String(data.title);
    if (data?.message) return String(data.message);
    return statusText;
  } catch {
    return text || statusText;
  }
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: object, auth?: boolean }} options
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true } = options;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getStoredToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseErrorMessage(text, res.statusText));
  }

  if (!text) return null;
  return JSON.parse(text);
}
