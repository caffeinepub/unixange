/**
 * Auth intent utility to persist user's choice between Login and Sign up
 * across the Internet Identity redirect flow
 */

type AuthIntent = 'login' | 'signup';

const AUTH_INTENT_KEY = 'unixange_auth_intent';

export function setAuthIntent(intent: AuthIntent): void {
  try {
    sessionStorage.setItem(AUTH_INTENT_KEY, intent);
  } catch (error) {
    console.error('Failed to set auth intent:', error);
  }
}

export function getAuthIntent(): AuthIntent | null {
  try {
    const intent = sessionStorage.getItem(AUTH_INTENT_KEY);
    return intent === 'login' || intent === 'signup' ? intent : null;
  } catch (error) {
    console.error('Failed to get auth intent:', error);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
}

export function clearAuthIntent(): void {
  try {
    sessionStorage.removeItem(AUTH_INTENT_KEY);
  } catch (error) {
    console.error('Failed to clear auth intent:', error);
    // Don't throw - clearing is best-effort
  }
}
