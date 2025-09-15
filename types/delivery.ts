import { Order } from "./order";
import { Vehicle } from "./vehicle";
import { Location } from "./location";

export type deliveryStatus =
  | "awaiting"
  | "pending_approval"
  | "update_requested"
  | "approved"
  | "delivered"
  | "fulfilled";

export interface Delivery {
  uuid: string;
  order: Order;
  vehicle: Vehicle;
  distance: number; // distance in km
  cost_ratio: number; // cost ratio for the delivery
  delivery_burn_rate: number; // burn rate for the delivery
  from: Location;
  to: Location;
  total_order_volume: number; // total order volume in cubic meters
  total_order_weight: number; // total order weight in kg
  total_order_density: number; // total order density in kg/m^3
  vehicle_max_density: number; // vehicle maximum density in kg/m^3
  vehicle_coverage: number; // vehicle coverage in km
  status: deliveryStatus;
  comment: string;
  created_at: string;
}
