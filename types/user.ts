import { Market } from "./market";
import { Role } from "./role";

export interface User {
  id: string;
  uuid: string;
  first_name: string;
  full_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: Role;
  market: Market | null;
  status: string;
  email_verified_at: string | null;
  is_active: boolean;
  has_distributor: boolean;
  created_at: string;
  mustChangePassword?: boolean;
  refresh_token?: string;
  token_obtained_at?: number;
  expires_in?: number;
}
