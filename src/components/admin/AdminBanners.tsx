import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  Image as ImageIcon,
  Sparkles,
  Link
} from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface AdminBannersProps {
  banners: any[];
  categories: any[];
  onRefresh: () => void;
}

export default function AdminBanners({
  banners,
  categories,
  onRefresh
}: AdminBannersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    badge: 'FLAT 25% OFF',
    title: 'Crispy Snacks & Drinks',
    subtitle: '🍿 Party Favorites • Instant Delivery',
    cta: 'Shop Now →',
    categoryId: '3',
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    display_order: 1,
    is_active: true
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      badge: 'FLAT 25% OFF',
      title: 'Fresh Grocery Deal',
      subtitle: '⚡ 10 Minute Express Delivery',
      cta: 'Shop Now →',
      categoryId: categories[0]?.id || '1',
      image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
      display_order: banners.length + 1,
      is_active: true
    });
    setImagePreview('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: any) => {
    setEditingBanner(b);
    setFormData({
      badge: b.badge || 'PROMO',
      title: b.title || '',
      subtitle: b.subtitle || '',
      cta: b.cta || 'Shop Now →',
      categoryId: String(b.categoryId || '1'),
      image_url: b.image_url || '',
      display_order: Number(b.display_order || 1),
      is_active: b.is_active !== false
    });
    setImagePreview(b.image_url || '');
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
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        badge: formData.badge.trim(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        cta: formData.cta.trim(),
        categoryId: formData.categoryId,
        image_url: formData.image_url.trim(),
        display_order: Number(formData.display_order) || 1,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), payload);
      } else {
        await addDoc(collection(db, 'banners'), {
          ...payload,
          created_at: new Date().toISOString()
        });
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to save banner:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      onRefresh();
    } catch (err) {
      console.error("Failed to delete banner:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        <div>
          <h2 className="text-base font-black text-gray-900">Homepage Banners</h2>
          <p className="text-xs text-gray-500">Manage hero promotions & discounts shown on customer app</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#0b803f] hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            
            {/* Live Banner Preview Card */}
            <div className="p-5 bg-[#fffdf0] border-b border-amber-100 flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-[65%]">
                <span className="px-2 py-0.5 rounded-md bg-green-700 text-[#facc15] font-black text-[10px] tracking-wide inline-block">
                  {banner.badge || 'PROMO'}
                </span>
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight">
                  {banner.title}
                </h3>
                <p className="text-[11px] text-gray-600 font-medium">
                  {banner.subtitle}
                </p>
                <button className="mt-2 bg-[#0b803f] text-white font-extrabold text-[10px] px-3 py-1 rounded-lg">
                  {banner.cta || 'Shop Now →'}
                </button>
              </div>

              <img 
                src={banner.image_url} 
                alt={banner.title} 
                className="w-24 h-24 object-cover rounded-2xl shadow-xs border border-amber-200/60 bg-white"
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 flex items-center justify-between text-xs bg-white">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                banner.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {banner.is_active !== false ? 'Active' : 'Draft'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(banner)}
                  className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ────────────── BANNER MODAL ────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">Badge Tagline *</label>
                <input 
                  type="text" 
                  required
                  value={formData.badge}
                  onChange={e => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. FLAT 25% OFF"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Headline Title *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Crispy Snacks & Drinks"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subtitle Details</label>
                <input 
                  type="text" 
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. 🍿 Party Favorites • Express Delivery"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL or File</label>
                <div className="flex gap-3 items-center">
                  <img src={imagePreview} className="w-14 h-14 object-cover rounded-xl bg-gray-100 shrink-0 border" />
                  <div className="flex-1 space-y-1">
                    <input 
                      type="text" 
                      value={formData.image_url}
                      onChange={e => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-xl text-gray-700 font-bold text-[10px] cursor-pointer">
                      <Upload size={12} /> Upload File
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0b803f] text-white font-extrabold shadow-md"
                >
                  {isSubmitting ? 'Saving...' : editingBanner ? 'Update' : 'Create'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
