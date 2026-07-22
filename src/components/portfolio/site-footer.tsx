import Link from "next/link";
import { CodeIcon, MailIcon, PhoneIcon } from "lucide-react";

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
        <address className="site-footer__contact" aria-label="연락처">
          <a href="https://github.com/hyidyong" rel="noreferrer" target="_blank">
            <CodeIcon aria-hidden="true" />
            <span>github.com/hyidyong</span>
          </a>
          <a href="mailto:dudn4291@naver.com">
            <MailIcon aria-hidden="true" />
            <span>dudn4291@naver.com</span>
          </a>
          <a href="tel:01080286655">
            <PhoneIcon aria-hidden="true" />
            <span>010-8028-6655</span>
          </a>
        </address>
        <Link
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "site-footer__cta",
          )}
          href="/work/global-technical-talent-strategy"
        >
          대표 프로젝트 보기
        </Link>
        <Link className="site-footer__admin-link" href="/admin" aria-label="관리자 페이지 열기">
          관리
        </Link>
      </div>
    </footer>
  );
}
