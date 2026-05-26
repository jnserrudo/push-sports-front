import React, { useState } from 'react';
import { ShoppingCart, Eye, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, hasDiscount, getFinalPrice, calculateDiscountPercentage } from '../../utils/priceFormatter';
import { parseImagenes } from '../../lib/supabaseStorage';
import LazyImage from '../ui/LazyImage';

const ProductCard = ({ producto, onQuickView, onCompareToggle, isComparing = false }) => {
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const finalPrice = getFinalPrice(producto);
  const discount = hasDiscount(producto);
  const discountPercentage = discount ? calculateDiscountPercentage(producto.precio_base, producto.precio_promocion) : 0;
  const inCart = isInCart(producto.id);
  const hasStock = producto.disponibilidad && producto.disponibilidad.length > 0;
  const parsedImages = parseImagenes(producto.imagen_url || producto.imagen);
  const mainImage = parsedImages.length > 0 ? parsedImages[0] : '/placeholder-product.jpg';

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!hasStock) return;
    
    setIsAdding(true);
    addToCart(producto, 1);
    
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView(producto);
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    onCompareToggle(producto);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-gray-700">
        <LazyImage
          src={mainImage}
          alt={producto.nombre}
          className="w-full h-full"
        />
        
        {/* Badge de descuento */}
        {discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {/* Badge de categoría */}
        {producto.categoria && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
            {producto.categoria}
          </div>
        )}

        {/* Overlay con botones (visible en hover en desktop) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={handleQuickView}
            className="bg-white text-black p-3 rounded-full hover:bg-brand-cyan hover:text-white transition-all duration-300 hover:scale-110 shadow-lg"
            title="Vista rápida"
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Checkbox de comparación (siempre visible en móvil) */}
        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3">
          <label className="flex items-center gap-1.5 md:gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm border border-neutral-100 dark:border-gray-700">
            <input
              type="checkbox"
              checked={isComparing}
              onChange={handleCompareToggle}
              className="w-3.5 h-3.5 md:w-4 md:h-4 accent-brand-cyan"
            />
            <span className="text-[10px] md:text-xs font-bold text-black dark:text-white">Comparar</span>
          </label>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        {/* Marca */}
        {producto.marca && (
          <p className="text-[9px] font-black uppercase tracking-wider text-brand-cyan mb-1">
            {producto.marca}
          </p>
        )}

        {/* Nombre */}
        <h3 className="font-sport text-lg uppercase text-black dark:text-white mb-2 leading-tight line-clamp-2 min-h-[3.5rem]">
          {producto.nombre}
        </h3>

        {/* Descripción corta */}
        {producto.descripcion && (
          <p className="text-xs text-neutral-500 dark:text-gray-400 mb-3 line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        {/* Precios */}
        <div className="flex items-center gap-2 mb-3 mt-auto">
          <span className="text-2xl font-sport text-brand-cyan">
            {formatPrice(finalPrice)}
          </span>
          {discount && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(producto.precio_base)}
            </span>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="mb-4">
          {hasStock ? (
            <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-gray-400">
              <MapPin size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-green-600 dark:text-green-400">Disponible en:</span>
                <div className="mt-1 space-y-0.5">
                  {producto.disponibilidad.slice(0, 2).map((disp, idx) => (
                    <div key={idx} className="text-[10px]">
                      • {disp.sucursal}
                    </div>
                  ))}
                  {producto.disponibilidad.length > 2 && (
                    <div className="text-[10px] text-brand-cyan font-bold">
                      +{producto.disponibilidad.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <MapPin size={14} />
              <span className="font-bold">Sin stock disponible</span>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-1.5 md:gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!hasStock || isAdding}
            className={`flex-1 py-2 md:py-3 px-1 md:px-3 rounded-xl font-bold text-[9px] md:text-sm uppercase tracking-wider md:tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 ${
              !hasStock
                ? 'bg-neutral-200 dark:bg-gray-700 text-neutral-400 dark:text-gray-400 cursor-not-allowed'
                : inCart
                ? 'bg-green-500 text-white'
                : 'bg-brand-cyan text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5'
            } ${isAdding ? 'scale-95' : ''}`}
          >
            <ShoppingCart size={16} className={`md:w-[18px] md:h-[18px] flex-shrink-0 ${isAdding ? 'animate-bounce' : ''}`} />
            <span className="truncate">{!hasStock ? 'Sin Stock' : inCart ? 'En Carrito' : 'Agregar'}</span>
          </button>

          <button
            onClick={handleQuickView}
            className="md:hidden bg-neutral-100 dark:bg-gray-700 text-black dark:text-white p-2 rounded-xl hover:bg-brand-cyan hover:text-white transition-all duration-300 flex-shrink-0 flex items-center justify-center"
            title="Vista rápida"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
