'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n';

export async function addMember(tripId: string, formData: FormData) {
  const supabase = await createClient();
  const dict = getDictionary(await getServerLocale(supabase));

  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error(dict.errors.memberNameRequired);
  }

  const { error } = await supabase
    .from('trip_members')
    .insert({ trip_id: tripId, name: name.trim() });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/trips/${tripId}/members`);
}

export async function removeMember(tripId: string, memberId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/trips/${tripId}/members`);
}
