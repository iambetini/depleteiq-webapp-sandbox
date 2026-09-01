"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Lga } from "@/types/lga";

const { Layout, useContext } = createEntityLayout<Lga>({
  storeName: "lgas",
  showErrorToast: false,
});

export default Layout;
export { useContext };
