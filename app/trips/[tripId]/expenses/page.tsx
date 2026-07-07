import { Badge } from '@/components/ui/badge';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
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
          'id, description, amount, settle_amount, expense_date, receipt_url, payer_id'
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

  const memberNameById = new Map((members ?? []).map((m) => [m.id, m.name]));

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
        <div className="flex flex-col gap-2">
          {expensesWithReceipts.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {memberNameById.get(expense.payer_id)}
                  </Badge>
                  <span>
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </span>
                  {expense.receiptSignedUrl && (
                    <a
                      href={expense.receiptSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Receipt
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(expense.amount, currency)}
                </p>
                {showConversion && (
                  <p className="text-xs text-muted-foreground">
                    ≈{' '}
                    {formatCurrency(
                      expense.settle_amount ?? expense.amount,
                      settleCurrency
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExpenseDialog tripId={tripId} members={members ?? []} />
    </div>
  );
}
