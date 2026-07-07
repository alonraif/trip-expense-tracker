'use client';

import { useState } from 'react';
import { Trash2Icon, TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
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
import { deleteTrip } from '@/app/trips/[tripId]/actions';

export function DeleteTripDialog({
  tripId,
  tripName,
  memberCount,
  expenseCount,
}: {
  tripId: string;
  tripName: string;
  memberCount: number;
  expenseCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrip(tripId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete trip'
      );
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText('');
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete trip"
          />
        }
      >
        <Trash2Icon className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlertIcon className="size-4" />
            Delete trip
          </DialogTitle>
          <DialogDescription>
            This permanently deletes <strong>{tripName}</strong>,{' '}
            {memberCount} member{memberCount === 1 ? '' : 's'}, and{' '}
            {expenseCount} expense{expenseCount === 1 ? '' : 's'} — including
            uploaded receipts and the cover photo. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-trip-name">
            Type <strong>{tripName}</strong> to confirm
          </Label>
          <Input
            id="confirm-trip-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== tripName || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete trip permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
