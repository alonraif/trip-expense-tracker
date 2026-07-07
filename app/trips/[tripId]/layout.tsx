import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripSwitcher } from '@/components/trip-switcher';
import { TripTabsNav } from '@/components/trip-tabs-nav';
import { TripCoverUpload } from '@/components/trip-cover-upload';
import { CoverImage } from '@/components/cover-image';
import { DeleteTripDialog } from '@/components/delete-trip-dialog';

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [
    { data: trip },
    { data: trips },
    { count: memberCount },
    { count: expenseCount },
  ] = await Promise.all([
    supabase
      .from('trips')
      .select(
        'id, name, cover_url, cover_position_x, cover_position_y, cover_scale'
      )
      .eq('id', tripId)
      .single(),
    supabase
      .from('trips')
      .select('id, name')
      .order('created_at', { ascending: false }),
    supabase
      .from('trip_members')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', tripId),
    supabase
      .from('expenses')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', tripId),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="relative h-36 w-full overflow-hidden">
        {trip.cover_url ? (
          <CoverImage
            src={trip.cover_url}
            positionX={trip.cover_position_x}
            positionY={trip.cover_position_y}
            scale={trip.cover_scale}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent" />
        )}
        <div className="absolute bottom-4 end-4">
          <TripCoverUpload tripId={tripId} hasCover={!!trip.cover_url} />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <TripSwitcher trips={trips ?? []} currentTripId={tripId} />
          </div>
          <DeleteTripDialog
            tripId={tripId}
            tripName={trip.name}
            memberCount={memberCount ?? 0}
            expenseCount={expenseCount ?? 0}
          />
        </div>
        <TripTabsNav tripId={tripId} />
        <div className="flex-1 pb-20">{children}</div>
      </div>
    </div>
  );
}
