import React, { useState } from 'react';
import { X, ShoppingCart, Share2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, hasDiscount, getFinalPrice, calculateDiscountPercentage } from '../../utils/priceFormatter';
import { useProducts } from '../../hooks/useProducts';
import { parseImagenes } from '../../lib/supabaseStorage';
import { toast } from '../../store/toastStore';
import LazyImage from '../ui/LazyImage';
import ProductCard from './ProductCard';

const ProductQuickView = ({ producto, isOpen, onClose, onQuickView }) => {
  const { addToCart } = useCart();
  const { getRelatedProducts } = useProducts();
  const [cantidad, setCantidad] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !producto) return null;

  const finalPrice = getFinalPrice(producto);
  const discount = hasDiscount(producto);
  const discountPercentage = discount ? calculateDiscountPercentage(producto.precio_base, producto.precio_promocion) : 0;
  const hasStock = producto.disponibilidad && producto.disponibilidad.length > 0;
  const relatedProducts = getRelatedProducts(producto.id, 4);

  // Simular galería de imágenes (en producción vendrían del backend)
  const images = parseImagenes(producto.imagen_url || producto.imagen);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!hasStock) {
      toast.error('Producto sin stock por el momento', {
          style: {
              background: '#000',
              color: '#fff',
              borderRadius: '16px',
              border: '1px solid #DC2626',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '0.1em'
          }
      });
      return;
    }
    
    setIsAdding(true);
    addToCart(producto, cantidad);
    
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 600);
  };

  const handleShare = async () => {
    const shareData = {
      title: producto.nombre,
      text: `${producto.nombre} - ${formatPrice(finalPrice)}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-700 p-4 md:p-6 flex items-center justify-between z-10">
          <h2 className="text-xl md:text-2xl font-sport uppercase">Vista Rápida</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Compartir"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6">
          
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-neutral-100 dark:bg-gray-800 rounded-2xl overflow-hidden group">
              {images.length > 0 ? (
                <>
                  <LazyImage
                    src={images[currentImageIndex]}
                    alt={producto.nombre}
                    className="w-full h-full"
                  />
                  
                  {/* Navegación de imágenes */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={20} />
                      </button>
                      
                      {/* Dots */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentImageIndex === idx 
                                ? 'bg-brand-cyan w-6' 
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badge de descuento */}
                  {discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
                      -{discountPercentage}%
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Thumbnails (si hay múltiples imágenes) */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx 
                        ? 'border-brand-cyan' 
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría y Marca */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              {producto.categoria && (
                <span className="text-neutral-500 dark:text-gray-400">{producto.categoria}</span>
              )}
              {producto.categoria && producto.marca && (
                <span className="text-neutral-300 dark:text-gray-600">•</span>
              )}
              {producto.marca && (
                <span className="text-brand-cyan">{producto.marca}</span>
              )}
            </div>

            {/* Nombre */}
            <h1 className="text-3xl md:text-4xl font-sport uppercase leading-tight">
              {producto.nombre}
            </h1>

            {/* Precios */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-sport text-brand-cyan">
                {formatPrice(finalPrice)}
              </span>
              {discount && (
                <span className="text-xl text-neutral-400 line-through">
                  {formatPrice(producto.precio_base)}
                </span>
              )}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="border-t border-neutral-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-neutral-600 dark:text-gray-400 leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>
            )}

            {/* Disponibilidad */}
            <div className="border-t border-neutral-200 dark:border-gray-700 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-gray-400 mb-3">
                Disponibilidad
              </h3>
              {hasStock && (
                <div className="space-y-2">
                  {producto.disponibilidad.map((disp, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-green-500" />
                      <span className="font-medium text-black dark:text-white">
                        {disp.sucursal}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de cantidad */}
            {hasStock && (
              <div className="border-t border-neutral-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-gray-400 mb-3">
                  Cantidad
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-gray-800 rounded-lg hover:bg-brand-cyan hover:text-white transition-all font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-xl">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-gray-800 rounded-lg hover:bg-brand-cyan hover:text-white transition-all font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 bg-brand-cyan text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5 ${isAdding ? 'scale-95' : ''}`}
            >
              <ShoppingCart size={20} className={isAdding ? 'animate-bounce' : ''} />
              {isAdding ? 'Agregando...' : `Agregar al Carrito - ${formatPrice(finalPrice * cantidad)}`}
            </button>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-gray-700 p-4 md:p-6 bg-neutral-50 dark:bg-gray-800/50">
            <h3 className="text-xl font-sport uppercase mb-6">Productos Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(prod => (
                <div key={prod.id} className="cursor-pointer" onClick={() => {
                  onClose();
                  setTimeout(() => onQuickView(prod), 300);
                }}>
                  <ProductCard
                    producto={prod}
                    onQuickView={onQuickView}
                    onCompareToggle={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductQuickView;
