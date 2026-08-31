import React, { useEffect, useState } from 'react';
import { 
  Store, 
  Save, 
  CheckCircle2, 
  Shield, 
  Truck, 
  DollarSign, 
  Phone, 
  Mail,
  RefreshCw
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface AdminSettingsProps {
  onRefresh: () => void;
}

export default function AdminSettings({ onRefresh }: AdminSettingsProps) {
  const [formData, setFormData] = useState({
    store_name: 'GharBazar Grocery',
    tagline: 'Sab kuch, ghar tak!',
    support_phone: '+91 9876543210',
    support_email: 'support@gharbazar.com',
    currency_symbol: '₹',
    min_order_value: '99',
    free_delivery_threshold: '499',
    standard_delivery_fee: '30'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'store_config'));
      if (snap.exists()) {
        setFormData(prev => ({ ...prev, ...snap.data() }));
      }
    } catch (err) {
      console.error("Failed to load store settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await setDoc(doc(db, 'settings', 'store_config'), {
        ...formData,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Error saving settings to Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        <div>
          <h2 className="text-base font-black text-gray-900">Store Configurations</h2>
          <p className="text-xs text-gray-500">Manage store branding, contact details & delivery charges</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-extrabold text-xs">
            <CheckCircle2 size={16} /> Saved Successfully!
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">

        {/* Store Profile Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store size={18} className="text-[#0b803f]" /> Store Profile & Branding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Store Name *</label>
              <input 
                type="text" 
                required
                value={formData.store_name}
                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Tagline / Slogan</label>
              <input 
                type="text" 
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Customer Helpline Phone</label>
              <input 
                type="text" 
                value={formData.support_phone}
                onChange={e => setFormData({ ...formData, support_phone: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Support Email</label>
              <input 
                type="email" 
                value={formData.support_email}
                onChange={e => setFormData({ ...formData, support_email: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Checkout & Delivery Rules */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Truck size={18} className="text-[#0b803f]" /> Delivery Fees & Order Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Standard Delivery Fee (₹)</label>
              <input 
                type="number" 
                value={formData.standard_delivery_fee}
                onChange={e => setFormData({ ...formData, standard_delivery_fee: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Free Delivery Order Limit (₹)</label>
              <input 
                type="number" 
                value={formData.free_delivery_threshold}
                onChange={e => setFormData({ ...formData, free_delivery_threshold: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Minimum Order Amount (₹)</label>
              <input 
                type="number" 
                value={formData.min_order_value}
                onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-[#0b803f] hover:bg-emerald-700 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> {isSaving ? 'Saving Configurations...' : 'Save Settings'}
          </button>
        </div>

      </form>

    </div>
  );
}
