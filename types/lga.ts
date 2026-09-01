export interface LgaState {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Lga {
  uuid: string;
  name: string;
  state: LgaState;
  created_at: string;
  updated_at: string;
}
