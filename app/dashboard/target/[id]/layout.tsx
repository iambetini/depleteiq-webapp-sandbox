"use client"

import { TargetLayout } from "@/components/layouts/entity-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TargetLayout>{children}</TargetLayout>
}
