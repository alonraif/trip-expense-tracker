'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createTrip(formData: FormData) {
  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Trip name is required');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trips')
    .insert({ name: name.trim() })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/trips/${data.id}`);
}
