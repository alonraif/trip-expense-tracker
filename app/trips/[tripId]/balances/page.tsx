import { ArrowRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { computeBalances, simplifyDebts } from '@/lib/settlement';

export default async function BalancesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [{ data: members }, { data: expenses }] = await Promise.all([
    supabase
      .from('trip_members')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
    supabase.from('expenses').select('payer_id, amount').eq('trip_id', tripId),
  ]);

  if (!members?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Add trip members to see balances.
      </p>
    );
  }

  const balances = computeBalances(
    members,
    (expenses ?? []).map((e) => ({ payerId: e.payer_id, amount: e.amount }))
  );
  const transactions = simplifyDebts(balances);

  return (
    <div className="flex flex-col gap-6">
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
                {balance.net > 0 ? '+' : balance.net < 0 ? '-' : ''}$
                {Math.abs(balance.net).toFixed(2)}
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
                <span className="font-semibold">${tx.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
