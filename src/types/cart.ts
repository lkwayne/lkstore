/**
 * Le panier ne stocke JAMAIS de prix côté client — uniquement l'identifiant
 * produit et la quantité. Le prix affiché vient toujours d'une relecture
 * serveur (Supabase) au moment d'afficher le panier, jamais du navigateur.
 */
export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  primaryImageUrl: string | null;
}
