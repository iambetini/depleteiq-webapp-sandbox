import { Role } from "./role";
import { Market } from "./market";
import type { SignupMarketAssignment } from "./participant";

export interface TPE {
  id?: string;
  uuid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  market_assignment?: SignupMarketAssignment | null;
  market?: Market | null;
  status: string;
  email_verified_at: string | null;
  is_active: boolean;
  created_at: string;
}
