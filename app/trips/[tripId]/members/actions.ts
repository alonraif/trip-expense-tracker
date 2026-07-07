'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addMember(tripId: string, formData: FormData) {
  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Member name is required');
  }

  const supabase = await createClient();
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
