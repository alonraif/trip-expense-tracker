'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/components/i18n-provider';

type Trip = { id: string; name: string };

export function TripSwitcher({
  trips,
  currentTripId,
}: {
  trips: Trip[];
  currentTripId: string;
}) {
  const router = useRouter();
  const dict = useTranslations();

  return (
    <Select
      value={currentTripId}
      onValueChange={(id) => router.push(`/trips/${id}`)}
    >
      <SelectTrigger size="sm" aria-label={dict.tripLayout.switchTrip}>
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
