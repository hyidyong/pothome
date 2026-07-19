import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <h2>다음 움직임을, 근거에서 시작합니다.</h2>
      <div className="site-footer__aside">
        <p>
          전략기획을 중심으로 HR과 PM의 실행 문제까지 연결하는 문제
          해결자입니다.
        </p>
        <Link
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "site-footer__cta",
          )}
          href="/work/global-technical-talent-strategy"
        >
          대표 프로젝트 보기
        </Link>
      </div>
    </footer>
  );
}
