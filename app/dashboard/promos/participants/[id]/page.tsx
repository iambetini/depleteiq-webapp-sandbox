"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"

export default function ParticipantDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { participant } = useContext()

  if (!participant) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ""

  return (
    <div>
      <ViewPageHeader
        title="Sign up Details"
        description="View detailed information about this sign up"
        showEditButton={true}
        editHref={`/dashboard/promos/participants/${participant.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "participants",
          uuid: participant.uuid,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Information</CardTitle>
            <CardDescription>Sign up details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="text-base font-semibold">{participant.first_name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="text-base font-semibold">{participant.last_name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base font-semibold">{participant.email || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base font-semibold">{participant.phone || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Network</label>
              <p className="text-base font-semibold">{participant.phone_network || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
