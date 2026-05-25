import React, { useState } from 'react';
import { Search, Edit2, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { variantesService } from '../../services/variantesService';
import { toast } from '../../store/toastStore';

const GestionTab = ({ producto, variantes, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    
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
        try {
            await variantesService.actualizarVariante(id_variante, editValues);
            toast.success('Variante actualizada exitosamente');
            setEditingId(null);
            onRefresh();
        } catch (error) {
            toast.error('Error al actualizar variante');
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
    
    const handleToggleGestion = async () => {
        const nuevoValor = !producto.usa_variantes;
        
        if (!nuevoValor) {
            if (!window.confirm('¿Desactivar gestión por variantes? Las variantes seguirán existiendo pero no se usarán en ventas.')) {
                return;
            }
        }
        
        try {
            await variantesService.toggleUsaVariantes(producto.id_producto, nuevoValor);
            toast.success(`Gestión por variantes ${nuevoValor ? 'activada' : 'desactivada'}`);
            onRefresh();
        } catch (error) {
            toast.error('Error al cambiar estado de gestión');
        }
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
                        className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] sm:text-[11px] font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    />
                </div>
            </div>
            
            {/* Tabla de variantes */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600">
                                    SKU
                                </th>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600">
                                    Atributos
                                </th>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600">
                                    Stock
                                </th>
                                <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-neutral-600">
                                    Precio
                                </th>
                                <th className="px-3 py-2 text-right text-[9px] font-black uppercase tracking-wider text-neutral-600">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
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
                                    <tr key={variante.id_variante} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-3 py-2 text-[10px] font-mono font-bold text-neutral-700">
                                            {variante.sku_variante}
                                        </td>
                                        <td className="px-3 py-2 text-[10px] font-bold text-neutral-600">
                                            {renderAtributos(variante.atributos_valores)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {editingId === variante.id_variante ? (
                                                <input
                                                    type="number"
                                                    value={editValues.stock_central}
                                                    onChange={(e) => setEditValues({ ...editValues, stock_central: parseInt(e.target.value) || 0 })}
                                                    className="w-20 px-2 py-1 border border-brand-cyan rounded text-[10px] font-bold"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-neutral-700">
                                                    {variante.stock_central || 0}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            {editingId === variante.id_variante ? (
                                                <input
                                                    type="number"
                                                    value={editValues.precio_variante}
                                                    onChange={(e) => setEditValues({ ...editValues, precio_variante: parseFloat(e.target.value) || 0 })}
                                                    className="w-24 px-2 py-1 border border-brand-cyan rounded text-[10px] font-bold"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-neutral-700">
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
                                                        className="px-2 py-1 bg-green-500 text-white rounded text-[8px] font-black uppercase hover:bg-green-600 transition-colors"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-[8px] font-black uppercase hover:bg-neutral-300 transition-colors"
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
                <div className="md:hidden divide-y divide-neutral-100">
                    {variantesFiltradas.length === 0 ? (
                        <div className="px-3 py-8 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                {searchTerm ? 'No se encontraron variantes' : 'No hay variantes generadas'}
                            </p>
                        </div>
                    ) : (
                        variantesFiltradas.map((variante) => (
                            <div key={variante.id_variante} className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 mb-0.5">
                                            SKU
                                        </p>
                                        <p className="text-[10px] font-mono font-bold text-neutral-700">
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
                                    <p className="text-[10px] font-bold text-neutral-600">
                                        {renderAtributos(variante.atributos_valores)}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 mb-0.5">
                                            Stock
                                        </p>
                                        <p className="text-[10px] font-bold text-neutral-700">
                                            {variante.stock_central || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500 mb-0.5">
                                            Precio
                                        </p>
                                        <p className="text-[10px] font-bold text-neutral-700">
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
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                        <Info size={14} className="sm:w-4 sm:h-4 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black mb-1.5 sm:mb-2">
                            Gestión del Sistema
                        </h5>
                        <div className="space-y-1 text-[8px] sm:text-[9px] text-neutral-600 leading-relaxed">
                            <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0"></span>
                                <span><span className="font-bold">Estado:</span> {producto.usa_variantes ? 'Gestión por Variantes ACTIVA' : 'Gestión por Variantes INACTIVA'}</span>
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
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 sm:p-4 flex items-start gap-2">
                <Info size={14} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                <p className="text-[8px] sm:text-[9px] text-cyan-800 leading-relaxed">
                    <span className="font-bold">Tip:</span> Haz click en el ícono de editar para modificar el stock y precio de cada variante individualmente.
                </p>
            </div>
        </div>
    );
};

export default GestionTab;
