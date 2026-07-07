-- An expense with no rows here means "split evenly across all current
-- trip members" (computed on the fly). Rows only exist when a custom
-- split was chosen. Amounts are in the trip's currency, matching
-- expenses.amount, converted at read time using that expense's fx_rate.
create table expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references trip_members(id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index expense_splits_expense_id_idx on expense_splits(expense_id);

alter table expense_splits enable row level security;

create policy "authenticated_all_expense_splits" on expense_splits
  for all
  to authenticated
  using (true)
  with check (true);
