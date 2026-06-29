import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, AlertTriangle, MapPin, Box, Trash2, Plus, Loader2 } from 'lucide-react';
import { inventarioService } from '../../services/inventarioService';
import { productosService } from '../../services/productosService';
import { sucursalesService } from '../../services/sucursalesService';
import { useAuthStore } from '../../store/authStore';
import PremiumSelect from '../../components/ui/PremiumSelect';
import { toast } from '../../store/toastStore';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { motion } from 'framer-motion';
import { parseImagenes } from '../../lib/supabaseStorage';

const Inventario = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [data, setData] = useState([]);
    const [productos, setProductos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [loadingSucursales, setLoadingSucursales] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        id_producto: '',
        id_comercio: '',
        cantidad_actual: '',
        stock_minimo_alerta: '',
    });

    // ─── Load data ──────────────────────────────────────────────────────────
    const loadAll = useCallback(async () => {
        setIsLoading(true);
        setLoadingProductos(true);
        setLoadingSucursales(true);
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
            setData([]);
        } finally {
            setIsLoading(false);
            setLoadingProductos(false);
            setLoadingSucursales(false);
        }
    }, [isSuperAdmin, sucursalId]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            id_producto: productos[0]?.id_producto || '',
            id_comercio: isSuperAdmin ? (sucursales[0]?.id_comercio || '') : sucursalId,
            cantidad_actual: '',
            stock_minimo_alerta: '5',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            id_producto: item.id_producto,
            id_comercio: item.id_comercio,
            cantidad_actual: item.cantidad_actual,
            stock_minimo_alerta: item.stock_minimo_alerta ?? '5',
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
            const payload = {
                ...formData,
                cantidad_actual: Number(formData.cantidad_actual) || 0,
                stock_minimo_alerta: Number(formData.stock_minimo_alerta) || 0
            };
            if (editingItem) {
                await inventarioService.update(editingItem.id_inventario, payload);
                toast.success('Registro actualizado correctamente');
            } else {
                await inventarioService.create(payload);
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
            render: (row) => {
                const p = row.producto || {};
                return (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {(() => {
                            const images = parseImagenes(p.imagen_url);
                            return images.length > 0
                                ? <img src={images[0]} alt="" className="w-full h-full object-cover" />
                                : <Box size={14} className="text-neutral-400" />
                        })()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black uppercase tracking-widest leading-none">
                            {p.nombre || 'Producto Desconocido'}
                        </span>
                        <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest mt-0.5">
                            {p.categoria?.nombre || p.descripcion?.substring(0, 30) || 'Sin categoría'}
                        </span>
                    </div>
                </div>
                );
            }
        },
        {
            header: 'Sede',
            render: (row) => {
                const nombre = row.sucursal_nombre || row.comercio?.nombre || sucursales.find(s => s.id_comercio === row.id_comercio)?.nombre || 'N/A';
                return (
                    <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-neutral-400" />
                        <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                            {nombre}
                        </span>
                    </div>
                );
            }
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
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black dark:border-gray-600 pb-4 gap-4 flex-wrap relative">
                <div className="flex-1 min-w-0 pr-0 md:pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Box size={14} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Logística & Stock Central</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        <span className="text-brand-cyan">Stock</span>
                    </h2>
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal">
                        Asigná y modificá el stock real en cada sucursal. Los cambios hechos acá impactan directamente en el sistema y habilitan las ventas.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black uppercase text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                            {isSuperAdmin ? 'Panel de Control Central' : 'Vista de Sucursal Asignada'}
                        </span>
                        {isLoading && data.length > 0 && (
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest animate-pulse">
                                <Loader2 size={10} className="animate-spin text-brand-cyan" /> Sincronizando...
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="relative group">
                {isLoading && data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full bg-brand-cyan animate-pulse w-[30%]" />
                        </div>
                        <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white text-center">Recopilando estado de stock...</span>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.5 }}
                    >
                        <DataTable
                            columns={columns}
                            data={data}
                            onAdd={isSuperAdmin ? handleAdd : null}
                            onEdit={handleEdit}
                            onDelete={isSuperAdmin ? handleDelete : null}
                            searchPlaceholder="BUSCAR POR PRODUCTO O SEDE..."
                            addLabel="VINCULAR PRODUCTO"
                            emptyTitle="Catálogo sin distribución"
                            emptySubtitle={isSuperAdmin ? "No hay productos vinculados a ninguna sede todavía. Utiliza el botón 'Vincular Producto' sobre la tabla para comenzar." : "Tu sede no tiene productos asignados. Contacta al administrador central."}
                            emptyIcon={Package}
                        />
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title={editingItem ? 'Editar Registro de Stock' : 'Nuevo Registro de Stock'}
            >
                <form onSubmit={handleSubmit} className="space-y-6 py-2">

                    {/* Preview del registro para edición */}
                    {editingItem && (
                        <div className="p-4 bg-black rounded-xl border border-brand-cyan/20">
                            <p className="text-brand-cyan text-[9px] font-black uppercase tracking-[0.3em] mb-1">Editando</p>
                            <p className="text-white font-sport text-xl uppercase truncate">{productNombre(formData.id_producto)}</p>
                            <p className="text-neutral-400 text-[9px] font-black uppercase tracking-widest mt-1 truncate">{comercioNombre(formData.id_comercio)}</p>
                        </div>
                    )}

                    {/* Producto */}
                    {!editingItem && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                                Producto a Distribuir
                            </label>
                            <PremiumSelect
                                icon={Box}
                                placeholder="Seleccionar producto"
                                isLoading={loadingProductos}
                                options={productos.map(p => ({ 
                                    value: p.id_producto, 
                                    label: p.nombre,
                                    subtitle: p.categoria?.nombre || p.marca?.nombre
                                }))}
                                value={formData.id_producto}
                                onChange={val => setFormData({ ...formData, id_producto: val })}
                            />
                        </div>
                    )}

                    {/* Sede (solo si es SuperAdmin y no está editando) */}
                    {isSuperAdmin && !editingItem && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block">
                                Sede / Comercio
                            </label>
                            <PremiumSelect
                                icon={MapPin}
                                placeholder="Seleccionar sede"
                                isLoading={loadingSucursales}
                                options={sucursales.map(s => ({ value: s.id_comercio, label: s.nombre }))}
                                value={formData.id_comercio}
                                onChange={val => setFormData({ ...formData, id_comercio: val })}
                            />
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
                                onChange={e => setFormData({ ...formData, cantidad_actual: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-cyan transition-colors text-black dark:text-white"
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
                                onChange={e => setFormData({ ...formData, stock_minimo_alerta: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-cyan transition-colors text-black dark:text-white"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    {/* Botones */}
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="p-5">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-base font-black text-center text-neutral-900 dark:text-white mb-2">
                                ¿Desvincular?
                            </h3>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 text-center mb-4">
                                ¿Desvincular <strong className="text-neutral-900">"{deleteConfirm.producto?.nombre}"</strong> de <strong>"{deleteConfirm.comercio?.nombre || deleteConfirm.sucursal_nombre}"</strong>?
                                <br />
                                <span className="text-red-600 font-medium text-[10px]">Esta acción es irreversible.</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-gray-700 text-neutral-700 dark:text-neutral-200 rounded-lg font-bold text-xs hover:bg-neutral-200 dark:hover:bg-gray-600 transition-colors"
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