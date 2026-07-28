"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContext } from "./layout"

export default function PromoterDetailPage() {
  const { promoter } = useContext()

  if (!promoter) {
    return null
  }

  const market = promoter.market_assignment || promoter.market
  const status = promoter.status
  const isActive = status === "active" || promoter.is_active

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Information</CardTitle>
            <CardDescription>Promoter details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="text-base font-semibold">
                {promoter.first_name || promoter.user?.first_name || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="text-base font-semibold">
                {promoter.last_name || promoter.user?.last_name || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base font-semibold">
                {promoter.email || promoter.user?.email || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base font-semibold">{promoter.phone || "-"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Market</label>
              <p className="text-base font-semibold">
                {market?.full_name || market?.name || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div>
                <Badge
                  variant={isActive ? "default" : "destructive"}
                  className={`status ${isActive ? "active" : "inactive"}`}
                >
                  {status || (isActive ? "active" : "inactive")}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">TPE Supervisor</label>
              <p className="text-base font-semibold">
                {promoter.tpe_user
                  ? `${promoter.tpe_user.first_name} ${promoter.tpe_user.last_name}`
                  : "-"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="text-base font-semibold">{promoter.created_at || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
