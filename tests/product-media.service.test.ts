import { describe, it, expect } from "vitest";
import {
  detectMediaType,
  validateMediaFile,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/services/product-media.service";

function makeFile(name: string, type: string, size: number): File {
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
}

describe("detectMediaType", () => {
  it("reconnaît les formats image supportés", () => {
    expect(detectMediaType("image/jpeg")).toBe("IMAGE");
    expect(detectMediaType("image/png")).toBe("IMAGE");
    expect(detectMediaType("image/webp")).toBe("IMAGE");
  });

  it("reconnaît les formats vidéo supportés", () => {
    expect(detectMediaType("video/mp4")).toBe("VIDEO");
    expect(detectMediaType("video/webm")).toBe("VIDEO");
  });

  it("retourne null pour un format non supporté", () => {
    expect(detectMediaType("application/pdf")).toBeNull();
  });
});

describe("validateMediaFile", () => {
  it("accepte une image sous la limite de taille", () => {
    const file = makeFile("photo.jpg", "image/jpeg", 1024);
    expect(validateMediaFile(file)).toBeNull();
  });

  it("rejette une image au-dessus de la limite", () => {
    const file = makeFile("photo.jpg", "image/jpeg", MAX_IMAGE_SIZE_BYTES + 1);
    expect(validateMediaFile(file)).toContain("dépasse la taille maximale");
  });

  it("accepte une vidéo sous sa limite (plus élevée que les images)", () => {
    const file = makeFile("clip.mp4", "video/mp4", MAX_IMAGE_SIZE_BYTES + 1000);
    expect(validateMediaFile(file)).toBeNull();
  });

  it("rejette une vidéo au-dessus de sa propre limite", () => {
    const file = makeFile("clip.mp4", "video/mp4", MAX_VIDEO_SIZE_BYTES + 1);
    expect(validateMediaFile(file)).toContain("dépasse la taille maximale");
  });

  it("rejette un format non supporté quelle que soit la taille", () => {
    const file = makeFile("doc.pdf", "application/pdf", 100);
    expect(validateMediaFile(file)).toContain("Format non supporté");
  });
});
