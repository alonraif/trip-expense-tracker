import Link from 'next/link';
import { MapIcon } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateTripDialog } from '@/components/create-trip-dialog';
import { EmptyStateIllustration } from '@/components/illustrations/empty-state';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from('trips')
    .select('id, name, created_at, cover_url, cover_position_x, cover_position_y')
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Your Trips</h1>
        <CreateTripDialog />
      </div>

      {!trips?.length ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <EmptyStateIllustration className="size-28" />
          <p className="text-sm text-muted-foreground">
            No trips yet. Create one to start tracking expenses.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="transition hover:shadow-md">
                {trip.cover_url ? (
                  <img
                    src={trip.cover_url}
                    alt=""
                    className="h-32 w-full object-cover"
                    style={{
                      objectPosition: `${trip.cover_position_x}% ${trip.cover_position_y}%`,
                    }}
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-primary/25 via-secondary/15 to-accent">
                    <MapIcon className="size-8 text-primary/60" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{trip.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(trip.created_at).toLocaleDateString()}
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
