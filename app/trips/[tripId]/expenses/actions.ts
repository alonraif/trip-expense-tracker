'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getExchangeRate } from '@/lib/fx';

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

  const expenseDate =
    typeof date === 'string' && date
      ? date
      : new Date().toISOString().slice(0, 10);

  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('currency, settle_currency')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error(tripError?.message ?? 'Trip not found');
  }

  let fxRate = 1;
  try {
    fxRate = await getExchangeRate(
      expenseDate,
      trip.currency,
      trip.settle_currency
    );
  } catch {
    // A flaky FX API shouldn't block logging an expense mid-trip.
    fxRate = 1;
  }

  const payload: Record<string, unknown> = {
    trip_id: tripId,
    payer_id: payerId,
    description: description.trim(),
    amount: amountNum,
    expense_date: expenseDate,
    fx_rate: fxRate,
    settle_amount: Math.round(amountNum * fxRate * 100) / 100,
  };

  if (typeof receiptUrl === 'string' && receiptUrl) {
    payload.receipt_url = receiptUrl;
  }

  const { error } = await supabase.from('expenses').insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/trips/${tripId}/expenses`);
  revalidatePath(`/trips/${tripId}/balances`);
}
