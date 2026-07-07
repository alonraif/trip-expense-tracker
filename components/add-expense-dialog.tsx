'use client';

import { useRef, useState } from 'react';
import { CameraIcon, PlusIcon } from 'lucide-react';
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
import { createExpense } from '@/app/trips/[tripId]/expenses/actions';
import { createClient } from '@/lib/supabase/client';

type Member = { id: string; name: string };

export function AddExpenseDialog({
  tripId,
  members,
}: {
  tripId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [receiptPath, setReceiptPath] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const createExpenseForTrip = createExpense.bind(null, tripId);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate('');
    setReceiptPath('');
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsScanning(true);
    try {
      const ocrFormData = new FormData();
      ocrFormData.append('receipt', file);
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: ocrFormData,
      });
      const ocrData = await ocrResponse.json();

      if (!ocrResponse.ok) {
        throw new Error(ocrData.error ?? 'Failed to scan receipt');
      }

      const supabase = createClient();
      const path = `${tripId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setDescription(ocrData.merchant ?? '');
      setAmount(ocrData.total ? String(ocrData.total) : '');
      setDate(ocrData.date ?? '');
      setReceiptPath(path);
      toast.success('Receipt scanned — review the details below');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to scan receipt'
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg"
            aria-label="Add expense"
          />
        }
      >
        <PlusIcon className="size-6" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>
            It&apos;ll be split evenly across everyone on the trip.
          </DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm font-medium text-muted-foreground hover:border-foreground/30">
          <CameraIcon className="size-4" />
          {isScanning ? 'Scanning receipt...' : 'Scan a receipt'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScan}
            disabled={isScanning}
          />
        </label>

        <form
          ref={formRef}
          action={async (formData: FormData) => {
            await createExpenseForTrip(formData);
            resetForm();
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="receiptUrl" value={receiptPath} />
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner at Trattoria"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payerId">Paid by</Label>
            <Select name="payerId" required>
              <SelectTrigger id="payerId" className="w-full">
                <SelectValue placeholder="Select a member" />
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
          <DialogFooter>
            <Button type="submit" disabled={members.length === 0}>
              Add expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
