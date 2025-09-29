"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Order } from "@/types/order";

const { Layout, useContext } = createEntityLayout<Order>({
  storeName: "orders",
});

export default Layout;
export { useContext };
