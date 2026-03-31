import { User } from './user'
import { Market } from './market'

export interface Promoter {
  id: string
  uuid: string
  market_id: string
  user_id: string
  tpe_user_id?: string
  market?: Market
  user?: User
  tpe_user?: User
  created_at: string
  updated_at: string
}
