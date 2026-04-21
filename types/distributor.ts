import { Location } from "./location";
import { Market } from "./market";
import { User } from "./user";

export interface Business {
  uuid: string;
  name: string;
  type: string;
  address: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Distributor {
  id?: string;
  uuid: string;
  user: User;
  business: Business;
  category: string;
  registration_number?: string;
  tax_id?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  ime_vss_user_id?: string;
  location_id?: string;
  location?: Location;
  market?: Market;
  ime_vss?: User;
  performance?: {
    total_orders: number;
    total_order_value: number;
    target_volume: number;
    target_amount: number;
    total_value?: number;
    growth_rate?: number;
    last_order_date?: string;
  };
  created_at: string;
}
