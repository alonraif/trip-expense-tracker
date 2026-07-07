import { Badge } from '@/components/ui/badge';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { createClient } from '@/lib/supabase/server';

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [{ data: expenses }, { data: members }] = await Promise.all([
    supabase
      .from('expenses')
      .select('id, description, amount, expense_date, receipt_url, trip_members(name)')
      .eq('trip_id', tripId)
      .order('expense_date', { ascending: false }),
    supabase
      .from('trip_members')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
  ]);

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
        <p className="text-sm text-muted-foreground">
          Add trip members first, then start logging expenses.
        </p>
      ) : !expensesWithReceipts.length ? (
        <p className="text-sm text-muted-foreground">
          No expenses yet. Tap the + button to add one.
        </p>
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
                  <Badge variant="outline">{expense.trip_members?.[0]?.name}</Badge>
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
              <p className="font-semibold">${expense.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      <AddExpenseDialog tripId={tripId} members={members ?? []} />
    </div>
  );
}
