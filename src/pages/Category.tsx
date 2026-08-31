import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard.tsx';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Lays Magic Masala Chips',
    price: 20,
    unit: '50 g',
    categoryId: '3',
    categoryName: 'Snacks & Munchies',
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p2',
    name: 'Fresh Farm Milk (Toned)',
    price: 32,
    unit: '500 ml',
    categoryId: '2',
    categoryName: 'Dairy & Eggs',
    image_url: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p3',
    name: 'Farm Fresh Organic Eggs',
    price: 45,
    unit: '6 pcs',
    categoryId: '2',
    categoryName: 'Dairy & Eggs',
    image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p4',
    name: 'Crispy Crunchy Nachos & Cheese',
    price: 60,
    unit: '150 g',
    categoryId: '3',
    categoryName: 'Snacks & Munchies',
    image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p5',
    name: 'Fresh Robusta Bananas',
    price: 40,
    unit: '1 kg',
    categoryId: '1',
    categoryName: 'Fruits & Vegetables',
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  },
  {
    id: 'p6',
    name: 'Cold Pressed Orange Juice',
    price: 95,
    unit: '1 Litre',
    categoryId: '4',
    categoryName: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80',
    in_stock: true
  }
];

export default function Category() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('id');
  const categoryName = searchParams.get('name') || 'Products';

  const [products, setProducts] = useState<any[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, [categoryId]);

  // Filter products by category ID or name match
  const filteredProducts = products.filter(p => {
    if (!categoryId) return true;
    const catIdStr = String(p.categoryId || '').toLowerCase();
    const nameStr = String(p.categoryName || '').toLowerCase();
    const queryIdStr = String(categoryId).toLowerCase();
    const queryNameStr = String(categoryName).toLowerCase();

    return catIdStr.includes(queryIdStr) || 
           nameStr.includes(queryNameStr) ||
           catIdStr === queryIdStr ||
           queryNameStr.includes(catIdStr);
  });

  const displayList = filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{categoryName}</h1>
          <p className="text-xs text-gray-500 font-medium">{displayList.length} items available</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {displayList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
