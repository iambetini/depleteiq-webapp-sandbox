export interface Permission {
  id?: string;
  uuid: string;
  name: string;
  description?: string | null;
  guard_name?: string | null;
  module?: string;
  category?: string;
  deleted?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type PermissionsCatalogItems =
  | Permission[]
  | Permission[][]
  | Record<string, Permission[]>;
