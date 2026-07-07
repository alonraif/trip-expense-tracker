-- Trip cover photos. Unlike receipts (financial data), cover photos are
-- low-sensitivity travel pics, so this bucket is public to avoid needing
-- signed-URL plumbing everywhere a cover is displayed.

alter table trips add column cover_url text;

insert into storage.buckets (id, name, public)
values ('trip-covers', 'trip-covers', true)
on conflict (id) do nothing;

create policy "authenticated_write_trip_covers" on storage.objects
  for all
  to authenticated
  using (bucket_id = 'trip-covers')
  with check (bucket_id = 'trip-covers');

create policy "public_read_trip_covers" on storage.objects
  for select
  to anon
  using (bucket_id = 'trip-covers');
