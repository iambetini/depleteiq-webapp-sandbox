"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContext } from "./layout"

export default function PromoterDetailPage() {
  const { promoter } = useContext()

  if (!promoter) {
    return null
  }

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
              <p className="text-base font-semibold">{promoter.user?.first_name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="text-base font-semibold">{promoter.user?.last_name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base font-semibold">{promoter.user?.email || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Market</label>
              <p className="text-base font-semibold">{promoter.market?.name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">TPE Supervisor</label>
              <p className="text-base font-semibold">
                {promoter.tpe_user
                  ? `${promoter.tpe_user.first_name} ${promoter.tpe_user.last_name}`
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
