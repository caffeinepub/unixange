import { createTimeoutError } from './actorInitErrors';

/**
 * Wraps a promise with a hard timeout, rejecting with a consistent timeout error
 * if the operation doesn't complete within the specified time limit.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        createTimeoutError(
          message || `Operation timed out after ${timeoutMs}ms`
        )
      );
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
