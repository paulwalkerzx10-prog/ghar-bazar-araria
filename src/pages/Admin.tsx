import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import AdminAuthGuard from '../components/admin/AdminAuthGuard.tsx';
import AdminSidebar from '../components/admin/AdminSidebar.tsx';
import AdminHeader from '../components/admin/AdminHeader.tsx';
import AdminDashboard from '../components/admin/AdminDashboard.tsx';
import AdminProducts from '../components/admin/AdminProducts.tsx';
import AdminCategories from '../components/admin/AdminCategories.tsx';
import AdminOrders from '../components/admin/AdminOrders.tsx';
import AdminCustomers from '../components/admin/AdminCustomers.tsx';
import AdminBanners from '../components/admin/AdminBanners.tsx';
import AdminSupport from '../components/admin/AdminSupport.tsx';
import AdminSettings from '../components/admin/AdminSettings.tsx';

function AdminContent({ onLogoutAdmin }: { onLogoutAdmin?: () => void }) {
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Firestore Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Sub-component state triggers
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      // Products
      const pSnap = await getDocs(collection(db, 'products'));
      if (!pSnap.empty) {
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Categories
      const cSnap = await getDocs(query(collection(db, 'categories'), orderBy('display_order')));
      if (!cSnap.empty) {
        setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Banners
      const bSnap = await getDocs(query(collection(db, 'banners')));
      if (!bSnap.empty) {
        setBanners(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Orders
      const oSnap = await getDocs(collection(db, 'orders'));
      if (!oSnap.empty) {
        const orderList = oSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setOrders(orderList);
      }

      // Customers
      const custSnap = await getDocs(collection(db, 'customers'));
      if (!custSnap.empty) {
        setCustomers(custSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    if (onLogoutAdmin) onLogoutAdmin();
    navigate('/');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Metric counts for badges
  const pendingOrdersCount = orders.filter(o => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Packed').length;
  const lowStockCount = products.filter(p => Number(p.stock || 0) <= 5).length;
  const openTicketsCount = 2; // Active support issues

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* 🟢 LEFT SIDEBAR (Desktop sticky + Mobile drawer) */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        pendingOrdersCount={pendingOrdersCount}
        openTicketsCount={openTicketsCount}
        onLogout={handleLogout}
      />

      {/* 🟡 MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Top Header */}
        <AdminHeader 
          title={
            activeTab === 'dashboard' ? 'Overview Dashboard' :
            activeTab === 'products' ? 'Product Catalog' :
            activeTab === 'categories' ? 'Category Manager' :
            activeTab === 'orders' ? 'Order Management' :
            activeTab === 'customers' ? 'Customer Directory' :
            activeTab === 'banners' ? 'Homepage & Banners' :
            activeTab === 'support' ? 'Customer Support' : 'Store Settings'
          }
          subtitle="GharBazar Grocery Admin Panel"
          setIsOpenMobile={setIsOpenMobile}
          onRefresh={fetchAdminData}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pendingOrdersCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
        />

        {/* Tab Content Renderer */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <AdminDashboard 
              products={products}
              orders={orders}
              categories={categories}
              customers={customers}
              onNavigateTab={setActiveTab}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSelectOrderDetails={(order) => {
                setSelectedOrderDetails(order);
                setActiveTab('orders');
              }}
              onQuickAddProduct={() => {
                setIsAddProductModalOpen(true);
                setActiveTab('products');
              }}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts 
              products={products}
              categories={categories}
              onRefresh={fetchAdminData}
              isAddModalOpen={isAddProductModalOpen}
              setIsAddModalOpen={setIsAddProductModalOpen}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories 
              categories={categories}
              products={products}
              onRefresh={fetchAdminData}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders 
              orders={orders}
              onRefresh={fetchAdminData}
              selectedOrderDetails={selectedOrderDetails}
              setSelectedOrderDetails={setSelectedOrderDetails}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers 
              customers={customers}
              orders={orders}
            />
          )}

          {activeTab === 'banners' && (
            <AdminBanners 
              banners={banners}
              categories={categories}
              onRefresh={fetchAdminData}
            />
          )}

          {activeTab === 'support' && (
            <AdminSupport 
              onRefresh={fetchAdminData}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings 
              onRefresh={fetchAdminData}
            />
          )}

        </main>
      </div>

    </div>
  );
}

export default function Admin() {
  return (
    <AdminAuthGuard>
      <AdminContent />
    </AdminAuthGuard>
  );
}
