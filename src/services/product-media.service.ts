import { createClient } from "@/lib/supabase/server";

export const MAX_MEDIA_PER_PRODUCT = 7;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 Mo

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const BUCKET = "product-media";

export interface ProductMediaItem {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  sortOrder: number;
  storagePath: string | null;
}

export function detectMediaType(mimeType: string): "IMAGE" | "VIDEO" | null {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return "IMAGE";
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return "VIDEO";
  return null;
}

export function validateMediaFile(file: File): string | null {
  const mediaType = detectMediaType(file.type);
  if (!mediaType) {
    return `Format non supporté pour "${file.name}" — photos JPG/PNG/WebP/GIF ou vidéos MP4/WebM/MOV uniquement.`;
  }
  const maxSize = mediaType === "IMAGE" ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return `"${file.name}" dépasse la taille maximale (${maxMb} Mo).`;
  }
  return null;
}

export async function listProductMedia(productId: string): Promise<ProductMediaItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, media_type, sort_order, storage_path")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .returns<
      { id: string; url: string; media_type: "IMAGE" | "VIDEO"; sort_order: number; storage_path: string | null }[]
    >();

  if (error) {
    throw new Error(`Impossible de charger les médias : ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    mediaType: row.media_type,
    sortOrder: row.sort_order,
    storagePath: row.storage_path,
  }));
}

/**
 * Upload une liste de fichiers (photos et/ou vidéo) vers le bucket
 * `product-media` et crée les lignes `product_images` correspondantes.
 * Revalide côté serveur le nombre maximum (7) et les types/tailles — ne
 * fait jamais confiance à la validation côté client seule.
 */
export async function uploadProductMedia(
  productId: string,
  files: File[]
): Promise<{ uploaded: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];

  const existing = await listProductMedia(productId);
  const availableSlots = MAX_MEDIA_PER_PRODUCT - existing.length;

  if (availableSlots <= 0) {
    return {
      uploaded: 0,
      errors: [`Ce produit a déjà ${MAX_MEDIA_PER_PRODUCT} médias — le maximum autorisé.`],
    };
  }

  const filesToProcess = files.slice(0, availableSlots);
  if (files.length > availableSlots) {
    errors.push(
      `Seuls ${availableSlots} fichier(s) supplémentaire(s) accepté(s) (maximum ${MAX_MEDIA_PER_PRODUCT} médias par produit).`
    );
  }

  let nextSortOrder =
    existing.length > 0 ? Math.max(...existing.map((m) => m.sortOrder)) + 1 : 0;
  let uploaded = 0;

  for (const file of filesToProcess) {
    const validationError = validateMediaFile(file);
    if (validationError) {
      errors.push(validationError);
      continue;
    }
    const mediaType = detectMediaType(file.type)!;
    const extension = file.name.split(".").pop() || "bin";
    const path = `${productId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      errors.push(`Échec de l'envoi de "${file.name}" : ${uploadError.message}`);
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    interface ImagesInsertBuilder {
      insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }
    const table = supabase.from("product_images") as unknown as ImagesInsertBuilder;
    const { error: insertError } = await table.insert({
      product_id: productId,
      url: publicUrlData.publicUrl,
      media_type: mediaType,
      storage_path: path,
      sort_order: nextSortOrder,
    });

    if (insertError) {
      // Nettoyage : ne pas laisser un fichier orphelin dans le stockage.
      await supabase.storage.from(BUCKET).remove([path]);
      errors.push(`Échec de l'enregistrement de "${file.name}" : ${insertError.message}`);
      continue;
    }

    nextSortOrder += 1;
    uploaded += 1;
  }

  return { uploaded, errors };
}

export async function removeProductMedia(mediaId: string): Promise<void> {
  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle()
    .returns<{ storage_path: string | null }>();

  if (fetchError) {
    throw new Error(`Impossible de retrouver ce média : ${fetchError.message}`);
  }

  interface ImagesDeleteBuilder {
    delete: () => { eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }> };
  }
  const table = supabase.from("product_images") as unknown as ImagesDeleteBuilder;
  const { error: deleteError } = await table.delete().eq("id", mediaId);

  if (deleteError) {
    throw new Error(`Impossible de supprimer ce média : ${deleteError.message}`);
  }

  if (data?.storage_path) {
    await supabase.storage.from(BUCKET).remove([data.storage_path]);
  }
}
