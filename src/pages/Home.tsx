import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Menu, 
  X, 
  ShoppingCart, 
  ArrowRight, 
  Check, 
  Store, 
  Clock, 
  Grid, 
  User
} from 'lucide-react';
import ProductCard from '../components/ProductCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useCartStore } from '../store/cartStore.ts';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

// Default categories matching user screenshot with realistic images
const DEFAULT_CATEGORIES = [
  {
    id: 'fruits-veg',
    name: 'Fruits & Vegetables',
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'dairy-eggs',
    name: 'Dairy & Eggs',
    image_url: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'snacks-munchies',
    name: 'Snacks & Munchies',
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'beverages',
    name: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'household',
    name: 'Household',
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
  }
];

// Default banners for instant zero-lag display
const DEFAULT_BANNERS = [
  {
    id: 'banner-1',
    badge: 'FLAT 25% OFF',
    title: 'Crispy Snacks & Drinks',
    tag1: '🍿 Party Favorites',
    tag2: '✓ Instant Delivery',
    btnText: 'Shop Now',
    categoryId: 'snacks-munchies',
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'banner-2',
    badge: 'UP TO 40% OFF',
    title: 'Fresh Fruits & Veggies',
    tag1: '🥬 Farm Fresh Pick',
    tag2: '✓ 10-Min Delivery',
    btnText: 'Explore Fresh',
    categoryId: 'fruits-veg',
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'banner-3',
    badge: 'DAILY ESSENTIALS',
    title: 'Fresh Milk & Dairy',
    tag1: '🥛 Pure & Organic',
    tag2: '✓ Chilled Express',
    btnText: 'Order Dairy',
    categoryId: 'dairy-eggs',
    image_url: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=400&q=80'
  }
];

// Default fallback products
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Lays Magic Masala Chips',
    price: 20,
    unit: '50 g',
    categoryId: 'snacks-munchies',
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p2',
    name: 'Fresh Farm Milk (Toned)',
    price: 32,
    unit: '500 ml',
    categoryId: 'dairy-eggs',
    image_url: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p3',
    name: 'Farm Fresh Organic Eggs',
    price: 45,
    unit: '6 pcs',
    categoryId: 'dairy-eggs',
    image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p4',
    name: 'Crispy Crunchy Nachos & Cheese',
    price: 60,
    unit: '150 g',
    categoryId: 'snacks-munchies',
    image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p5',
    name: 'Fresh Robusta Bananas',
    price: 40,
    unit: '1 kg',
    categoryId: 'fruits-veg',
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p6',
    name: 'Cold Pressed Orange Juice',
    price: 95,
    unit: '1 Litre',
    categoryId: 'beverages',
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartItems = useCartStore(state => state.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // States initialized with default data so UI renders instantly (zero loading flicker)
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<any[]>(DEFAULT_PRODUCTS);
  const [banners, setBanners] = useState<any[]>(DEFAULT_BANNERS);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState<string>('221B Baker Street, London');
  
  // Modals & Drawers
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch address from user profile if available
  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'customers', user.uid))
        .then(docSnap => {
          if (docSnap.exists() && docSnap.data().address) {
            setAddress(docSnap.data().address);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  // Background fetch from Firestore to keep data up-to-date
  useEffect(() => {
    const fetchFirestoreData = async () => {
      try {
        const [catsSnap, prodsSnap, bansSnap] = await Promise.all([
          getDocs(query(collection(db, 'categories'), orderBy('display_order'))).catch(() => null),
          getDocs(collection(db, 'products')).catch(() => null),
          getDocs(query(collection(db, 'banners'))).catch(() => null)
        ]);

        if (catsSnap && !catsSnap.empty) {
          const dbCats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          // Merge images if missing
          setCategories(dbCats.map((cat, idx) => ({
            ...cat,
            image_url: cat.image_url || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length]?.image_url
          })));
        }

        if (prodsSnap && !prodsSnap.empty) {
          setProducts(prodsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        if (bansSnap && !bansSnap.empty) {
          setBanners(bansSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Firestore sync notice (using optimized fallback):", err);
      }
    };

    fetchFirestoreData();
  }, []);

  // Filter products by search query
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentBanner = banners[activeBannerIdx] || DEFAULT_BANNERS[0];

  return (
    <div className="pb-28 min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      
      {/* 🟢 TOP GREEN HEADER SECTION (Matching Screenshot) */}
      <header className="bg-[#0b803f] text-white pt-3 pb-5 px-4 shadow-md rounded-b-3xl">
        <div className="max-w-md mx-auto">
          
          {/* Top Row: Hamburger Menu, Logo, Shopping Cart */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu size={26} className="text-white" />
            </button>

            {/* App Branding Logo */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-extrabold tracking-tight leading-none">
                Ghar<span className="text-[#facc15]">Bazar</span>
              </h1>
              <span className="text-[11px] font-medium text-white/90 mt-0.5 tracking-wide">
                Sab kuch, ghar tak!
              </span>
            </div>

            {/* Shopping Cart Button with Cart Badge */}
            <button 
              onClick={() => navigate('/cart')}
              className="relative p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={24} className="text-white" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#facc15] text-gray-900 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Delivery Address Bar - Navigates to /profile */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center gap-1.5 text-xs text-white/95 cursor-pointer hover:text-white transition-opacity py-1 px-2 rounded-lg hover:bg-white/10 max-w-fit mx-auto mb-3"
          >
            <MapPin size={15} className="text-white shrink-0" />
            <span className="font-normal text-white/90">Deliver to</span>
            <span className="font-bold text-white underline decoration-white/40 truncate max-w-[200px]">
              {address}
            </span>
            <ChevronDown size={14} className="text-white/80 shrink-0 ml-0.5" />
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search for "milk", "bread", "eggs"...' 
              className="w-full bg-white text-gray-900 border-0 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium placeholder:text-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
            />
          </div>

        </div>
      </header>

      {/* ────────────── MAIN CONTENT CONTAINER ────────────── */}
      <main className="max-w-md mx-auto px-4 mt-4 space-y-6">

        {/* 🟡 PROMO HERO BANNER CARD (Matching Screenshot) */}
        {!searchQuery && (
          <div className="space-y-2">
            <div className="bg-[#fefce8] border border-amber-100 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
              
              {/* Left Details */}
              <div className="flex-1 pr-3 z-10">
                <span className="inline-block bg-[#fef08a] text-amber-900 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 shadow-xs">
                  {currentBanner.badge || 'FLAT 25% OFF'}
                </span>
                
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-2">
                  {currentBanner.title || 'Crispy Snacks & Drinks'}
                </h2>

                <div className="space-y-1 mb-4 text-xs font-semibold text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <span>{currentBanner.tag1 || '🍿 Party Favorites'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-800">
                    <Check size={14} className="text-green-600 stroke-[3]" />
                    <span>{currentBanner.tag2?.replace('✓ ', '') || 'Instant Delivery'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/category?id=3&name=Snacks%20%26%20Munchies')}
                  className="bg-[#e65c00] hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 px-4 sm:px-5 rounded-full inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentBanner.btnText || 'Shop Now'}</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </button>
              </div>

              {/* Right Image Container */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-white p-1">
                <img 
                  src={currentBanner.image_url} 
                  alt="Promotion" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>

            {/* Banner Pagination Dots */}
            {banners.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIdx(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeBannerIdx 
                        ? 'w-6 bg-[#0b803f]' 
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🛍️ CATEGORIES SECTION (Matching Screenshot) */}
        {!searchQuery && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Categories</h2>
              <button 
                onClick={() => navigate('/categories')}
                className="text-[#0b803f] font-bold text-xs hover:underline cursor-pointer"
              >
                See all
              </button>
            </div>

            {/* 3-Column Grid Layout matching screenshot */}
            <div className="grid grid-cols-3 gap-3">
              {categories.slice(0, 6).map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => navigate(`/category?id=${cat.id}&name=${encodeURIComponent(cat.name)}`)}
                  className="bg-gray-50/80 hover:bg-white border border-gray-100 rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer hover:border-green-300 hover:shadow-md transition-all active:scale-95 group"
                >
                  {/* Category Image Box */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 aspect-square rounded-2xl overflow-hidden bg-white p-1 border border-gray-100 shadow-xs mb-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img 
                      src={cat.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                      alt={cat.name} 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Category Title */}
                  <span className="text-xs font-extrabold text-gray-800 leading-tight group-hover:text-green-700 transition-colors line-clamp-2">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 📦 POPULAR PRODUCTS / SEARCH RESULTS */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Products'}
            </h2>
            {!searchQuery && (
              <span className="text-xs text-gray-400 font-medium">Delivered in 10 mins</span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
              No products found matching "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ────────────── SIDEBAR NAVIGATION DRAWER ────────────── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMenuOpen(false)} 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="bg-[#0b803f] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold">Ghar<span className="text-[#facc15]">Bazar</span></h3>
                <p className="text-xs text-white/80 mt-0.5">Sab kuch, ghar tak!</p>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X size={22} className="text-white" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <button 
                onClick={() => { setIsMenuOpen(false); navigate('/'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <Store size={18} className="text-green-600" /> Home
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); navigate('/categories'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <Grid size={18} className="text-green-600" /> All Categories
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); navigate('/orders'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <Clock size={18} className="text-green-600" /> My Orders
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); navigate('/cart'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <ShoppingCart size={18} className="text-green-600" /> Cart ({totalCartCount})
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <User size={18} className="text-green-600" /> Profile & Address
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
              GharBazar Express Delivery v1.0
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
