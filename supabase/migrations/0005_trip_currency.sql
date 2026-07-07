alter table trips add column currency text not null default 'USD';
alter table trips add column settle_currency text not null default 'USD';

-- Computed once at expense-creation time using the historical FX rate for
-- that expense's date, then stored — not recomputed on every page view.
-- Null on pre-existing expenses; treated as equal to `amount` when read.
alter table expenses add column settle_amount numeric(10, 2);
alter table expenses add column fx_rate numeric(12, 6);
