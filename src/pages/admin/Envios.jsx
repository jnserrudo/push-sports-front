import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Truck, Box, Home, PlusCircle, Info, Check, RefreshCw, AlertCircle, CheckCircle2, Package, Clock, FileSpreadsheet, Boxes, Download } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { enviosService } from '../../services/enviosService';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';
import { inventarioService } from '../../services/inventarioService';
import { useAuthStore } from '../../store/authStore';
import PremiumSelect from '../../components/ui/PremiumSelect';
import QueQueresHacer from '../../components/ui/QueQueresHacer';
import { exportToExcel } from '../../utils/exportExcel';

const TIPO_INGRESO = 1;

const varianteNombre = (mv) => {
    const v = mv?.variante || {};
    const attrs = v.atributos_valores && typeof v.atributos_valores === 'object'
        ? Object.values(v.atributos_valores).join(' / ')
        : '';
    return attrs || v.sku_variante || 'Variante';
};

const Envios = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [envios, setEnvios]         = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [todasSucursales, setTodasSucursales] = useState([]);
    const [filtro, setFiltro] = useState({ sucursalId: '', desde: '', hasta: '' });
    const [loadingEnvios, setLoadingEnvios] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [productos, setProductos]   = useState([]);
    const [loadingSucursales, setLoadingSucursales] = useState(false);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [isLoading, setIsLoading]   = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'ok'|'error', msg: string }
    const [confirmEnvio, setConfirmEnvio] = useState(null);

    const [formData, setFormData] = useState({
        sucursal_id: '',
        producto_id: '',
        cantidad: '',
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productVariants, setProductVariants] = useState([]);
    const [variantQuantities, setVariantQuantities] = useState({});
    const [hasVariants, setHasVariants] = useState(false);

    const fetchIngresos = useCallback(async (f) => {
        const res = await enviosService.getAll({
            id_tipo_movimiento: TIPO_INGRESO,
            sucursalId: f.sucursalId || undefined,
            desde: f.desde || undefined,
            hasta: f.hasta || undefined,
            limit: 5000,
        });
        return (res.data || []).filter(item => item && (item.id_movimiento || item.fecha_hora || item.producto?.nombre));
    }, []);

    const loadEnvios = useCallback(async (f) => {
        setLoadingEnvios(true);
        try {
            setEnvios(await fetchIngresos(f));
        } catch (err) {
            console.error('Error cargando envíos:', err);
        } finally {
            setLoadingEnvios(false);
        }
    }, [fetchIngresos]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setLoadingSucursales(true);
        setLoadingProductos(true);
        try {
            const [sucData, prodData] = await Promise.all([
                sucursalesService.getAll(),
                productosService.getAll(),
            ]);
            setTodasSucursales(sucData);
            setSucursales(sucData.filter(s => s.activo));
            setProductos(prodData.filter(p => p.activo));
        } catch (err) {
            console.error('Error cargando envíos:', err);
        } finally {
            setIsLoading(false);
            setLoadingSucursales(false);
            setLoadingProductos(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { loadEnvios(filtro); }, [filtro, loadEnvios]);

    const sucursalNombreById = (id) => todasSucursales.find(s => s.id_comercio === id)?.nombre || '';

    const handleExportIngresos = async () => {
        setExporting(true);
        try {
            const rows = [...envios]
                .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
                .flatMap(mov => {
                    const prod = mov.producto || {};
                    const publico = Number(prod.precio_venta_sugerido || 0);
                    const push = Number(prod.precio_pushsport || 0);
                    const base = {
                        Fecha: mov.fecha_hora ? new Date(mov.fecha_hora).toLocaleDateString('es-AR') : '',
                        Sucursal: mov.comercio?.nombre || sucursalNombreById(mov.id_comercio),
                        Producto: prod.nombre || '',
                    };
                    const fila = (variante, cantidad) => ({
                        ...base,
                        Variante: variante,
                        Cantidad: cantidad,
                        'Precio Publico (hoy)': publico,
                        'Precio Push (hoy)': push,
                        'Total Publico': cantidad * publico,
                        'Total Push': cantidad * push,
                    });
                    if (mov.variantes?.length) {
                        return mov.variantes.map(mv => fila(varianteNombre(mv), Number(mv.cantidad_cambio) || 0));
                    }
                    return [fila('', Number(mov.cantidad_cambio) || 0)];
                });
            const suc = filtro.sucursalId ? sucursalNombreById(filtro.sucursalId) : 'Todas';
            const stamp = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
            await exportToExcel(rows, `Mercaderia_Ingresada_${suc}_${stamp}`);
        } finally {
            setExporting(false);
        }
    };

    const totalUnidadesFiltradas = envios.reduce((sum, m) => sum + (Number(m.cantidad_cambio) || 0), 0);

    const handleAdd = () => {
        setFormData({
            sucursal_id: sucursales[0]?.id_comercio || '',
            producto_id: '',
            cantidad: '',
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
        const cleanVal = cantidad === '' ? '' : String(parseInt(cantidad) || 0);
        setVariantQuantities(prev => ({
            ...prev,
            [varianteId]: cleanVal
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        let itemsVariantes = [];
        let qtyLabel = '';
        if (hasVariants) {
            itemsVariantes = Object.entries(variantQuantities)
                .filter(([, cantidad]) => Number(cantidad) > 0)
                .map(([id_variante, cantidad]) => ({ id_variante, cantidad: Number(cantidad) }));
            if (itemsVariantes.length === 0) {
                setFeedback({ type: 'error', msg: 'Debes ingresar cantidad para al menos una variante.' });
                return;
            }
            qtyLabel = itemsVariantes.map((item) => {
                const variante = productVariants.find(v => v.id_variante === item.id_variante);
                const attrs = variante?.atributos_valores || {};
                const nombre = variante?.sku_variante || Object.values(attrs).join(' / ') || 'Variante';
                return `${item.cantidad} ${nombre}`;
            }).join(', ');
        } else {
            const qty = Number(formData.cantidad) || 0;
            if (qty <= 0) {
                setFeedback({ type: 'error', msg: 'Ingresá una cantidad mayor a 0.' });
                return;
            }
            qtyLabel = `${qty} unidades`;
        }

        const sucursalNombre = sucursales.find(s => s.id_comercio === formData.sucursal_id)?.nombre || 'la sucursal';
        const productoNombre = selectedProduct?.nombre || 'el producto';
        let needsLink = false;
        try {
            const inv = await inventarioService.getBySucursal(formData.sucursal_id);
            needsLink = !(inv || []).some(i => i.id_producto === formData.producto_id);
        } catch {
            needsLink = false;
        }

        setConfirmEnvio({
            needsLink,
            sucursalNombre,
            productoNombre,
            qtyLabel,
            itemsVariantes,
        });
    };

    const executeEnvio = async () => {
        const pending = confirmEnvio;
        setConfirmEnvio(null);
        setIsSubmitting(true);
        setFeedback(null);
        try {
            if (pending?.needsLink) {
                try {
                    await inventarioService.create({
                        id_producto: formData.producto_id,
                        id_comercio: formData.sucursal_id,
                        cantidad_actual: 0,
                        stock_minimo_alerta: 5,
                    });
                } catch {
                    // Ya existe o el envío lo crea solo
                }
            }

            if (hasVariants) {
                await enviosService.crearEnvioConVariantes(
                    formData.sucursal_id,
                    formData.producto_id,
                    pending.itemsVariantes
                );
                const totalUnidades = pending.itemsVariantes.reduce((sum, item) => sum + item.cantidad, 0);
                setFeedback({ type: 'ok', msg: `Stock cargado: ${totalUnidades} unidades de ${pending.itemsVariantes.length} variantes.` });
            } else {
                await enviosService.crearEnvio(
                    formData.sucursal_id,
                    formData.producto_id,
                    Number(formData.cantidad) || 0
                );
                setFeedback({ type: 'ok', msg: 'Stock cargado en la sucursal. Ya puede venderlo.' });
            }

            setTimeout(() => {
                setIsModalOpen(false);
                setFeedback(null);
                loadData();
                loadEnvios(filtro);
            }, 1200);
        } catch (err) {
            const backendError = err.response?.data?.error || err.message || 'Error al procesar la orden.';
            setFeedback({ type: 'error', msg: backendError });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id_movimiento',
            render: (row) => (
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_movimiento || '').split('-')[0]}
                </span>
            )
        },
        {
            header: 'Fecha',
            accessor: 'fecha_hora',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-neutral-400" />
                    <span className="font-bold text-[10px] text-black uppercase tracking-tight">
                        {row.fecha_hora ? new Date(row.fecha_hora).toLocaleDateString() : '—'}
                    </span>
                </div>
            )
        },
        {
            header: 'Destino',
            accessor: 'comercio.nombre',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Home size={10} className="text-brand-cyan" />
                    <span className="font-bold text-[10px] text-black dark:text-white uppercase tracking-tight">{row.comercio?.nombre || sucursalNombreById(row.id_comercio) || '—'}</span>
                </div>
            )
        },
        {
            header: 'Producto',
            accessor: 'producto.nombre',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Box size={10} className="text-neutral-400" />
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight leading-snug">
                        {row.producto?.nombre || '—'}
                    </span>
                </div>
            )
        },
        {
            header: 'Cantidad',
            accessor: 'cantidad_cambio',
            render: (row) => (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase tracking-widest">
                    {row.cantidad_cambio} UN.
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
                        Envíos a <span className="text-brand-cyan">Sucursales</span>
                    </h2>
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal line-clamp-3 md:line-clamp-none">
                        Acá le dejás stock a una sucursal. El botón Cargar Mercadería sí mueve el inventario. Reportería solo imprime; Registrar Ventas cobra al cliente.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => { loadData(); loadEnvios(filtro); }}
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

            <QueQueresHacer />

            <div className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-xl flex items-start gap-4 mb-2">
                <Info size={18} className="text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-cyan-200 leading-relaxed m-0">
                    <span className="text-black dark:text-white font-black">Cargar Mercadería:</span> suma stock en la sede destino (por variante si corresponde). Si el producto no está vinculado, al confirmar se vincula en 0 y después entra el envío. El historial de abajo son esos ingresos.
                </p>
            </div>

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-gray-400 mb-2">¿Qué querés descargar?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link
                        to="/dashboard/reporteria?ver=inventario"
                        className="group flex items-start gap-4 p-4 rounded-xl border-2 border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-cyan transition-all"
                    >
                        <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center shrink-0">
                            <Boxes size={20} className="text-brand-cyan" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight text-black dark:text-white">Lo que tiene HOY una sucursal</p>
                            <p className="text-[10px] font-bold text-neutral-500 dark:text-gray-400 mt-1 leading-relaxed">
                                Stock actual de cada producto + precio Público y Push. Elegís la sucursal y bajás PDF o Excel.
                            </p>
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-brand-cyan group-hover:underline">
                                <Download size={12} /> Ir a descargar stock
                            </span>
                        </div>
                    </Link>
                    <a
                        href="#mercaderia-ingresada"
                        className="group flex items-start gap-4 p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-900/10 hover:border-emerald-500 transition-all"
                    >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Truck size={20} className="text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight text-black dark:text-white">Mercadería ingresada (lo que le cargaste)</p>
                            <p className="text-[10px] font-bold text-neutral-500 dark:text-gray-400 mt-1 leading-relaxed">
                                Todo lo que entró a una sucursal con Cargar Mercadería: fecha, producto, cantidad y precios. Está acá abajo.
                            </p>
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 group-hover:underline">
                                <FileSpreadsheet size={12} /> Descargar Excel abajo
                            </span>
                        </div>
                    </a>
                </div>
            </div>

            <div id="mercaderia-ingresada" className="bg-white dark:bg-gray-800 border-2 border-emerald-500/30 rounded-xl p-4 space-y-3 scroll-mt-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2">
                            <FileSpreadsheet size={16} className="text-emerald-600" /> Descargar mercadería ingresada
                        </p>
                        <p className="text-[10px] font-bold text-neutral-500 dark:text-gray-400 mt-0.5">
                            1) Elegí la sucursal (o dejá Todas). 2) Si querés, poné fechas. 3) Tocá Descargar Excel. La tabla de abajo muestra lo mismo que se descarga.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleExportIngresos}
                        disabled={exporting || loadingEnvios || envios.length === 0}
                        className="h-11 px-5 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shrink-0"
                    >
                        <FileSpreadsheet size={15} /> {exporting ? 'Generando...' : 'Descargar Excel'}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Sucursal</label>
                        <select
                            value={filtro.sucursalId}
                            onChange={e => setFiltro(f => ({ ...f, sucursalId: e.target.value }))}
                            className="w-full h-10 px-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-bold text-black dark:text-white"
                        >
                            <option value="">Todas las sucursales</option>
                            {todasSucursales.map(s => (
                                <option key={s.id_comercio} value={s.id_comercio}>
                                    {s.nombre}{s.activo ? '' : ' (inactiva)'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Desde (opcional)</label>
                        <input
                            type="date"
                            value={filtro.desde}
                            onChange={e => setFiltro(f => ({ ...f, desde: e.target.value }))}
                            className="w-full h-10 px-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-bold text-black dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Hasta (opcional)</label>
                        <input
                            type="date"
                            value={filtro.hasta}
                            onChange={e => setFiltro(f => ({ ...f, hasta: e.target.value }))}
                            className="w-full h-10 px-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-bold text-black dark:text-white"
                        />
                    </div>
                </div>
                <p className="text-[10px] font-bold text-neutral-500 dark:text-gray-400">
                    {loadingEnvios
                        ? 'Buscando...'
                        : `${envios.length} ingreso${envios.length !== 1 ? 's' : ''} · ${totalUnidadesFiltradas} unidades`}
                    {' · '}Los precios del Excel son los de hoy.
                </p>
            </div>

            {isLoading || loadingEnvios ? (
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
                            Al confirmar, el stock se incrementa en la <span className="text-black font-black">Sede Destino</span> y la sucursal ya puede venderlo. No uses Registrar Ventas para esto.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Sede de Destino</label>
                            <PremiumSelect
                                icon={Home}
                                placeholder="Seleccione destino..."
                                isLoading={loadingSucursales}
                                options={sucursales.map(s => ({ value: s.id_comercio, label: s.nombre }))}
                                value={formData.sucursal_id}
                                onChange={val => setFormData({ ...formData, sucursal_id: val })}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Producto a Transferir</label>
                            <PremiumSelect
                                icon={Box}
                                placeholder="Seleccione ítem..."
                                isLoading={loadingProductos}
                                options={productos.map(p => ({ 
                                    value: p.id_producto, 
                                    label: p.nombre,
                                    subtitle: p.categoria?.nombre
                                }))}
                                value={formData.producto_id}
                                onChange={val => handleProductChange(val)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Mostrar selector de variantes si el producto tiene variantes */}
                        {hasVariants ? (
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black flex items-center gap-2">
                                    <Package size={14} className="text-brand-cyan" />
                                    Variantes a Transferir
                                </label>
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                                    <p className="text-[9px] text-blue-700 leading-tight m-0">
                                        Este producto se gestiona por variantes. Ingresá la cantidad de cada talle/color que deseas enviar. Solo se descontará del stock central de cada variante.
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-neutral-50 dark:bg-gray-600">
                                            <tr>
                                                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500">SKU / Atributos</th>
                                                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 text-center">Disponible</th>
                                                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 text-center w-28">Transferir</th>
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
                                                        <td className="px-3 py-2 text-center align-middle">
                                                            <span className="inline-block text-[10px] font-black text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-1 rounded">
                                                                {variante.stock_central ?? 0} UN.
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                disabled={isSubmitting}
                                                                className="w-full px-2 py-1.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-500 rounded text-center text-sm font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan transition-all disabled:opacity-60"
                                                                placeholder="0"
                                                                value={variantQuantities[variante.id_variante] ?? ''}
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
                                    Total a transferir: {Object.values(variantQuantities).reduce((a, b) => parseInt(a || 0) + parseInt(b || 0), 0)} unidades
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Cantidad de Unidades</label>
                                    {selectedProduct && (
                                        <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-1 rounded">
                                            Disponible: {selectedProduct.stock_central ?? 0} UN.
                                        </span>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Check size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                    <input
                                        required type="number" min="1"
                                        disabled={isSubmitting || hasVariants}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all disabled:opacity-60"
                                        placeholder="0"
                                        value={formData.cantidad}
                                        onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
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
                                : <><Truck size={16} /> Cargar</>
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

            <ConfirmDialog
                isOpen={!!confirmEnvio}
                onClose={() => setConfirmEnvio(null)}
                onConfirm={executeEnvio}
                variant={confirmEnvio?.needsLink ? 'warning' : 'info'}
                title="¿Cargar mercadería ahora?"
                confirmText="Sí, mover stock"
                cancelText="Volver"
                message={confirmEnvio
                    ? `Vas a dejar ${confirmEnvio.qtyLabel} de ${confirmEnvio.productoNombre} en ${confirmEnvio.sucursalNombre}. Esto suma stock real. ${confirmEnvio.needsLink ? 'El producto no está vinculado a esa sucursal: se vincula en 0 y después entra el envío.' : ''}`
                    : ''}
            />
        </div>
    );
};

export default Envios;