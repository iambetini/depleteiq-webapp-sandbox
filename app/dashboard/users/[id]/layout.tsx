"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { User } from "@/types/user";

const { Layout, useContext } = createEntityLayout<User>({
  storeName: "users",
  showErrorToast: false,
});

export default Layout;
export { useContext };
