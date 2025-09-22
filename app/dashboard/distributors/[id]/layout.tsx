"use client"

import { DistributorLayout } from "@/components/layouts/entity-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DistributorLayout>{children}</DistributorLayout>
}
