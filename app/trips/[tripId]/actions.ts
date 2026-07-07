'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setTripCover(
  tripId: string,
  coverUrl: string,
  positionX: number,
  positionY: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('trips')
    .update({
      cover_url: coverUrl,
      cover_position_x: positionX,
      cover_position_y: positionY,
    })
    .eq('id', tripId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath(`/trips/${tripId}`);
}
