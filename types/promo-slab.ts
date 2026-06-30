import type { Promo } from "@/types/promo"

export interface PromoSlabSummary {
  uuid: string
  title: string
  bundle?: string | null
  reward?: string | null
  value?: string | number | null
}

export interface PromoSlab extends PromoSlabSummary {
  id: string
  promo_id?: string
  promo?: Promo | null
  created_at?: string
  updated_at?: string
}