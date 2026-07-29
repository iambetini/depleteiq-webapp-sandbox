"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useContext } from "./layout"

export default function PromoterDetailPage() {
  const { promoter } = useContext()

  if (!promoter) {
    return null
  }

  const market = promoter.market_assignment || promoter.market
  const status = promoter.status
  const isActive = status === "active" || promoter.is_active
  const tpeUser = promoter.tpe_user
  const tpeName = tpeUser
    ? tpeUser.full_name ||
      [tpeUser.first_name, tpeUser.last_name].filter(Boolean).join(" ")
    : null

  return (
    <div>
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium text-lg text-[#444444]">
                {promoter.first_name || promoter.user?.first_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium text-lg text-[#444444]">
                {promoter.last_name || promoter.user?.last_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-[#444444] break-all">
                {promoter.email || promoter.user?.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-[#444444]">
                {promoter.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Market</p>
              <p className="font-medium text-[#444444]">
                {market?.full_name || market?.name || "—"}
              </p>
              {market?.type && (
                <p className="text-sm text-muted-foreground capitalize mt-0.5">
                  {market.type}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={`mt-1 capitalize status ${isActive ? "active" : "inactive"}`}
              >
                {status || (isActive ? "active" : "inactive")}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">TPE Supervisor</p>
              <p className="font-medium text-[#444444]">{tpeName || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Stores Count</p>
              <p className="font-medium text-[#444444]">
                {promoter.stores?.length ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-[#444444]">
                {promoter.created_at || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
