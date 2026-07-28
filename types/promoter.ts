import { User } from './user'
import { Market } from './market'
import type { Store } from './store'
import type { SignupMarketAssignment } from './participant'

export interface PromoterStoreAssignment {
  uuid?: string
  store_uuid?: string
  store?: Store | null
}

export interface Promoter {
  id?: string
  uuid: string
  market_id?: string
  user_id?: string
  tpe_user_id?: string
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  status?: string
  is_active?: boolean
  market_assignment?: SignupMarketAssignment | null
  market?: Market
  user?: User
  role?: { uuid: string; name: string; created_at?: string }
  tpe_user?: User
  stores?: PromoterStoreAssignment[]
  email_verified_at?: string | null
  created_at: string
  updated_at?: string
}
