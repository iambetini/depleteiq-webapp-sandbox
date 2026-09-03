"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"

const getCategories = (category?: unknown): string[] => {
  if (!category) return []
  if (Array.isArray(category)) return category.filter((c): c is string => typeof c === "string")
  if (typeof category === "string") return [category]
  return []
}

export default function StoreDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { store } = useContext()

  if (!store) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ""
  const storeUser = store.business?.user
  const categories = getCategories(store.category)

  return (
    <div>
      <ViewPageHeader
        title={store.business?.name || "Store Details"}
        description="Store Details"
        showEditButton={true}
        editHref={`/dashboard/stores/${store.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "stores",
          uuid: store.uuid,
        }}
      />

      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium text-lg text-[#444444]">
                {store.business?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Business Type</p>
              <p className="font-medium text-lg capitalize text-[#444444]">
                {store.business?.type || "—"}
              </p>
            </div>

            {categories.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {store.promo_class && (
              <div>
                <p className="text-sm text-muted-foreground">Promo Class</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {store.promo_class}
                </Badge>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Market</p>
              <p className="font-medium text-[#444444]">
                {store.market?.full_name || store.market?.name || "—"}
              </p>
              {store.market?.type && (
                <p className="text-sm text-muted-foreground capitalize mt-0.5">
                  {store.market.type}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">In Market</p>
              <Badge
                variant={store.in_market ? "default" : "secondary"}
                className="mt-1"
              >
                {store.in_market ? "Yes" : "No"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Has QR Code</p>
              <Badge
                variant={store.has_qr ? "default" : "secondary"}
                className="mt-1"
              >
                {store.has_qr ? "Yes" : "No"}
              </Badge>
            </div>

            {store.business?.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Business Address</p>
                <p className="font-medium text-[#444444] whitespace-pre-wrap">
                  {store.business.address}
                </p>
              </div>
            )}

            {storeUser && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Contact Person</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium text-[#444444]">
                      {storeUser.full_name ||
                        `${storeUser.first_name} ${storeUser.last_name}`}
                    </p>
                  </div>
                  {storeUser.email && (
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-[#444444]">{storeUser.email}</p>
                    </div>
                  )}
                  {storeUser.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-[#444444]">{storeUser.phone}</p>
                    </div>
                  )}
                  {storeUser.status && (
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge
                        variant={
                          storeUser.status === "active" ? "default" : "secondary"
                        }
                        className="mt-1 capitalize"
                      >
                        {storeUser.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {store.location && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-3">Location Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {store.location.full_location && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Full Address</p>
                      <p className="font-medium text-[#444444]">
                        {store.location.full_location}
                      </p>
                    </div>
                  )}
                  {store.location.street && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Street</p>
                      <p className="font-medium text-[#444444]">{store.location.street}</p>
                    </div>
                  )}
                  {store.location.city && (
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="font-medium text-[#444444]">{store.location.city}</p>
                    </div>
                  )}
                  {store.location.state && (
                    <div>
                      <p className="text-xs text-muted-foreground">State</p>
                      <p className="font-medium text-[#444444]">{store.location.state}</p>
                    </div>
                  )}
                  {store.location.region && (
                    <div>
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="font-medium text-[#444444]">{store.location.region}</p>
                    </div>
                  )}
                  {store.location.country && (
                    <div>
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="font-medium text-[#444444]">{store.location.country}</p>
                    </div>
                  )}
                </div>
                {(store.location.latitude || store.location.longitude) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Coordinates</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {store.location.latitude != null && (
                        <div>
                          <p className="text-xs text-muted-foreground">Latitude</p>
                          <p className="font-medium text-[#444444]">
                            {store.location.latitude}
                          </p>
                        </div>
                      )}
                      {store.location.longitude != null && (
                        <div>
                          <p className="text-xs text-muted-foreground">Longitude</p>
                          <p className="font-medium text-[#444444]">
                            {store.location.longitude}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-[#444444]">
                {store.created_at
                  ? new Date(store.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>

            {store.updated_at && (
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium text-[#444444]">
                  {new Date(store.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {store.qr_code && (
        <Card className="w-full max-w-3xl mt-6">
          <CardHeader>
            <CardTitle className="text-[#444444]">QR Code Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-medium font-mono text-[#444444]">
                  {store.qr_code.reference}
                </p>
              </div>
              {store.qr_code.type && (
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize text-[#444444]">
                    {store.qr_code.type}
                  </p>
                </div>
              )}
              {store.qr_code.status && (
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default" className="mt-1 capitalize">
                    {store.qr_code.status}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
