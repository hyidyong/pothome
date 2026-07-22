import { ReviewBoard } from "@/components/portfolio/review-board";
import { SiteHeader } from "@/components/site-header";
import { getReviewComments } from "@/lib/review-board/repository";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const comments = await getReviewComments().catch(() => []);
  return <div className="content-page"><SiteHeader /><main id="main-content" tabIndex={-1}><ReviewBoard initialComments={comments} /></main></div>;
}
