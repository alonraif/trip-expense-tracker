'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { removeMember } from '@/app/trips/[tripId]/members/actions';
import { useTranslations } from '@/components/i18n-provider';

export function RemoveMemberButton({
  tripId,
  memberId,
}: {
  tripId: string;
  memberId: string;
}) {
  const dict = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const handleRemove = async () => {
    setIsPending(true);
    try {
      await removeMember(tripId, memberId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : dict.members.removeError
      );
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={dict.members.remove}
      disabled={isPending}
      onClick={handleRemove}
    >
      <XIcon className="size-4" />
    </Button>
  );
}
