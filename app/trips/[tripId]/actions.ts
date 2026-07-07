'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function setTripCover(
  tripId: string,
  coverUrl: string,
  positionX: number,
  positionY: number,
  scale: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('trips')
    .update({
      cover_url: coverUrl,
      cover_position_x: positionX,
      cover_position_y: positionY,
      cover_scale: scale,
    })
    .eq('id', tripId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();

  const [{ data: trip }, { data: expenses }] = await Promise.all([
    supabase.from('trips').select('cover_url').eq('id', tripId).single(),
    supabase
      .from('expenses')
      .select('receipt_url')
      .eq('trip_id', tripId)
      .not('receipt_url', 'is', null),
  ]);

  const receiptPaths = (expenses ?? [])
    .map((e) => e.receipt_url)
    .filter((path): path is string => !!path);

  if (receiptPaths.length) {
    await supabase.storage.from('receipts').remove(receiptPaths);
  }
  if (trip?.cover_url) {
    await supabase.storage.from('trip-covers').remove([trip.cover_url]);
  }

  // Deleted explicitly and in this order (rather than relying solely on the
  // schema's ON DELETE CASCADE) so there's no ambiguity about whether
  // expenses.payer_id's ON DELETE RESTRICT could interfere with a cascading
  // multi-table delete triggered from the trips row.
  const { error: expensesError } = await supabase
    .from('expenses')
    .delete()
    .eq('trip_id', tripId);
  if (expensesError) {
    throw new Error(expensesError.message);
  }

  const { error: membersError } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId);
  if (membersError) {
    throw new Error(membersError.message);
  }

  const { error: tripError } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);
  if (tripError) {
    throw new Error(tripError.message);
  }

  revalidatePath('/');
  redirect('/');
}
