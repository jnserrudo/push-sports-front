import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-700 p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-sport uppercase">
            Comparar Productos ({products.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabla comparativa */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="min-w-max">
            {/* Desktop: Tabla lado a lado */}
            <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(250px, 1fr))` }}>
              {products.map((producto) => {
                const finalPrice = getFinalPrice(producto);
                const discount = hasDiscount(producto);
                const hasStock = producto.disponibilidad && producto.disponibilidad.length > 0;

                return (
                  <div key={producto.id} className="bg-neutral-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-gray-700">
                    {/* Imagen */}
                    <div className="aspect-square bg-white dark:bg-gray-700">
                      <LazyImage
                        src={producto.imagen || '/placeholder-product.jpg'}
                        alt={producto.nombre}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-4">
                      {/* Categoría */}
                      <div className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
                        {producto.categoria}
                      </div>

                      {/* Nombre */}
                      <h3 className="font-sport text-lg uppercase leading-tight min-h-[3rem]">
                        {producto.nombre}
                      </h3>

                      {/* Marca */}
                      <div className="text-sm text-neutral-500 dark:text-gray-400">
                        <span className="font-bold">Marca:</span> {producto.marca}
                      </div>

                      {/* Precio */}
                      <div className="border-t border-neutral-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-sport text-brand-cyan">
                            {formatPrice(finalPrice)}
                          </span>
                          {discount && (
                            <span className="text-sm text-neutral-400 line-through">
                              {formatPrice(producto.precio_base)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Descripción */}
                      {producto.descripcion && (
                        <div className="border-t border-neutral-200 dark:border-gray-700 pt-4">
                          <p className="text-xs text-neutral-600 dark:text-gray-400 line-clamp-3">
                            {producto.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Disponibilidad */}
                      <div className="border-t border-neutral-200 dark:border-gray-700 pt-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-gray-400 mb-2">
                          Disponibilidad
                        </div>
                        {hasStock ? (
                          <div className="text-xs text-green-600 dark:text-green-400 font-bold">
                            ✓ Disponible en {producto.disponibilidad.length} sucursal{producto.disponibilidad.length > 1 ? 'es' : ''}
                          </div>
                        ) : (
                          <div className="text-xs text-red-500 font-bold">
                            ✗ Sin stock
                          </div>
                        )}
                      </div>

                      {/* Botón */}
                      <button
                        onClick={() => handleAddToCart(producto)}
                        disabled={!hasStock}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          !hasStock
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-brand-cyan text-white hover:bg-black'
                        }`}
                      >
                        <ShoppingCart size={16} />
                        {hasStock ? 'Agregar' : 'Sin Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Cards apiladas */}
            <div className="md:hidden space-y-4">
              {products.map((producto) => {
                const finalPrice = getFinalPrice(producto);
                const discount = hasDiscount(producto);
                const hasStock = producto.disponibilidad && producto.disponibilidad.length > 0;

                return (
                  <div key={producto.id} className="bg-neutral-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-gray-700">
                    <div className="flex gap-4 p-4">
                      {/* Imagen */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                        <LazyImage
                          src={producto.imagen || '/placeholder-product.jpg'}
                          alt={producto.nombre}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan">
                          {producto.categoria}
                        </div>
                        <h3 className="font-sport text-base uppercase leading-tight">
                          {producto.nombre}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-sport text-brand-cyan">
                            {formatPrice(finalPrice)}
                          </span>
                          {discount && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPrice(producto.precio_base)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(producto)}
                          disabled={!hasStock}
                          className={`w-full py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            !hasStock
                              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                              : 'bg-brand-cyan text-white hover:bg-black'
                          }`}
                        >
                          <ShoppingCart size={14} />
                          {hasStock ? 'Agregar' : 'Sin Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparator;
