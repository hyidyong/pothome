grant select, insert on table public.review_comments to anon, authenticated;
grant insert on table public.review_comment_likes to anon, authenticated;

drop policy if exists "public can read published review comments" on public.review_comments;
create policy "public can read published review comments"
on public.review_comments for select to anon, authenticated
using (published is true);

drop policy if exists "public can add review comments" on public.review_comments;
create policy "public can add review comments"
on public.review_comments for insert to anon, authenticated
with check (published is true);

drop policy if exists "public can add one review like" on public.review_comment_likes;
create policy "public can add one review like"
on public.review_comment_likes for insert to anon, authenticated
with check (true);

create or replace function public.bump_review_comment_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.review_comments
  set like_count = like_count + 1
  where id = new.comment_id;
  return new;
end;
$$;

revoke all on function public.bump_review_comment_like_count() from public;

drop trigger if exists review_comment_like_count_trigger on public.review_comment_likes;
create trigger review_comment_like_count_trigger
after insert on public.review_comment_likes
for each row execute function public.bump_review_comment_like_count();

insert into public.review_comments (author_name, body, rating, like_count, created_at)
select seed.author_name, seed.body, seed.rating, seed.like_count, seed.created_at
from (
  values
    ('AI 하계 몰입 프로그램 팀원', '15일 동안 정말 고생 많으셨습니다!! 처음 프로젝트를 시작했을 때 여러 사정으로 팀원들이 나가고 결국 둘만 남게 됐을 때 많이 막막했는데, 끝까지 포기하지 않고 프로젝트를 이끌어주신 덕분에 저도 끝까지 해낼 수 있었습니다. AI를 처음 접하는 저에게 바쁜 와중에도 하나하나 친절하게 알려주시고 방향을 잡아주셔서 정말 많이 배웠습니다. 최우수상도 팀원님이 중심을 잘 잡아주신 덕분이라고 생각합니다. 어려운 상황에서도 함께 고민하고 프로젝트를 완성해 간 과정이 오래 기억에 남을 것 같아요.', 5, 0, timestamptz '2026-07-22 15:04:51.222029+00'),
    ('책사연 수업 팀원', '금요일 쿠키 잘 받았습니다. 거래처 조사로 정신이 없어 인사가 늦었네요. 작은 선물에 큰 정성, 정말 감동했어요. 매사 이렇게 완벽하고 남을 위한 깊은 배려심이 많아서 사회에 나가면 어디서든 인정받고 사랑받을 거라고 생각합니다. 항상 고마워요.', 5, 0, timestamptz '2026-07-22 15:04:51.410527+00'),
    ('YLC 인사팀장', '여러모로 많이 도와주시고 신경 써주셔서 큰 문제 없이 활동을 마칠 수 있었습니다. 항상 제일 먼저 답해주시고 제가 놓친 부분도 말씀해주셔서, 희정님이 저보다 더 인사팀장 역할을 잘하셨겠다는 생각도 했어요. 앞으로 하시는 일, 원하시는 일 모두 잘되길 진심으로 응원합니다. 제일 짱짱은 희정님이에요.', 5, 0, timestamptz '2026-07-22 15:04:51.570522+00'),
    ('책사연 수업 팀원', '쿠키도 편지도 정말 감사했어요. 따뜻하면서도 철저하게 팀을 잘 이끌어주시고, 작은 일에도 우리 팀 최고라고 해주시는 모습이 기억에 남습니다. 열정도 넘치시고 팀원들을 잘 챙겨주셔서 늘 든든했어요. 나중에 꼭 한자리 하실 거라고 장담합니다.', 5, 0, timestamptz '2026-07-22 15:04:51.722551+00'),
    ('비전프러너 멘토', '캠프 동안 조원분들을 잘 이끌어주셔서 정말 든든했습니다. PBL 결과가 나온 뒤에도 피드백을 요청하고 끝까지 열정적으로 참여해주신 점이 인상 깊었어요. 궁금한 점이 생기면 언제든 편하게 연락 주세요. 희정님 꼭 성공하실 겁니다.', 5, 0, timestamptz '2026-07-22 15:04:51.890368+00'),
    ('한경협 퓨처리더스 캠프 팀원', '우리 리더 희정 팀장님, 2박 3일 동안 덕분에 많이 웃고 즐겁게 보냈어요. 힘들었을 텐데 묵묵히 팀을 마지막까지 잘 이끌어줘서 정말 고마웠습니다. 발표 연습할 때 앞에서 상황극 하던 모습까지 기억에 남아요. 밝고 유쾌한 에너지로 더 높이 올라가길 멀리서 응원할게요.', 5, 0, timestamptz '2026-07-22 15:04:52.027573+00'),
    ('YLC 후배', '한 학기 동안 정말 감사했습니다. 같은 학교 후배라는 이유로 먼저 다가와 항상 챙겨주셔서 동아리 활동이 훨씬 편하고 즐거웠어요. 저도 나중에 후배가 생긴다면 선배님처럼 먼저 챙겨주는 사람이 되고 싶다는 생각이 들었습니다.', 5, 2, timestamptz '2026-07-22 15:04:52.184103+00')
) as seed(author_name, body, rating, like_count, created_at)
where not exists (select 1 from public.review_comments);
