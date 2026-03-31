import { User } from "./user";
import { Business } from "./business";

export interface Wholesaler {
  id: string;
  uuid: string;
  user_id: string;
  business_id: string;
  tpe_user_id?: string;
  user?: User;
  business?: Business;
  tpeUser?: User;
  created_at: string;
  updated_at: string;
}
