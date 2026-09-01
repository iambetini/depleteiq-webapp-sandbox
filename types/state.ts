export interface StateRegion {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface State {
  uuid: string;
  name: string;
  region: StateRegion | null;
  created_at: string;
  updated_at: string;
}
