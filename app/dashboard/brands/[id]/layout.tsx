"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Brand } from "@/types/brand";

const { Layout, useContext } = createEntityLayout<Brand>({
  storeName: "brands",
  showErrorToast: false,
});

export default Layout;
export { useContext };
