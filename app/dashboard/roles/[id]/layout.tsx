"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Role } from "@/types/role";

const { Layout, useContext } = createEntityLayout<Role>({
  storeName: "roles",
  showErrorToast: false,
});

export default Layout;
export { useContext };
