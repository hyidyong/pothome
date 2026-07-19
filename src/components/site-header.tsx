"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const destinations = [
  { label: "Work", href: "#work" },
  { label: "Decision Spine", href: "#decision-spine" },
  { label: "About", href: "#about" },
  { label: "Resume", href: "/resume" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-header__skip-link" href="#main-content">
        본문으로 건너뛰기
      </Link>
      <div className="site-header__inner">
        <Link
          className="site-header__wordmark"
          href="/"
          aria-label="홈: JY Strategy Planner"
        >
          <span aria-hidden="true" className="site-header__signal" />
          <span>JY · Strategy Planner</span>
        </Link>

        <nav className="site-header__desktop-nav" aria-label="주요 탐색">
          {destinations.map((destination) =>
            destination.label === "Resume" ? (
              <Link
                key={destination.href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                href={destination.href}
              >
                {destination.label}
              </Link>
            ) : (
              <Link key={destination.href} href={destination.href}>
                {destination.label}
              </Link>
            ),
          )}
        </nav>

        <div className="site-header__mobile-menu">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="메뉴 열기" />
              }
            >
              <MenuIcon data-icon="inline-start" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>포트폴리오 메뉴</SheetTitle>
                <SheetDescription>
                  작업, 판단 방법론, 소개와 공개 이력서로 이동합니다.
                </SheetDescription>
              </SheetHeader>
              <nav
                className="site-header__sheet-nav"
                aria-label="모바일 주요 탐색"
              >
                {destinations.map((destination) => (
                  <Link key={destination.href} href={destination.href}>
                    {destination.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
