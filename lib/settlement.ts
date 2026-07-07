export type SettlementMember = {
  id: string;
  name: string;
};

export type SettlementSplit = {
  memberId: string;
  amount: number;
};

export type SettlementExpense = {
  payerId: string;
  amount: number;
  // Present = custom split for this expense; absent/empty = split evenly
  // across all members.
  splits?: SettlementSplit[];
};

export type Balance = {
  memberId: string;
  name: string;
  paid: number;
  share: number;
  net: number; // positive = owed money, negative = owes money
};

export type Transaction = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeBalances(
  members: SettlementMember[],
  expenses: SettlementExpense[]
): Balance[] {
  const paidByMember = new Map<string, number>(members.map((m) => [m.id, 0]));
  const owedByMember = new Map<string, number>(members.map((m) => [m.id, 0]));

  for (const e of expenses) {
    paidByMember.set(e.payerId, (paidByMember.get(e.payerId) ?? 0) + e.amount);

    if (e.splits && e.splits.length > 0) {
      for (const s of e.splits) {
        owedByMember.set(s.memberId, (owedByMember.get(s.memberId) ?? 0) + s.amount);
      }
    } else {
      const share = members.length > 0 ? e.amount / members.length : 0;
      for (const m of members) {
        owedByMember.set(m.id, (owedByMember.get(m.id) ?? 0) + share);
      }
    }
  }

  return members.map((m) => {
    const paid = round2(paidByMember.get(m.id) ?? 0);
    const share = round2(owedByMember.get(m.id) ?? 0);
    return {
      memberId: m.id,
      name: m.name,
      paid,
      share,
      net: round2(paid - share),
    };
  });
}

export function simplifyDebts(balances: Balance[]): Transaction[] {
  const creditors = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ id: b.memberId, name: b.name, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ id: b.memberId, name: b.name, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = round2(Math.min(debtor.amount, creditor.amount));

    if (amount > 0.01) {
      transactions.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount,
      });
    }

    debtor.amount = round2(debtor.amount - amount);
    creditor.amount = round2(creditor.amount - amount);

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return transactions;
}
