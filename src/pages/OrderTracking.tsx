import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

const STAGES = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, login, loginError } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      getDoc(doc(db, 'orders', id))
        .then(docSnap => {
          if (docSnap.exists() && docSnap.data().userId === user.uid) {
            setOrder({ id: docSnap.id, ...docSnap.data() });
          } else {
            setOrder(null);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!user && loading) {
        setLoading(false);
    }
  }, [id, user, loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-green-600">Loading...</div>;
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-500 mb-6">You need to sign in to view this order.</p>
        
        {loginError && (
          <div className="mb-6 max-w-sm w-full p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 text-left">
            {loginError}
          </div>
        )}

        <button 
          onClick={login}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-green-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!order || order.error) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  const currentStageIndex = order.status === 'Cancelled' ? -1 : STAGES.indexOf(order.status);

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Order Tracking</h1>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs text-gray-500 font-medium mb-1">Order ID: #ORD{order.id.toString().padStart(6, '0')}</p>
        <p className="text-xs text-gray-500 mb-6">Placed on: {new Date(order.created_at).toLocaleString()}</p>

        {order.status === 'Cancelled' ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold">
            This order was cancelled.
          </div>
        ) : (
          <div className="relative pl-4 space-y-8">
            {/* Vertical line connecting nodes */}
            <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-100" />
            
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              
              return (
                <div key={stage} className="flex relative z-10 gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center ring-4 ring-white">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white ring-2 ring-gray-100" />
                    )}
                  </div>
                  <div className="-mt-1">
                    <p className={`text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isCurrent ? 'Your order is currently here' : 
                       isCompleted ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Order Details</h3>
        <div className="space-y-3">
          {order.items?.map((item: any, idx: number) => (
            <div key={item.productId || idx} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate max-w-[200px]">{item.quantity}x {item.product?.name || `Item #${item.productId}`}</span>
              <span className="font-medium text-gray-900 shrink-0 pl-2">₹{item.price_at_order * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-3 mt-2">
            <span>Total</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
