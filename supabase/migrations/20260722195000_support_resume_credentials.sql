alter table public.experience_entries
  drop constraint if exists experience_entries_section_check,
  add constraint experience_entries_section_check
    check (section in ('timeline', 'training', 'credential')),
  drop constraint if exists experience_entries_entry_kind_check,
  add constraint experience_entries_entry_kind_check
    check (entry_kind in ('work', 'project', 'activity', 'award', 'education', 'training', 'credential')),
  drop constraint if exists experience_entries_section_shape_check,
  add constraint experience_entries_section_shape_check check (
    (section = 'timeline' and display_year is not null and entry_kind not in ('training', 'credential'))
    or (section = 'training' and display_year is null and entry_kind in ('training', 'education'))
    or (section = 'credential' and display_year is null and entry_kind = 'credential')
  );
