'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addMember } from '@/app/trips/[tripId]/members/actions';

export function AddMemberForm({ tripId }: { tripId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const addMemberWithTrip = addMember.bind(null, tripId);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        try {
          await addMemberWithTrip(formData);
          formRef.current?.reset();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Failed to add member'
          );
        }
      }}
      className="flex gap-2"
    >
      <Input name="name" placeholder="Member name" required className="flex-1" />
      <Button type="submit">Add</Button>
    </form>
  );
}
