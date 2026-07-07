'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setLocale } from '@/app/actions';
import { useLocale, useTranslations } from '@/components/i18n-provider';
import type { Locale } from '@/lib/i18n';

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const dict = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const handleChange = async (next: Locale) => {
    if (next === locale) return;
    setIsPending(true);
    try {
      await setLocale(next);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={locale === 'en' ? 'default' : 'outline'}
        size="sm"
        disabled={isPending}
        onClick={() => handleChange('en')}
      >
        {dict.locale.english}
      </Button>
      <Button
        type="button"
        variant={locale === 'he' ? 'default' : 'outline'}
        size="sm"
        disabled={isPending}
        onClick={() => handleChange('he')}
      >
        {dict.locale.hebrew}
      </Button>
    </div>
  );
}
