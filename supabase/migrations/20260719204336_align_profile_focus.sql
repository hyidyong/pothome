alter table public.site_profile
  add column profile_focus jsonb;

update public.site_profile
set profile_focus = case
  when slug = 'strategy-portfolio' then
    '[
      {"role": "전략기획", "percentage": 65},
      {"role": "HR", "percentage": 20},
      {"role": "PM", "percentage": 15}
    ]'::jsonb
  else jsonb_build_array(
    jsonb_build_object('role', role_focus, 'percentage', 100)
  )
end;

alter table public.site_profile
  alter column profile_focus set not null,
  add constraint site_profile_profile_focus_array_check check (
    jsonb_typeof(profile_focus) = 'array'
    and jsonb_array_length(profile_focus) > 0
  ),
  drop constraint site_profile_role_focus_not_blank_check,
  drop column role_focus;

update public.case_study_metrics as metrics
set label = '개 기업'
from public.case_studies as cases
where cases.id = metrics.case_study_id
  and cases.slug = 'global-technical-talent-strategy'
  and metrics.value_text = '21';

update public.case_study_sections as sections
set body = '21개 기업과 유효 후보자 38명의 응답을 별도 표본으로 검토하고 13개국의 후보자 범위를 함께 기록했습니다.'
from public.case_studies as cases
where cases.id = sections.case_study_id
  and cases.slug = 'global-technical-talent-strategy'
  and sections.kind = 'evidence';
