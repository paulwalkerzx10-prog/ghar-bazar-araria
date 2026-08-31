import { useEffect, useState } from 'react';
import { Package, MapPin, ArrowLeft, Loader2, ArrowRight, User, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

export default function Orders() {
  const { user, token, login, loginError } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user!.uid)); // Client-side sort to avoid index requirements
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(data);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24 max-w-lg mx-auto flex flex-col justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Orders</h2>
          <p className="text-gray-500 mb-6 text-sm">Sign in with your Google account to view your order history.</p>
          
          {loginError && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 text-left">
              {loginError}
            </div>
          )}

          <button 
            onClick={login}
            className="w-full bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-green-700 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'Placed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Your Orders</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const itemCount = order.items?.length || 0;
            const firstItemName = order.items?.[0]?.product?.name || 'Items';
            const itemSummary = itemCount > 1 ? `${firstItemName} + ${itemCount - 1} more` : firstItemName;

            return (
              <div 
                key={order.id} 
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Order #ORD{order.id.toString().padStart(6, '0')}</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-800 mb-2 font-medium">
                  <ShoppingBag size={14} className="mr-2 text-gray-400" />
                  <span className="truncate">{itemSummary}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin size={14} className="mr-2 text-gray-400" />
                  <span className="truncate">{order.address}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                  <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                  <div className="flex items-center text-green-600 text-xs font-semibold">
                    Track <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
