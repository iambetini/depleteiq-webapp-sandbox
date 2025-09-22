"use client"

import { ImeVssLayout } from "@/components/layouts/entity-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ImeVssLayout>{children}</ImeVssLayout>
}
