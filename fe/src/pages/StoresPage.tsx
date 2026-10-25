import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store as StoreIcon,
  Search,
  Filter,
  MapPin,
  Building2,
  ExternalLink,
  LayoutGrid,
  List,
  ShoppingBag,
  Loader2,
} from 'lucide-react'
import type { Store, Tier } from '../types'
import { getStores, getTiers } from '../services/apiService'
import { StoreProductsModal } from '../components/StoreProductsModal'

export interface StoresPageProps {
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void
}

export const StoresPage: FC<StoresPageProps> = ({ onNotify }) => {
  const [stores, setStores] = useState<Store[]>([])
  const [tiers, setTiers] = useState<Tier[]>([])
  const [allProvinces, setAllProvinces] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Search input state and debounced value
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Filters and view modes
  const [tierFilter, setTierFilter] = useState('ALL')
  const [provinceFilter, setProvinceFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedStoreForMenu, setSelectedStoreForMenu] = useState<Store | null>(null)

  // Debounce search input: wait until user stops typing before triggering API
  useEffect(() => {
    if (!searchTerm.trim() && !debouncedSearch) {
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
      setIsTyping(false)
    }, 600) // 600ms debounce delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, debouncedSearch])

  // Fetch stores from backend API with debounced search, tier filter, and province filter
  const loadStores = useCallback(
    async (query?: string, tier?: string, province?: string) => {
      setLoading(true)
      try {
        const data = await getStores({
          search: query,
          tier_id: tier !== 'ALL' ? tier : undefined,
          province: province !== 'ALL' ? province : undefined,
        })
        setStores(data)

        // Capture all unique provinces on the first broad load (unfiltered)
        if (!query && (!tier || tier === 'ALL') && (!province || province === 'ALL')) {
          const provinces = Array.from(new Set(data.map((s) => s.province).filter(Boolean))).sort()
          setAllProvinces(provinces)
        }
      } catch (err: any) {
        console.error('Failed to load stores', err)
        onNotify('error', 'Store Connection Issue', 'Could not load stores from backend.')
      } finally {
        setLoading(false)
      }
    },
    [onNotify]
  )

  // Fetch tiers on mount
  useEffect(() => {
    getTiers().then(setTiers).catch((err) => {
      console.error('Failed to load tiers', err)
    })
  }, [])

  // Call API whenever debouncedSearch, tierFilter, or provinceFilter changes
  useEffect(() => {
    loadStores(debouncedSearch, tierFilter, provinceFilter)
  }, [debouncedSearch, tierFilter, provinceFilter, loadStores])

  // Stores returned from the backend are already filtered by the database
  const filteredStores = stores

  const renderTierBadge = (tierName?: string) => {
    const name = (tierName || '').toUpperCase()
    if (name.includes('TIER A')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Tier A
        </span>
      )
    }
    if (name.includes('TIER B')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Tier B
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        {tierName || 'Tier C'}
      </span>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Modal for Menu Preview */}
        {selectedStoreForMenu && (
          <StoreProductsModal
            store={selectedStoreForMenu}
            onClose={() => setSelectedStoreForMenu(null)}
          />
        )}

        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Store Directory
                  </h1>
                  <p className="text-xs text-slate-500">
                    Browse all authorized bakery branches, operational tiers, and assigned product menus.
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            {/* Search Input with Debounced API Trigger */}
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {isTyping || loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by store name, branch code, city, or address..."
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {isTyping && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] text-amber-600 font-medium">Waiting...</span>
                </div>
              )}
            </div>

            {/* Tier Filter (API-driven) */}
            <div className="sm:col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Store Tiers</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={String(tier.id)}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Filter (API-driven) */}
            <div className="sm:col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Provinces</option>
                {allProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">
              {debouncedSearch ? `Searching for "${debouncedSearch}"...` : 'Loading Stores...'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Connecting to PostgreSQL backend</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Store Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStores.map((store) => {
              const tierName = store.tier?.name || `Tier ${store.tier_id}`

              return (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {store.code}
                      </span>
                      {renderTierBadge(tierName)}
                    </div>

                    {/* Store Name */}
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                      {store.name}
                    </h3>

                    {/* Location */}
                    <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{store.street_address}</span>
                      </p>
                      <p className="pl-5 text-slate-500 text-[11px]">
                        {store.city}, {store.province}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStoreForMenu(store)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Menu</span>
                    </button>

                    <Link
                      to={`/entry?store_id=${store.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
                    >
                      <span>Add Entry</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Store Table View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Store Name</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Street Address</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Province</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStores.map((store, idx) => (
                    <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {store.code}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {store.name}
                      </td>
                      <td className="py-3 px-4">
                        {renderTierBadge(store.tier?.name)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {store.street_address}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {store.city}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {store.province}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStoreForMenu(store)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Menu
                        </button>
                        <Link
                          to={`/entry?store_id=${store.id}`}
                          className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold transition-colors"
                        >
                          Add Entry
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state if search has no results */}
        {!loading && filteredStores.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center">
            <StoreIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-800 text-sm">No stores match your filters</p>
            <p className="text-xs text-slate-500 mt-1">
              {debouncedSearch
                ? `No stores found matching "${debouncedSearch}".`
                : tierFilter !== 'ALL' || provinceFilter !== 'ALL'
                ? 'No stores found matching the selected filters.'
                : 'No stores available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoresPage