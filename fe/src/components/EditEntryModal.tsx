import type { FC, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  X,
  User,
  Store as StoreIcon,
  ShoppingBag,
  Loader2,
  Save,
  AlertCircle,
  Building2,
  Tag,
  Pencil,
} from 'lucide-react'
import type { Submission, Store, Product } from '../types'
import { getStores, getStoreProducts, updateSubmission, ApiError } from '../services/apiService'
import { formatCurrency } from '../utils/formatters'

interface EditEntryModalProps {
  entry: Submission | null
  onClose: () => void
  onSuccess: () => void
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void
}

export const EditEntryModal: FC<EditEntryModalProps> = ({
  entry,
  onClose,
  onSuccess,
  onNotify,
}) => {
  const [stores, setStores] = useState<Store[]>([])
  const [loadingStores, setLoadingStores] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')

  // Product dependent states
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Fetch all stores on mount
  useEffect(() => {
    let isMounted = true
    setLoadingStores(true)
    getStores()
      .then((data) => {
        if (isMounted) setStores(data)
      })
      .catch((err) => {
        console.error('Failed to load stores', err)
      })
      .finally(() => {
        if (isMounted) setLoadingStores(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Initialize fields when entry changes
  useEffect(() => {
    if (entry) {
      setName(entry.name || entry.customer_name || '')
      setSelectedStoreId(entry.store_id ? String(entry.store_id) : '')
      setSelectedProductId(entry.product_id ? String(entry.product_id) : '')
      setFieldErrors({})
    }
  }, [entry])

  // Active store object
  const activeStore = useMemo(() => {
    return stores.find((s) => String(s.id) === String(selectedStoreId)) || null
  }, [stores, selectedStoreId])

  // Fetch products whenever selectedStoreId changes
  useEffect(() => {
    if (!selectedStoreId) {
      setProducts([])
      return
    }

    let isMounted = true
    setLoadingProducts(true)

    getStoreProducts(selectedStoreId)
      .then((items) => {
        if (!isMounted) return
        setProducts(items)

        // If currently selected product is not in the new store tier products, reset it
        setSelectedProductId((prev) => {
          const exists = items.some((p) => String(p.id) === String(prev))
          return exists ? prev : ''
        })
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Failed to load store products', err)
        setProducts([])
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedStoreId])

  if (!entry) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = 'Name is required'
    }
    if (!selectedStoreId) {
      errors.store_id = 'Please select a store'
    }
    if (!selectedProductId) {
      errors.product_id = 'Please select a product'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSaving(true)
    try {
      await updateSubmission(entry.id, {
        name: name.trim(),
        customer_name: name.trim(),
        store_id: Number(selectedStoreId),
        product_id: Number(selectedProductId),
      })

      onNotify('success', 'Entry Updated', `Entry #${entry.id} was saved successfully.`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Update failed:', err)
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(err.errors)) {
          if (Array.isArray(v) && v.length > 0) {
            mapped[k] = String(v[0])
          }
        }
        setFieldErrors(mapped)
        onNotify('error', 'Update Rejected', 'Please fix the highlighted input errors.')
      } else {
        onNotify('error', 'Update Failed', err.message || 'Could not update the entry in the database.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Entry #{entry.id}</h3>
              <p className="text-xs text-slate-500">
                Modify customer name, store, or tier-allocated product.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="edit_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="edit_name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder="Customer Name"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.name
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 bg-white'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Store Field */}
          <div>
            <label htmlFor="edit_store" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
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
                id="edit_store"
                value={selectedStoreId}
                disabled={loadingStores}
                onChange={(e) => {
                  setSelectedStoreId(e.target.value)
                  if (fieldErrors.store_id) setFieldErrors((prev) => ({ ...prev, store_id: '' }))
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  loadingStores
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-wait'
                    : fieldErrors.store_id
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 bg-white'
                }`}
              >
                <option value="">-- Choose Store ({stores.length} available) --</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city}) - [{s.tier?.name || `Tier ${s.tier_id}`}]
                  </option>
                ))}
              </select>
            </div>

            {activeStore && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/50">
                <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="truncate">{activeStore.street_address}, {activeStore.city}</span>
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

          {/* Product Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="edit_product" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
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
                id="edit_product"
                value={selectedProductId}
                disabled={!selectedStoreId || loadingProducts}
                onChange={(e) => {
                  setSelectedProductId(e.target.value)
                  if (fieldErrors.product_id) setFieldErrors((prev) => ({ ...prev, product_id: '' }))
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  !selectedStoreId
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
                    ? 'No products available for this tier'
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

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold shadow-sm shadow-amber-600/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEntryModal