const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const COOKIE_KEY = 'proform_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function normalizeToken(token: string | null | undefined): string | null {
  if (!token) return null;

  let cleaned = String(token).trim();

  // Remove wrapped quotes: "abc", 'abc'
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Remove accidental Bearer prefix if already present
  if (cleaned.toLowerCase().startsWith('bearer ')) {
    cleaned = cleaned.slice(7).trim();
  }

  return cleaned || null;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const encodedName = `${name}=`;
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.slice(encodedName.length));
    }
  }

  return null;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const fromLocalStorage = normalizeToken(localStorage.getItem(TOKEN_KEY));
  if (fromLocalStorage) return fromLocalStorage;
  return normalizeToken(readCookie(COOKIE_KEY));
}

export function hasAuthSession(): boolean {
  return Boolean(getAuthToken());
}

export function setAuthSession(token: string) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeToken(token);
  if (!normalized) return;
  localStorage.setItem(TOKEN_KEY, normalized);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(normalized)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function setAuthUser(user: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): { id: number; [key: string]: unknown } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}
