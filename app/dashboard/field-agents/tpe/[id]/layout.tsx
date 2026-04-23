"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { TPE } from "@/types/tpe";

const { Layout, useContext } = createEntityLayout<TPE>({
  storeName: "tpes",
});

export default Layout;
export { useContext };
