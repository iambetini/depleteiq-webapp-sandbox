"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Promoter } from "@/types/promoter";

const { Layout, useContext } = createEntityLayout<Promoter>({
  storeName: "promoters",
});

export default Layout;
export { useContext };
