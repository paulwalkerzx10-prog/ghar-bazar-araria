import React, { useState } from 'react';
import { 
  Search, 
  User, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Eye,
  ShieldCheck,
  X,
  CreditCard
} from 'lucide-react';

interface AdminCustomersProps {
  customers: any[];
  orders: any[];
}

export default function AdminCustomers({
  customers,
  orders
}: AdminCustomersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Derive full customer metrics from orders if firestore customer docs are partial
  const customerMap: Record<string, any> = {};

  // Hydrate from customers array
  customers.forEach(c => {
    customerMap[c.id] = {
      id: c.id,
      name: c.name || c.displayName || 'Customer',
      email: c.email || 'N/A',
      phone: c.phone || 'N/A',
      address: c.address || 'Standard Delivery Address',
      created_at: c.created_at || new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
      orders: []
    };
  });

  // Aggregate orders for each customer
  orders.forEach(order => {
    const key = order.customer_id || order.customer_name || 'Guest User';
    if (!customerMap[key]) {
      customerMap[key] = {
        id: key,
        name: order.customer_name || 'Customer',
        email: order.email || 'N/A',
        phone: order.phone || 'N/A',
        address: order.address || 'Standard Address',
        created_at: order.created_at || new Date().toISOString(),
        ordersCount: 0,
        totalSpent: 0,
        orders: []
      };
    }

    customerMap[key].ordersCount += 1;
    if (order.status !== 'Cancelled') {
      customerMap[key].totalSpent += Number(order.total_amount || 0);
    }
    customerMap[key].orders.push(order);
  });

  const customerList = Object.values(customerMap);

  const filteredCustomers = customerList.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6">

      {/* Top Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, email or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30"
          />
        </div>

        <div className="text-xs font-bold text-gray-500">
          Showing {filteredCustomers.length} registered shoppers
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No customers found matching search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-gray-200/80">
                  <th className="p-4">Customer Profile</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((cust, idx) => (
                  <tr key={cust.id || idx} className="hover:bg-gray-50/60 transition-colors">
                    
                    {/* Name & Avatar */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-[#0b803f] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900">{cust.name}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <ShieldCheck size={11} className="text-emerald-500" /> Verified Account
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="p-4">
                      <div className="text-gray-900 font-semibold">{cust.phone}</div>
                      <div className="text-[11px] text-gray-400">{cust.email}</div>
                    </td>

                    {/* Orders Count */}
                    <td className="p-4 font-bold text-gray-800">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-xs">
                        {cust.ordersCount} {cust.ordersCount === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="p-4 font-black text-gray-900 text-sm">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>

                    {/* View Profile Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3 py-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-xl font-bold text-xs inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> Profile
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────── CUSTOMER DETAIL MODAL ────────────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0b803f] text-white flex items-center justify-center font-black text-lg shadow-md">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">Customer ID: #{String(selectedCustomer.id).slice(-8)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Customer Contact Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone Number</span>
                <span className="font-extrabold text-gray-900">{selectedCustomer.phone}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Address</span>
                <span className="font-bold text-gray-900 truncate block">{selectedCustomer.email}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Primary Address</span>
                <span className="font-bold text-gray-800">{selectedCustomer.address}</span>
              </div>
            </div>

            {/* Past Orders History */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">
                Past Order History ({selectedCustomer.orders.length})
              </h4>

              {selectedCustomer.orders.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No order history available for this account.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.orders.map((ord: any) => (
                    <div key={ord.id} className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-gray-900">#{ord.id.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400">{ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">₹{ord.total_amount}</p>
                        <span className="text-[10px] font-extrabold text-[#0b803f]">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-extrabold text-xs shadow-md"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
