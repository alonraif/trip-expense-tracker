'use client';

import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteExpense } from '@/app/trips/[tripId]/expenses/actions';

export function DeleteExpenseButton({
  tripId,
  expenseId,
}: {
  tripId: string;
  expenseId: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense?')) return;

    setIsPending(true);
    try {
      await deleteExpense(tripId, expenseId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete expense'
      );
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete expense"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2Icon className="size-3.5" />
    </Button>
  );
}
