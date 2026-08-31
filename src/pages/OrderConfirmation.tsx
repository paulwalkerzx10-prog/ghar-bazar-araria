import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Confetti effect placeholder */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxjaXJjbGUgY3g9IjEwJSIgY3k9IjIwJSIgcj0iNCIgZmlsbD0iI2YyOGI4MiIvPjxjaXJjbGUgY3g9IjgwJSIgY3k9IjEwJSIgcj0iNSIgZmlsbD0iI2Y5YzcyMiIvPjxjaXJjbGUgY3g9IjMwJSIgY3k9IjcwJSIgcj0iNiIgZmlsbD0iIzRmOGI0YyIvPjwvc3ZnPg==')]"></div>

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">Our team will call you shortly to confirm your order.</p>

        <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
          <p className="font-mono font-bold text-gray-800 mb-4">#ORD{order.id.toString().padStart(6, '0')}</p>
          
          <p className="text-xs text-gray-400 font-medium mb-1">Estimated Delivery</p>
          <p className="font-bold text-green-700">{order.delivery_slot}</p>
        </div>

        <button 
          onClick={() => navigate('/orders')}
          className="w-full bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-3"
        >
          Track Order
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white text-gray-600 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
