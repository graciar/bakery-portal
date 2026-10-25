import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { Croissant, PlusCircle, ClipboardList, Building2 } from 'lucide-react'

export const Navbar: FC = () => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6 md:gap-8">
          <NavLink to="/entry" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Croissant className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">Innocean Bakery</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Retail Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Tiered Store & Product Inventory Allocation
              </p>
            </div>
          </NavLink>

          {/* Navigation Tabs with Active Indicators */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <NavLink
              to="/entry"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-amber-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`
              }
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>New Entry</span>
            </NavLink>

            <NavLink
              to="/stores"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-amber-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`
              }
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Stores</span>
            </NavLink>

            <NavLink
              to="/submissions"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-amber-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`
              }
            >
              <ClipboardList className="w-4 h-4 text-amber-600" />
              <span>Entries</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar