'use client';

import { createContext, useContext } from 'react';
import { getDictionary, type Dictionary, type Locale } from '@/lib/i18n';

const LocaleContext = createContext<{ locale: Locale; dict: Dictionary } | null>(
  null
);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Dictionaries include functions (for interpolated strings), which can't
  // cross the Server -> Client Component boundary as props — only the
  // (serializable) locale string comes from the server; the dictionary
  // itself is resolved here, in client code.
  const dict = getDictionary(locale);

  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useTranslations must be used within a LocaleProvider');
  }
  return ctx.dict;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx.locale;
}
