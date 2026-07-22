-- Gallery categories are public-facing labels only; asset files remain private.
alter table public.asset_picker_assets
  drop constraint if exists asset_picker_assets_gallery_category_check;

update public.asset_picker_assets
set gallery_category = case
  when gallery_category = 'field' then 'field'
  when gallery_category in ('strategy', 'execution', 'product') then 'result'
  else 'result'
end;

alter table public.asset_picker_assets
  alter column gallery_category set default 'result',
  add constraint asset_picker_assets_gallery_category_check
    check (gallery_category in ('field', 'result', 'credential'));
