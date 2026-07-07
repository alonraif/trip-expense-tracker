import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateTripDialog } from '@/components/create-trip-dialog';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from('trips')
    .select('id, name, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Your Trips</h1>
        <CreateTripDialog />
      </div>

      {!trips?.length ? (
        <p className="text-sm text-muted-foreground">
          No trips yet. Create one to start tracking expenses.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="transition hover:bg-accent">
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
