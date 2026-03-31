export interface Participant {
  id: string;
  uuid: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  phone_network?: string;
  created_at: string;
  updated_at: string;
}
