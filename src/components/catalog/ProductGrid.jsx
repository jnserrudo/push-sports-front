import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductComparator from './ProductComparator';
import { SkeletonGrid } from '../ui/SkeletonCard';
import { useProducts } from '../../hooks/useProducts';

const ProductGrid = ({ onQuickView }) => {
  const {
    filteredProducts,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    categorias,
    marcas
  } = useProducts();

  const [comparingProducts, setComparingProducts] = useState([]);
  const [showComparator, setShowComparator] = useState(false);
  const [displayCount, setDisplayCount] = useState(8);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(8);
  }, [filters]);

  const handleCompareToggle = (producto) => {
    setComparingProducts(prev => {
      const isComparing = prev.some(p => p.id === producto.id);
      
      if (isComparing) {
        return prev.filter(p => p.id !== producto.id);
      } else {
        if (prev.length >= 3) {
          // Máximo 3 productos para comparar
          return prev;
        }
        return [...prev, producto];
      }
    });
  };

  const isProductComparing = (productoId) => {
    return comparingProducts.some(p => p.id === productoId);
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 max-w-7xl py-24">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <Package size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-sport uppercase text-red-600 dark:text-red-400 mb-2">
            Error al cargar productos
          </h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/80">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <section id="productos" className="py-12 md:py-16 bg-neutral-50 dark:bg-gray-900">
      
      {/* Filtros */}
      <ProductFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        categorias={categorias}
        marcas={marcas}
        resultCount={filteredProducts.length}
      />

      {/* Grid de productos */}
      <div className="container mx-auto px-6 max-w-7xl mt-8">
        {loading ? (
          <SkeletonGrid count={8} />
        ) : filteredProducts.length === 0 ? (
          // Empty state
          <div className="py-24 text-center">
            <div className="text-neutral-300 dark:text-gray-600 mb-6">
              <Package size={64} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-sport uppercase text-black dark:text-white mb-3">
              No se encontraron productos
            </h3>
            <p className="text-neutral-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Intenta ajustar los filtros o realizar una búsqueda diferente.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-brand-cyan text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 px-1 sm:px-0">
              {filteredProducts.slice(0, displayCount).map(producto => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  onQuickView={onQuickView}
                  onCompareToggle={handleCompareToggle}
                  isComparing={isProductComparing(producto.id)}
                />
              ))}
            </div>

            {/* Botón Ver Más */}
            {displayCount < filteredProducts.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setDisplayCount(prev => prev + 8)}
                  className="px-8 py-4 bg-transparent border-2 border-brand-cyan text-brand-cyan dark:text-cyan-400 hover:bg-brand-cyan hover:text-white dark:hover:bg-brand-cyan dark:hover:text-black rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-sm hover:shadow-lg flex items-center gap-2"
                >
                  <span>Ver más productos</span>
                  <span className="text-[10px] bg-brand-cyan/10 px-2 py-1 rounded-md">+{filteredProducts.length - displayCount}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botón flotante de comparación */}
      {comparingProducts.length > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-black text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4">
            <span className="font-bold text-sm uppercase tracking-widest">
              {comparingProducts.length} productos seleccionados
            </span>
            <button
              onClick={() => setShowComparator(true)}
              disabled={comparingProducts.length < 2}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                comparingProducts.length < 2
                  ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                  : 'bg-brand-cyan text-white hover:bg-white hover:text-black'
              }`}
            >
              Comparar
            </button>
            <button
              onClick={() => setComparingProducts([])}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de comparación */}
      <ProductComparator
        products={comparingProducts}
        isOpen={showComparator}
        onClose={() => setShowComparator(false)}
      />
    </section>
  );
};

export default ProductGrid;
