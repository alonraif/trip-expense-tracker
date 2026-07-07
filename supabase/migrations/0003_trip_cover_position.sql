-- Stores where within the frame the cover photo should be anchored
-- (CSS object-position percentages), so the original photo is kept
-- untouched and repositioning doesn't require re-uploading.

alter table trips add column cover_position_x numeric(5, 2) not null default 50;
alter table trips add column cover_position_y numeric(5, 2) not null default 50;
