import type { PromoSlabSummary } from "@/types/promo-slab"
import type { CustomerSummary, SignupMarketAssignment } from "@/types/participant"

export interface PromoParticipationPromoter {
  uuid: string
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  market_assignment?: SignupMarketAssignment | null
  status?: string
  is_active?: boolean
}

export interface PromoParticipationStore {
  uuid: string
  business?: {
    uuid?: string
    name?: string
    type?: string
    address?: string | null
  } | null
  in_market?: boolean
  promo_class?: string | null
  category?: string | null
  has_qr?: boolean
  name?: string
}

export interface PromoParticipation {
  uuid: string
  participation_code?: string | null
  customer?: CustomerSummary | null
  promo?: {
    uuid: string
    type?: string
    title?: string
    name?: string
    description?: string | null
    start_date?: string
    end_date?: string
  } | null
  promo_slab?: PromoSlabSummary | null
  promoter?: PromoParticipationPromoter | null
  store?: PromoParticipationStore | null
  receipt_image?: string | null
  item_purchased?: Array<{ name: string; quantity: number }> | string[] | string | null
  item_gifted?: Array<{ name: string; quantity: number }> | string[] | string | null
  purchase_value?: string | number | null
  slab_quantity?: number | null
  created_at: string
  updated_at: string
}

export function formatParticipationItems(
  items: PromoParticipation["item_purchased"]
): string {
  const rows = normalizeParticipationItems(items)
  if (rows.length === 0) return "—"
  return rows
    .map((item) =>
      item.quantity != null ? `${item.name} (Qty: ${item.quantity})` : item.name
    )
    .join(", ")
}

export function normalizeParticipationItems(
  items: PromoParticipation["item_purchased"]
): Array<{ name: string; quantity?: number }> {
  if (!items) return []
  if (typeof items === "string") {
    return items.trim() ? [{ name: items }] : []
  }
  if (!Array.isArray(items)) return []
  return items
    .map((item) => {
      if (typeof item === "string") {
        return item.trim() ? { name: item } : null
      }
      if (!item?.name) return null
      return {
        name: item.name,
        quantity: item.quantity,
      }
    })
    .filter((item): item is { name: string; quantity?: number } => Boolean(item))
}
