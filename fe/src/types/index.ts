export interface Tier {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  code: string
  name: string
  category: string
  price: number
  tier_id: number
  tier?: Tier
  created_at?: string
  updated_at?: string
}

export interface Store {
  id: number
  code: string
  name: string
  street_address: string
  city: string
  province: string
  tier_id: number
  tier?: Tier
  created_at?: string
  updated_at?: string
}

export interface Submission {
  id: number
  name: string
  customer_name?: string
  product_id: number
  store_id: number
  product?: Product
  store?: Store
  created_at: string
  updated_at: string
}

export interface CreateSubmissionPayload {
  customer_name: string
  name?: string
  store_id: number
  product_id: number
}

export interface ApiValidationError {
  message: string
  errors?: Record<string, string[]>
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
}
