import { ArrowRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { computeBalances, simplifyDebts } from '@/lib/settlement';
import { formatCurrency } from '@/lib/format-currency';

export default async function BalancesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [{ data: trip }, { data: members }, { data: expenses }] =
    await Promise.all([
      supabase
        .from('trips')
        .select('settle_currency')
        .eq('id', tripId)
        .single(),
      supabase
        .from('trip_members')
        .select('id, name')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true }),
      supabase
        .from('expenses')
        .select(
          'payer_id, amount, settle_amount, fx_rate, splits:expense_splits(member_id, amount)'
        )
        .eq('trip_id', tripId),
    ]);

  const settleCurrency = trip?.settle_currency ?? 'USD';

  if (!members?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Add trip members to see balances.
      </p>
    );
  }

  const balances = computeBalances(
    members,
    (expenses ?? []).map((e) => {
      const fxRate = e.fx_rate ?? 1;
      return {
        payerId: e.payer_id,
        amount: e.settle_amount ?? e.amount,
        splits: e.splits?.length
          ? e.splits.map((s) => ({
              memberId: s.member_id,
              amount: s.amount * fxRate,
            }))
          : undefined,
      };
    })
  );
  const transactions = simplifyDebts(balances);
  const totalSpent = (expenses ?? []).reduce(
    (sum, e) => sum + (e.settle_amount ?? e.amount),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <span className="text-sm font-semibold text-muted-foreground">
          Total expenses
        </span>
        <span className="text-lg font-bold">
          {formatCurrency(totalSpent, settleCurrency)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Net balances
        </h2>
        <div className="flex flex-col gap-2">
          {balances.map((balance) => (
            <div
              key={balance.memberId}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <Badge variant="secondary">{balance.name}</Badge>
              <p
                className={
                  balance.net > 0
                    ? 'font-semibold text-success'
                    : balance.net < 0
                      ? 'font-semibold text-destructive'
                      : 'font-semibold text-muted-foreground'
                }
              >
                {balance.net > 0 ? '+' : balance.net < 0 ? '-' : ''}
                {formatCurrency(Math.abs(balance.net), settleCurrency)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Settle up
        </h2>
        {!transactions.length ? (
          <p className="text-sm text-muted-foreground">
            Everyone&apos;s settled up.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tx.fromName}</span>
                  <ArrowRightIcon className="size-4 text-muted-foreground" />
                  <span className="font-medium">{tx.toName}</span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(tx.amount, settleCurrency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
