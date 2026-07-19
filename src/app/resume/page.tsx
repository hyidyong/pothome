import type { Metadata } from "next";

import { ResumePage } from "@/components/portfolio/resume-page";
import { createPortfolioRepository } from "@/lib/portfolio/repository";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "공개 이력 | 전략기획 포트폴리오",
  description: "전략기획, HR, PM과 연결된 공개 경험을 정리한 이력입니다.",
};

const repository = createPortfolioRepository();

export default async function ResumeRoute() {
  const data = await repository.getResumeData();

  return <ResumePage data={data} />;
}
