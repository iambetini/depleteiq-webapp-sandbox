"use client";

import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Geofence } from "@/types/geofence";

const { Layout, useContext } = createEntityLayout<Geofence>({
  storeName: "geofences",
});

export default Layout;
export { useContext };
