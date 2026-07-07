'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n';

export async function setLocale(locale: Locale) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { locale },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}
