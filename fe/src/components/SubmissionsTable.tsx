import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Trash2,
  Layers,
  Inbox,
  PlusCircle,
  Loader2,
  Pencil,
} from 'lucide-react'
import type { Submission, Tier } from '../types'
import { formatDate } from '../utils/formatters'
import { deleteSubmission, getTiers, type GetSubmissionsParams } from '../services/apiService'
import { EditEntryModal } from './EditEntryModal'

interface SubmissionsTableProps {
  submissions: Submission[]
  loading: boolean
  onFetch?: (params?: GetSubmissionsParams) => void | Promise<void>
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void
}

export const SubmissionsTable: FC<SubmissionsTableProps> = ({
  submissions,
  loading,
  onFetch,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [tierFilter, setTierFilter] = useState('ALL')
  const [tiers, setTiers] = useState<Tier[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingEntry, setEditingEntry] = useState<Submission | null>(null)

  // Fetch tiers for the filter dropdown from DB
  useEffect(() => {
    getTiers().then(setTiers).catch((err) => {
      console.error('Failed to load tiers', err)
    })
  }, [])

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

  // Call API whenever debouncedSearch or tierFilter changes
  useEffect(() => {
    onFetch?.({
      search: debouncedSearch,
      tier_id: tierFilter !== 'ALL' ? tierFilter : undefined,
    })
  }, [debouncedSearch, tierFilter, onFetch])

  // Delete handler
  const handleDelete = async (id: number, customerName: string) => {
    if (!window.confirm(`Delete entry for "${customerName}"?`)) return

    setDeletingId(id)
    try {
      await deleteSubmission(id)
      onNotify('success', 'Entry Deleted', `Entry #${id} has been removed.`)
      onFetch?.({
        search: debouncedSearch,
        tier_id: tierFilter !== 'ALL' ? tierFilter : undefined,
      })
    } catch (err: any) {
      console.error('Delete failed', err)
      onNotify('error', 'Delete Failed', err.message || 'Could not delete entry.')
    } finally {
      setDeletingId(null)
    }
  }

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
    <>
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            onFetch?.({
              search: debouncedSearch,
              tier_id: tierFilter !== 'ALL' ? tierFilter : undefined,
            })
          }}
          onNotify={onNotify}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        {/* Header & Controls */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Submitted Entries</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {submissions.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Historical log of recorded bakery entries and tier-allocated products.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/entry"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ New Entry</span>
              </Link>
            </div>
          </div>

          {/* Filter & Search Bar with Debounced API Trigger */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
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
                placeholder="Search by name, store, product, category, or city..."
                className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {isTyping && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] text-amber-600 font-medium">Waiting...</span>
                </div>
              )}
            </div>

            {/* Tier Filter (API-driven) */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Tiers</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={String(tier.id)}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold tracking-wider uppercase text-[10px]">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Store Name</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && submissions.length === 0 ? (
                // Loading Skeleton State
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-4 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-16 bg-slate-200 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-12 bg-slate-200 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="py-16 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                        <Inbox className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-slate-800 text-base">No entries found</p>
                      <p className="text-xs text-slate-500 mt-1 mb-5">
                        {debouncedSearch || tierFilter !== 'ALL'
                          ? 'Try clearing the search query or tier filter.'
                          : 'No entries have been saved yet. Use the data input form to create the first record.'}
                      </p>
                      <Link
                        to="/entry"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Create First Entry</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                submissions.map((item, index) => {
                  const customer = item.customer_name || item.name || 'Anonymous'
                  const store = item.store
                  const product = item.product
                  const tierName = store?.tier?.name || product?.tier?.name

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {customer}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {store ? store.name : <span className="text-slate-400 italic">Store #{item.store_id}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderTierBadge(tierName)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {product ? product.name : <span className="text-slate-400 italic">Product #{item.product_id}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingEntry(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            title="Edit entry"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, customer)}
                            disabled={deletingId === item.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Connected to PostgreSQL backend</span>
          </div>
          <div>
            Showing {submissions.length} submitted {submissions.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>
    </>
  )
}

export default SubmissionsTable