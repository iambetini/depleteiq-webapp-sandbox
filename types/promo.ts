import type { PromoSlabSummary } from "@/types/promo-slab";

export interface IPromo {
  id: string;
  uuid: string;
  type: string;
  title?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  promo_slabs?: PromoSlabSummary[];
  created_at?: string;
  updated_at?: string;
}

export type Promo = IPromo;
