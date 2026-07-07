'use client';

import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { removeMember } from '@/app/trips/[tripId]/members/actions';

export function RemoveMemberButton({
  tripId,
  memberId,
}: {
  tripId: string;
  memberId: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Remove member"
      onClick={() => removeMember(tripId, memberId)}
    >
      <XIcon className="size-4" />
    </Button>
  );
}
