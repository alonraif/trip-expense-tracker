'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getExchangeRate } from '@/lib/fx';
import { getServerLocale } from '@/lib/i18n/server';
import { getDictionary, type Dictionary } from '@/lib/i18n';

async function computeFxAndSettleAmount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dict: Dictionary,
  tripId: string,
  amountNum: number,
  expenseDate: string
) {
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('currency, settle_currency')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error(tripError?.message ?? dict.errors.tripNotFound);
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

  return {
    fxRate,
    settleAmount: Math.round(amountNum * fxRate * 100) / 100,
  };
}

function parseExpenseForm(formData: FormData, dict: Dictionary) {
  const description = formData.get('description');
  const amount = formData.get('amount');
  const date = formData.get('date');
  const payerId = formData.get('payerId');
  const splitsRaw = formData.get('splits');

  if (typeof description !== 'string' || !description.trim()) {
    throw new Error(dict.errors.descriptionRequired);
  }

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    throw new Error(dict.errors.amountPositive);
  }

  if (typeof payerId !== 'string' || !payerId) {
    throw new Error(dict.errors.payerRequired);
  }

  const expenseDate =
    typeof date === 'string' && date
      ? date
      : new Date().toISOString().slice(0, 10);

  let splits: { memberId: string; amount: number }[] | null = null;
  if (typeof splitsRaw === 'string' && splitsRaw) {
    const parsed = JSON.parse(splitsRaw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      splits = parsed.map((s) => ({
        memberId: String(s.memberId),
        amount: Number(s.amount),
      }));

      const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(splitTotal - amountNum) > 0.01) {
        throw new Error(
          dict.errors.splitMismatch(
            splitTotal.toFixed(2),
            amountNum.toFixed(2)
          )
        );
      }
    }
  }

  return {
    description: description.trim(),
    amountNum,
    payerId,
    expenseDate,
    splits,
  };
}

export async function createExpense(tripId: string, formData: FormData) {
  const supabase = await createClient();
  const dict = getDictionary(await getServerLocale(supabase));

  const { description, amountNum, payerId, expenseDate, splits } =
    parseExpenseForm(formData, dict);
  const receiptUrl = formData.get('receiptUrl');

  const { fxRate, settleAmount } = await computeFxAndSettleAmount(
    supabase,
    dict,
    tripId,
    amountNum,
    expenseDate
  );

  const payload: Record<string, unknown> = {
    trip_id: tripId,
    payer_id: payerId,
    description,
    amount: amountNum,
    expense_date: expenseDate,
    fx_rate: fxRate,
    settle_amount: settleAmount,
  };

  if (typeof receiptUrl === 'string' && receiptUrl) {
    payload.receipt_url = receiptUrl;
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (splits) {
    const { error: splitsError } = await supabase.from('expense_splits').insert(
      splits.map((s) => ({
        expense_id: expense.id,
        member_id: s.memberId,
        amount: s.amount,
      }))
    );
    if (splitsError) {
      throw new Error(splitsError.message);
    }
  }

  revalidatePath(`/trips/${tripId}/expenses`);
  revalidatePath(`/trips/${tripId}/balances`);
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const dict = getDictionary(await getServerLocale(supabase));

  const { description, amountNum, payerId, expenseDate, splits } =
    parseExpenseForm(formData, dict);

  const { fxRate, settleAmount } = await computeFxAndSettleAmount(
    supabase,
    dict,
    tripId,
    amountNum,
    expenseDate
  );

  const { error } = await supabase
    .from('expenses')
    .update({
      description,
      amount: amountNum,
      payer_id: payerId,
      expense_date: expenseDate,
      fx_rate: fxRate,
      settle_amount: settleAmount,
    })
    .eq('id', expenseId);

  if (error) {
    throw new Error(error.message);
  }

  const { error: deleteSplitsError } = await supabase
    .from('expense_splits')
    .delete()
    .eq('expense_id', expenseId);
  if (deleteSplitsError) {
    throw new Error(deleteSplitsError.message);
  }

  if (splits) {
    const { error: splitsError } = await supabase.from('expense_splits').insert(
      splits.map((s) => ({
        expense_id: expenseId,
        member_id: s.memberId,
        amount: s.amount,
      }))
    );
    if (splitsError) {
      throw new Error(splitsError.message);
    }
  }

  revalidatePath(`/trips/${tripId}/expenses`);
  revalidatePath(`/trips/${tripId}/balances`);
}

export async function deleteExpense(tripId: string, expenseId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/trips/${tripId}/expenses`);
  revalidatePath(`/trips/${tripId}/balances`);
}
