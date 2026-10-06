"use server";

import { requireStaff } from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import {
  deleteReview,
  setReviewApproval,
  submitReview,
} from "@/services/review.service";

type Result = { success: true } | { success: false; error: string };

function fail(err: unknown): Result {
  return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
}

export async function createReview(
  productId: string,
  productSlug: string,
  rating: number,
  comment: string
): Promise<Result> {
  try {
    await submitReview({ productId, rating, comment });
    revalidatePath(`/products/${productSlug}`);
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}

export async function moderateReview(reviewId: string, approved: boolean): Promise<Result> {
  try {
    await requireStaff();
    await setReviewApproval(reviewId, approved);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}

export async function removeReview(reviewId: string): Promise<Result> {
  try {
    await requireStaff();
    await deleteReview(reviewId);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}
