import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripSwitcher } from '@/components/trip-switcher';
import { TripTabsNav } from '@/components/trip-tabs-nav';
import { TripCoverUpload } from '@/components/trip-cover-upload';

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [{ data: trip }, { data: trips }] = await Promise.all([
    supabase
      .from('trips')
      .select('id, name, cover_url')
      .eq('id', tripId)
      .single(),
    supabase
      .from('trips')
      .select('id, name')
      .order('created_at', { ascending: false }),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="relative flex h-36 w-full items-end overflow-hidden">
        {trip.cover_url ? (
          <img
            src={trip.cover_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        <div className="relative flex w-full items-end justify-between gap-2 p-4">
          <h1 className="truncate font-heading text-xl font-semibold text-white drop-shadow-sm">
            {trip.name}
          </h1>
          <TripCoverUpload tripId={tripId} hasCover={!!trip.cover_url} />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <TripSwitcher trips={trips ?? []} currentTripId={tripId} />
        <TripTabsNav tripId={tripId} />
        <div className="flex-1 pb-20">{children}</div>
      </div>
    </div>
  );
}
