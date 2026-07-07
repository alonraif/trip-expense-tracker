import en from './dictionaries/en';
import he from './dictionaries/he';

export type Locale = 'en' | 'he';
export type Dictionary = typeof en;

// Assignability check: this throws a compile error if he.ts drifts from
// en.ts's shape (missing/extra keys, mismatched function signatures).
const _heShapeCheck: Dictionary = he;
void _heShapeCheck;

export const dictionaries: Record<Locale, Dictionary> = { en, he };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function isValidLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'he';
}
