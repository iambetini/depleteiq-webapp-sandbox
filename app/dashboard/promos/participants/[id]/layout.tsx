"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Participant } from "@/types/participant";

const { Layout, useContext } = createEntityLayout<Participant>({
  storeName: "participants",
});

export default Layout;
export { useContext };
