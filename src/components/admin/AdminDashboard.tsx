import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Eye,
  Plus
} from 'lucide-react';

interface AdminDashboardProps {
  products: any[];
  orders: any[];
  categories: any[];
  customers: any[];
  onNavigateTab: (tab: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  onSelectOrderDetails: (order: any) => void;
  onQuickAddProduct: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  categories,
  customers,
  onNavigateTab,
  onUpdateOrderStatus,
  onSelectOrderDetails,
  onQuickAddProduct
}: AdminDashboardProps) {

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'Cancelled') {
      return sum + Number(o.total_amount || 0);
    }
    return sum;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Packed');
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const lowStockProducts = products.filter(p => Number(p.stock || 0) <= 5);

  const recentOrders = orders.slice(0, 6);

  // Status badge color generator
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">

      {/* 🟢 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> From {orders.length} orders
          </div>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#0b803f]">Total Orders</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            {orders.length}
          </div>
          <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
            {completedOrders.length} delivered
          </div>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md transition-all cursor-pointer bg-amber-50/20 group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Pending</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-1">
            Needs processing
          </div>
        </div>

        {/* Total Customers */}
        <div 
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#0b803f]">Customers</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            {customers.length || Math.max(1, orders.length)}
          </div>
          <div className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
            Active shoppers
          </div>
        </div>

        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#0b803f]">Products</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            {products.length}
          </div>
          <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-1">
            Across {categories.length} categories
          </div>
        </div>

        {/* Low Stock Warning */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs hover:shadow-md transition-all cursor-pointer bg-rose-50/20 group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Low Stock</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900 tracking-tight">
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mt-1">
            Items ≤ 5 units left
          </div>
        </div>

      </div>

      {/* 🟡 MIDDLE SECTION: RECENT ORDERS & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3): Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">Recent Orders</h3>
              <p className="text-xs text-gray-500">Live order management & quick updates</p>
            </div>
            <button 
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#0b803f] hover:underline cursor-pointer"
            >
              View All Orders →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              No orders placed yet. Orders will appear here live.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider border-y border-gray-100">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3 font-extrabold text-gray-900">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{order.customer_name || 'Guest User'}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[150px]">{order.address || 'Standard Delivery'}</div>
                      </td>
                      <td className="p-3 font-black text-gray-900">
                        ₹{Number(order.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${getStatusBadge(order.status)}`}>
                          {order.status || 'Placed'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => onSelectOrderDetails(order)}
                          className="p-1.5 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg inline-flex items-center gap-1 font-bold text-[11px]"
                          title="View Details"
                        >
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Right Column (1/3): Quick Actions & Low Stock Items */}
        <div className="space-y-6">

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-[#0b803f] to-emerald-800 text-white rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-base font-black flex items-center justify-between">
              <span>Quick Actions</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-bold text-amber-300">Fast Control</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button 
                onClick={onQuickAddProduct}
                className="bg-white text-gray-900 hover:bg-yellow-300 font-extrabold text-xs py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={16} className="text-[#0b803f]" /> Add Product
              </button>
              
              <button 
                onClick={() => onNavigateTab('banners')}
                className="bg-emerald-950/40 text-white hover:bg-emerald-950/70 border border-white/20 font-bold text-xs py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                New Banner
              </button>
            </div>
          </div>

          {/* Low Stock Warning List */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600" /> Stock Alerts
              </h3>
              <button 
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Restock →
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-emerald-600 font-bold flex flex-col items-center gap-1">
                <CheckCircle2 size={24} />
                <span>All products are well stocked!</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {lowStockProducts.slice(0, 5).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={prod.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                        alt={prod.name} 
                        className="w-9 h-9 object-cover rounded-xl bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-gray-500">₹{prod.price} / {prod.unit}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-black shrink-0">
                      {prod.stock || 0} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
