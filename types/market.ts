import { Location } from "./location";
import { User } from "./user";
import { Warehouse } from "./warehouse";

export interface Market {
  id: string;
  uuid: string;
  name: string;
  full_name: string;
  type: string;
  description: string;
  region: string;
  status: string;
  users: User[];
  users_count: number;
  location: Location;
  location_count: number;
  warehouse_id?: string;
  warehouse: Warehouse;
  created_at: string;
  branch:string;
}
