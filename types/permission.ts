export interface Permission {
  id: string;
  uuid: string;
  name: string;
  description?: string | null;
  deleted: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
