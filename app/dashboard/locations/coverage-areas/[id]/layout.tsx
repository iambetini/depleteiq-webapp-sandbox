"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { CoverageArea } from "@/types/coverage-area";

const { Layout, useContext } = createEntityLayout<CoverageArea>({
  storeName: "coverageAreas",
  showErrorToast: false,
});

export default Layout;
export { useContext };
