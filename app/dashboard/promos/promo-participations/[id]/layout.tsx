"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { PromoParticipation } from "@/types/promo-participation";

const { Layout, useContext } = createEntityLayout<PromoParticipation>({
  storeName: "promoParticipations",
});

export default Layout;
export { useContext };
