import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Minus, Plus, Trash2, ArrowLeft, MapPin, Clock, User, Navigation } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const { user, token, login, loginError } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [slot, setSlot] = useState('Today 2PM - 4PM');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      getDoc(doc(db, 'customers', user!.uid))
        .then(snap => snap.exists() ? snap.data() : null)
        .then(data => {
          if (data) {
            if (data.name && !name) setName(data.name);
            if (data.phone && !phone) setPhone(data.phone);
            if (data.address && !address) {
               // Extract ward no if it's there
               if (data.address.startsWith("Ward No: ")) {
                 const parts = data.address.split(" | ");
                 setWardNo(parts[0].replace("Ward No: ", ""));
                 setAddress(parts[1] || "");
               } else {
                 setAddress(data.address);
               }
            }
          }
        })
        .catch(err => console.error("Failed to load profile", err));
    }
  }, [token]);

  const handleGetLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat.toString());
        setLongitude(lon.toString());
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress("Location captured from GPS (Address not found)");
          }
        } catch (err) {
          console.error("Geocoding error", err);
          setAddress(`GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        setLocationError(error.message || "Unable to retrieve your location");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const itemTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFormValid = address.trim() && name.trim() && phone.trim();

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    if (!isFormValid || items.length === 0) return;
    if (phone.trim().length !== 10) {
      setCheckoutError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (address.trim().length < 10) {
      setCheckoutError("Address is too short. Please provide a complete address (min 10 characters).");
      return;
    }

    setLoading(true);
    try {
      const finalAddress = wardNo.trim() ? `Ward No: ${wardNo.trim()} | ${address.trim()}` : address.trim();

      const payload = {
        userId: user!.uid,
        customer_name: name,
        phone_number: phone,
        address: finalAddress,
        latitude,
        longitude,
        delivery_slot: slot,
        status: 'Placed',
        total_amount: itemTotal,
        created_at: new Date().toISOString(),
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price_at_order: item.price,
          product: item // embed product data for easy display
        }))
      };

      const orderRef = await addDoc(collection(db, 'orders'), payload);
      const order = { id: orderRef.id, ...payload };
      
      clearCart();
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      console.error(err);
      // Removed alert as it can crash cross-origin iframes
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-500 mb-6">You need to sign in to place an order.</p>
        
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Trash2 size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-green-700 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-3">Items ({items.length})</h2>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xs text-gray-400">Img</span>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900 leading-tight">{item.name}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 -mr-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className="text-xs text-gray-500">{item.unit}</span>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                  <div className="flex items-center bg-green-50 border border-green-200 text-green-700 rounded-lg h-7 w-[72px]">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-1/3 flex items-center justify-center h-full hover:bg-green-100 rounded-l-lg transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold flex-1 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-1/3 flex items-center justify-center h-full hover:bg-green-100 rounded-r-lg transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Delivery Details</h2>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center"><MapPin size={14} className="mr-1"/> Address</label>
          <button 
            type="button"
            onClick={handleGetLocation} 
            disabled={gettingLocation}
            className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 py-3 rounded-xl font-bold mb-3 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <Navigation size={18} />
            {gettingLocation ? 'Capturing Location...' : 'Use Current GPS Location'}
          </button>
          
          <input 
            type="text" 
            value={wardNo} 
            onChange={(e) => setWardNo(e.target.value)}
            placeholder="Ward No. (Optional)"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
          
          <textarea 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Complete delivery address"
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
          />
          {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center"><Clock size={14} className="mr-1"/> Delivery Slot</label>
          <select 
            value={slot} 
            onChange={(e) => setSlot(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
          >
            <option>Today 10AM - 12PM</option>
            <option>Today 2PM - 4PM</option>
            <option>Today 6PM - 8PM</option>
            <option>Tomorrow Morning</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Bill Details</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Item Total</span>
            <span>₹{itemTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
            <span>Grand Total</span>
            <span>₹{itemTotal}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Place Order Button */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40">
        <div className="max-w-lg mx-auto">
          {checkoutError && <p className="text-xs text-red-600 font-bold mb-2 text-center">{checkoutError}</p>}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pay on Delivery</p>
              <p className="font-bold text-gray-900">₹{itemTotal}</p>
            </div>
            <button 
              onClick={handlePlaceOrder}
              disabled={!isFormValid || loading}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-center"
            >
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
