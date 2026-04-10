import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, AlertTriangle, MapPin, Box, Trash2 } from 'lucide-react';
import { inventarioService } from '../../services/inventarioService';
import { productosService } from '../../services/productosService';
import { sucursalesService } from '../../services/sucursalesService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { motion } from 'framer-motion';

const Inventario = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [data, setData] = useState([]);
    const [productos, setProductos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        id_producto: '',
        id_comercio: '',
        cantidad_actual: 0,
        stock_minimo_alerta: 5,
        comision_pactada_porcentaje: 0,
    });

    // ─── Load data ──────────────────────────────────────────────────────────
    const loadAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [inv, prods, sucs] = await Promise.all([
                isSuperAdmin ? inventarioService.getAll() : inventarioService.getBySucursal(sucursalId),
                productosService.getAll().catch(() => []),
                sucursalesService.getAll().catch(() => []),
            ]);
            setData(inv);
            setProductos(prods.filter(p => p.activo));
            setSucursales(sucs.filter(s => s.activo));
        } catch (e) {
            console.error(e);
            toast.error('Error cargando inventario');
        } finally {
            setIsLoading(false);
        }
    }, [isSuperAdmin, sucursalId]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            id_producto: productos[0]?.id_producto || '',
            id_comercio: isSuperAdmin ? (sucursales[0]?.id_comercio || '') : sucursalId,
            cantidad_actual: 0,
            stock_minimo_alerta: 5,
            comision_pactada_porcentaje: 0,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            id_producto: item.id_producto,
            id_comercio: item.id_comercio,
            cantidad_actual: item.cantidad_actual,
            stock_minimo_alerta: item.stock_minimo_alerta ?? 5,
            comision_pactada_porcentaje: item.comision_pactada_porcentaje ?? 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        setDeleteConfirm(item);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await inventarioService.delete(deleteConfirm.id_inventario);
            toast.success('Registro desvinculado correctamente');
            await loadAll();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Error al desvincular');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await inventarioService.update(editingItem.id_inventario, formData);
                toast.success('Registro actualizado correctamente');
            } else {
                await inventarioService.create(formData);
                toast.success('Stock registrado correctamente');
            }
            setIsModalOpen(false);
            await loadAll();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Columns ─────────────────────────────────────────────────────────────
    const columns = [
        {
            header: 'ID',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_inventario).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Producto',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {row.producto?.imagen_url
                            ? <img src={row.producto.imagen_url} alt="" className="w-full h-full object-cover" />
                            : <Box size={14} className="text-neutral-400" />
                        }
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black uppercase tracking-widest leading-none">
                            {row.producto?.nombre || 'N/A'}
                        </span>
                        <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest mt-0.5">
                            {row.producto?.categoria?.nombre || row.producto?.descripcion || ''}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Sede',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                        {row.comercio?.nombre || row.sucursal_nombre || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Stock',
            render: (row) => {
                const qty = row.cantidad_actual ?? 0;
                const min = row.stock_minimo_alerta ?? 5;
                const isEmpty = qty === 0;
                const isCritical = qty <= min && !isEmpty;
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isEmpty ? 'bg-red-500 animate-pulse' :
                            isCritical ? 'bg-amber-400' : 'bg-black'
                        }`} />
                        <div className="flex flex-col">
                            <span className={`font-sport text-2xl leading-none ${
                                isEmpty ? 'text-red-500' :
                                isCritical ? 'text-amber-500' : 'text-black'
                            }`}>{qty}</span>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                Alerta: {min}
                            </span>
                        </div>
                        {isEmpty && <AlertTriangle size={14} className="text-red-400" />}
                        {isCritical && !isEmpty && <AlertTriangle size={14} className="text-amber-400" />}
                    </div>
                );
            }
        },
        {
            header: 'Comisión',
            render: (row) => (
                <div className="inline-flex px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-black text-white">
                    {row.comision_pactada_porcentaje ?? 0}%
                </div>
            )
        },
    ];

    const productNombre = (id) => productos.find(p => p.id_producto === id)?.nombre || '';
    const comercioNombre = (id) => sucursales.find(s => s.id_comercio === id)?.nombre || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3 max-w-[1400px] mx-auto pb-4"
        >
            {/* Header - Compacto */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-3 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Search size={12} className="text-brand-cyan" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">CONTROL STOCK</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        {isSuperAdmin ? 'Gestión' : 'Mi'} <span className="text-brand-cyan">Inventario</span>
                    </h2>
                    <p className="hidden md:block text-[9px] font-bold text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                        Control en tiempo real del stock físico.
                    </p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                        {data.length} registros
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-black text-white text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-lg hover:bg-brand-cyan hover:text-black transition-colors flex items-center gap-1.5"
                >
                    <Package size={12} />
                    Nuevo Stock
                </button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <DataTable
                        data={data}
                        columns={columns}
                        onEdit={handleEdit}
                        onDelete={isSuperAdmin ? handleDelete : undefined}
                        searchPlaceholder="Buscar producto o sede..."
                    />
                </motion.div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title={editingItem ? 'Editar Registro de Stock' : 'Nuevo Registro de Stock'}
            >
                <form onSubmit={handleSubmit} className="space-y-6 py-2">

                    {/* Preview del registro para edición */}
                    {editingItem && (
                        <div className="p-4 bg-black rounded-xl">
                            <p className="text-brand-cyan text-[9px] font-black uppercase tracking-[0.3em] mb-1">Editando</p>
                            <p className="text-white font-sport text-xl uppercase">{productNombre(formData.id_producto)}</p>
                            <p className="text-neutral-400 text-[9px] font-black uppercase tracking-widest mt-1">{comercioNombre(formData.id_comercio)}</p>
                        </div>
                    )}

                    {/* Producto */}
                    {!editingItem && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                                Producto
                            </label>
                            <div className="relative">
                                <Box size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <select
                                    required
                                    value={formData.id_producto}
                                    onChange={e => setFormData({ ...formData, id_producto: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-black transition-colors appearance-none"
                                >
                                    <option value="">— Seleccionar producto —</option>
                                    {productos.map(p => (
                                        <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Sede (solo si es SuperAdmin y no está editando) */}
                    {isSuperAdmin && !editingItem && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                                Sede / Comercio
                            </label>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <select
                                    required
                                    value={formData.id_comercio}
                                    onChange={e => setFormData({ ...formData, id_comercio: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-black transition-colors appearance-none"
                                >
                                    <option value="">— Seleccionar sede —</option>
                                    {sucursales.map(s => (
                                        <option key={s.id_comercio} value={s.id_comercio}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                                {editingItem ? 'Stock Actual' : 'Stock Inicial'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={formData.cantidad_actual}
                                onChange={e => setFormData({ ...formData, cantidad_actual: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-black transition-colors"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                                Alerta mínima
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={formData.stock_minimo_alerta}
                                onChange={e => setFormData({ ...formData, stock_minimo_alerta: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-black transition-colors"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    {/* Comisión */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                            Comisión pactada (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            required
                            value={formData.comision_pactada_porcentaje}
                            onChange={e => setFormData({ ...formData, comision_pactada_porcentaje: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-black transition-colors"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Package size={14} /> {editingItem ? 'Guardar Cambios' : 'Registrar Stock'}</>
                            )}
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors disabled:opacity-40"
                        >
                            CANCELAR
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="p-5">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={20} className="text-red-600" />
                            </div>
                            <h3 className="text-base font-black text-center text-neutral-900 mb-2">
                                ¿Desvincular?
                            </h3>
                            <p className="text-xs text-neutral-600 text-center mb-4">
                                ¿Desvincular <strong className="text-neutral-900">"{deleteConfirm.producto?.nombre}"</strong> de <strong>"{deleteConfirm.comercio?.nombre || deleteConfirm.sucursal_nombre}"</strong>?
                                <br />
                                <span className="text-red-600 font-medium text-[10px]">Esta acción es irreversible.</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                >
                                    Desvincular
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Inventario;