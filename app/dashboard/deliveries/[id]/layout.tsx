"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Delivery } from "@/types/delivery";

const { Layout, useContext } = createEntityLayout<Delivery>({
  storeName: "deliveries",
});

export default Layout;
export { useContext };
