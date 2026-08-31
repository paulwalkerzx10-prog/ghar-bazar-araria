import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Grid, 
  ShoppingBag, 
  Users, 
  Image as ImageIcon, 
  Headphones, 
  Settings, 
  LogOut, 
  ExternalLink,
  X,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingOrdersCount: number;
  openTicketsCount: number;
  onLogout: () => void;
}

export const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Grid },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'orders' },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'banners', label: 'Banners & Home', icon: ImageIcon },
  { id: 'support', label: 'Support & Tickets', icon: Headphones, badgeKey: 'support' },
  { id: 'settings', label: 'Store Settings', icon: Settings },
];

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  pendingOrdersCount,
  openTicketsCount,
  onLogout
}: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0b803f] flex items-center justify-center text-white font-black text-lg shadow-md shadow-green-900/30">
            GB
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Ghar<span className="text-[#facc15]">Bazar</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-400" /> Control Center
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button 
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Management
        </div>

        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          let badgeNum = 0;
          if (tab.badgeKey === 'orders') badgeNum = pendingOrdersCount;
          if (tab.badgeKey === 'support') badgeNum = openTicketsCount;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0b803f] text-white shadow-md shadow-emerald-950/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-[#facc15]' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </div>

              {badgeNum > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-[#facc15] text-slate-900' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {badgeNum}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-1.5">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={15} /> Customer Storefront
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Live</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut size={15} /> Exit Admin Panel
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200 h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
