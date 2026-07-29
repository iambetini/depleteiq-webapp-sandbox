"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  const market = tpe.market_assignment || tpe.market
  const isActive = tpe.status === "active" || tpe.is_active
  const displayName =
    tpe.full_name ||
    [tpe.first_name, tpe.last_name].filter(Boolean).join(" ") ||
    "TPE Details"

  return (
    <div>
      <ViewPageHeader
        title={displayName}
        description="TPE Details"
        showEditButton={true}
        editHref={`/dashboard/field-agents/tpe/${tpe.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "tpes",
          uuid: tpe.uuid,
        }}
      />

      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium text-lg text-[#444444]">
                {tpe.first_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium text-lg text-[#444444]">
                {tpe.last_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-[#444444] break-all">
                {tpe.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-[#444444]">{tpe.phone || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize text-[#444444]">
                {tpe.role?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={`mt-1 capitalize status ${isActive ? "active" : "inactive"}`}
              >
                {tpe.status || (isActive ? "active" : "inactive")}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Market</p>
              <p className="font-medium text-[#444444]">
                {market?.name || "Not assigned"}
              </p>
              {market?.type && (
                <p className="text-sm text-muted-foreground capitalize mt-0.5">
                  {market.type}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email Verified</p>
              <Badge
                variant={tpe.email_verified_at ? "default" : "secondary"}
                className="mt-1"
              >
                {tpe.email_verified_at ? "Yes" : "No"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-[#444444]">
                {tpe.created_at || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
