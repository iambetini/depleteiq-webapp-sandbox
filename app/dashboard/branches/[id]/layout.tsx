"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Branch } from "@/types/branch";

const { Layout, useContext } = createEntityLayout<Branch>({
  storeName: "branches",
});

export default Layout;
export { useContext };
