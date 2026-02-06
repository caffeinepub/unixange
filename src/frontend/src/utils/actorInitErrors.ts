/**
 * Actor initialization error primitives for reliable error handling across the UI.
 * Provides type guards and helpers to distinguish timeout vs error states.
 */

export const ACTOR_INIT_TIMEOUT_MARKER = 'ACTOR_INIT_TIMEOUT';

export interface ActorInitTimeoutError extends Error {
  code: typeof ACTOR_INIT_TIMEOUT_MARKER;
}

export function isActorInitTimeout(error: unknown): error is ActorInitTimeoutError {
  return (
    error instanceof Error &&
    'code' in error &&
    error.code === ACTOR_INIT_TIMEOUT_MARKER
  );
}

export function createTimeoutError(message: string): ActorInitTimeoutError {
  const error = new Error(message) as ActorInitTimeoutError;
  error.code = ACTOR_INIT_TIMEOUT_MARKER;
  return error;
}
