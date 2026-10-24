import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, CheckSquare, Square, Loader2, FileText, FileSpreadsheet, Eye, EyeOff, Layers, Store, Tag, Package } from 'lucide-react';
import Modal from '../ui/Modal';
import PremiumSelect from '../ui/PremiumSelect';
import { inventarioService } from '../../services/inventarioService';

const variantLabel = (v) => {
  const raw = v?.variante || v || {};
  let attrs = raw.atributos_valores || v?.atributos_valores || {};
  if (typeof attrs === 'string') {
    try { attrs = JSON.parse(attrs); } catch { attrs = {}; }
  }
  const fromAttrs = Object.values(attrs || {}).filter(Boolean).join(' / ');
  return fromAttrs || raw.sku_variante || v?.sku_variante || 'Variante';
};

const itemStock = (item) => {
  const usaVariantes = item.producto?.usa_desglose_variantes || item.usa_desglose_variantes;
  if (usaVariantes && item.variantes?.length) {
    return item.variantes.reduce((sum, v) => sum + (v.cantidad_actual || 0), 0);
  }
  return item.cantidad_actual || 0;
};

/**
 * Paso extra antes de emitir la Lista de Precios: elegir categoría(s), marca(s),
 * una sucursal puntual (filtra a productos con stock real ahí), si va el precio Push,
 * y si el PDF/Excel sale agrupado por Categoría > Marca.
 */
const ReportConfigModal = ({ isOpen, onClose, products = [], sucursales = [], onGenerate }) => {
  const activeProducts = useMemo(() => products.filter(p => p.activo !== false), [products]);

  const categorias = useMemo(() => {
    const map = new Map();
    activeProducts.forEach(p => {
      if (p.categoria?.id_categoria != null) map.set(p.categoria.id_categoria, p.categoria.nombre);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [activeProducts]);

  const marcas = useMemo(() => {
    const map = new Map();
    activeProducts.forEach(p => {
      if (p.marca?.id_marca != null) map.set(p.marca.id_marca, p.marca.nombre_marca);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [activeProducts]);

  const [selectedCategorias, setSelectedCategorias] = useState([]); // [] = todas
  const [selectedMarcas, setSelectedMarcas] = useState([]); // [] = todas
  const [marcaSearch, setMarcaSearch] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [sucursalStockIds, setSucursalStockIds] = useState(null); // Set | null
  const [loadingStock, setLoadingStock] = useState(false);
  const [showPushPrice, setShowPushPrice] = useState(true);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [generating, setGenerating] = useState(null); // 'pdf' | 'excel' | null

  // Reset al abrir, para que cada reporte arranque de cero
  useEffect(() => {
    if (isOpen) {
      setSelectedCategorias([]);
      setSelectedMarcas([]);
      setMarcaSearch('');
      setSucursalId('');
      setSucursalStockIds(null);
      setShowPushPrice(true);
      setGroupByCategory(true);
      setGenerating(null);
    }
  }, [isOpen]);

  const toggleCategoria = (id) => {
    setSelectedCategorias(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleMarca = (id) => {
    setSelectedMarcas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredMarcas = useMemo(() => {
    if (!marcaSearch.trim()) return marcas;
    const term = marcaSearch.toLowerCase();
    return marcas.filter(m => m.nombre.toLowerCase().includes(term));
  }, [marcas, marcaSearch]);

  const handleSucursalChange = useCallback(async (value) => {
    setSucursalId(value);
    if (!value) {
      setSucursalStockIds(null);
      return;
    }
    setLoadingStock(true);
    try {
      const inv = await inventarioService.getBySucursal(value);
      const ids = new Set((inv || []).filter(i => itemStock(i) > 0).map(i => i.id_producto));
      setSucursalStockIds(ids);
    } catch (error) {
      console.error('Error cargando stock de sucursal:', error);
      setSucursalStockIds(new Set());
    } finally {
      setLoadingStock(false);
    }
  }, []);

  const sucursalNombre = useMemo(
    () => sucursales.find(s => String(s.id_comercio) === String(sucursalId))?.nombre || '',
    [sucursales, sucursalId]
  );

  const filteredProducts = useMemo(() => {
    return activeProducts.filter(p => {
      if (selectedCategorias.length && !selectedCategorias.includes(p.categoria?.id_categoria)) return false;
      if (selectedMarcas.length && !selectedMarcas.includes(p.marca?.id_marca)) return false;
      if (sucursalStockIds && !sucursalStockIds.has(p.id_producto)) return false;
      return true;
    });
  }, [activeProducts, selectedCategorias, selectedMarcas, sucursalStockIds]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (groupByCategory) {
      list.sort((a, b) => {
        const catA = a.categoria?.nombre || '';
        const catB = b.categoria?.nombre || '';
        if (catA !== catB) return catA.localeCompare(catB);
        const marcaA = a.marca?.nombre_marca || '';
        const marcaB = b.marca?.nombre_marca || '';
        if (marcaA !== marcaB) return marcaA.localeCompare(marcaB);
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
    } else {
      list.sort((a, b) => (a.codigo_producto?.codigo || '').localeCompare(b.codigo_producto?.codigo || ''));
    }
    return list;
  }, [filteredProducts, groupByCategory]);

  const isBusy = loadingStock || generating;
  const canGenerate = sortedProducts.length > 0 && !isBusy;

  const handleGenerate = async (formato) => {
    if (!canGenerate) return;
    setGenerating(formato);
    try {
      await onGenerate({
        products: sortedProducts,
        groupByCategory,
        showPushPrice,
        sucursalNombre,
      }, formato);
      onClose();
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" hideHeader={true}>
      <div className="p-4">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-black uppercase text-black dark:text-white tracking-tight">
              Generar <span className="text-brand-cyan">Lista de Precios</span>
            </h2>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
              Elegí qué incluir antes de descargar el PDF o Excel
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-gray-700 hover:bg-neutral-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all shrink-0"
          >
            <span className="sr-only">Cerrar</span>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Categorías */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 flex items-center gap-1.5">
                <Layers size={12} /> Categorías
              </label>
              {selectedCategorias.length > 0 && (
                <button onClick={() => setSelectedCategorias([])} className="text-[9px] font-black uppercase text-brand-cyan hover:underline">
                  Todas
                </button>
              )}
            </div>
            <div className="bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-2 max-h-36 overflow-y-auto space-y-1">
              {categorias.length === 0 ? (
                <p className="text-[10px] text-neutral-400 p-2">Sin categorías</p>
              ) : categorias.map(c => (
                <div key={c.id} onClick={() => toggleCategoria(c.id)} className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                  {selectedCategorias.includes(c.id) ? <CheckSquare size={14} className="text-brand-cyan shrink-0" /> : <Square size={14} className="text-neutral-300 shrink-0" />}
                  <span className="text-[10px] font-bold text-neutral-700 dark:text-gray-300 truncate">{c.nombre}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-neutral-400 font-bold">
              {selectedCategorias.length === 0 ? 'Incluye todas las categorías' : `${selectedCategorias.length} categoría${selectedCategorias.length !== 1 ? 's' : ''} elegida${selectedCategorias.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Marcas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 flex items-center gap-1.5">
                <Tag size={12} /> Marcas
              </label>
              {selectedMarcas.length > 0 && (
                <button onClick={() => setSelectedMarcas([])} className="text-[9px] font-black uppercase text-brand-cyan hover:underline">
                  Todas
                </button>
              )}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar marca..."
                value={marcaSearch}
                onChange={(e) => setMarcaSearch(e.target.value)}
                className="w-full h-8 pl-7 pr-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
              {filteredMarcas.length === 0 ? (
                <p className="text-[10px] text-neutral-400 p-2">Sin resultados</p>
              ) : filteredMarcas.map(m => (
                <div key={m.id} onClick={() => toggleMarca(m.id)} className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                  {selectedMarcas.includes(m.id) ? <CheckSquare size={14} className="text-brand-cyan shrink-0" /> : <Square size={14} className="text-neutral-300 shrink-0" />}
                  <span className="text-[10px] font-bold text-neutral-700 dark:text-gray-300 truncate">{m.nombre}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-neutral-400 font-bold">
              {selectedMarcas.length === 0 ? 'Incluye todas las marcas' : `${selectedMarcas.length} marca${selectedMarcas.length !== 1 ? 's' : ''} elegida${selectedMarcas.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Sucursal */}
        <div className="space-y-2 mb-3">
          <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 flex items-center gap-1.5">
            <Store size={12} /> Sucursal (opcional)
          </label>
          <PremiumSelect
            compact
            placeholder="Catálogo completo (todas las sucursales)"
            isLoading={loadingStock}
            options={[
              { value: '', label: 'Catálogo completo' },
              ...sucursales.map(s => ({ value: s.id_comercio, label: s.nombre }))
            ]}
            value={sucursalId}
            onChange={handleSucursalChange}
          />
          {sucursalId && (
            <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
              Solo se incluyen productos con stock actual en {sucursalNombre || 'esta sucursal'}.
            </p>
          )}
        </div>

        {/* Precio push + agrupar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setShowPushPrice(!showPushPrice)}
            className={`h-11 px-4 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest border-2 ${
              showPushPrice
                ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                : 'bg-neutral-50 dark:bg-gray-800 border-neutral-200 dark:border-gray-700 text-neutral-400'
            }`}
          >
            {showPushPrice ? <Eye size={14} /> : <EyeOff size={14} />}
            {showPushPrice ? 'Incluye Precio Push' : 'Sin Precio Push'}
          </button>
          <button
            type="button"
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`h-11 px-4 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest border-2 ${
              groupByCategory
                ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                : 'bg-neutral-50 dark:bg-gray-800 border-neutral-200 dark:border-gray-700 text-neutral-400'
            }`}
          >
            <Layers size={14} />
            {groupByCategory ? 'Agrupado por Categoría y Marca' : 'Lista simple (sin agrupar)'}
          </button>
        </div>

        {/* Contador en vivo */}
        <div className="flex items-center gap-2 p-3 bg-neutral-900 dark:bg-gray-900 rounded-xl mb-3">
          <Package size={16} className="text-brand-cyan shrink-0" />
          {loadingStock ? (
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" /> Calculando stock de la sucursal...
            </span>
          ) : (
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} coincide{sortedProducts.length !== 1 ? 'n' : ''} con estos filtros
            </span>
          )}
        </div>

        {sortedProducts.length === 0 && !loadingStock && (
          <p className="text-[10px] font-bold text-red-500 mb-3 text-center">
            Ningún producto coincide con esta combinación. Ajustá los filtros para poder generar el reporte.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-neutral-200 dark:border-gray-700">
          <button onClick={onClose} disabled={isBusy} className="h-10 px-4 bg-neutral-100 dark:bg-gray-700 text-neutral-900 dark:text-white rounded-lg font-black uppercase text-[10px] hover:bg-neutral-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50">
            Cancelar
          </button>
          <button
            onClick={() => handleGenerate('pdf')}
            disabled={!canGenerate}
            className="flex-1 h-10 bg-neutral-800 dark:bg-gray-600 text-white rounded-lg font-black uppercase text-[10px] hover:bg-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {generating === 'pdf' ? <><Loader2 size={14} className="animate-spin" /> Generando PDF...</> : <><FileText size={14} /> Descargar PDF</>}
          </button>
          <button
            onClick={() => handleGenerate('excel')}
            disabled={!canGenerate}
            className="flex-1 h-10 bg-emerald-600 text-white rounded-lg font-black uppercase text-[10px] hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {generating === 'excel' ? <><Loader2 size={14} className="animate-spin" /> Generando Excel...</> : <><FileSpreadsheet size={14} /> Descargar Excel</>}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportConfigModal;
