"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useContext } from "./layout"

export default function ParticipantDetailPage() {
  const { participant } = useContext()

  if (!participant) {
    return null
  }

  const customer = participant.customer
  const firstName = customer?.first_name
  const lastName = customer?.last_name
  const email = customer?.email
  const phone = customer?.phone
  const network = customer?.phone_network
  const promoter = participant.promoter
  const market = promoter?.market_assignment

  return (
    <div>
      <ViewPageHeader
        title={[firstName, lastName].filter(Boolean).join(" ") || "Sign up Details"}
        description="Customer promo sign up"
        showEditButton={false}
        showDeleteButton={false}
      />

      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium text-lg text-[#444444]">
                {[firstName, lastName].filter(Boolean).join(" ") || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-[#444444]">{phone || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-[#444444]">{email || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Network</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {network || "Unknown"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Promo</p>
              <p className="font-medium text-[#444444]">
                {participant.promo?.title || participant.promo?.type || "—"}
              </p>
              {participant.promo?.title && participant.promo?.type && (
                <p className="text-sm text-muted-foreground">{participant.promo.type}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Promoter</p>
              <p className="font-medium text-[#444444]">
                {promoter?.full_name ||
                  [promoter?.first_name, promoter?.last_name]
                    .filter(Boolean)
                    .join(" ") ||
                  "—"}
              </p>
              {promoter?.email && (
                <p className="text-sm text-muted-foreground">{promoter.email}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Market</p>
              <p className="font-medium text-[#444444]">
                {market?.full_name || market?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Signed Up</p>
              <p className="font-medium text-[#444444]">
                {participant.created_at
                  ? new Date(participant.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>

            {participant.updated_at && (
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium text-[#444444]">
                  {new Date(participant.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
