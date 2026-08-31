/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import Home from './pages/Home.tsx';
import Categories from './pages/Categories.tsx';
import Category from './pages/Category.tsx';
import Cart from './pages/Cart.tsx';
import OrderConfirmation from './pages/OrderConfirmation.tsx';
import Orders from './pages/Orders.tsx';
import OrderTracking from './pages/OrderTracking.tsx';
import Profile from './pages/Profile.tsx';
import Admin from './pages/Admin.tsx';
import BottomNav from './components/BottomNav.tsx';

export default function App() {
  const location = useLocation();
  const hideNavPaths = ['/profile/edit', '/order-confirmation', '/admin'];
  const showNav = !hideNavPaths.some(path => location.pathname === path);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-green-100 selection:text-green-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category" element={<Category />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/profile/*" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        {showNav && <BottomNav />}
      </div>
    </AuthProvider>
  );
}
