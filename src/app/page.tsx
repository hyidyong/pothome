import type { Metadata } from "next";

import { HomePage } from "@/components/portfolio/home-page";
import { createPortfolioRepository } from "@/lib/portfolio/repository";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "손희정 | 전략기획 포트폴리오",
  description:
    "법학의 구조적 사고로 시장·사람·제품의 근거를 실행 가능한 전략으로 연결한 포트폴리오입니다.",
};

const repository = createPortfolioRepository();

export default async function Home() {
  const data = await repository.getHomePageData();

  return <HomePage data={data} />;
}
