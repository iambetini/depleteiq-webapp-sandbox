"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { PromoSlab } from "@/types/promo-slab";

const { Layout, useContext } = createEntityLayout<PromoSlab>({
  storeName: "promoSlabs",
});

export default Layout;
export { useContext };