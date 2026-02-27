import { isAdminEmail } from './adminEmailAllowlist';

export function isValidUniversityEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (isAdminEmail(lower)) return true;
  return lower.endsWith('@jainuniversity.ac.in');
}

export function getUniversityEmailError(email: string): string | null {
  if (!email) return 'Email is required.';
  const lower = email.toLowerCase().trim();
  if (isAdminEmail(lower)) return null;
  if (!lower.endsWith('@jainuniversity.ac.in')) {
    return 'Only @jainuniversity.ac.in email addresses are allowed. Please use your Jain University email.';
  }
  return null;
}
