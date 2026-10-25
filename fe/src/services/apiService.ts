import type {
  CreateSubmissionPayload,
  Product,
  Store,
  Submission,
  Tier,
} from '../types'

const DEFAULT_BASE = '/api'
const BACKUP_BASE = 'http://127.0.0.1:8000/api'
const API_BASE = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  let url = `${API_BASE}${cleanEndpoint}`
  
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (networkErr) {
    // If relative /api failed (e.g. proxy unavailable), attempt direct backend fallback
    if (API_BASE === DEFAULT_BASE) {
      try {
        url = `${BACKUP_BASE}${cleanEndpoint}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } catch {
        throw networkErr
      }
    } else {
      throw networkErr
    }
  }

  let data: any = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`
    const validationErrors = data?.errors || undefined
    throw new ApiError(message, response.status, validationErrors)
  }

  return data as T
}

export interface GetStoresParams {
  search?: string
  tier_id?: number | string
  city?: string
  province?: string
}

/**
 * Fetch all stores (with eager loaded tier), supporting search and filter parameters
 */
export async function getStores(params?: GetStoresParams): Promise<Store[]> {
  const query = new URLSearchParams()
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim())
  }
  if (params?.tier_id && params.tier_id !== 'ALL') {
    query.set('tier_id', String(params.tier_id))
  }
  if (params?.city) {
    query.set('city', params.city)
  }
  if (params?.province && params.province !== 'ALL') {
    query.set('province', params.province)
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const data = await request<Store[] | { data: Store[] }>(`/stores${queryString}`)
  return Array.isArray(data) ? data : data.data || []
}

/**
 * Fetch products available for a specific store (matching tier)
 * Triggers GET /api/stores/{storeId}/products
 */
export async function getStoreProducts(storeId: number | string): Promise<Product[]> {
  const data = await request<Product[] | { data: Product[] }>(`/stores/${storeId}/products`)
  return Array.isArray(data) ? data : data.data || []
}

/**
 * Fetch all tiers
 */
export async function getTiers(): Promise<Tier[]> {
  const data = await request<Tier[] | { data: Tier[] }>('/tiers')
  return Array.isArray(data) ? data : data.data || []
}

/**
 * Fetch submissions list
 */
export interface GetSubmissionsParams {
  search?: string
  tier_id?: number | string
  product_id?: number | string
  store_id?: number | string
}

export async function getSubmissions(params?: GetSubmissionsParams): Promise<Submission[]> {
  const query = new URLSearchParams()
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim())
  }
  if (params?.tier_id && params.tier_id !== 'ALL') {
    query.set('tier_id', String(params.tier_id))
  }
  if (params?.product_id) {
    query.set('product_id', String(params.product_id))
  }
  if (params?.store_id) {
    query.set('store_id', String(params.store_id))
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''
  try {
    const data = await request<Submission[] | { data: Submission[] }>(`/submissions${queryString}`)
    return Array.isArray(data) ? data : data.data || []
  } catch (err: any) {
    if (err.status === 404) {
      const fallback = await request<Submission[] | { data: Submission[] }>(`/entries${queryString}`)
      return Array.isArray(fallback) ? fallback : fallback.data || []
    }
    throw err
  }
}

/**
 * Submit a customer entry
 */
export async function createSubmission(payload: CreateSubmissionPayload): Promise<Submission> {
  try {
    return await request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (err: any) {
    if (err.status === 404) {
      return await request<Submission>('/entries', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.customer_name,
          customer_name: payload.customer_name,
          store_id: payload.store_id,
          product_id: payload.product_id,
        }),
      })
    }
    throw err
  }
}

/**
 * Update an existing entry / submission
 */
export async function updateSubmission(
  id: number | string,
  payload: Partial<CreateSubmissionPayload>
): Promise<Submission> {
  const body = {
    name: payload.name || payload.customer_name,
    customer_name: payload.customer_name || payload.name,
    store_id: payload.store_id,
    product_id: payload.product_id,
  }

  try {
    return await request<Submission>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  } catch (err: any) {
    if (err.status === 404) {
      return await request<Submission>(`/entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    }
    throw err
  }
}

/**
 * Delete a submission by ID
 */
export async function deleteSubmission(id: number | string): Promise<void> {
  try {
    await request<void>(`/submissions/${id}`, { method: 'DELETE' })
  } catch (err: any) {
    if (err.status === 404) {
      await request<void>(`/entries/${id}`, { method: 'DELETE' })
      return
    }
    throw err
  }
}
