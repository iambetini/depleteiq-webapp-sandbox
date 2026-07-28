import type { Business } from "./business"
import type { Market } from "./market"
import type { QrCode } from "./qr-code"
import type { Location } from "./location"

export interface Store {
  uuid: string
  business: Business
  location: Location | null
  market: Market | null
  in_market: boolean
  promo_class: string | null
  category: string | null
  has_qr: boolean
  qr_code: QrCode | null
  created_at: string
  updated_at: string
  promoter?: {
    uuid: string
    [key: string]: unknown
  } | null
}
