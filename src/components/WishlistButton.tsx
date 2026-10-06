"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlistItem } from "@/app/actions/wishlist.actions";

function HeartIcon({ filled, ...props }: { filled: boolean } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path
        d="M12 20.5s-7.5-4.6-10-9.2C.4 7.8 2.3 4.5 5.7 4.5c2 0 3.5 1 6.3 4 2.8-3 4.3-4 6.3-4 3.4 0 5.3 3.3 3.7 6.8-2.5 4.6-10 9.2-10 9.2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistButton({
  productId,
  initialIsFavorite,
  variant = "icon",
}: {
  productId: string;
  initialIsFavorite: boolean;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    const next = !isFavorite;
    setIsFavorite(next); // optimiste

    startTransition(async () => {
      const result = await toggleWishlistItem(productId);
      if (!result.success) {
        setIsFavorite(!next); // on annule si ça échoue
        if (result.error.includes("Connectez-vous")) {
          router.push("/login");
        } else {
          setError(result.error);
        }
      }
    });
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
          isFavorite
            ? "border-brand-red bg-brand-red/10 text-brand-red"
            : "border-neutral-200 text-brand-navy hover:border-brand-red"
        }`}
      >
        <HeartIcon filled={isFavorite} className="h-4 w-4" />
        {isFavorite ? "Dans vos favoris" : "Ajouter aux favoris"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={error ?? undefined}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors disabled:opacity-60 ${
        isFavorite ? "text-brand-red" : "text-neutral-400 hover:text-brand-red"
      }`}
    >
      <HeartIcon filled={isFavorite} className="h-4.5 w-4.5" />
    </button>
  );
}
