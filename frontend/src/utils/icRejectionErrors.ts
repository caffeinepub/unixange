/**
 * IC rejection error detection and parsing utilities.
 * Handles stopped-canister and other IC-specific error cases.
 */

interface ICRejectionBody {
  status?: string;
  error_code?: string;
  reject_code?: number;
  reject_message?: string;
}

interface ICRejectionError {
  message?: string;
  body?: ICRejectionBody;
  [key: string]: any;
}

/**
 * Detects if an error is an IC stopped-canister rejection.
 */
export function isStoppedCanisterError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as ICRejectionError;
  
  // Check for IC0508 error code (canister stopped)
  if (err.body?.error_code === 'IC0508') return true;
  
  // Check reject message for "is stopped"
  if (err.body?.reject_message?.includes('is stopped')) return true;
  
  // Check main error message
  if (err.message?.includes('is stopped')) return true;
  
  return false;
}

/**
 * Extracts canister ID from an IC rejection error.
 */
export function extractCanisterId(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as ICRejectionError;
  
  // Try to extract from reject_message
  if (err.body?.reject_message) {
    const match = err.body.reject_message.match(/Canister\s+([a-z0-9-]+)\s+is stopped/i);
    if (match && match[1]) return match[1];
  }
  
  // Try to extract from main message
  if (err.message) {
    const match = err.message.match(/Canister\s+([a-z0-9-]+)\s+is stopped/i);
    if (match && match[1]) return match[1];
  }
  
  // Try to extract from any string representation
  const errorStr = JSON.stringify(error);
  const match = errorStr.match(/Canister\s+([a-z0-9-]+)\s+is stopped/i);
  if (match && match[1]) return match[1];
  
  return null;
}

/**
 * Checks if an error is any IC rejection (not just stopped canister).
 */
export function isICRejection(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as ICRejectionError;
  return !!(err.body?.status === 'non_replicated_rejection' || err.body?.reject_code);
}
