import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import {
  getMyReviewStatus,
  getProductRatingStats,
  getProductReviews,
} from "@/services/review.service";

export async function ReviewsSection({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [reviews, stats, status] = await Promise.all([
    getProductReviews(productId),
    getProductRatingStats(productId),
    getMyReviewStatus(productId),
  ]);

  return (
    <section className="mt-12 border-t border-neutral-100 pt-8" aria-labelledby="avis">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="avis" className="text-xl font-bold text-brand-navy">
          Avis clients
        </h2>
        {stats.averageRating != null ? (
          <span className="flex items-center gap-2 text-sm text-neutral-500">
            <StarRating value={stats.averageRating} />
            {stats.averageRating.toFixed(1)} / 5 · {stats.reviewCount} avis
          </span>
        ) : null}
      </div>

      <div className="mt-4 max-w-xl">
        {status === "CAN_REVIEW" ? (
          <ReviewForm productId={productId} productSlug={productSlug} />
        ) : status === "PENDING" ? (
          <p className="text-sm text-neutral-500">Votre avis est en cours de vérification.</p>
        ) : status === "REVIEWED" ? (
          <p className="text-sm text-neutral-500">Merci, votre avis est publié.</p>
        ) : status === "ANONYMOUS" ? (
          <p className="text-sm text-neutral-500">
            <Link href="/login" className="font-semibold text-brand-navy underline">
              Connectez-vous
            </Link>{" "}
            pour donner votre avis après achat.
          </p>
        ) : (
          <p className="text-sm text-neutral-500">
            Seuls les clients ayant reçu ce produit peuvent laisser un avis.
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Aucun avis pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2">
                <StarRating value={r.rating} />
                <span className="text-sm font-semibold text-brand-navy">{r.reviewerName}</span>
                <span className="text-xs text-neutral-400">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {r.comment ? (
                <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">{r.comment}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
