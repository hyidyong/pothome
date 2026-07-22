-- The team-lead activity and award describe one AI Solution Challenge program.
delete from public.experience_entries
where slug = 'ai-solution-team-lead-2025';

update public.experience_entries
set
  period_label = '2026년 1월',
  summary = 'AI Solution Challenge 단기 집중 과정에서 팀장으로 참여해 우수상을 받았습니다.',
  role = '팀장',
  display_order = 1
where slug = 'ai-solution-award-2026';

-- Sort learning records from the newest dated item to the oldest.
update public.experience_entries
set display_order = case slug
  when 'kdi-youth-economic-fiscal-camp-2026' then 20
  when 'human-ai-foundation' then 21
  when 'vision-pruner-hyundai-peb-2026' then 22
  when 'vibecoding-intermediate' then 23
  when 'ai-coding-course' then 24
  when 'dsac-data-scientist' then 25
  when 'adsp-preparation' then 26
  else display_order
end
where slug in (
  'kdi-youth-economic-fiscal-camp-2026',
  'human-ai-foundation',
  'vision-pruner-hyundai-peb-2026',
  'vibecoding-intermediate',
  'ai-coding-course',
  'dsac-data-scientist',
  'adsp-preparation'
);
