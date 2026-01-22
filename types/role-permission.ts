import { Role } from "./role";
import { Permission } from "./permission";

export interface RolePermission {
  id: string;
  role_id: number;
  permission_id: number;
  role?: Role;
  permission?: Permission;
  created_at: string;
  updated_at: string;
}
