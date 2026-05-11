import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const ProductFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  categorias = [], 
  marcas = [],
  resultCount = 0
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters = filters.search || filters.categoria || filters.marca || filters.sortBy !== 'relevancia';

  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const handleCategoriaChange = (e) => {
    onFilterChange({ categoria: e.target.value });
  };

  const handleMarcaChange = (e) => {
    onFilterChange({ marca: e.target.value });
  };

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  const handleClearAll = () => {
    onClearFilters();
    setShowMobileFilters(false);
  };

  return (
    <>
      {/* Barra de filtros sticky */}
      <div className="sticky top-20 z-40 bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl py-4">
          
          {/* Desktop: Filtros en línea */}
          <div className="hidden md:flex items-center gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
              />
            </div>

            {/* Categoría */}
            <select
              value={filters.categoria}
              onChange={handleCategoriaChange}
              className="px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Marca */}
            <select
              value={filters.marca}
              onChange={handleMarcaChange}
              className="px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all cursor-pointer"
            >
              <option value="">Todas las marcas</option>
              {marcas.map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>

            {/* Ordenar */}
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all cursor-pointer"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nombre_asc">Nombre: A-Z</option>
              <option value="nombre_desc">Nombre: Z-A</option>
            </select>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center gap-2"
              >
                <X size={16} />
                Limpiar
              </button>
            )}
          </div>

          {/* Mobile: Búsqueda + Botón de filtros */}
          <div className="md:hidden space-y-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
              />
            </div>

            {/* Botón de filtros y ordenar */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <SlidersHorizontal size={18} />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-brand-cyan text-white text-xs px-2 py-0.5 rounded-full">
                    {[filters.categoria, filters.marca, filters.sortBy !== 'relevancia'].filter(Boolean).length}
                  </span>
                )}
              </button>

              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan transition-all cursor-pointer"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio_asc">$ Menor</option>
                <option value="precio_desc">$ Mayor</option>
                <option value="nombre_asc">A-Z</option>
                <option value="nombre_desc">Z-A</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-3 text-xs text-neutral-500 dark:text-gray-400 font-medium">
            Mostrando <span className="font-bold text-black dark:text-white">{resultCount}</span> productos
            {hasActiveFilters && (
              <span className="ml-2">
                • <button onClick={handleClearAll} className="text-brand-cyan hover:underline">Limpiar filtros</button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de filtros móvil */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-sport uppercase">Filtros</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filtros */}
            <div className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.categoria}
                  onChange={handleCategoriaChange}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan transition-all"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Marca
                </label>
                <select
                  value={filters.marca}
                  onChange={handleMarcaChange}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan transition-all"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-gray-700">
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-gray-800 text-black dark:text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-gray-700 transition-all"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-3 bg-brand-cyan text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilters;
