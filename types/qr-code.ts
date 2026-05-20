export interface QrCode {
  id: string;
  uuid: string;
  reference: string;
  type?: string;
  status?: string;
  store?: {
    uuid: string;
    name: string;
    address?: string;
  } | null;
  created_at: string;
  updated_at: string;
}
