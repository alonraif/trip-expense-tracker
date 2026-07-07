-- Zoom multiplier on top of the "cover fit" baseline (1 = no zoom).
alter table trips add column cover_scale numeric(4, 2) not null default 1;
