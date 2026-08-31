import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

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

export default function Categories() {
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'categories'), orderBy('display_order'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900">All Categories</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat, idx) => {
          const fallbackImg = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length]?.image_url;
          return (
            <div 
              key={cat.id} 
              onClick={() => navigate(`/category?id=${cat.id}&name=${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center gap-2 cursor-pointer p-3 bg-white rounded-2xl shadow-xs border border-gray-100 hover:border-green-400 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-20 h-20 aspect-square rounded-2xl overflow-hidden bg-gray-50 p-1 border border-gray-100 flex items-center justify-center">
                <img 
                  src={cat.image_url || fallbackImg} 
                  alt={cat.name} 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold text-gray-800 text-center leading-tight group-hover:text-green-700 transition-colors">
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
