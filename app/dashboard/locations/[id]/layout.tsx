"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Location } from "@/types/location";

const { Layout, useContext } = createEntityLayout<Location>({
  storeName: "locations",
});

export default Layout;
export { useContext };
