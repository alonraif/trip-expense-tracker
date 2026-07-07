'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createExpense(tripId: string, formData: FormData) {
  const description = formData.get('description');
  const amount = formData.get('amount');
  const date = formData.get('date');
  const payerId = formData.get('payerId');
  const receiptUrl = formData.get('receiptUrl');

  if (typeof description !== 'string' || !description.trim()) {
    throw new Error('Description is required');
  }

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (typeof payerId !== 'string' || !payerId) {
    throw new Error('Payer is required');
  }

  const payload: Record<string, unknown> = {
    trip_id: tripId,
    payer_id: payerId,
    description: description.trim(),
    amount: amountNum,
  };

  if (typeof date === 'string' && date) {
    payload.expense_date = date;
  }
  if (typeof receiptUrl === 'string' && receiptUrl) {
    payload.receipt_url = receiptUrl;
  }

  const supabase = await createClient();
  const { error } = await supabase.from('expenses').insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/trips/${tripId}/expenses`);
  revalidatePath(`/trips/${tripId}/balances`);
}
