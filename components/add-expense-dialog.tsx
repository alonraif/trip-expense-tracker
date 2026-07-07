'use client';

import { useRef, useState } from 'react';
import { CameraIcon, ImageIcon, PlusIcon } from 'lucide-react';
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
import { ExpenseSplitEditor, type Split } from '@/components/expense-split-editor';
import { useTranslations } from '@/components/i18n-provider';

type Member = { id: string; name: string };

export function AddExpenseDialog({
  tripId,
  members,
  currency,
}: {
  tripId: string;
  members: Member[];
  currency: string;
}) {
  const dict = useTranslations();
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [receiptPath, setReceiptPath] = useState('');
  const [splits, setSplits] = useState<Split[] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const createExpenseForTrip = createExpense.bind(null, tripId);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate('');
    setReceiptPath('');
    setSplits(null);
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
        throw new Error(ocrData.error ?? dict.addExpenseDialog.scanError);
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
      toast.success(dict.addExpenseDialog.scanSuccess);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : dict.addExpenseDialog.scanError
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
            className="fixed bottom-6 end-6 z-40 size-14 rounded-full shadow-lg"
            aria-label={dict.expenses.addExpense}
          />
        }
      >
        <PlusIcon className="size-6" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.addExpenseDialog.title}</DialogTitle>
          <DialogDescription>
            {dict.addExpenseDialog.description}
          </DialogDescription>
        </DialogHeader>

        {isScanning ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm font-medium text-muted-foreground">
            {dict.addExpenseDialog.scanning}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-4 text-xs font-medium text-muted-foreground hover:border-foreground/30">
              <CameraIcon className="size-4" />
              {dict.addExpenseDialog.takePhoto}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleScan}
                disabled={isScanning}
              />
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-4 text-xs font-medium text-muted-foreground hover:border-foreground/30">
              <ImageIcon className="size-4" />
              {dict.addExpenseDialog.choosePhoto}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScan}
                disabled={isScanning}
              />
            </label>
          </div>
        )}

        <form
          ref={formRef}
          action={async (formData: FormData) => {
            try {
              await createExpenseForTrip(formData);
              resetForm();
              setOpen(false);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : dict.addExpenseDialog.addError
              );
            }
          }}
          className="space-y-4"
        >
          <input type="hidden" name="receiptUrl" value={receiptPath} />
          <input
            type="hidden"
            name="splits"
            value={splits ? JSON.stringify(splits) : ''}
          />
          <div className="space-y-2">
            <Label htmlFor="description">
              {dict.addExpenseDialog.descriptionLabel}
            </Label>
            <Input
              id="description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.addExpenseDialog.descriptionPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{dict.addExpenseDialog.amountLabel}</Label>
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
            <Label htmlFor="date">{dict.addExpenseDialog.dateLabel}</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payerId">{dict.addExpenseDialog.paidByLabel}</Label>
            <Select name="payerId" required>
              <SelectTrigger id="payerId" className="w-full">
                <SelectValue placeholder={dict.addExpenseDialog.selectMember}>
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
            <Label>{dict.addExpenseDialog.splitLabel}</Label>
            <ExpenseSplitEditor
              members={members}
              amount={amount}
              currency={currency}
              onChange={setSplits}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={members.length === 0}>
              {dict.addExpenseDialog.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
