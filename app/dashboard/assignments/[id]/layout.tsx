"use client";

import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Assignment } from "@/types/assignment";

const { Layout, useContext } = createEntityLayout<Assignment>({
  storeName: "assignments",
  showErrorToast: false,
});

export default Layout;
export { useContext };
