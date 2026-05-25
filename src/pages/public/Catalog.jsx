import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Package, ChevronDown, X, Tag, Layers } from 'lucide-react';
import publicService from '../../services/publicService';
import PremiumSelect from '../../components/ui/PremiumSelect';
import { parseImagenes } from '../../lib/supabaseStorage';

const ProductCard = ({ producto, onClick }) => {
  const disponible = producto.disponibilidad?.length > 0;

  const images = parseImagenes(producto.imagen);
  const mainImage = images.length > 0 ? images[0] : null;

  return (
    <div
      className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-brand-cyan hover:shadow-xl hover:shadow-brand-cyan/5 transition-all duration-300 cursor-pointer"
      onClick={() => onClick(producto)}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-neutral-300 dark:text-neutral-600" />
          </div>
        )}
        {/* Badge disponibilidad */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          disponible
            ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
            : 'bg-neutral-500/80 text-white backdrop-blur-sm'
        }`}>
          {disponible ? 'Disponible' : 'Sin stock'}
        </div>
        {/* Badge marca */}
        {producto.marca && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm">
            {producto.marca}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan mb-1">
          {producto.categoria || 'General'}
        </p>
        <h3 className="font-bold text-sm text-black dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-brand-cyan transition-colors">
          {producto.nombre}
        </h3>

        {/* Precio */}
        {producto.precio_base > 0 && (
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-lg font-black text-black dark:text-white">
              ${producto.precio_base?.toLocaleString('es-AR')}
            </span>
          </div>
        )}

        {/* Sucursales con stock */}
        {disponible ? (
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
            <MapPin size={11} className="text-brand-cyan flex-shrink-0" />
            <span>
              {producto.disponibilidad.length === 1
                ? producto.disponibilidad[0].sucursal
                : `${producto.disponibilidad.length} sucursales`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium">
            <MapPin size={11} className="flex-shrink-0" />
            <span>Sin stock en sucursales</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductModal = ({ producto, onClose }) => {
  if (!producto) return null;
  const disponible = producto.disponibilidad?.length > 0;

  const images = parseImagenes(producto.imagen);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-200 dark:border-neutral-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen */}
        {images.length > 0 && (
          <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <img src={images[0]} alt={producto.nombre} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan mb-1">
                {producto.categoria} · {producto.marca}
              </p>
              <h2 className="text-xl font-black text-black dark:text-white leading-tight">
                {producto.nombre}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0 ml-4"
            >
              <X size={18} />
            </button>
          </div>

          {producto.descripcion && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              {producto.descripcion}
            </p>
          )}

          {producto.precio_base > 0 && (
            <div className="mb-4">
              <span className="text-2xl font-black text-black dark:text-white">
                ${producto.precio_base?.toLocaleString('es-AR')}
              </span>
            </div>
          )}

          {/* Variantes */}
          {producto.usa_variantes && producto.variantes?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Variantes disponibles</p>
              <div className="flex flex-wrap gap-2">
                {producto.variantes.map(v => {
                  const attrs = typeof v.atributos_valores === 'string' ? JSON.parse(v.atributos_valores) : v.atributos_valores;
                  const label = attrs ? Object.values(attrs).filter(Boolean).join(' / ') : 'Variante';
                  return (
                    <span key={v.id_variante} className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dónde encontrarlo */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                <MapPin size={11} className="text-brand-cyan" /> Dónde encontrarlo
              </p>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {disponible ? (
                producto.disponibilidad.map((s, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-black dark:text-white">{s.sucursal}</span>
                    <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      En stock
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-sm text-neutral-400 font-medium">Sin stock disponible actualmente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Catalog = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloDisponible, setSoloDisponible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await publicService.getCatalog();
        setProductos(data);
      } catch (err) {
        setError('No se pudo cargar el catálogo. Por favor intentá de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    return cats.sort();
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.marca?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoriaFiltro || p.categoria === categoriaFiltro;
      const matchStock = !soloDisponible || p.disponibilidad?.length > 0;
      return matchSearch && matchCat && matchStock;
    });
  }, [productos, search, categoriaFiltro, soloDisponible]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Cargando catálogo...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <Package size={48} className="text-neutral-300" />
      <p className="text-sm font-bold text-neutral-500">{error}</p>
    </div>
  );

  return (
    <>
      <ProductModal producto={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan mb-2">Catálogo 2026</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black dark:text-white leading-none mb-3 font-sport">
          Nuestros <span className="text-brand-cyan">Productos</span>
        </h1>
        <p className="text-neutral-500 text-sm max-w-xl">
          Explorá toda la línea de Push Sport y encontrá en qué sucursal podés comprar cada producto hoy.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar producto o marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categoría */}
        <div className="w-full sm:w-64">
          <PremiumSelect
            icon={Tag}
            placeholder="Todas las categorías"
            options={[
              { value: '', label: 'Todas las categorías' },
              ...categorias.map(cat => ({ value: cat, label: cat }))
            ]}
            value={categoriaFiltro}
            onChange={val => setCategoriaFiltro(val)}
            className="!py-1"
          />
        </div>

        {/* Solo con stock */}
        <button
          onClick={() => setSoloDisponible(!soloDisponible)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
            soloDisponible
              ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-brand-cyan'
          }`}
        >
          <MapPin size={13} />
          Con stock
        </button>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        </p>
        {(search || categoriaFiltro || soloDisponible) && (
          <button
            onClick={() => { setSearch(''); setCategoriaFiltro(''); setSoloDisponible(false); }}
            className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            <X size={11} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {productosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers size={40} className="text-neutral-300 mb-4" />
          <p className="text-sm font-bold text-neutral-500">No se encontraron productos</p>
          <p className="text-xs text-neutral-400 mt-1">Intentá con otro término de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productosFiltrados.map(p => (
            <ProductCard key={p.id} producto={p} onClick={setSelectedProduct} />
          ))}
        </div>
      )}
    </>
  );
};

export default Catalog;
