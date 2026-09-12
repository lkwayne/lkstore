"use client";

import { useRef, useState, useTransition } from "react";
import {
  getProductMedia,
  uploadMedia,
  deleteMedia,
} from "@/app/actions/admin-media.actions";
import type { ProductMediaItem } from "@/services/product-media.service";

const MAX_MEDIA = 7;
const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

export interface StagedFile {
  file: File;
  previewUrl: string;
}

/**
 * Deux modes :
 * - productId fourni (édition) : upload immédiat vers Supabase Storage.
 * - productId absent (création) : fichiers mis en attente localement,
 *   remontés au parent via onStagedFilesChange pour upload une fois le
 *   produit créé (on n'a pas encore d'ID à ce stade).
 */
export function ProductMediaManager({
  productId,
  onStagedFilesChange,
}: {
  productId?: string;
  onStagedFilesChange?: (files: File[]) => void;
}) {
  const [existingMedia, setExistingMedia] = useState<ProductMediaItem[]>([]);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  if (productId && !hasLoaded) {
    setHasLoaded(true);
    getProductMedia(productId).then(setExistingMedia);
  }

  const totalCount = existingMedia.length + stagedFiles.length;
  const remainingSlots = MAX_MEDIA - totalCount;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErrors([]);
    const incoming = Array.from(fileList).slice(0, Math.max(0, remainingSlots));

    if (fileList.length > incoming.length) {
      setErrors([`Maximum ${MAX_MEDIA} médias par produit — certains fichiers ont été ignorés.`]);
    }

    if (productId) {
      const formData = new FormData();
      incoming.forEach((file) => formData.append("files", file));
      startTransition(async () => {
        const result = await uploadMedia(productId, formData);
        if (result.errors.length > 0) setErrors(result.errors);
        if (result.uploaded > 0) {
          const refreshed = await getProductMedia(productId);
          setExistingMedia(refreshed);
        }
      });
    } else {
      const newlyStaged = incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      const updated = [...stagedFiles, ...newlyStaged];
      setStagedFiles(updated);
      onStagedFilesChange?.(updated.map((s) => s.file));
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeStagedFile(index: number) {
    const updated = stagedFiles.filter((_, i) => i !== index);
    setStagedFiles(updated);
    onStagedFilesChange?.(updated.map((s) => s.file));
  }

  function handleDeleteExisting(mediaId: string) {
    if (!productId) return;
    setErrors([]);
    startTransition(async () => {
      const result = await deleteMedia(productId, mediaId);
      if (result.success) {
        setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
      } else if (result.error) {
        setErrors([result.error]);
      }
    });
  }

  return (
    <div>
      <p className="text-xs text-neutral-400">
        Jusqu&rsquo;à {MAX_MEDIA} médias — photos (JPG, PNG, WebP, GIF) et
        vidéos (MP4, WebM, MOV, 25 Mo max). {totalCount}/{MAX_MEDIA} utilisés.
      </p>

      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {existingMedia.map((media) => (
          <div
            key={media.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-brand-surface"
          >
            {media.mediaType === "VIDEO" ? (
              <video src={media.url} className="h-full w-full object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- aperçus dynamiques, next/image inutile ici
              <img src={media.url} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleDeleteExisting(media.id)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              aria-label="Supprimer ce média"
            >
              ×
            </button>
          </div>
        ))}

        {stagedFiles.map((staged, index) => (
          <div
            key={staged.previewUrl}
            className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-brand-orange bg-brand-surface"
          >
            {staged.file.type.startsWith("video/") ? (
              <video src={staged.previewUrl} className="h-full w-full object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={staged.previewUrl} alt="" className="h-full w-full object-cover" />
            )}
            <span className="absolute bottom-1 left-1 rounded bg-brand-orange px-1 text-[9px] font-semibold text-white">
              en attente
            </span>
            <button
              type="button"
              onClick={() => removeStagedFile(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Retirer ce fichier"
            >
              ×
            </button>
          </div>
        ))}

        {remainingSlots > 0 ? (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-brand-orange hover:text-brand-orange">
            <span className="text-xl leading-none">+</span>
            <span className="text-[10px]">Ajouter</span>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              disabled={isPending}
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
          </label>
        ) : null}
      </div>

      {errors.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {errors.map((err) => (
            <li key={err} className="text-xs text-brand-red">
              {err}
            </li>
          ))}
        </ul>
      ) : null}
      {isPending ? <p className="mt-2 text-xs text-neutral-400">Envoi en cours…</p> : null}
    </div>
  );
}
