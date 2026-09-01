"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { State } from "@/types/state";

const { Layout, useContext } = createEntityLayout<State>({
  storeName: "states",
  showErrorToast: false,
});

export default Layout;
export { useContext };
