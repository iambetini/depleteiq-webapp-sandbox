export interface PromoParticipation {
  id: string;
  uuid: string;
  participant_id: string;
  promo_id: string;
  promoter_id: string;
  store_id: string;
  promo_slab_id?: string | null;
  promo_slab?: {
    uuid: string;
    title: string;
    bundle?: string | null;
    reward?: string | null;
    value?: string | number | null;
  } | null;
  purchase_value?: string | number | null;
  slab_quantity?: number | null;
  receipt_image?: string;
  item_purchased?: string;
  item_gifted?: string;
  created_at: string;
  updated_at: string;
}
