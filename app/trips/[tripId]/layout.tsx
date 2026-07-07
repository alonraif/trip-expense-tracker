import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripSwitcher } from '@/components/trip-switcher';
import { TripTabsNav } from '@/components/trip-tabs-nav';

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
    supabase.from('trips').select('id, name').eq('id', tripId).single(),
    supabase
      .from('trips')
      .select('id, name')
      .order('created_at', { ascending: false }),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="truncate text-lg font-bold">{trip.name}</h1>
        <TripSwitcher trips={trips ?? []} currentTripId={tripId} />
      </div>
      <TripTabsNav tripId={tripId} />
      <div className="flex-1 pb-20">{children}</div>
    </div>
  );
}
