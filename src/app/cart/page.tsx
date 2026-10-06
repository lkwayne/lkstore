import { Header } from "@/components/Header";
import { CartPageClient } from "./client";

export default function CartPage() {
  return <CartPageClient header={<Header />} />;
}
