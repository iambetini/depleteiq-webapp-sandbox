export interface Geofence {
  uuid: string;
  name: string;
  type: string;
  center_longitude?: string | null;
  center_latitude?: string | null;
  radius?: string | number | null;
  polygon?: number[][] | string | null;
  description?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
