/**
 * Validates that an email address ends with @jainuniversity.ac.in
 * Case-insensitive validation
 */
export function isValidJainUniversityEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  return trimmedEmail.endsWith('@jainuniversity.ac.in');
}

/**
 * Returns a user-friendly error message for invalid university emails
 */
export function getUniversityEmailError(email: string): string {
  if (!email || !email.trim()) {
    return 'University email is required';
  }
  
  if (!isValidJainUniversityEmail(email)) {
    return 'Email must be from @jainuniversity.ac.in domain';
  }
  
  return '';
}
