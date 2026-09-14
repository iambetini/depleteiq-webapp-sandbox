import type { Business } from "./business"
import type { Market } from "./market"
import type { QrCode } from "./qr-code"
import type { Location } from "./location"

export const STORE_CATEGORIES = [
  "Alcoholic beverages",
  "Articles",
  "Cosmetics",
  "Food",
  "Non-alcoholic beverage",
  "Personal care/Home care",
  "Pharmaceuticals",
  "Provisions",
] as const

export type StoreCategory = (typeof STORE_CATEGORIES)[number]

export const normalizeStoreCategories = (category?: unknown): string[] => {
  if (!category) return []
  if (Array.isArray(category)) return category.filter((c): c is string => typeof c === "string")
  if (typeof category === "string" && category.trim()) return [category]
  return []
}

export interface Store {
  uuid: string
  business: Business
  location: Location | null
  market: Market | null
  coverage_area: {
    uuid: string
    name: string
    enable_geofence?: boolean
  } | null
  in_market: boolean
  promo_class: string | null
  category: string[] | string | null
  has_qr: boolean
  qr_code: QrCode | null
  created_at: string
  updated_at: string
  promoter?: {
    uuid: string
    [key: string]: unknown
  } | null
}
