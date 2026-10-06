import { getMegaMenu } from "@/services/menu.service";
import { HeaderClient } from "@/components/HeaderClient";

export async function Header() {
  const menu = await getMegaMenu();
  return <HeaderClient menu={menu} />;
}
