"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { VssSupply } from "@/types/vss-supply";

const { Layout, useContext } = createEntityLayout<VssSupply>({
  storeName: "vssSupplies",
});

export default Layout;
export { useContext };
