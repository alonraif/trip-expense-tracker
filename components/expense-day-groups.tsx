'use client';

import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditExpenseDialog } from '@/components/edit-expense-dialog';
import { DeleteExpenseButton } from '@/components/delete-expense-button';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';

type Member = { id: string; name: string };
type Expense = {
  id: string;
  description: string;
  amount: number;
  settle_amount: number | null;
  expense_date: string;
  payer_id: string;
  receiptSignedUrl: string | null;
};
type Group = { date: string; expenses: Expense[] };

function formatGroupDate(dateStr: string, isToday: boolean) {
  if (isToday) return 'Today';
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function ExpenseDayGroups({
  tripId,
  groups,
  members,
  currency,
  settleCurrency,
  showConversion,
}: {
  tripId: string;
  groups: Group[];
  members: Member[];
  currency: string;
  settleCurrency: string;
  showConversion: boolean;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const memberNameById = new Map(members.map((m) => [m.id, m.name]));

  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.date).filter((d) => d !== todayStr))
  );

  const allCollapsed = collapsed.size === groups.length;

  const toggleDate = (date: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setCollapsed(
      allCollapsed ? new Set() : new Set(groups.map((g) => g.date))
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={toggleAll}>
          {allCollapsed ? 'Expand all' : 'Collapse all'}
        </Button>
      </div>

      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.date);
        const dayTotal = group.expenses.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div key={group.date} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleDate(group.date)}
              className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-left"
            >
              <span className="text-sm font-semibold">
                {formatGroupDate(group.date, group.date === todayStr)}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatCurrency(dayTotal, currency)}</span>
                <ChevronDownIcon
                  className={cn(
                    'size-4 transition-transform',
                    !isCollapsed && 'rotate-180'
                  )}
                />
              </div>
            </button>

            {!isCollapsed && (
              <div className="flex flex-col gap-2">
                {group.expenses.map((expense) => (
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
                    <div className="flex items-center gap-1">
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
                      <EditExpenseDialog
                        tripId={tripId}
                        expense={expense}
                        members={members}
                      />
                      <DeleteExpenseButton
                        tripId={tripId}
                        expenseId={expense.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
