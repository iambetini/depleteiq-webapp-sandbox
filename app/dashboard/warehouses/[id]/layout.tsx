"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Warehouse } from "@/types/warehouse";

const { Layout, useContext } = createEntityLayout<Warehouse>({
  storeName: "warehouses",
});

export default Layout;
export { useContext };
