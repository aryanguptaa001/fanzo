export const RESERVED_CREATOR_USERNAMES = new Set([
  'admin',
  'api',
  'brand',
  'brands',
  'calls',
  'creators',
  'dashboard',
  'explore',
  'help',
  'live',
  'login',
  'messages',
  'privacy',
  'profile',
  'settings',
  'sign-in',
  'sign-up',
  'support',
  'terms',
]);

export const CREATOR_USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/;

export function normalizeCreatorUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidCreatorUsername(username: string): boolean {
  return CREATOR_USERNAME_PATTERN.test(normalizeCreatorUsername(username));
}

export function isReservedCreatorUsername(username: string): boolean {
  return RESERVED_CREATOR_USERNAMES.has(normalizeCreatorUsername(username));
}
