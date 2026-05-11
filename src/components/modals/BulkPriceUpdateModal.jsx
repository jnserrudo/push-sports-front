import React, { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Search, CheckSquare, Square, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';

const BulkPriceUpdateModal = ({ isOpen, onClose, onConfirm, products = [], selectedProductIds: initialSelected = [] }) => {
    const [percentage, setPercentage] = useState('');
    const [applyTo, setApplyTo] = useState('precio_venta_sugerido');
    const [isDecrease, setIsDecrease] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectionMode, setSelectionMode] = useState('all'); // 'all' or 'selected'
    const [selectedIds, setSelectedIds] = useState(initialSelected);
    const [searchTerm, setSearchTerm] = useState('');

    const activeProducts = useMemo(() => {
        return products.filter(p => p.activo !== false);
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return activeProducts;
        const term = searchTerm.toLowerCase();
        return activeProducts.filter(p => 
            p.nombre?.toLowerCase().includes(term) ||
            p.marca?.nombre_marca?.toLowerCase().includes(term)
        );
    }, [activeProducts, searchTerm]);

    const affectedProducts = useMemo(() => {
        if (selectionMode === 'selected') {
            return activeProducts.filter(p => selectedIds.includes(p.id_producto));
        }
        return activeProducts;
    }, [activeProducts, selectedIds, selectionMode]);

    const previewProducts = useMemo(() => {
        return affectedProducts.slice(0, 5);
    }, [affectedProducts]);

    const calculateNewPrice = (currentPrice) => {
        if (!percentage || isNaN(percentage)) return currentPrice;
        const factor = 1 + (parseFloat(percentage) * (isDecrease ? -1 : 1)) / 100;
        return Math.max(0, Math.round(currentPrice * factor * 100) / 100);
    };

    const toggleProduct = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id_producto));
        }
    };

    const handleSubmit = async () => {
        if (!percentage || parseFloat(percentage) <= 0) return;
        if (selectionMode === 'selected' && selectedIds.length === 0) return;

        setLoading(true);
        try {
            const finalPercentage = parseFloat(percentage) * (isDecrease ? -1 : 1);
            await onConfirm({
                productIds: selectionMode === 'selected' ? selectedIds : [],
                percentage: finalPercentage,
                applyTo
            });
            onClose();
            setPercentage('');
            setApplyTo('precio_venta_sugerido');
            setIsDecrease(false);
            setSelectionMode('all');
            setSelectedIds([]);
        } catch (error) {
            console.error('Error updating prices:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xlarge" hideHeader={true}>
            <div className="p-4">
                {/* Header compacto */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-black uppercase text-black dark:text-white tracking-tight">
                            Actualización <span className="text-brand-cyan">Masiva</span>
                        </h2>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                            {affectedProducts.length} producto{affectedProducts.length !== 1 ? 's' : ''} {selectionMode === 'selected' ? 'seleccionados' : 'activos'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-gray-700 hover:bg-neutral-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
                    >
                        <X size={20} className="text-neutral-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Grid principal: 3 columnas */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                    {/* Columna 1: Configuración */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400">Tipo de Precio</label>
                        <div className="flex gap-1">
                            <button onClick={() => setApplyTo('precio_venta_sugerido')} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${applyTo === 'precio_venta_sugerido' ? 'bg-brand-cyan text-black' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300'}`}>Público</button>
                            <button onClick={() => setApplyTo('precio_pushsport')} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${applyTo === 'precio_pushsport' ? 'bg-brand-cyan text-black' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300'}`}>Push</button>
                            <button onClick={() => setApplyTo('both')} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${applyTo === 'both' ? 'bg-brand-cyan text-black' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300'}`}>Ambos</button>
                        </div>
                        
                        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 mt-2 block">Tipo de Cambio</label>
                        <div className="flex gap-1">
                            <button onClick={() => setIsDecrease(false)} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all ${!isDecrease ? 'bg-green-500 text-white' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-400'}`}><TrendingUp size={12} />+</button>
                            <button onClick={() => setIsDecrease(true)} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all ${isDecrease ? 'bg-red-500 text-white' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-400'}`}><TrendingDown size={12} />-</button>
                        </div>
                        
                        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 mt-2 block">Porcentaje</label>
                        <div className="relative">
                            <input type="number" min="0" max="100" step="0.1" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="10" className="w-full h-9 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg pl-3 pr-8 text-sm font-black text-neutral-900 dark:text-white outline-none focus:border-brand-cyan transition-all" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-400">%</span>
                        </div>
                    </div>

                    {/* Columna 2: Selección de productos */}
                    <div className="col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400">Productos a Actualizar</label>
                            <div className="flex gap-1">
                                <button onClick={() => setSelectionMode('all')} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${selectionMode === 'all' ? 'bg-brand-cyan text-black' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-500'}`}>Todos ({activeProducts.length})</button>
                                <button onClick={() => setSelectionMode('selected')} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${selectionMode === 'selected' ? 'bg-brand-cyan text-black' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-500'}`}>Seleccionados ({selectedIds.length})</button>
                            </div>
                        </div>
                        
                        {selectionMode === 'selected' && (
                            <>
                                <div className="relative">
                                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-8 pl-8 pr-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium outline-none focus:border-brand-cyan" />
                                </div>
                                <div className="bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-2 max-h-48 overflow-y-auto">
                                    <div className="flex items-center gap-2 pb-2 mb-2 border-b border-neutral-200 dark:border-gray-700">
                                        <button onClick={toggleAll} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-brand-cyan hover:text-cyan-600">
                                            {selectedIds.length === filteredProducts.length ? <CheckSquare size={14} /> : <Square size={14} />}
                                            Seleccionar todos
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {filteredProducts.map(p => (
                                            <div key={p.id_producto} onClick={() => toggleProduct(p.id_producto)} className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                                {selectedIds.includes(p.id_producto) ? <CheckSquare size={14} className="text-brand-cyan" /> : <Square size={14} className="text-neutral-300" />}
                                                <span className="text-[10px] font-bold text-neutral-700 dark:text-gray-300 truncate flex-1">{p.nombre}</span>
                                                <span className="text-[9px] text-neutral-400">${(applyTo === 'precio_pushsport' || applyTo === 'both' ? p.precio_pushsport : p.precio_venta_sugerido)?.toLocaleString() || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Vista previa compacta */}
                {percentage && parseFloat(percentage) > 0 && previewProducts.length > 0 && (
                    <div className="mb-3 p-2 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg">
                        <p className="text-[9px] font-black uppercase text-neutral-500 dark:text-gray-400 mb-1.5">Vista Previa (primeros 3)</p>
                        <div className="space-y-1">
                            {previewProducts.slice(0, 3).map(product => {
                                const showPublic = applyTo === 'precio_venta_sugerido' || applyTo === 'both';
                                const showPush = applyTo === 'precio_pushsport' || applyTo === 'both';
                                return (
                                    <div key={product.id_producto} className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-700 rounded text-[10px]">
                                        <span className="font-bold text-neutral-700 dark:text-gray-300 truncate max-w-[200px]">{product.nombre}</span>
                                        <div className="flex gap-3 items-center">
                                            {showPublic && <div className="flex items-center gap-1"><span className="text-neutral-400 line-through">${product.precio_venta_sugerido?.toLocaleString()}</span><span className="text-brand-cyan font-black">${calculateNewPrice(product.precio_venta_sugerido || 0).toLocaleString()}</span></div>}
                                            {showPush && <div className="flex items-center gap-1"><span className="text-neutral-400 line-through">${product.precio_pushsport?.toLocaleString()}</span><span className="text-green-600 font-black">${calculateNewPrice(product.precio_pushsport || 0).toLocaleString()}</span></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {affectedProducts.length > 3 && <p className="text-[9px] text-neutral-400 mt-1 text-center">+ {affectedProducts.length - 3} más</p>}
                    </div>
                )}

                {/* Actions compactos */}
                <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-gray-700">
                    <button onClick={onClose} disabled={loading} className="flex-1 h-9 bg-neutral-100 dark:bg-gray-700 text-neutral-900 dark:text-white rounded-lg font-black uppercase text-[10px] hover:bg-neutral-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50">Cancelar</button>
                    <button onClick={handleSubmit} disabled={!percentage || parseFloat(percentage) <= 0 || (selectionMode === 'selected' && selectedIds.length === 0) || loading} className="flex-1 h-9 bg-brand-cyan text-black rounded-lg font-black uppercase text-[10px] hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                        {loading ? <><Loader2 size={14} className="animate-spin" />Aplicando...</> : <>Aplicar a {affectedProducts.length} producto{affectedProducts.length !== 1 ? 's' : ''}</>}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkPriceUpdateModal;
