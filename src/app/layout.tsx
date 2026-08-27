import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BENDO — Tout ce qu'il vous faut",
  description:
    "BENDO, votre boutique en ligne au Cameroun : téléphones, informatique, électroménager, mode et bien plus. Livraison et retrait en magasin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
