import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  Check, 
  X, 
  Upload, 
  Image as ImageIcon,
  Tag,
  AlertCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface AdminProductsProps {
  products: any[];
  categories: any[];
  onRefresh: () => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export default function AdminProducts({
  products,
  categories,
  onRefresh,
  isAddModalOpen: externalAddModalOpen,
  setIsAddModalOpen: externalSetAddModalOpen
}: AdminProductsProps) {
  const [internalAddModalOpen, setInternalAddModalOpen] = useState(false);
  
  const isModalOpen = externalAddModalOpen !== undefined ? externalAddModalOpen : internalAddModalOpen;
  const setModalOpen = externalSetAddModalOpen || setInternalAddModalOpen;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    unit: '1 kg',
    categoryId: '',
    image_url: '',
    is_featured: false,
    is_bestseller: false,
    is_active: true
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesQuery = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || 
                       String(p.categoryId) === String(selectedCategory);

    let matchesStatus = true;
    if (statusFilter === 'in_stock') matchesStatus = Number(p.stock || 0) > 0;
    if (statusFilter === 'low_stock') matchesStatus = Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5;
    if (statusFilter === 'out_of_stock') matchesStatus = Number(p.stock || 0) === 0;
    if (statusFilter === 'featured') matchesStatus = Boolean(p.is_featured);
    if (statusFilter === 'inactive') matchesStatus = p.is_active === false;

    return matchesQuery && matchesCat && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      mrp: '',
      stock: '20',
      unit: '1 kg',
      categoryId: categories[0]?.id || 'fruits-veg',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      is_featured: false,
      is_bestseller: false,
      is_active: true
    });
    setImagePreview('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      mrp: String(product.mrp || product.price || ''),
      stock: String(product.stock !== undefined ? product.stock : 10),
      unit: product.unit || '1 item',
      categoryId: String(product.categoryId || categories[0]?.id || ''),
      image_url: product.image_url || '',
      is_featured: Boolean(product.is_featured),
      is_bestseller: Boolean(product.is_bestseller),
      is_active: product.is_active !== false
    });
    setImagePreview(product.image_url || '');
    setModalOpen(true);
  };

  // Image Upload handler (Base64 file reader)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate discount percentage automatically
  const calcDiscount = () => {
    const price = Number(formData.price) || 0;
    const mrp = Number(formData.mrp) || 0;
    if (mrp > price && mrp > 0) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('Please fill out product name and price');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = Number(formData.price);
      const mrpNum = Number(formData.mrp) || priceNum;
      const stockNum = Number(formData.stock) || 0;

      const categoryObj = categories.find(c => String(c.id) === String(formData.categoryId));

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceNum,
        mrp: mrpNum,
        discount_percent: mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
        stock: stockNum,
        unit: formData.unit.trim() || '1 item',
        categoryId: formData.categoryId,
        categoryName: categoryObj?.name || 'General',
        image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        in_stock: stockNum > 0,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload);
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          created_at: new Date().toISOString()
        });
      }

      setModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Error saving product to database");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      onRefresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleToggleActive = async (product: any) => {
    const newStatus = !product.is_active;
    try {
      await updateDoc(doc(db, 'products', product.id), { is_active: newStatus });
      onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* 🟢 TOP ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        
        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by product name..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤5)</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="featured">Featured</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleOpenAddModal}
          className="bg-[#0b803f] hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} /> Add Product
        </button>

      </div>

      {/* 🟡 PRODUCTS CATALOG TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Tag size={32} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-600">No products found matching filters</p>
            <p className="text-xs text-gray-400">Try clearing your search query or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-gray-200/80">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price & MRP</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => {
                  const stockNum = Number(product.stock || 0);
                  const isLow = stockNum > 0 && stockNum <= 5;
                  const isOut = stockNum === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Product details & thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-gray-900 text-xs leading-tight">{product.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{product.unit || '1 item'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 font-semibold text-gray-700">
                        {product.categoryName || product.categoryId || 'General'}
                      </td>

                      {/* Price & MRP */}
                      <td className="p-4">
                        <div className="font-black text-gray-900">₹{product.price}</div>
                        {product.mrp && Number(product.mrp) > Number(product.price) && (
                          <div className="text-[11px] text-gray-400 line-through">₹{product.mrp}</div>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="p-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] border border-rose-200">
                            Out of stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-200">
                            Low Stock ({stockNum})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-200">
                            {stockNum} in stock
                          </span>
                        )}
                      </td>

                      {/* Tags/Badges */}
                      <td className="p-4 space-x-1">
                        {product.is_featured && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                            <Star size={10} className="fill-purple-600 text-purple-600" /> Featured
                          </span>
                        )}
                        {product.is_bestseller && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                            <TrendingUp size={10} className="text-amber-600" /> Bestseller
                          </span>
                        )}
                      </td>

                      {/* Active/Inactive Switch */}
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleActive(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-colors cursor-pointer ${
                            product.is_active !== false 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                              : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {product.is_active !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-xs"
                          title="Edit Product"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
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

      {/* ────────────── CREATE / EDIT PRODUCT MODAL ────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Grocery Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amul Fresh Toned Milk"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select 
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit / Pack Size *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 500 ml, 1 kg, 6 pcs"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                  />
                </div>
              </div>

              {/* Price, MRP, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="32"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">MRP (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.mrp}
                    onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="35"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Level *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                  />
                </div>
              </div>

              {/* Discount Info Badge */}
              {calcDiscount() > 0 && (
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold text-[11px] flex items-center justify-between">
                  <span>Calculated Savings: {calcDiscount()}% OFF</span>
                  <span className="text-gray-500 line-through">MRP: ₹{formData.mrp}</span>
                </div>
              )}

              {/* Product Image Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Image</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={formData.image_url}
                      onChange={e => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Paste Image URL..."
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                    
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold text-[11px] cursor-pointer transition-colors">
                      <Upload size={13} /> Upload File
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Checkboxes: Featured / Bestseller / Active */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_featured}
                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-[#0b803f]"
                  />
                  <span className="font-bold text-gray-800">Featured</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_bestseller}
                    onChange={e => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="rounded text-[#0b803f]"
                  />
                  <span className="font-bold text-gray-800">Bestseller</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-[#0b803f]"
                  />
                  <span className="font-bold text-gray-800">Active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0b803f] hover:bg-emerald-700 text-white font-extrabold shadow-md active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
