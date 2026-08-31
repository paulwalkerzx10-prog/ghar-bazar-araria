import React from 'react';
import { Home, Grid, ShoppingCart, Clock, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.ts';
import { useNavStore } from '../store/navStore.ts';

export default function BottomNav() {
  const items = useCartStore(state => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const hasUnsavedChanges = useNavStore(state => state.hasUnsavedChanges);

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/categories', icon: Grid, label: 'Categories' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { to: '/orders', icon: Clock, label: 'Orders' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const handleNavClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Click OK to discard them, or Cancel to stay and save.")) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-2 z-50">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full space-y-1 relative ${
              isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <div className="relative">
            <link.icon size={20} />
            {link.badge !== undefined && link.badge > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                {link.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{link.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
