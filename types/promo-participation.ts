export interface PromoParticipation {
  id: string;
  uuid: string;
  participant_id: string;
  promo_id: string;
  promoter_id: string;
  store_id: string;
  receipt_image?: string;
  item_purchased?: string;
  item_gifted?: string;
  created_at: string;
  updated_at: string;
}
