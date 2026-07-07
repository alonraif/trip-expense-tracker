'use client';

import { useRef, useState } from 'react';
import { PencilIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateExpense } from '@/app/trips/[tripId]/expenses/actions';
import { ExpenseSplitEditor, type Split } from '@/components/expense-split-editor';

type Member = { id: string; name: string };
type Expense = {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  payer_id: string;
  splits?: { member_id: string; amount: number }[];
};

export function EditExpenseDialog({
  tripId,
  expense,
  members,
  currency,
}: {
  tripId: string;
  expense: Expense;
  members: Member[];
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(expense.amount));
  const [date, setDate] = useState(expense.expense_date);
  const [splits, setSplits] = useState<Split[] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const updateExpenseForTrip = updateExpense.bind(null, tripId, expense.id);

  const initialSplits: Split[] | null = expense.splits?.length
    ? expense.splits.map((s) => ({ memberId: s.member_id, amount: s.amount }))
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDescription(expense.description);
          setAmount(String(expense.amount));
          setDate(expense.expense_date);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit expense" />
        }
      >
        <PencilIcon className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
          <DialogDescription>
            Changing the amount or date recalculates the settle-up conversion.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          action={async (formData: FormData) => {
            try {
              await updateExpenseForTrip(formData);
              setOpen(false);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : 'Failed to update expense'
              );
            }
          }}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="splits"
            value={splits ? JSON.stringify(splits) : ''}
          />
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-payerId">Paid by</Label>
            <Select name="payerId" defaultValue={expense.payer_id} required>
              <SelectTrigger id="edit-payerId" className="w-full">
                <SelectValue placeholder="Select a member">
                  {(id: string) =>
                    members.find((member) => member.id === id)?.name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Split</Label>
            <ExpenseSplitEditor
              members={members}
              amount={amount}
              currency={currency}
              initialSplits={initialSplits}
              onChange={setSplits}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
