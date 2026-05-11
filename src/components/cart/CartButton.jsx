import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartButton = () => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const totalItems = getTotalItems();

  // Animar cuando cambia la cantidad
  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 z-50 bg-brand-cyan text-white p-4 rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all duration-300 group"
      aria-label="Abrir carrito"
    >
      <ShoppingCart 
        size={24} 
        className={`${isAnimating ? 'animate-bounce' : ''} group-hover:scale-110 transition-transform`}
      />
      
      {totalItems > 0 && (
        <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
          isAnimating ? 'animate-ping' : ''
        }`}>
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );
};

export default CartButton;
