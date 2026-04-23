"use client"

import { createEntityLayout } from "@/lib/entity-layout-factory"
import type { Wholesaler } from "@/types/wholesaler"

const { Layout, useContext } = createEntityLayout<Wholesaler>({
  storeName: "wholesalers",
  showErrorToast: false,
})

export default Layout
export { useContext }

