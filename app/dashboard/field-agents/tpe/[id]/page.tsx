"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"

export default function TPEDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { tpe } = useContext()

  if (!tpe) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ""
  const isActive = tpe.is_active

  return (
    <div>
      <ViewPageHeader
        title="TPE Details"
        description={`${tpe.full_name || tpe.first_name} ${tpe.last_name}`}
        showEditButton={true}
        editHref={`/dashboard/field-agents/tpe/${tpe.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "tpes",
          uuid: tpe.uuid,
        }}
      />
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-[#444444]">TPE Information</CardTitle>
          <CardDescription>View all details for this TPE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="text-base font-semibold">{tpe.first_name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="text-base font-semibold">{tpe.last_name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base font-semibold break-all">{tpe.email || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base font-semibold">{tpe.phone || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-base font-semibold">{tpe.role?.name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Market</label>
              <p className="text-base font-semibold">{tpe.market?.name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground mr-2">Status</label>
              <Badge variant={isActive ? "default" : "secondary"}>
                {tpe.status || "—"}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
              <p className="text-base font-semibold">
                {tpe.email_verified_at ? "Yes" : "No"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm text-muted-foreground">
                {tpe.created_at}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
