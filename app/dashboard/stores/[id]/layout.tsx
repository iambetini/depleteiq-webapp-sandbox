"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Store } from "@/types/store";

const { Layout, useContext } = createEntityLayout<Store>({
  storeName: "stores",
});

export default Layout;
export { useContext };
