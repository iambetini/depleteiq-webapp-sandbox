import { Location } from "./location";

export interface Warehouse {
  uuid: string;
  warehouse_code: string;
  address: string;
  location_id: string;
  location: Location;
  longitude: string;
  latitude: string;
  created_at: string;
  updated_at: string;
}
