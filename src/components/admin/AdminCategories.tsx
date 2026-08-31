import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Upload, 
  Image as ImageIcon,
  Grid
} from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface AdminCategoriesProps {
  categories: any[];
  products: any[];
  onRefresh: () => void;
}

export default function AdminCategories({
  categories,
  products,
  onRefresh
}: AdminCategoriesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 1
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => Number(c.display_order || 0))) + 1 : 1;
    setFormData({
      name: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
      display_order: nextOrder
    });
    setImagePreview('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: Number(cat.display_order || 1)
    });
    setImagePreview(cat.image_url || '');
    setIsModalOpen(true);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
        display_order: Number(formData.display_order) || 1,
        updated_at: new Date().toISOString()
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), payload);
      } else {
        await addDoc(collection(db, 'categories'), {
          ...payload,
          created_at: new Date().toISOString()
        });
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      onRefresh();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const handleReorder = async (category: any, direction: 'up' | 'down') => {
    const currentOrder = Number(category.display_order || 0);
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    try {
      await updateDoc(doc(db, 'categories', category.id), { display_order: newOrder });
      onRefresh();
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        <div>
          <h2 className="text-base font-black text-gray-900">Store Categories</h2>
          <p className="text-xs text-gray-500">Manage categories, order display on homepage</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#0b803f] hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const productCount = products.filter(p => String(p.categoryId) === String(cat.id)).length;

          return (
            <div 
              key={cat.id}
              className="bg-white rounded-3xl border border-gray-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <img 
                  src={cat.image_url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'} 
                  alt={cat.name} 
                  className="w-16 h-16 object-cover rounded-2xl border border-gray-100 bg-gray-50 shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0b803f] bg-green-50 px-2 py-0.5 rounded-full">
                      Order #{cat.display_order || idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-gray-500">
                      {productCount} items
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-sm mt-1 truncate">
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                
                {/* Reorder Up/Down */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleReorder(cat, 'up')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Move Order Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    onClick={() => handleReorder(cat, 'down')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Move Order Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenEditModal(cat)}
                    className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* ────────────── CATEGORY MODAL ────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Snacks & Munchies"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#0b803f]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Display Order Position</label>
                <input 
                  type="number" 
                  value={formData.display_order}
                  onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Image</label>
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
                      placeholder="Image URL..."
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold text-[11px] cursor-pointer">
                      <Upload size={13} /> Upload Image
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0b803f] text-white font-extrabold hover:bg-emerald-700 shadow-md"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
