import { listReviewsForModeration } from "@/services/review.service";
import { StarRating } from "@/components/StarRating";
import { ReviewModerationButtons } from "@/components/admin/ReviewModerationButtons";
import { guardPage } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await guardPage("reviews.moderate");
  const reviews = await listReviewsForModeration();
  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Avis clients</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {pendingCount} en attente de modération · {reviews.length} au total
      </p>

      {reviews.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Aucun avis pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-brand-navy">{r.productName}</p>
                  <p className="text-xs text-neutral-400">
                    {r.customerName} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span
                  className={
                    r.isApproved
                      ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                      : "rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-orange"
                  }
                >
                  {r.isApproved ? "Publié" : "En attente"}
                </span>
              </div>
              <div className="mt-2">
                <StarRating value={r.rating} />
              </div>
              {r.comment ? (
                <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">{r.comment}</p>
              ) : null}
              <div className="mt-3">
                <ReviewModerationButtons reviewId={r.id} isApproved={r.isApproved} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
