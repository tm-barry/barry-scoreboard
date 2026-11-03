export const SPORTS = [
  { type: 'generic', label: 'Generic' },
  { type: 'baseball', label: 'Baseball' },
  { type: 'basketball', label: 'Basketball' },
  { type: 'football', label: 'Football' },
] as const;

// Derived from the list, so the type can never drift from the options
export type SportType = (typeof SPORTS)[number]['type'];
