"use client";

import { useState, useTransition } from "react";
import { moderateReview, removeReview } from "@/app/actions/review.actions";

export function ReviewModerationButtons({
  reviewId,
  isApproved,
}: {
  reviewId: string;
  isApproved: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.success) setError(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={pending}
        onClick={() => run(() => moderateReview(reviewId, !isApproved))}
        className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-brand-navy disabled:opacity-60"
      >
        {isApproved ? "Masquer" : "Approuver"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Supprimer définitivement cet avis ?")) run(() => removeReview(reviewId));
        }}
        className="rounded-full px-3 py-1 text-xs font-semibold text-brand-red disabled:opacity-60"
      >
        Supprimer
      </button>
      {error ? <span className="text-xs text-brand-red">{error}</span> : null}
    </div>
  );
}
