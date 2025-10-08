import { Location } from "./location";

export interface Branch {
  uuid: string;
  branch_name: string;
  branch_code: string;
  location: Location;
  created_at: string;
}
