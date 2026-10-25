import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Loader2, MapPin, Tag, ArrowRight } from 'lucide-react'
import type { Store, Product } from '../types'
import { getStoreProducts } from '../services/apiService'
import { formatCurrency } from '../utils/formatters'

interface StoreProductsModalProps {
  store: Store | null
  onClose: () => void
}

export const StoreProductsModal: FC<StoreProductsModalProps> = ({ store, onClose }) => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!store) {
      setProducts([])
      return
    }

    let isMounted = true
    setLoading(true)
    getStoreProducts(store.id)
      .then((data) => {
        if (isMounted) setProducts(data)
      })
      .catch((err) => {
        console.error('Failed to load store products', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [store])

  if (!store) return null

  const tierName = store.tier?.name || `Tier ${store.tier_id}`

  const handleOrderFromStore = () => {
    onClose()
    navigate(`/order?store_id=${store.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {store.code}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {tierName}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{store.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{store.street_address}, {store.city}, {store.province}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Authorized Menu for {tierName}</span>
            <span className="text-slate-400 font-normal">
              {products.length} Items Available
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span>Fetching available products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No products found for this store.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {products.map((product) => (
                <div key={product.id} className="p-3 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{product.name}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="font-mono text-slate-400">{product.code}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold font-mono text-slate-800 shrink-0 text-sm">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOrderFromStore}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Order From This Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
