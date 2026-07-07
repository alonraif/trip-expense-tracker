'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTrip } from '@/app/trips/actions';

export function CreateTripDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>New Trip</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a trip</DialogTitle>
          <DialogDescription>
            Give this trip a name so you can track its expenses separately.
          </DialogDescription>
        </DialogHeader>
        <form action={createTrip} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip name</Label>
            <Input
              id="name"
              name="name"
              required
              autoFocus
              placeholder="Summer 2026 Italy Trip"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
