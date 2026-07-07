import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { ExpenseDayGroups } from '@/components/expense-day-groups';
import { EmptyStateIllustration } from '@/components/illustrations/empty-state';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/format-currency';

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [{ data: trip }, { data: expenses }, { data: members }] =
    await Promise.all([
      supabase
        .from('trips')
        .select('currency, settle_currency')
        .eq('id', tripId)
        .single(),
      supabase
        .from('expenses')
        .select(
          'id, description, amount, settle_amount, expense_date, receipt_url, payer_id, splits:expense_splits(member_id, amount)'
        )
        .eq('trip_id', tripId)
        .order('expense_date', { ascending: false }),
      supabase
        .from('trip_members')
        .select('id, name')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true }),
    ]);

  const currency = trip?.currency ?? 'USD';
  const settleCurrency = trip?.settle_currency ?? 'USD';
  const showConversion = currency !== settleCurrency;

  const expensesWithReceipts = await Promise.all(
    (expenses ?? []).map(async (expense) => {
      if (!expense.receipt_url) {
        return { ...expense, receiptSignedUrl: null as string | null };
      }
      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(expense.receipt_url, 3600);
      return { ...expense, receiptSignedUrl: data?.signedUrl ?? null };
    })
  );

  const groups: { date: string; expenses: typeof expensesWithReceipts }[] = [];
  for (const expense of expensesWithReceipts) {
    const last = groups[groups.length - 1];
    if (last && last.date === expense.expense_date) {
      last.expenses.push(expense);
    } else {
      groups.push({ date: expense.expense_date, expenses: [expense] });
    }
  }

  const total = expensesWithReceipts.reduce((sum, e) => sum + e.amount, 0);
  const settleTotal = expensesWithReceipts.reduce(
    (sum, e) => sum + (e.settle_amount ?? e.amount),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      {!members?.length ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <EmptyStateIllustration className="size-28" />
          <p className="text-sm text-muted-foreground">
            Add trip members first, then start logging expenses.
          </p>
        </div>
      ) : !expensesWithReceipts.length ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <EmptyStateIllustration className="size-28" />
          <p className="text-sm text-muted-foreground">
            No expenses yet. Tap the + button to add one.
          </p>
        </div>
      ) : (
        <>
          <ExpenseDayGroups
            tripId={tripId}
            groups={groups}
            members={members ?? []}
            currency={currency}
            settleCurrency={settleCurrency}
            showConversion={showConversion}
          />
          <div className="flex items-center justify-between rounded-lg border bg-card p-3">
            <span className="text-sm font-semibold text-muted-foreground">
              Total
            </span>
            <div className="text-right">
              <p className="text-lg font-bold">
                {formatCurrency(total, currency)}
              </p>
              {showConversion && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(settleTotal, settleCurrency)}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <AddExpenseDialog
        tripId={tripId}
        members={members ?? []}
        currency={currency}
      />
    </div>
  );
}
