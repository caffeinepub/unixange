import { isAllowlistedAdminEmail } from './adminEmailAllowlist';

/**
 * Validates that an email address ends with @jainuniversity.ac.in
 * OR is in the admin email allowlist
 * Case-insensitive validation
 */
export function isValidJainUniversityEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Check if it's a valid university email
  if (trimmedEmail.endsWith('@jainuniversity.ac.in')) {
    return true;
  }
  
  // Check if it's an allowlisted admin email
  return isAllowlistedAdminEmail(trimmedEmail);
}

/**
 * Returns a user-friendly error message for invalid university emails
 */
export function getUniversityEmailError(email: string): string {
  if (!email || !email.trim()) {
    return 'University email is required';
  }
  
  if (!isValidJainUniversityEmail(email)) {
    return 'Email must be from @jainuniversity.ac.in domain or be an approved admin email';
  }
  
  return '';
}
