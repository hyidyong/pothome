-- Align the public resume labels with the issued course certificates.
update public.experience_entries
set
  title = '(재)대구디지털혁신진흥원 바이브코딩 초급 교육 과정 수료',
  period_label = '2026년 6월 9일 ~ 10일',
  summary = '바이브코딩 초급 교육 과정을 수료했습니다.',
  updated_at = now()
where slug = 'ai-coding-course';

update public.experience_entries
set
  title = '(재)대구디지털혁신진흥원 바이브코딩 중급 교육 과정 수료',
  period_label = '2026년 6월 16일 ~ 17일',
  summary = '바이브코딩 중급 교육 과정을 수료했습니다.',
  updated_at = now()
where slug = 'vibecoding-intermediate';

update public.experience_entries
set
  period_label = '2023년 9월 6일 ~ 22일',
  updated_at = now()
where slug = 'digital-marketer-nia';
