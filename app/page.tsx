import Link from 'next/link';
import { MapIcon } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateTripDialog } from '@/components/create-trip-dialog';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { EmptyStateIllustration } from '@/components/illustrations/empty-state';
import { CoverImage } from '@/components/cover-image';
import { createClient } from '@/lib/supabase/server';
import { getServerLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n';

export default async function DashboardPage() {
  const supabase = await createClient();
  const locale = await getServerLocale(supabase);
  const dict = getDictionary(locale);
  const dateLocale = locale === 'he' ? 'he-IL' : 'en-US';

  const { data: trips } = await supabase
    .from('trips')
    .select(
      'id, name, created_at, cover_url, cover_position_x, cover_position_y, cover_scale'
    )
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">
          {dict.dashboard.title}
        </h1>
        <CreateTripDialog />
      </div>

      <LocaleSwitcher />

      {!trips?.length ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <EmptyStateIllustration className="size-28" />
          <p className="text-sm text-muted-foreground">
            {dict.dashboard.noTrips}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="transition hover:shadow-md">
                {trip.cover_url ? (
                  <CoverImage
                    src={trip.cover_url}
                    positionX={trip.cover_position_x}
                    positionY={trip.cover_position_y}
                    scale={trip.cover_scale}
                    className="-mt-4 h-32 w-full rounded-t-xl"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-primary/25 via-secondary/15 to-accent">
                    <MapIcon className="size-8 text-primary/60" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{trip.name}</CardTitle>
                  <CardDescription>
                    {dict.dashboard.createdOn(
                      new Date(trip.created_at).toLocaleDateString(dateLocale)
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
