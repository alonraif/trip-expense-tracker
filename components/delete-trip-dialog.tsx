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
import { useTranslations } from '@/components/i18n-provider';

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
  const dict = useTranslations();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrip(tripId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : dict.deleteTrip.deleteError
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
            aria-label={dict.tripLayout.deleteTrip}
          />
        }
      >
        <Trash2Icon className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlertIcon className="size-4" />
            {dict.deleteTrip.title}
          </DialogTitle>
          <DialogDescription>
            {dict.deleteTrip.description(tripName, memberCount, expenseCount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-trip-name">
            {dict.deleteTrip.confirmLabel(tripName)}
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
            {dict.common.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== tripName || isDeleting}
          >
            {isDeleting ? dict.deleteTrip.deleting : dict.deleteTrip.deleteButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
