"use client";

import { useState, useTransition } from "react";
import { createReview } from "@/app/actions/review.actions";

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="rounded-xl bg-brand-surface p-4 text-sm text-brand-navy">
        Merci ! Votre avis sera publié après vérification par notre équipe.
      </p>
    );
  }

  return (
    <form
      className="rounded-xl border border-neutral-100 bg-brand-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (rating === 0) {
          setError("Choisissez une note.");
          return;
        }
        setError(null);
        startTransition(async () => {
          const res = await createReview(productId, productSlug, rating, comment);
          if (res.success) setDone(true);
          else setError(res.error);
        });
      }}
    >
      <p className="text-sm font-semibold text-brand-navy">Donnez votre avis</p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-brand-orange" : "text-neutral-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Votre commentaire (facultatif)"
        className="mt-3 w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm"
      />
      {error ? <p className="mt-2 text-sm text-brand-red">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-brand-gradient mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Publier mon avis"}
      </button>
    </form>
  );
}
