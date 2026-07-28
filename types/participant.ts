export interface CustomerSummary {
  uuid: string
  first_name: string
  last_name: string
  phone?: string | null
  email?: string | null
  phone_network?: string | null
  created_at?: string
  updated_at?: string
}

export interface SignupPromoSummary {
  uuid: string
  type?: string
  title?: string
  name?: string
  description?: string | null
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

export interface SignupMarketAssignment {
  uuid: string
  name: string
  type?: string
  description?: string
  full_name?: string
  created_at?: string
}

export interface SignupPromoterSummary {
  uuid: string
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  market_assignment?: SignupMarketAssignment | null
  status?: string
  role?: { uuid: string; name: string }
  is_active?: boolean
  created_at?: string
}

export interface Participant {
  uuid: string
  customer?: CustomerSummary | null
  promo?: SignupPromoSummary | null
  promoter?: SignupPromoterSummary | null
  created_at: string
  updated_at: string
}
