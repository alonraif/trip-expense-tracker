import type { createClient } from '@/lib/supabase/server';
import { isValidLocale, type Locale } from '@/lib/i18n';

export async function getServerLocale(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Locale> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = user?.user_metadata?.locale;
  return isValidLocale(locale) ? locale : 'en';
}
