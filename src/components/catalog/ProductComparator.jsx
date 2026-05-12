import React from 'react';
import { X, ShoppingCart, Check, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, hasDiscount, getFinalPrice } from '../../utils/priceFormatter';
import LazyImage from '../ui/LazyImage';

const ProductComparator = ({ products, isOpen, onClose }) => {
  const { addToCart } = useCart();

  if (!isOpen || products.length === 0) return null;

  const handleAddToCart = (producto) => {
    addToCart(producto, 1);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center md:items-center animate-in fade-in duration-300">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Mobile: Bottom sheet, Desktop: Center modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full md:max-w-4xl md:max-h-[85vh] md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-300 flex flex-col md:mx-4">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-700 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-sport uppercase">
            Comparar ({products.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile: Horizontal scroll cards */}
          <div className="md:hidden flex gap-2 p-3 overflow-x-auto snap-x snap-mandatory">
            {products.map((producto) => {
              const finalPrice = getFinalPrice(producto);
              const discount = hasDiscount(producto);
              const hasStock = producto.disponibilidad && producto.disponibilidad.length > 0;

              return (
                <div key={producto.id} className="flex-shrink-0 w-64 snap-center">
                  <div className="bg-neutral-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-gray-700">
                    {/* Imagen ultra compacta */}
                    <div className="aspect-[3/2] bg-white dark:bg-gray-700 relative h-32">
                      <LazyImage
                        src={producto.imagen || '/placeholder-product.jpg'}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badge de descuento */}
                      {discount && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          -{Math.round((1 - finalPrice / producto.precio_base) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Info ultra compacta */}
                    <div className="p-2 space-y-1.5">
                      {/* Categoría y marca */}
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-brand-cyan">
                          {producto.categoria}
                        </span>
                        <span className="text-[8px] text-neutral-500">
                          {producto.marca}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h3 className="font-sport text-xs uppercase leading-tight line-clamp-2 min-h-[2rem]">
                        {producto.nombre}
                      </h3>

                      {/* Precio y stock */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-sport text-brand-cyan">
                              {formatPrice(finalPrice)}
                            </span>
                            {discount && (
                              <span className="text-[9px] text-neutral-400 line-through">
                                {formatPrice(producto.precio_base)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {hasStock ? (
                              <>
                                <Check size={10} className="text-green-500" />
                                <span className="text-[8px] text-green-600">
                                  {producto.disponibilidad.length} sucursal{producto.disponibilidad.length > 1 ? 'es' : ''}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle size={10} className="text-red-500" />
                                <span className="text-[8px] text-red-500">Sin stock</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(producto)}
                          disabled={!hasStock}
                          className={`p-1.5 rounded-lg transition-all ${
                            !hasStock
                              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                              : 'bg-brand-cyan text-white hover:bg-black active:scale-95'
                          }`}
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Ultra compact grid */}
          <div className="hidden md:block p-4">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr))` }}>
              {products.map((producto) => {
                const finalPrice = getFinalPrice(producto);
                const discount = hasDiscount(producto);
                const hasStock = producto.disponibilidad && producto.disponibilidad.length > 0;

                return (
                  <div key={producto.id} className="bg-neutral-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-gray-700">
                    {/* Imagen ultra compacta */}
                    <div className="aspect-[3/2] bg-white dark:bg-gray-700 relative h-28">
                      <LazyImage
                        src={producto.imagen || '/placeholder-product.jpg'}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badge de descuento */}
                      {discount && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          -{Math.round((1 - finalPrice / producto.precio_base) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Info ultra compacta */}
                    <div className="p-2.5 space-y-2">
                      {/* Categoría y marca */}
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-brand-cyan">
                          {producto.categoria}
                        </span>
                        <span className="text-[8px] text-neutral-500">
                          {producto.marca}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h3 className="font-sport text-xs uppercase leading-tight line-clamp-2 min-h-[1.8rem]">
                        {producto.nombre}
                      </h3>

                      {/* Precio */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-sport text-brand-cyan">
                          {formatPrice(finalPrice)}
                        </span>
                        {discount && (
                          <span className="text-[9px] text-neutral-400 line-through">
                            {formatPrice(producto.precio_base)}
                          </span>
                        )}
                      </div>

                      {/* Stock y botón */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-200 dark:border-gray-700">
                        <div className="flex items-center gap-0.5">
                          {hasStock ? (
                            <>
                              <Check size={10} className="text-green-500" />
                              <span className="text-[8px] text-green-600">
                                {producto.disponibilidad.length} sucursal{producto.disponibilidad.length > 1 ? 'es' : ''}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={10} className="text-red-500" />
                              <span className="text-[8px] text-red-500">Sin stock</span>
                            </>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(producto)}
                          disabled={!hasStock}
                          className={`p-1.5 rounded-lg transition-all ${
                            !hasStock
                              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                              : 'bg-brand-cyan text-white hover:bg-black active:scale-95'
                          }`}
                        >
                          <ShoppingCart size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Bottom action bar */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Desliza para comparar</span>
            <span>{products.length} producto{products.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparator;
