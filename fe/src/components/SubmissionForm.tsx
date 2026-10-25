import type { FC, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Store as StoreIcon,
  ShoppingBag,
  User,
  Loader2,
  Save,
  AlertCircle,
  Building2,
  Tag,
} from 'lucide-react'
import type { Store, Product } from '../types'
import { getStoreProducts, createSubmission, ApiError } from '../services/apiService'
import { formatCurrency } from '../utils/formatters'

interface SubmissionFormProps {
  stores: Store[]
  loadingStores?: boolean
  onSuccess?: () => void
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void
}

export const SubmissionForm: FC<SubmissionFormProps> = ({
  stores,
  loadingStores = false,
  onSuccess,
  onNotify,
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')

  // Dependent products state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Handle URL query parameter ?store_id=123 (e.g., from Stores directory)
  useEffect(() => {
    const storeIdParam = searchParams.get('store_id')
    if (storeIdParam && stores.some((s) => String(s.id) === storeIdParam)) {
      setSelectedStoreId(storeIdParam)
    }
  }, [searchParams, stores])

  // Active store object
  const activeStore = useMemo(() => {
    return stores.find((s) => String(s.id) === String(selectedStoreId)) || null
  }, [stores, selectedStoreId])

  // Fetch dynamic products whenever selectedStoreId changes
  useEffect(() => {
    if (!selectedStoreId) {
      setProducts([])
      setSelectedProductId('')
      return
    }

    let isMounted = true
    setLoadingProducts(true)
    setSelectedProductId('') // Reset product when store changes

    getStoreProducts(selectedStoreId)
      .then((items) => {
        if (!isMounted) return
        setProducts(items)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Failed to load store products:', err)
        setProducts([])
        onNotify('error', 'Product Loading Error', 'Failed to fetch authorized products for the selected store.')
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedStoreId, onNotify])

  // Form reset handler
  const handleReset = () => {
    setCustomerName('')
    setSelectedStoreId('')
    setSelectedProductId('')
    setProducts([])
    setFieldErrors({})
  }

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Client-side quick check
    const errors: Record<string, string> = {}
    if (!customerName.trim()) {
      errors.customer_name = 'Name is required'
    }
    if (!selectedStoreId) {
      errors.store_id = 'Please select a store'
    }
    if (!selectedProductId) {
      errors.product_id = 'Please select a product'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      onNotify('error', 'Validation Error', 'Please complete all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const response = await createSubmission({
        customer_name: customerName.trim(),
        name: customerName.trim(),
        store_id: Number(selectedStoreId),
        product_id: Number(selectedProductId),
      })

      onNotify(
        'success',
        'Entry Saved Successfully',
        `Recorded for "${response.customer_name || response.name}" at ${response.store?.name || 'store'}.`
      )

      handleReset()
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/submissions')
      }
    } catch (err: any) {
      console.error('Submission failed:', err)
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        const mappedErrors: Record<string, string> = {}
        for (const [key, msgs] of Object.entries(err.errors)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            mappedErrors[key] = String(msgs[0])
          }
        }
        setFieldErrors(mappedErrors)
        onNotify('error', 'Submission Rejected', 'Please fix the highlighted input errors.')
      } else {
        onNotify('error', 'Save Failed', err.message || 'Could not record the entry to PostgreSQL database.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/40 p-6 sm:p-8">
      <div className="">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Input Form</h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Name Input */}
        <div>
          <label htmlFor="customer_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="customer_name"
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                if (fieldErrors.customer_name) {
                  setFieldErrors((prev) => ({ ...prev, customer_name: '' }))
                }
              }}
              placeholder="e.g., Sarah Jenkins"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${fieldErrors.customer_name
                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 bg-white'
                }`}
            />
          </div>
          {fieldErrors.customer_name && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.customer_name}
            </p>
          )}
        </div>

        {/* Store Dropdown */}
        <div>
          <label htmlFor="store" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Store <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {loadingStores ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <StoreIcon className="w-4 h-4" />
              )}
            </div>
            <select
              id="store"
              value={selectedStoreId}
              disabled={loadingStores}
              onChange={(e) => {
                setSelectedStoreId(e.target.value)
                if (fieldErrors.store_id) {
                  setFieldErrors((prev) => ({ ...prev, store_id: '' }))
                }
              }}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all cursor-pointer ${loadingStores
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-wait'
                : fieldErrors.store_id
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 bg-white'
                }`}
            >
              <option value="">
                {loadingStores
                  ? 'Loading stores...'
                  : `-- Select Store (${stores.length} available) --`}
              </option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.city}) - [{store.tier?.name || `Tier ${store.tier_id}`}]
                </option>
              ))}
            </select>
          </div>

          {activeStore && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 px-3.5 py-2 rounded-lg bg-amber-50/70 border border-amber-200/50">
              <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="truncate">{activeStore.street_address}, {activeStore.city}, {activeStore.province}</span>
              <span className="ml-auto font-semibold text-amber-800 shrink-0">
                {activeStore.tier?.name || `Tier ${activeStore.tier_id}`}
              </span>
            </div>
          )}

          {fieldErrors.store_id && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.store_id}
            </p>
          )}
        </div>

        {/* Dynamic Dependent Product Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="product" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Product <span className="text-rose-500">*</span>
            </label>
            {loadingProducts && (
              <span className="text-[11px] text-amber-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading products for {activeStore?.tier?.name || 'store'}...
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value)
                if (fieldErrors.product_id) {
                  setFieldErrors((prev) => ({ ...prev, product_id: '' }))
                }
              }}
              disabled={!selectedStoreId || loadingProducts}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all ${!selectedStoreId
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : loadingProducts
                  ? 'border-amber-200 bg-amber-50/40 text-slate-500 cursor-wait'
                  : fieldErrors.product_id
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20 cursor-pointer'
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 bg-white text-slate-900 cursor-pointer'
                }`}
            >
              <option value="">
                {!selectedStoreId
                  ? 'Select a store first...'
                  : loadingProducts
                    ? 'Loading products...'
                    : products.length === 0
                      ? 'No products available for this store tier'
                      : `-- Choose Product (${products.length} available) --`}
              </option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.category}) - {formatCurrency(prod.price)}
                </option>
              ))}
            </select>
          </div>

          {selectedStoreId && !loadingProducts && products.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>
                Showing products filtered for {activeStore?.tier?.name || 'selected store tier'}.
              </span>
            </div>
          )}

          {fieldErrors.product_id && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.product_id}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Entry...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}