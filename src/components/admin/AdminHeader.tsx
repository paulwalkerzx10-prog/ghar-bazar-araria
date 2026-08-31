import React from 'react';
import { Menu, Search, RefreshCw, Bell, Shield, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  setIsOpenMobile: (open: boolean) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pendingOrdersCount: number;
  lowStockCount: number;
}

export default function AdminHeader({
  title,
  subtitle,
  setIsOpenMobile,
  onRefresh,
  isRefreshing,
  searchQuery,
  setSearchQuery,
  pendingOrdersCount,
  lowStockCount
}: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Page Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpenMobile(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-medium text-gray-500 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders, customers..."
              className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30 focus:border-[#0b803f] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Alerts & Admin Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 text-gray-600 hover:text-[#0b803f] hover:bg-green-50 rounded-xl transition-all ${isRefreshing ? 'animate-spin text-[#0b803f]' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>

          {/* Quick Alert Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {pendingOrdersCount > 0 && (
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold"
                title={`${pendingOrdersCount} orders require processing`}
              >
                <Bell size={13} className="text-amber-600" />
                <span>{pendingOrdersCount} Pending</span>
              </div>
            )}

            {lowStockCount > 0 && (
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold"
                title={`${lowStockCount} items running low on stock`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{lowStockCount} Low Stock</span>
              </div>
            )}
          </div>

          {/* Customer Store Link */}
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-green-600 text-gray-700 hover:text-green-700 font-bold text-xs transition-colors bg-white shadow-xs"
          >
            <Store size={14} className="text-green-600" />
            <span>View Store</span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0b803f] to-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Shield size={16} />
            </div>
            <div className="hidden xl:block text-left">
              <span className="block text-xs font-bold text-gray-900 leading-none">Admin User</span>
              <span className="text-[10px] text-emerald-600 font-semibold">GharBazar SuperAdmin</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
