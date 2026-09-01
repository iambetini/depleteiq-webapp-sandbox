export interface CoverageAreaLga {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CoverageAreaGeofence {
  uuid: string;
  name: string;
  description: string | null;
  type: string;
  center_latitude: string | null;
  center_longitude: string | null;
  radius: number | null;
  polygon: unknown | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CoverageArea {
  uuid: string;
  name: string;
  enable_geofence: boolean;
  lga: CoverageAreaLga;
  geofence: CoverageAreaGeofence | null;
  created_at: string;
  updated_at: string;
}
