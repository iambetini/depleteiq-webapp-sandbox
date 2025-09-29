"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Vehicle } from "@/types/vehicle";

const { Layout, useContext } = createEntityLayout<Vehicle>({
  storeName: "vehicles",
});

export default Layout;
export { useContext };
