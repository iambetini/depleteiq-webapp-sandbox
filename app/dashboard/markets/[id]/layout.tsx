"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Market } from "@/types/market";

const { Layout, useContext } = createEntityLayout<Market>({
  storeName: "markets",
  showErrorToast: false,
});

export default Layout;
export { useContext };
