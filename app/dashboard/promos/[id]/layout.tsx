"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Promo } from "@/types/promo";

const { Layout, useContext } = createEntityLayout<Promo>({
  storeName: "promos",
});

export default Layout;
export { useContext };
