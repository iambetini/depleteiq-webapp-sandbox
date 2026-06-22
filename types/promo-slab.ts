import type { Promo } from "@/types/promo"

export interface PromoSlab {
  id: string
  uuid: string
  promo_id?: string
  title: string
  bundle?: string | null
  reward?: string | null
  value?: string | number | null
  promo?: Promo | null
  created_at?: string
  updated_at?: string
}