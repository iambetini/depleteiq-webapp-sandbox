"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Region } from "@/types/region";

const { Layout, useContext } = createEntityLayout<Region>({
  storeName: "regions",
  showErrorToast: false,
});

export default Layout;
export { useContext };
