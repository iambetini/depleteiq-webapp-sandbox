"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { VssOrder } from "@/types/vss-order";

const { Layout, useContext } = createEntityLayout<VssOrder>({
  storeName: "vssOrders",
});

export default Layout;
export { useContext };
