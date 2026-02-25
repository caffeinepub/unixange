/**
 * Admin email allowlist for non-university domain emails
 * These emails are granted access even if they don't match @jainuniversity.ac.in
 */

const ADMIN_EMAIL_ALLOWLIST = new Set([
  'aaryan123cse@gmail.com',
  'admin-balu@campusmarket.in',
  'pkamil13@gmail.com',
]);

/**
 * Checks if an email is in the admin allowlist
 * Case-insensitive comparison
 */
export function isAllowlistedAdminEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_EMAIL_ALLOWLIST.has(normalizedEmail);
}

/**
 * Returns all allowlisted admin emails (for debugging/admin purposes only)
 */
export function getAllowlistedEmails(): string[] {
  return Array.from(ADMIN_EMAIL_ALLOWLIST);
}
