"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { normalizeParticipationItems } from "@/types/promo-participation"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"

function ItemsTable({
  title,
  items,
}: {
  title: string
  items: ReturnType<typeof normalizeParticipationItems>
}) {
  const hasQuantity = items.some((item) => item.quantity != null)

  return (
    <Card className="w-full max-w-3xl mt-6">
      <CardHeader>
        <CardTitle className="text-[#444444]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S/N</TableHead>
                  <TableHead>Item</TableHead>
                  {hasQuantity && <TableHead className="w-28 text-right">Qty</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={`${item.name}-${index}`}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium text-[#444444]">{item.name}</TableCell>
                    {hasQuantity && (
                      <TableCell className="text-right">
                        {item.quantity ?? "—"}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function PromoParticipationDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { promoParticipation } = useContext()

  if (!promoParticipation) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ""
  const customer = promoParticipation.customer
  const promoter = promoParticipation.promoter
  const market = promoter?.market_assignment
  const store = promoParticipation.store
  const promo = promoParticipation.promo
  const slab = promoParticipation.promo_slab
  const purchaseValue = promoParticipation.purchase_value
  const purchasedItems = normalizeParticipationItems(promoParticipation.item_purchased)
  const giftedItems = normalizeParticipationItems(promoParticipation.item_gifted)

  return (
    <div>
      <ViewPageHeader
        title={promoParticipation.participation_code || "Promo Participation"}
        description="Participation details"
        showEditButton={true}
        editHref={`/dashboard/promos/promo-participations/${promoParticipation.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "promoParticipations",
          uuid: promoParticipation.uuid,
        }}
      />

      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Participation Code</p>
              <p className="font-medium text-lg text-[#444444]">
                {promoParticipation.participation_code || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Purchase Value</p>
              <p className="font-medium text-lg text-[#444444]">
                {purchaseValue !== null && purchaseValue !== undefined && purchaseValue !== ""
                  ? Number(purchaseValue).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium text-[#444444]">
                {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-[#444444]">
                {customer?.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Network</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {customer?.phone_network || "Unknown"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Promo</p>
              <p className="font-medium text-[#444444]">
                {promo?.title || promo?.type || "—"}
              </p>
              {promo?.title && promo?.type && (
                <p className="text-sm text-muted-foreground">{promo.type}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Promo Slab</p>
              <p className="font-medium text-[#444444]">{slab?.title || "—"}</p>
              {slab?.bundle && (
                <p className="text-sm text-muted-foreground">{slab.bundle}</p>
              )}
            </div>

            {slab?.reward && (
              <div>
                <p className="text-sm text-muted-foreground">Reward</p>
                <p className="font-medium text-[#444444]">{slab.reward}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Slab Quantity</p>
              <p className="font-medium text-[#444444]">
                {promoParticipation.slab_quantity ?? "—"}
              </p>
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
              <p className="text-sm text-muted-foreground">Store</p>
              <p className="font-medium text-[#444444]">
                {store?.business?.name || store?.name || "—"}
              </p>
              {store?.business?.address && (
                <p className="text-sm text-muted-foreground">
                  {store.business.address}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-[#444444]">
                {promoParticipation.created_at
                  ? new Date(promoParticipation.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>

            {promoParticipation.updated_at && (
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium text-[#444444]">
                  {new Date(promoParticipation.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ItemsTable title="Items Purchased" items={purchasedItems} />
      <ItemsTable title="Items Gifted" items={giftedItems} />

      {promoParticipation.receipt_image && (
        <Card className="w-full max-w-3xl mt-6">
          <CardHeader>
            <CardTitle className="text-[#444444]">Receipt Image</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={promoParticipation.receipt_image}
              target="_blank"
              rel="noreferrer"
              className="block border rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            >
              <img
                src={promoParticipation.receipt_image}
                alt="Receipt"
                className="w-full max-h-96 object-contain bg-muted/20"
              />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
