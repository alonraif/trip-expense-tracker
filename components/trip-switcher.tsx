'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Trip = { id: string; name: string };

export function TripSwitcher({
  trips,
  currentTripId,
}: {
  trips: Trip[];
  currentTripId: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={currentTripId}
      onValueChange={(id) => router.push(`/trips/${id}`)}
    >
      <SelectTrigger size="sm" aria-label="Switch trip">
        <SelectValue>
          {(id: string) => trips.find((trip) => trip.id === id)?.name ?? id}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {trips.map((trip) => (
          <SelectItem key={trip.id} value={trip.id}>
            {trip.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
