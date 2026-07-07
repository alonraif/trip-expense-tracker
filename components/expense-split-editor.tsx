'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';

type Member = { id: string; name: string };
export type Split = { memberId: string; amount: number };

function evenSplit(memberIds: string[], total: number): Record<string, string> {
  if (memberIds.length === 0) return {};
  const base = Math.floor((total / memberIds.length) * 100) / 100;
  const remainder = Math.round((total - base * memberIds.length) * 100) / 100;

  const result: Record<string, string> = {};
  memberIds.forEach((id, i) => {
    const value = i === 0 ? base + remainder : base;
    result[id] = value.toFixed(2);
  });
  return result;
}

export function ExpenseSplitEditor({
  members,
  amount,
  currency,
  initialSplits,
  onChange,
}: {
  members: Member[];
  amount: string;
  currency: string;
  initialSplits?: Split[] | null;
  onChange: (splits: Split[] | null) => void;
}) {
  const [mode, setMode] = useState<'even' | 'custom'>(
    initialSplits && initialSplits.length > 0 ? 'custom' : 'even'
  );
  const [included, setIncluded] = useState<Set<string>>(
    () =>
      new Set(
        initialSplits && initialSplits.length > 0
          ? initialSplits.map((s) => s.memberId)
          : members.map((m) => m.id)
      )
  );
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    if (initialSplits && initialSplits.length > 0) {
      return Object.fromEntries(
        initialSplits.map((s) => [s.memberId, s.amount.toFixed(2)])
      );
    }
    return evenSplit(
      members.map((m) => m.id),
      Number(amount) || 0
    );
  });

  const prevAmount = useRef(amount);

  const emit = (nextIncluded: Set<string>, nextAmounts: Record<string, string>) => {
    if (mode === 'even') {
      onChange(null);
      return;
    }
    onChange(
      [...nextIncluded].map((id) => ({
        memberId: id,
        amount: Number(nextAmounts[id]) || 0,
      }))
    );
  };

  useEffect(() => {
    // Sync initial state up to the parent on mount, so submitting without
    // touching the editor still sends the pre-filled custom split (or the
    // explicit "even" signal) rather than leaving the parent's default.
    emit(included, amounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== 'custom' || prevAmount.current === amount) {
      prevAmount.current = amount;
      return;
    }
    prevAmount.current = amount;
    const next = evenSplit([...included], Number(amount) || 0);
    setAmounts(next);
    emit(included, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, mode]);

  const switchMode = (nextMode: 'even' | 'custom') => {
    setMode(nextMode);
    if (nextMode === 'even') {
      onChange(null);
    } else {
      const allIds = members.map((m) => m.id);
      const nextAmounts = evenSplit(allIds, Number(amount) || 0);
      setIncluded(new Set(allIds));
      setAmounts(nextAmounts);
      onChange(
        allIds.map((id) => ({ memberId: id, amount: Number(nextAmounts[id]) }))
      );
    }
  };

  const toggleMember = (id: string) => {
    const nextIncluded = new Set(included);
    if (nextIncluded.has(id)) {
      nextIncluded.delete(id);
    } else {
      nextIncluded.add(id);
    }
    const nextAmounts = evenSplit([...nextIncluded], Number(amount) || 0);
    setIncluded(nextIncluded);
    setAmounts(nextAmounts);
    emit(nextIncluded, nextAmounts);
  };

  const updateAmount = (id: string, value: string) => {
    const nextAmounts = { ...amounts, [id]: value };
    setAmounts(nextAmounts);
    emit(included, nextAmounts);
  };

  const assigned = [...included].reduce(
    (sum, id) => sum + (Number(amounts[id]) || 0),
    0
  );
  const remaining = Math.round((Number(amount) - assigned) * 100) / 100;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'even' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchMode('even')}
        >
          Split evenly
        </Button>
        <Button
          type="button"
          variant={mode === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchMode('custom')}
        >
          Custom split
        </Button>
      </div>

      {mode === 'custom' && (
        <div className="space-y-2 rounded-lg border p-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={included.has(member.id)}
                onChange={() => toggleMember(member.id)}
                className="size-4 accent-primary"
                aria-label={`Include ${member.name}`}
              />
              <span className="flex-1 text-sm">{member.name}</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                disabled={!included.has(member.id)}
                value={included.has(member.id) ? (amounts[member.id] ?? '') : ''}
                onChange={(e) => updateAmount(member.id, e.target.value)}
                className="w-24"
              />
            </div>
          ))}
          <p
            className={cn(
              'text-right text-xs',
              Math.abs(remaining) > 0.01
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            Remaining: {formatCurrency(remaining, currency)}
          </p>
        </div>
      )}
    </div>
  );
}
