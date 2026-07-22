import { spawn } from "node:child_process";

const selectedAssets = [
  ["REWORK", "file.svg"],
  ["REWORK", "research-war-room-desktop.png"],
  ["work-home", "image14.png"],
  ["work-home", "image17.png"],
  ["work-home", "image37.jpg"],
  ["work-home", "image38.jpg"],
  ["ylc 자료", "YLC_사유서_자동생성폼.png"],
  ["공유캠 첫 해커톤 자료", "KakaoTalk_20260705_001712915.jpg"],
  ["대외 활동 지원 관련 자료", "화면 캡처 2026-02-18 150546.png"],
  ["미래내일", "KakaoTalk_20260506_103220579.jpg"],
  ["미래내일", "계명대 경영학 소속 신진교 교수님 자문 요청 메일.png"],
  ["미래내일", "신진교 교수님 인터뷰 완료 인증.png"],
  ["미래내일", "엔디비아 자문요청 메일.png"],
  ["미래내일", "인텔 이메일 알아내려고 한 짓.png"],
  ["미래내일", "인텔 커뮤니티 등록.png"],
  ["미래내일", "표준협회 자문 답장.png"],
  ["미래내일", "표준협회 자문 요청 메일.png"],
  ["청년창업위원회 활동", "모두의 창업 지원 내용.jpg"],
  ["피토리", "1.png"],
  ["피토리", "2-1.png"],
  ["피토리", "2.png"],
  ["피토리", "4.png"],
  ["피토리", "5.png"],
  ["피토리", "6.png"],
  ["피토리", "7.png"],
  ["피토리", "KakaoTalk_20260323_045033251.png"],
  ["피토리", "Please enter a title..png"],
  ["피토리", "화면 캡처 2026-03-23 044054.png"],
  ["피토리", "화면 캡처 2026-03-23 044314.png"],
  ["피토리", "화면 캡처 2026-03-23 044439.png"],
  ["피토리", "화면 캡처 2026-03-23 044818.png"],
  ["피토리", "화면 캡처 2026-03-23 045323.png"],
  ["피토리", "화면 캡처 2026-03-23 045509.png"],
  ["피토리", "화면 캡처 2026-03-23 045525.png"],
  ["피토리", "화면 캡처 2026-03-23 045558.png"],
];

const quote = (value) => `'${value.replaceAll("'", "''")}'`;
const values = selectedAssets
  .map(([sourceGroup, fileName]) => `(${quote(sourceGroup)}, ${quote(fileName)})`)
  .join(", ");
const query = `
  update public.asset_picker_assets
  set decision = 'selected', decision_updated_at = now()
  where (source_group, file_name) in (values ${values});
  select count(*) from public.asset_picker_assets where decision = 'selected';
`;

const child = spawn("docker", [
  "exec",
  "-i",
  process.env.SUPABASE_LOCAL_DB_CONTAINER ?? "supabase_db_work-home",
  "psql",
  "-v",
  "ON_ERROR_STOP=1",
  "-U",
  "postgres",
  "-d",
  "postgres",
]);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.stdin.end(query);
child.on("close", (code) => process.exit(code ?? 1));
