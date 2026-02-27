const AUTH_INTENT_KEY = 'unixange_auth_intent';

export type AuthIntent = 'login' | 'signup';

export function setAuthIntent(intent: AuthIntent): void {
  try {
    sessionStorage.setItem(AUTH_INTENT_KEY, intent);
  } catch {
    // ignore
  }
}

export function getAuthIntent(): AuthIntent | null {
  try {
    const val = sessionStorage.getItem(AUTH_INTENT_KEY);
    if (val === 'login' || val === 'signup') return val;
    return null;
  } catch {
    return null;
  }
}

export function clearAuthIntent(): void {
  try {
    sessionStorage.removeItem(AUTH_INTENT_KEY);
  } catch {
    // ignore
  }
}
