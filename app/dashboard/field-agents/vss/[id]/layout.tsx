"use client"

import { VssLayout } from "@/components/layouts/entity-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <VssLayout>{children}</VssLayout>
}
