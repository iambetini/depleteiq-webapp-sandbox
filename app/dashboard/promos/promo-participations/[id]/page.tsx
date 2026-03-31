"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"

export default function PromoParticipationDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { promoParticipation } = useContext()


  if (!promoParticipation) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ""

  return (
    <div>
      <ViewPageHeader
        title="Promo Participation Details"
        description="View detailed information about this participation"
        showEditButton={true}
        editHref={`/dashboard/promos/promo-participations/${promoParticipation.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "promoParticipations",
          uuid: promoParticipation.uuid,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Information</CardTitle>
            <CardDescription>Participation details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Participant</label>
              <p className="text-base font-semibold">{promoParticipation.participant?.first_name} {promoParticipation.participant?.last_name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Promo</label>
              <p className="text-base font-semibold">{promoParticipation.promo?.type || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Store</label>
              <p className="text-base font-semibold">{promoParticipation.store?.name || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Item Purchased</label>
              <p className="text-base font-semibold">
                {Array.isArray(promoParticipation.item_purchased) && promoParticipation.item_purchased.length > 0
                  ? promoParticipation.item_purchased
                      .map((item: any) => `${item.name} (Qty: ${item.quantity})`)
                      .join(", ")
                  : "—"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Item Gifted</label>
              <p className="text-base font-semibold">
                {Array.isArray(promoParticipation.item_gifted) && promoParticipation.item_gifted.length > 0
                  ? promoParticipation.item_gifted
                      .map((item: any) => `${item.name} (Qty: ${item.quantity})`)
                      .join(", ")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
