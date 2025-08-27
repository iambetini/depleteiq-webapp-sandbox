import { Location } from "./location";
import { Promo } from "./promo";
import { User } from "./user";

export type orderStatus =
  | "approved"
  | "update_requested"
  | "confirmed"
  | "fulfilled"
  | "pending"
  | "rejected";
export interface OrderBrand {
  uuid: string;
  order_ref: string;
  customer_name: string;
  customer_type: string;
  category: string;
  brand_name: string;
  pcs_per_carton: string;
  cartons_sold: string;
  location: string;
  date: string;
  price_per_carton: string;
  sales_value: number;
  comments: string;
  quantity: string;
  price: string;
  info: {
    uuid: string;
    name: string;
    category: string;
  };
}

export interface Order {
  uuid: string;
  ref: string;
  delivery_image: string;
  delivery_location: Location;
  fulfilled_token: string;
  market: string;
  ime_vss: User;
  distributor_user: User & {
    distributor_details: {
      uuid: string;
      business_name: string;
      address: string;
    };
  };
  total_amount: string;
  created_at: string;
  status: orderStatus;
  status_progress: string;
  self_pickup: string;
  brands: OrderBrand[];
  promos: Promo;
}
