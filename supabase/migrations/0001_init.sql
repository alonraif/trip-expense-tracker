-- Trips, members, and expenses for the shared family trip tracker.
-- Auth model is a single shared login for the whole family, so RLS only
-- needs to gate "authenticated" vs "anonymous" — no per-row ownership.

create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  payer_id uuid not null references trip_members(id) on delete restrict,
  description text not null,
  amount numeric(10, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  receipt_url text,
  created_at timestamptz not null default now()
);

create index expenses_trip_id_idx on expenses(trip_id);
create index trip_members_trip_id_idx on trip_members(trip_id);

-- Row Level Security: deny anon entirely, allow all operations for
-- authenticated requests (the single shared login).
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table expenses enable row level security;

create policy "authenticated_all_trips" on trips
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_trip_members" on trip_members
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_expenses" on expenses
  for all
  to authenticated
  using (true)
  with check (true);

-- Storage bucket for receipt images. Kept non-public: a public bucket is
-- served directly by the CDN with no RLS check, which would leak receipt
-- images to anyone with the URL. Access goes through signed URLs instead.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "authenticated_all_receipts" on storage.objects
  for all
  to authenticated
  using (bucket_id = 'receipts')
  with check (bucket_id = 'receipts');
