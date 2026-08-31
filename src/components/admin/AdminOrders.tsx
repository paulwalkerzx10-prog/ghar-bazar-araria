import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Truck, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CreditCard,
  X,
  ChevronRight,
  Printer
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface AdminOrdersProps {
  orders: any[];
  onRefresh: () => void;
  selectedOrderDetails?: any;
  setSelectedOrderDetails?: (order: any) => void;
}

const ORDER_STATUSES = [
  'Placed',
  'Confirmed',
  'Packed',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminOrders({
  orders,
  onRefresh,
  selectedOrderDetails: externalSelectedOrder,
  setSelectedOrderDetails: externalSetSelectedOrder
}: AdminOrdersProps) {
  const [internalSelectedOrder, setInternalSelectedOrder] = useState<any | null>(null);
  
  const selectedOrder = externalSelectedOrder !== undefined ? externalSelectedOrder : internalSelectedOrder;
  const setSelectedOrder = externalSetSelectedOrder || setInternalSelectedOrder;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.phone || '').includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

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

      {/* Top Search & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Name, Phone..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30"
            />
          </div>

          {/* Status Tabs/Select */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all' 
                  ? 'bg-gray-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({orders.length})
            </button>
            {ORDER_STATUSES.map(st => {
              const count = orders.filter(o => o.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === st 
                      ? 'bg-[#0b803f] text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package size={32} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-600">No orders match the criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-gray-200/80">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const itemCount = Array.isArray(order.items) ? order.items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) : 1;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      
                      {/* Order ID & Time */}
                      <td className="p-4">
                        <div className="font-black text-gray-900">#{order.id.slice(-8).toUpperCase()}</div>
                        <div className="text-[11px] text-gray-400">
                          {order.created_at ? new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="p-4">
                        <div className="font-extrabold text-gray-900">{order.customer_name || 'Customer'}</div>
                        <div className="text-[11px] text-gray-500">{order.phone || 'N/A'}</div>
                      </td>

                      {/* Item Count */}
                      <td className="p-4 font-bold text-gray-700">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-black text-gray-900 text-sm">
                        ₹{Number(order.total_amount || 0).toLocaleString()}
                      </td>

                      {/* Payment mode */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-extrabold text-[10px]">
                          {order.payment_method || 'Cash on Delivery'}
                        </span>
                      </td>

                      {/* Order Status Selector */}
                      <td className="p-4">
                        <select
                          value={order.status || 'Placed'}
                          onChange={e => handleUpdateStatus(order.id, e.target.value)}
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadge(order.status || 'Placed')}`}
                        >
                          {ORDER_STATUSES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Details button */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-[#0b803f] hover:bg-emerald-700 text-white rounded-xl font-extrabold text-[11px] inline-flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                        >
                          <Eye size={13} /> View Full
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────── FULL ORDER DETAILS MODAL / DRAWER ────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0b803f] tracking-wider bg-green-50 px-2.5 py-1 rounded-full">
                  Order Details
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">
                  Order #{selectedOrder.id.toUpperCase()}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Lifecycle Status Progress Stepper */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-gray-700">
                <span>Update Fulfillment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadge(selectedOrder.status)}`}>
                  Current: {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ORDER_STATUSES.map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === st 
                        ? 'bg-[#0b803f] text-white border-[#0b803f] shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Delivery Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Box */}
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 font-black text-gray-900 border-b border-gray-200/60 pb-2">
                  <User size={15} className="text-[#0b803f]" /> Customer Info
                </div>
                <p className="font-extrabold text-gray-900">{selectedOrder.customer_name || 'Guest User'}</p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" /> {selectedOrder.phone || 'No phone recorded'}
                </p>
              </div>

              {/* Delivery Address Box */}
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 font-black text-gray-900 border-b border-gray-200/60 pb-2">
                  <MapPin size={15} className="text-[#0b803f]" /> Delivery Address
                </div>
                <p className="font-bold text-gray-800 leading-relaxed">
                  {selectedOrder.address || '221B Baker Street, London'}
                </p>
              </div>
            </div>

            {/* Itemized Products Ordered Table */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">
                Itemized Order Summary
              </h4>

              <div className="border border-gray-200/90 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-extrabold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {item.image_url && (
                                <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 shrink-0" />
                              )}
                              <div>
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-[10px] text-gray-400">{item.unit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-black text-gray-900">
                            x{item.quantity}
                          </td>
                          <td className="p-3 text-right text-gray-600 font-semibold">
                            ₹{item.price}
                          </td>
                          <td className="p-3 text-right font-black text-gray-900">
                            ₹{Number(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400">
                          Standard Express Grocery Package (Total: ₹{selectedOrder.total_amount})
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Amount & Payment Mode Footer */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Payment Method</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {selectedOrder.payment_method || 'Cash on Delivery (COD)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Grand Total</span>
                <span className="font-black text-emerald-950 text-xl">
                  ₹{Number(selectedOrder.total_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-extrabold text-xs shadow-md"
              >
                Close Order View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
