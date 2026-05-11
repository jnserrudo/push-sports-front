import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/priceFormatter';
import CheckoutModal from './CheckoutModal';
import LazyImage from '../ui/LazyImage';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const varianteText = item.variante 
    ? Object.values(item.variante.atributos_valores || {}).join(', ')
    : null;

  return (
    <div className="flex gap-4 p-4 bg-neutral-50 dark:bg-gray-800 rounded-xl group hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">
      {/* Imagen */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
        <LazyImage
          src={item.imagen || '/placeholder-product.jpg'}
          alt={item.nombre}
          className="w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-sport text-sm uppercase text-black dark:text-white mb-1 truncate">
          {item.nombre}
        </h4>
        
        {varianteText && (
          <p className="text-xs text-neutral-500 dark:text-gray-400 mb-2">
            {varianteText}
          </p>
        )}

        <div className="flex items-center justify-between">
          {/* Precio */}
          <span className="font-sport text-lg text-brand-cyan">
            {formatPrice(item.precio * item.cantidad)}
          </span>

          {/* Controles de cantidad */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1, item.variante)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg hover:bg-brand-cyan hover:text-white transition-all"
            >
              <Minus size={16} />
            </button>
            
            <span className="w-8 text-center font-bold text-black dark:text-white">
              {item.cantidad}
            </span>
            
            <button
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1, item.variante)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg hover:bg-brand-cyan hover:text-white transition-all"
            >
              <Plus size={16} />
            </button>

            <button
              onClick={() => onRemove(item.id, item.variante)}
              className="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all ml-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotal 
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  const total = getTotal();
  const isEmpty = cart.length === 0;

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white dark:bg-gray-900 z-[101] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-brand-cyan" />
            <h2 className="text-2xl font-sport uppercase">
              Tu Carrito ({cart.length})
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEmpty ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="text-neutral-300 dark:text-gray-600 mb-6">
                <ShoppingBag size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-sport uppercase text-black dark:text-white mb-3">
                Tu carrito está vacío
              </h3>
              <p className="text-neutral-500 dark:text-gray-400 mb-6 max-w-sm">
                Agrega productos para comenzar tu pedido
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-brand-cyan text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all"
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.id}-${index}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-neutral-200 dark:border-gray-700 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400">
                Total:
              </span>
              <span className="text-3xl font-sport text-brand-cyan">
                {formatPrice(total)}
              </span>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-brand-cyan text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                Finalizar Pedido por WhatsApp
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-neutral-100 dark:bg-gray-800 text-black dark:text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-gray-700 transition-all"
                >
                  Seguir Comprando
                </button>

                <button
                  onClick={clearCart}
                  className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                >
                  Vaciar
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-400 dark:text-gray-500 text-center">
              Coordinarás el pago y entrega por WhatsApp
            </p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};

export default CartDrawer;
