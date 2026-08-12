"use client"

import { createEntityLayout } from "@/lib/entity-layout-factory"
import type { Business } from "@/types/business"

const { Layout, useContext } = createEntityLayout<Business>({
  storeName: "businesses",
  entityName: "Wholesaler",
  showErrorToast: false,
})

export default Layout
export { useContext }

