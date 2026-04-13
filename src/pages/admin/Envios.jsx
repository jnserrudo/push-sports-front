import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Truck, Box, Home, PlusCircle, Info, Check, RefreshCw, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { enviosService } from '../../services/enviosService';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';
import { useAuthStore } from '../../store/authStore';

const Envios = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [envios, setEnvios]         = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [productos, setProductos]   = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'ok'|'error', msg: string }

    const [formData, setFormData] = useState({
        sucursal_id: '',
        producto_id: '',
        cantidad: 1,
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productVariants, setProductVariants] = useState([]);
    const [variantQuantities, setVariantQuantities] = useState({});
    const [hasVariants, setHasVariants] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [envData, sucData, prodData] = await Promise.all([
                enviosService.getAll().then(res => {
                    const data = res.data || [];
                    // Sanitización: Filtrar registros que no tienen los campos básicos necesarios
                    // Esto evita mostrar la fila #UNDEFINED que reportó el usuario.
                    return data.filter(item => item && (item.id || item.fecha || item.producto_nombre));
                }),
                sucursalesService.getAll(),
                productosService.getAll(),
            ]);
            setEnvios(envData);
            setSucursales(sucData.filter(s => s.activo));
            setProductos(prodData.filter(p => p.activo));
        } catch (err) {
            console.error('Error cargando envíos:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAdd = () => {
        setFormData({
            sucursal_id: sucursales[0]?.id_comercio || '',
            producto_id: '',
            cantidad: 1,
        });
        setSelectedProduct(null);
        setProductVariants([]);
        setVariantQuantities({});
        setHasVariants(false);
        setFeedback(null);
        setIsModalOpen(true);
    };

    // Detectar cuando cambia el producto seleccionado
    const handleProductChange = (productoId) => {
        setFormData({ ...formData, producto_id: productoId });
        
        const product = productos.find(p => p.id_producto === productoId);
        setSelectedProduct(product);
        
        // Verificar si el producto tiene variantes
        if (product?.variantes && product.variantes.length > 0) {
            setHasVariants(true);
            setProductVariants(product.variantes);
            // Inicializar cantidades en 0
            const initialQuantities = {};
            product.variantes.forEach(v => {
                initialQuantities[v.id_variante] = 0;
            });
            setVariantQuantities(initialQuantities);
        } else {
            setHasVariants(false);
            setProductVariants([]);
            setVariantQuantities({});
        }
    };

    // Actualizar cantidad de una variante
    const handleVariantQuantityChange = (varianteId, cantidad) => {
        setVariantQuantities(prev => ({
            ...prev,
            [varianteId]: Math.max(0, parseInt(cantidad) || 0)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);
        try {
            if (hasVariants) {
                // Verificar que hay al menos una variante con cantidad
                const itemsVariantes = Object.entries(variantQuantities)
                    .filter(([_, cantidad]) => cantidad > 0)
                    .map(([id_variante, cantidad]) => ({ id_variante, cantidad }));
                
                if (itemsVariantes.length === 0) {
                    setFeedback({ type: 'error', msg: 'Debes ingresar cantidad para al menos una variante.' });
                    setIsSubmitting(false);
                    return;
                }

                await enviosService.crearEnvioConVariantes(
                    formData.sucursal_id,
                    formData.producto_id,
                    itemsVariantes
                );
                
                const totalUnidades = itemsVariantes.reduce((sum, item) => sum + item.cantidad, 0);
                setFeedback({ type: 'ok', msg: `Orden procesada: ${totalUnidades} unidades de ${itemsVariantes.length} variantes.` });
            } else {
                await enviosService.crearEnvio(
                    formData.sucursal_id,
                    formData.producto_id,
                    formData.cantidad
                );
                setFeedback({ type: 'ok', msg: 'Orden procesada correctamente.' });
            }
            
            setTimeout(() => {
                setIsModalOpen(false);
                setFeedback(null);
                loadData();
            }, 1200);
        } catch (err) {
            setFeedback({ type: 'error', msg: err?.message || 'Error al procesar la orden.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            header: 'ID Asignación',
            accessor: 'id',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Fecha',
            accessor: 'fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black uppercase tracking-widest">
                        {row.fecha ? new Date(row.fecha).toLocaleDateString() : '—'}
                    </span>
                    <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">Registrado</span>
                </div>
            )
        },
        {
            header: 'Destino',
            accessor: 'sucursal_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                    <span className="font-bold text-sm text-black uppercase tracking-widest">{row.sucursal_nombre || '—'}</span>
                </div>
            )
        },
        {
            header: 'Producto',
            accessor: 'producto_nombre',
            render: (row) => (
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest leading-snug">
                    {row.producto_nombre || '—'}
                </span>
            )
        },
        {
            header: 'Volumen',
            accessor: 'cantidad',
            render: (row) => (
                <div className="inline-flex items-baseline gap-1 px-3 py-1.5 bg-black text-white rounded-lg font-sport text-lg leading-none tracking-widest">
                    {row.cantidad}
                    <span className="text-[10px] font-sans font-bold ml-1 mb-0.5">UN.</span>
                </div>
            )
        },
    ];

    // Fallback de seguridad extrema
    if (!isSuperAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-3 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-3 gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Gestión de <span className="text-brand-cyan">Ingresos</span>
                    </h2>
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal line-clamp-3 md:line-clamp-none">
                        Módulo de logística para la carga de mercadería nueva. Los registros aquí realizados incrementan el stock disponible en las sedes.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-neutral-100 dark:bg-gray-700 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-gray-600 transition-colors px-4 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-black text-white text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-lg hover:bg-brand-cyan hover:text-black transition-colors flex items-center gap-1.5 shadow-lg shadow-brand-cyan/10"
                        disabled={isSubmitting}
                    >
                        <PlusCircle size={12} />
                        Cargar Mercadería
                    </button>
                </div>
            </div>

            <div className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-xl flex items-start gap-4 mb-2">
                <Info size={18} className="text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-cyan-200 leading-relaxed m-0">
                    <span className="text-black dark:text-white font-black">Historial de Registros:</span> Debajo puedes auditar los ingresos de stock recientes. Para ver el stock acumulado total por producto, dirígete a <span className="text-brand-cyan">"Stock por Sede"</span>.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-3 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 animate-pulse">Recopilando historial de ingresos...</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm min-h-[400px] flex flex-col justify-start">
                    {envios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package size={48} className="text-neutral-200 mb-4" />
                            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Sin registros recientes</p>
                            <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest">Pulsa "Cargar Mercadería" para registrar la llegada de stock.</p>
                        </div>
                    ) : (
                        <DataTable
                            data={envios}
                            columns={columns}
                            searchPlaceholder="Buscar por sede o ítem..."
                            variant="minimal"
                        />
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title="Carga de Mercadería (Ingreso de Stock)"
            >
                <form onSubmit={handleSubmit} className="space-y-4 p-1">

                    {/* Feedback banner */}
                    {feedback && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
                            feedback.type === 'ok'
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            {feedback.type === 'ok'
                                ? <CheckCircle2 size={16} />
                                : <AlertCircle size={16} />
                            }
                            {feedback.msg}
                        </div>
                    )}

                    <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-4">
                        <Info size={18} className="text-brand-cyan shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                            Al confirmar, el stock se incrementará en la <span className="text-black font-black">Sede Destino</span>. Operación irreversible.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Sede de Destino</label>
                            <div className="relative group">
                                <Home size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                <select
                                    required
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all appearance-none disabled:opacity-60"
                                    value={formData.sucursal_id}
                                    onChange={e => setFormData({ ...formData, sucursal_id: e.target.value })}
                                >
                                    <option value="">Seleccione destino...</option>
                                    {sucursales.map(s => <option key={s.id_comercio} value={s.id_comercio}>{s.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Producto a Transferir</label>
                            <div className="relative group">
                                <Box size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                <select
                                    required
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all appearance-none disabled:opacity-60"
                                    value={formData.producto_id}
                                    onChange={e => handleProductChange(e.target.value)}
                                >
                                    <option value="">Seleccione ítem...</option>
                                    {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Mostrar selector de variantes si el producto tiene variantes */}
                        {hasVariants ? (
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black flex items-center gap-2">
                                    <Package size={14} className="text-brand-cyan" />
                                    Variantes a Transferir
                                </label>
                                <div className="bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-neutral-50 dark:bg-gray-600">
                                            <tr>
                                                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500">SKU / Atributos</th>
                                                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 text-center w-28">Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-gray-600">
                                            {productVariants.map((variante) => {
                                                const atributos = variante.atributos_valores || {};
                                                const atributosText = Object.entries(atributos)
                                                    .map(([key, val]) => `${key}: ${val}`)
                                                    .join(' · ');
                                                
                                                return (
                                                    <tr key={variante.id_variante} className="hover:bg-neutral-50 dark:hover:bg-gray-600/50">
                                                        <td className="px-3 py-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-black dark:text-white uppercase">
                                                                    {variante.sku_variante || 'Sin SKU'}
                                                                </span>
                                                                <span className="text-[9px] text-neutral-500 uppercase">
                                                                    {atributosText}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                disabled={isSubmitting}
                                                                className="w-full px-2 py-1.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-500 rounded text-center text-sm font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan transition-all disabled:opacity-60"
                                                                placeholder="0"
                                                                value={variantQuantities[variante.id_variante] || 0}
                                                                onChange={e => handleVariantQuantityChange(variante.id_variante, e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[9px] text-neutral-400 text-center">
                                    Total a transferir: {Object.values(variantQuantities).reduce((a, b) => a + b, 0)} unidades
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Cantidad de Unidades</label>
                                <div className="relative group">
                                    <Check size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                    <input
                                        required type="number" min="1"
                                        disabled={isSubmitting || hasVariants}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all disabled:opacity-60"
                                        placeholder="0"
                                        value={formData.cantidad}
                                        onChange={e => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-4 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-60"
                        >
                            {isSubmitting
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> PROCESANDO SOLICITUD...</>
                                : <><Truck size={16} /> PROCESAR ORDEN</>
                            }
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setIsModalOpen(false)}
                            className="w-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors py-3 disabled:opacity-40"
                        >
                            CANCELAR
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Envios;