import type { User } from "./user"

export interface Business {
  id?: string
  uuid: string
  name: string
  type: string
  email?: string | null
  phone?: string | null
  address?: string | null
  user?: User
  tpe_user?: User
  stores?: unknown[]
  created_at: string
  updated_at: string
}
