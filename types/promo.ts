export interface IPromo {
  id: string;
  uuid: string;
  type: string;
  title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  promo_slabs?: Array<{
    uuid: string;
    title: string;
    bundle?: string | null;
    reward?: string | null;
    value?: string | number | null;
  }>;
  created_at?: string;
  updated_at?: string;
}

export type Promo = IPromo;
