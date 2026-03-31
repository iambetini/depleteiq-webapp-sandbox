"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"

export default function StoreDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { store } = useContext()

  if (!store) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ""

  return (
    <div>
      <ViewPageHeader
        title="Store Details"
        description="View detailed information about this store"
        showEditButton={true}
        editHref={`/dashboard/stores/${store.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "stores",
          uuid: store.uuid,
        }}
      />
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-[#444444]">Store Information</CardTitle>
          <CardDescription>View all details for this store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Business</label>
              <p className="text-base font-semibold">{store.business?.name}</p>
              {store.business?.type && (
                <p className="text-sm text-muted-foreground">Type: {store.business.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Store Type</label>
              <p className="text-base font-semibold">{store.type || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="text-base font-semibold">{store.category || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Market</label>
              <p className="text-base font-semibold">{store.market?.name || "—"}</p>
              {store.market?.type && (
                <p className="text-sm text-muted-foreground">Type: {store.market.type}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-base whitespace-pre-wrap">{store.address || "—"}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-sm text-muted-foreground">
              {store.created_at ? new Date(store.created_at).toLocaleDateString() : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
