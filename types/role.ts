import { Permission } from "./permission";

export interface Role {
  id: string;
  uuid: string;
  name: string;
  access_type: string;
  description?: string | null;
  deleted: string;
  permissions?: Permission[] | string[];
  permissions_count?: number;
  users_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
