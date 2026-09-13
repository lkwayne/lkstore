import { describe, it, expect } from "vitest";
import { categorySchema, subcategorySchema } from "@/schemas/category.schema";

describe("categorySchema", () => {
  it("accepte une catégorie minimale valide", () => {
    const result = categorySchema.safeParse({ name: "Gaming", slug: "gaming" });
    expect(result.success).toBe(true);
  });

  it("applique les valeurs par défaut (actif, visible, ordre 0)", () => {
    const result = categorySchema.parse({ name: "Gaming", slug: "gaming" });
    expect(result.isActive).toBe(true);
    expect(result.isVisible).toBe(true);
    expect(result.sortOrder).toBe(0);
  });

  it("rejette un slug avec accents ou majuscules", () => {
    const result = categorySchema.safeParse({ name: "Énergie", slug: "Énergie-Solaire" });
    expect(result.success).toBe(false);
  });

  it("rejette un nom trop court", () => {
    const result = categorySchema.safeParse({ name: "G", slug: "g" });
    expect(result.success).toBe(false);
  });
});

describe("subcategorySchema", () => {
  it("accepte une sous-catégorie minimale valide", () => {
    const result = subcategorySchema.safeParse({ name: "Consoles", slug: "consoles" });
    expect(result.success).toBe(true);
  });

  it("rejette une URL d'image invalide", () => {
    const result = subcategorySchema.safeParse({
      name: "Consoles",
      slug: "consoles",
      imageUrl: "pas-une-url",
    });
    expect(result.success).toBe(false);
  });
});
