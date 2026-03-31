"use client";
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { QrCode } from "@/types/qr-code";

const { Layout, useContext } = createEntityLayout<QrCode>({
  storeName: "qrCodes",
});

export default Layout;
export { useContext };
