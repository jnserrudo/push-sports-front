import React, { useState } from 'react';
import { Search, Edit2, Trash2, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { variantesService } from '../../services/variantesService';
import { toast } from '../../store/toastStore';

const GestionTab = ({ producto, variantes, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    
    // Filtrar variantes por búsqueda
    const variantesFiltradas = variantes.filter(v => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const atributosStr = Object.values(v.atributos_valores || {}).join(' ').toLowerCase();
        return (
            v.sku_variante?.toLowerCase().includes(term) ||
            atributosStr.includes(term)
        );
    });
    
    const handleEdit = (variante) => {
        setEditingId(variante.id_variante);
        setEditValues({
            stock_central: variante.stock_central || 0,
            precio_variante: variante.precio_variante || 0
        });
    };
    
    const handleSave = async (id_variante) => {
        setSavingId(id_variante);
        try {
            await variantesService.actualizarVariante(id_variante, editValues);
            toast.success('Variante actualizada exitosamente');
            setEditingId(null);
            onRefresh();
        } catch (error) {
            toast.error('Error al actualizar variante');
        } finally {
            setSavingId(null);
        }
    };
    
    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };
    
    const handleDelete = async (variante) => {
        if (!window.confirm(`¿Eliminar variante ${variante.sku_variante}?`)) return;
        
        try {
            await variantesService.eliminarVariante(variante.id_variante);
            toast.success('Variante eliminada exitosamente');
            onRefresh();
        } catch (error) {
            toast.error('Error al eliminar variante');
        }
    };
    
    const renderAtributos = (atributos_valores) => {
        if (!atributos_valores) return '-';
        return Object.entries(atributos_valores)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' / ');
    };
    
    const handleToggleGestion = () => {
        const nuevoValor = !producto.usa_variantes;
        
        if (!nuevoValor) {
            setShowDeactivateModal(true);
            return;
        }
        
        ejecutarToggleGestion(nuevoValor);
    };
    
    const ejecutarToggleGestion = async (nuevoValor) => {
        try {
            await variantesService.toggleUsaVariantes(producto.id_producto, nuevoValor);
            toast.success(`Gestión por variantes ${nuevoValor ? 'activada' : 'desactivada'}`);
            onRefresh();
        } catch (error) {
            toast.error('Error al cambiar estado de gestión');
        }
    };
    
    const handleConfirmDeactivate = () => {
        setShowDeactivateModal(false);
        ejecutarToggleGestion(false);
    };
    
    const handleCancelDeactivate = () => {
        setShowDeactivateModal(false);
    };
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header con buscador */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Search size={14} className="sm:w-4 sm:h-4" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por SKU o atributos..."
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-[10px] sm:text-[11px] font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    />
                </div>
            </div>
            
            {/* Tabla de variantes */}
            <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-gray-700 border-b border-neutral-200 dark:border-gray-600">
                            <tr>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300">
                                    SKU
                                </th>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300">
                                    Atributos
                                </th>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300">
                                    Stock
                                </th>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300">
                                    Precio
                                </th>
                                <th className="px-3 py-2 text-right text-[9px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
                            {variantesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-3 py-8 text-center">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                            {searchTerm ? 'No se encontraron variantes' : 'No hay variantes generadas'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                variantesFiltradas.map((variante) => (
                                    <tr key={variante.id_variante} className="hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-3 py-2 text-[10px] font-mono font-bold text-neutral-700 dark:text-white">
                                            {variante.sku_variante}
                                        </td>
                                        <td className="px-3 py-2 text-[10px] font-bold text-neutral-600 dark:text-gray-100">
                                            {renderAtributos(variante.atributos_valores)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {editingId === variante.id_variante ? (
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={editValues.stock_central}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        setEditValues({ ...editValues, stock_central: val === '' ? 0 : parseInt(val) });
                                                    }}
                                                    className="w-20 px-2 py-1 border border-cyan-500 dark:border-cyan-400 rounded text-[10px] font-bold bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-cyan-500"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-neutral-700 dark:text-white">
                                                    {variante.stock_central || 0}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            {editingId === variante.id_variante ? (
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={editValues.precio_variante}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        setEditValues({ ...editValues, precio_variante: val === '' ? 0 : parseFloat(val) || 0 });
                                                    }}
                                                    className="w-24 px-2 py-1 border border-cyan-500 dark:border-cyan-400 rounded text-[10px] font-bold bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-cyan-500"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-neutral-700 dark:text-white">
                                                    ${(variante.precio_variante || 0).toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {editingId === variante.id_variante ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSave(variante.id_variante)}
                                                        disabled={savingId === variante.id_variante}
                                                        className="px-2 py-1 bg-green-500 text-white rounded text-[8px] font-black uppercase hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        {savingId === variante.id_variante ? (
                                                            <>
                                                                <Loader2 size={10} className="animate-spin" />
                                                                Guardando...
                                                            </>
                                                        ) : (
                                                            'Guardar'
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        disabled={savingId === variante.id_variante}
                                                        className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-[8px] font-black uppercase hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(variante)}
                                                        className="w-7 h-7 rounded bg-neutral-100 text-neutral-600 hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(variante)}
                                                        className="w-7 h-7 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-neutral-100 dark:divide-gray-700">
                    {variantesFiltradas.length === 0 ? (
                        <div className="px-3 py-8 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                {searchTerm ? 'No se encontraron variantes' : 'No hay variantes generadas'}
                            </p>
                        </div>
                    ) : (
                        variantesFiltradas.map((variante) => (
                            <div key={variante.id_variante} className="p-3 space-y-2 dark:bg-gray-800">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-0.5">
                                            SKU
                                        </p>
                                        <p className="text-[10px] font-mono font-bold text-neutral-700 dark:text-gray-300">
                                            {variante.sku_variante}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(variante)}
                                            className="w-8 h-8 rounded bg-neutral-100 text-neutral-600 hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(variante)}
                                            className="w-8 h-8 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 mb-0.5">
                                        Atributos
                                    </p>
                                    <p className="text-[10px] font-bold text-neutral-600 dark:text-gray-400">
                                        {renderAtributos(variante.atributos_valores)}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-0.5">
                                            Stock
                                        </p>
                                        <p className="text-[10px] font-bold text-neutral-700 dark:text-gray-300">
                                            {variante.stock_central || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-400 mb-0.5">
                                            Precio
                                        </p>
                                        <p className="text-[10px] font-bold text-neutral-700 dark:text-gray-300">
                                            ${(variante.precio_variante || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Panel de gestión del sistema */}
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-gray-800 dark:to-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <Info size={14} className="sm:w-4 sm:h-4 text-neutral-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black dark:text-white mb-1.5 sm:mb-2">
                            Gestión del Sistema
                        </h5>
                        <div className="space-y-1 text-[8px] sm:text-[9px] text-neutral-600 dark:text-gray-300 leading-relaxed">
                            <p className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${producto.usa_variantes ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span><span className="font-bold text-neutral-700 dark:text-white">Estado:</span> {producto.usa_variantes ? <span className="text-green-600 dark:text-green-300 font-black">ACTIVO</span> : <span className="text-red-600 dark:text-red-300 font-black">INACTIVO</span>}</span>
                            </p>
                            {producto.usa_variantes && (
                                <>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0"></span>
                                        <span>Las ventas descuentan del stock de cada variante</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0"></span>
                                        <span>El stock central es la suma de todas las variantes</span>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={handleToggleGestion}
                    disabled={variantes.length === 0}
                    className={`
                        w-full px-4 py-2.5 sm:py-3 rounded-lg font-black text-[10px] sm:text-[11px] uppercase tracking-wider
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                        ${producto.usa_variantes
                            ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                            : 'bg-black text-white hover:bg-neutral-800'
                        }
                    `}
                >
                    {producto.usa_variantes ? (
                        <>
                            <AlertCircle size={14} />
                            Desactivar Gestión por Variantes
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={14} />
                            Activar Gestión por Variantes
                        </>
                    )}
                </button>
            </div>
            
            {/* Tip */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 sm:p-4 flex items-start gap-2">
                <Info size={14} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-[8px] sm:text-[9px] text-cyan-800 dark:text-white leading-relaxed">
                    <span className="font-bold">Tip:</span> Haz click en el ícono de editar para modificar el stock y precio de cada variante individualmente.
                </p>
            </div>
            
            {/* Modal de Confirmación de Desactivación */}
            {showDeactivateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                                    Desactivar Gestión por Variantes
                                </h3>
                                <p className="text-[10px] font-bold text-neutral-500 dark:text-gray-400">
                                    Acción con impacto en el sistema de ventas
                                </p>
                            </div>
                        </div>
                        
                        {/* Body */}
                        <div className="p-4 space-y-3">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-200 mb-1">
                                    ¿Qué pasará?
                                </p>
                                <ul className="space-y-1 text-[9px] text-neutral-700 dark:text-gray-300">
                                    <li className="flex items-start gap-1.5">
                                        <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                                        <span>El producto volverá a venderse como un solo ítem (sin elegir talle, color, etc.)</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                                        <span>Las variantes seguirán existiendo pero no se mostrarán en ventas</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                                        <span>El stock usado será el "Stock Central" del producto</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                                        <span>Podrás reactivar la gestión por variantes en cualquier momento</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="bg-neutral-50 dark:bg-gray-700/50 border border-neutral-200 dark:border-gray-600 rounded-lg p-3">
                                <p className="text-[9px] font-bold text-neutral-600 dark:text-gray-300 leading-relaxed">
                                    <span className="font-black">Stock actual:</span> {variantes.reduce((sum, v) => sum + (v.stock_central || 0), 0)} unidades distribuidas en {variantes.length} variantes.
                                </p>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t border-neutral-200 dark:border-gray-700 flex gap-2">
                            <button
                                type="button"
                                onClick={handleCancelDeactivate}
                                className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-gray-700 text-neutral-700 dark:text-gray-300 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-neutral-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeactivate}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-red-600 transition-colors"
                            >
                                Sí, Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTab;
