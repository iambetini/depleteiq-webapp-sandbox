export interface IPromo {
  id: string;
  uuid: string;
  type: string;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type Promo = IPromo;
