const ADMIN_EMAILS = new Set([
  'aaryan123cse@gmail.com',
  'admin-balu@campusmarket.in',
  'pkamil13@gmail.com',
]);

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.has(email.toLowerCase().trim());
}
