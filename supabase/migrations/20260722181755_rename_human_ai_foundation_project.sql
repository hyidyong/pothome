update public.experience_entries
set
  title = '첨단산업 인재양성 AI 부트캠프 Human AI Foundation 프로젝트 — 최우수상(1위)',
  organization = '첨단산업 인재양성 AI 부트캠프 Human AI Foundation'
where slug = 'substudy-product-project-2026';

grant select on table public.press_releases to anon, authenticated;

drop policy if exists "public can read press releases" on public.press_releases;
create policy "public can read press releases"
on public.press_releases
for select
to anon, authenticated
using (true);

insert into public.press_releases (publisher, headline, summary, published_on, external_url)
select seed.publisher, seed.headline, seed.summary, seed.published_on, seed.external_url
from (
  values
    ('이데일리', '한경협·현대차, 대학생 기업가정신 캠프 개최…미래 모빌리티 인재 키운다', '한경협과 현대차가 함께한 비전프러너 캠프의 현장과 미래 모빌리티 인재 양성 활동을 다룬 기사입니다.', date '2026-06-29', 'https://news.nate.com/view/20260629n18422'),
    ('리얼푸드', '터미널 에스프레소 하우스, 한국경제인협회 ‘퓨처 리더스’ 행사 성료', '2026 퓨처리더스 캠프 후속 네트워킹 현장을 소개한 기사입니다.', date '2026-02-27', 'https://www.realfoods.co.kr/article/10684688'),
    ('이투데이', '한경협, 2026 퓨처리더스 캠프 개최…전국 영리더 150명 참여', '2026 퓨처리더스 캠프의 참가와 기업가정신 프로그램을 다룬 기사입니다.', date '2026-02-01', 'https://www.etoday.co.kr/news/view/2550490')
) as seed(publisher, headline, summary, published_on, external_url)
where not exists (
  select 1 from public.press_releases existing where existing.external_url = seed.external_url
);
