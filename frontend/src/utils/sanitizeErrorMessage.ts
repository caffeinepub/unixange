/**
 * Sanitizes raw initialization errors into user-friendly text.
 * Avoids leaking low-level details while keeping messages actionable.
 */

import { isStoppedCanisterError, extractCanisterId } from './icRejectionErrors';

export function sanitizeErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Check for stopped canister error first (highest priority)
  if (isStoppedCanisterError(error)) {
    const canisterId = extractCanisterId(error);
    if (canisterId) {
      return `The backend service is currently unavailable (canister ${canisterId} is stopped). Please contact support or try again later.`;
    }
    return 'The backend service is currently unavailable (canister is stopped). Please contact support or try again later.';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'Connection timed out. Please check your network and try again.';
  }

  // Authentication/authorization errors
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('not authenticated')
  ) {
    return 'Authentication failed. Please log in again.';
  }

  // Network/connection errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('actor not available')
  ) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }

  // Access control initialization errors
  if (lowerMessage.includes('access control') || lowerMessage.includes('initialization')) {
    return 'Failed to initialize the application. Please try again.';
  }

  // Generic canister errors (but not stopped, which we handled above)
  if (lowerMessage.includes('canister') || lowerMessage.includes('replica')) {
    return 'Server error occurred. Please try again in a moment.';
  }

  // If the error message is already user-friendly (short and clear), use it
  if (errorMessage.length < 100 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}
