import { useState } from 'react';
import { useCartStore } from '../store/cartStore.ts';
import { Minus, Plus } from 'lucide-react';
import React from 'react';

export interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    unit: string;
    image_url: string | null;
    in_stock: boolean;
  };
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === product.id);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2 shadow-sm">
      <div className="relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="text-gray-300">No Image</div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-md">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[40px]">{product.name}</h3>
        <p className="text-gray-500 text-xs mt-1">{product.unit}</p>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-gray-900">₹{product.price}</span>
          
          {!product.in_stock ? (
            <button disabled className="bg-gray-100 text-gray-400 text-xs font-bold py-1.5 px-4 rounded-lg">
              ADD
            </button>
          ) : !cartItem ? (
            <button 
              onClick={() => addItem({ ...product, quantity: 1 })}
              className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold py-1.5 px-4 rounded-lg hover:bg-green-100 active:scale-95 transition-all"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center justify-between bg-green-600 text-white rounded-lg h-8 w-[72px]">
              <button 
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-1/3 flex items-center justify-center h-full hover:bg-green-700 rounded-l-lg transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-xs font-bold">{cartItem.quantity}</span>
              <button 
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-1/3 flex items-center justify-center h-full hover:bg-green-700 rounded-r-lg transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
