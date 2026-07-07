'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n';

export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  const dict = getDictionary(await getServerLocale(supabase));

  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error(dict.errors.tripNameRequired);
  }

  const currency = formData.get('currency');
  const settleCurrency = formData.get('settleCurrency');

  const { data, error } = await supabase
    .from('trips')
    .insert({
      name: name.trim(),
      currency: typeof currency === 'string' && currency ? currency : 'USD',
      settle_currency:
        typeof settleCurrency === 'string' && settleCurrency
          ? settleCurrency
          : 'USD',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/trips/${data.id}`);
}
