"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { VssInventoryTransaction } from "@/types/vss-inventory-transaction";

const { Layout, useContext } = createEntityLayout<VssInventoryTransaction>({
  storeName: "vssInventoryTransactions",
});

export default Layout;
export { useContext };
