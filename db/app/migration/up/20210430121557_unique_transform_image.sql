alter table transformation_image add taken_on date not null default now()::date;
update transformation_image set taken_on = created_at::date;

with photos as (
  select id,  row_number() over (partition by account_id, taken_on order by account_id, taken_on desc) as rn from transformation_image
)
delete from transformation_image where id in (select id from photos where rn != 1);

create unique index uq_transformation_image_account_date
	on transformation_image (account_id asc, taken_on desc);
