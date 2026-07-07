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
      .select('id, description, amount, expense_date, trip_members(name)')
      .eq('trip_id', tripId)
      .order('expense_date', { ascending: false }),
    supabase
      .from('trip_members')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      {!members?.length ? (
        <p className="text-sm text-muted-foreground">
          Add trip members first, then start logging expenses.
        </p>
      ) : !expenses?.length ? (
        <p className="text-sm text-muted-foreground">
          No expenses yet. Tap the + button to add one.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((expense) => (
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
