import { createClient } from "@/lib/supabase/server";

export type ReviewStatus =
  | "ANONYMOUS"
  | "NOT_PURCHASED"
  | "CAN_REVIEW"
  | "PENDING"
  | "REVIEWED";

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
}

export interface ReviewStats {
  averageRating: number | null;
  reviewCount: number;
}

// Les fonctions SQL ne sont pas dans les types générés : on déclare un appel
// RPC minimal et explicite.
type Rpc = (
  fn: string,
  args: Record<string, unknown>
) => Promise<{ data: unknown; error: { message: string } | null }>;

async function rpc(): Promise<Rpc> {
  const supabase = await createClient();
  return ((fn, args) =>
    (supabase as unknown as { rpc: Rpc }).rpc(fn, args)) as Rpc;
}

export async function getProductReviews(productId: string): Promise<PublicReview[]> {
  const call = await rpc();
  const { data, error } = await call("get_product_reviews", { p_product_id: productId });
  if (error) return [];
  return ((data as Array<Record<string, unknown>>) ?? []).map((r) => ({
    id: r.id as string,
    rating: Number(r.rating),
    comment: (r.comment as string | null) ?? null,
    createdAt: r.created_at as string,
    reviewerName: r.reviewer_name as string,
  }));
}

export async function getProductRatingStats(productId: string): Promise<ReviewStats> {
  const call = await rpc();
  const { data, error } = await call("get_product_rating_stats", { p_product_id: productId });
  const row = (data as Array<Record<string, unknown>> | null)?.[0];
  if (error || !row) return { averageRating: null, reviewCount: 0 };
  return {
    averageRating: row.average_rating != null ? Number(row.average_rating) : null,
    reviewCount: Number(row.review_count ?? 0),
  };
}

export async function getMyReviewStatus(productId: string): Promise<ReviewStatus> {
  const call = await rpc();
  const { data, error } = await call("get_my_review_status", { p_product_id: productId });
  if (error || typeof data !== "string") return "ANONYMOUS";
  return data as ReviewStatus;
}

export async function submitReview(input: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<void> {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("La note doit être comprise entre 1 et 5.");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Connectez-vous pour laisser un avis.");

  const table = supabase.from("reviews") as unknown as {
    insert: (row: Record<string, unknown>) => Promise<{ error: { message: string; code?: string } | null }>;
  };
  const { error } = await table.insert({
    product_id: input.productId,
    customer_id: user.id,
    rating: input.rating,
    comment: input.comment.trim() || null,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Vous avez déjà donné votre avis sur ce produit.");
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------- Admin
export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  productName: string;
  productSlug: string;
  customerName: string;
}

export async function listReviewsForModeration(): Promise<AdminReview[]> {
  const supabase = await createClient();
  const builder = supabase.from("reviews") as unknown as {
    select: (cols: string) => {
      order: (c: string, o: { ascending: boolean }) => Promise<{
        data: Array<Record<string, unknown>> | null;
        error: { message: string } | null;
      }>;
    };
  };
  const { data, error } = await builder
    .select(
      "id, rating, comment, is_approved, created_at, product:products(name, slug), customer:profiles(first_name, last_name)"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Impossible de charger les avis : ${error.message}`);

  return (data ?? []).map((r) => {
    const product = r.product as { name: string; slug: string } | null;
    const customer = r.customer as { first_name: string | null; last_name: string | null } | null;
    return {
      id: r.id as string,
      rating: Number(r.rating),
      comment: (r.comment as string | null) ?? null,
      isApproved: Boolean(r.is_approved),
      createdAt: r.created_at as string,
      productName: product?.name ?? "Produit supprimé",
      productSlug: product?.slug ?? "",
      customerName:
        [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "Client",
    };
  });
}

export async function setReviewApproval(reviewId: string, approved: boolean): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("reviews") as unknown as {
    update: (v: Record<string, unknown>) => {
      eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const { error } = await table.update({ is_approved: approved }).eq("id", reviewId);
  if (error) throw new Error(error.message);
}

export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("reviews") as unknown as {
    delete: () => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
  };
  const { error } = await table.delete().eq("id", reviewId);
  if (error) throw new Error(error.message);
}
