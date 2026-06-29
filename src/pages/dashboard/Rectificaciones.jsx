import React, { useState, useEffect } from 'react';
import {
    Search, AlertTriangle, FileEdit, CheckCircle2, XCircle, Clock, Package,
    Send, ChevronRight, X, Plus, Minus, Trash2, Info, History, RefreshCw, Eye
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { rectificacionesService } from '../../services/rectificacionesService';
import { toast } from '../../store/toastStore';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';

const Rectificaciones = () => {
    const { user, sucursalId } = useAuthStore();
    const canApprove = user?.id_rol === 1 || user?.id_rol === 2;
    const isSuperAdmin = user?.id_rol === 1;

    const [activeTab, setActiveTab] = useState('ventas');

    // --- Tab Ventas ---
    const [ventas, setVentas] = useState([]);
    const [searchTermVenta, setSearchTermVenta] = useState('');
    const [isLoadingVentas, setIsLoadingVentas] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [cadenaVentas, setCadenaVentas] = useState([]);
    const [isLoadingCadena, setIsLoadingCadena] = useState(false);

    // --- Tab Movimientos ---
    const [movimientos, setMovimientos] = useState([]);
    const [searchTermMov, setSearchTermMov] = useState('');
    const [isLoadingMov, setIsLoadingMov] = useState(false);
    const [selectedMov, setSelectedMov] = useState(null);

    // --- Tab Solicitudes / Historial ---
    const [solicitudes, setSolicitudes] = useState([]);
    const [isLoadingSol, setIsLoadingSol] = useState(false);

    // --- Modales ---
    const [isRectificarModalOpen, setIsRectificarModalOpen] = useState(false);
    const [isResolucionModalOpen, setIsResolucionModalOpen] = useState(false);
    const [isCadenaModalOpen, setIsCadenaModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [isDetalleRectModalOpen, setIsDetalleRectModalOpen] = useState(false);
    const [selectedRectificacion, setSelectedRectificacion] = useState(null);

    // --- Tipos de Rectificación ---
    const [tipos, setTipos] = useState([]);
    const [isLoadingTipos, setIsLoadingTipos] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState('');
    const [motivoLibre, setMotivoLibre] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [esAnulacionTotal, setEsAnulacionTotal] = useState(false);

    // --- Edición de ítems para rectificación ---
    const [nuevosDetalles, setNuevosDetalles] = useState([]);

    const [motivo, setMotivo] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // ─── Cargas Iniciales ──────────────────────────────────────────────────
    const loadVentas = async () => {
        setIsLoadingVentas(true);
        try {
            const data = await rectificacionesService.getVentas();
            // Solo mostrar ventas activas no liquidadas para rectificación
            let filtered = data.filter(v => v.estado === 'ACTIVA' && !v.id_liquidacion);
            if (!isSuperAdmin) filtered = filtered.filter(v => v.id_comercio === (sucursalId || user?.id_comercio_asignado));
            setVentas(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingVentas(false);
        }
    };

    const loadMovimientos = async () => {
        setIsLoadingMov(true);
        try {
            const data = await rectificacionesService.getMovimientos({ limit: 100 });
            const filtered = isSuperAdmin ? data.data : data.data.filter(m => m.id_comercio === (sucursalId || user?.id_comercio_asignado));
            setMovimientos(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMov(false);
        }
    };

    const loadSolicitudes = async () => {
        setIsLoadingSol(true);
        try {
            const data = activeTab === 'solicitudes'
                ? await rectificacionesService.getPendientes()
                : await rectificacionesService.getHistorial();
            console.log('📋 Solicitudes/Historial cargado:', activeTab, data.length, data);
            setSolicitudes(data);
        } catch (e) {
            console.error('Error cargando solicitudes/historial:', e);
        } finally {
            setIsLoadingSol(false);
        }
    };

    const loadTipos = async () => {
        setIsLoadingTipos(true);
        try {
            const data = await rectificacionesService.getTipos();
            setTipos(data);
        } catch (e) {
            console.error('Error cargando tipos de rectificación:', e);
            toast.error('Error al cargar tipos de rectificación');
        } finally {
            setIsLoadingTipos(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ventas') loadVentas();
        if (activeTab === 'movimientos') loadMovimientos();
        if (activeTab === 'solicitudes' || activeTab === 'historial') loadSolicitudes();
    }, [activeTab, sucursalId]);

    useEffect(() => {
        loadTipos();
    }, []);


    // ─── Filtros ───────────────────────────────────────────────────────────
    const filteredVentas = ventas.filter(v =>
        v.id_venta?.toLowerCase().includes(searchTermVenta.toLowerCase()) ||
        new Date(v.fecha_hora).toLocaleDateString().includes(searchTermVenta) ||
        v.usuario?.nombre?.toLowerCase().includes(searchTermVenta.toLowerCase())
    );

    const filteredMovimientos = movimientos.filter(m =>
        m.id_movimiento?.toLowerCase().includes(searchTermMov.toLowerCase()) ||
        m.producto?.nombre?.toLowerCase().includes(searchTermMov.toLowerCase())
    );

    // ─── Helpers de edición de detalles ───────────────────────────────────
    const buildNuevosDetalles = (venta) => {
        return venta.detalles?.map(d => ({
            id_detalle_original: d.id_detalle,
            id_producto: d.id_producto,
            id_variante: d.variantes?.[0]?.id_variante || null,
            nombre: d.producto?.nombre,
            variante: d.variantes?.[0]?.variante,
            cantidad: d.cantidad,
            precio_unitario: Number(d.precio_unitario_cobrado),
            precio_pushsport_historico: Number(d.precio_pushsport_historico),
            tiene_variantes: d.tiene_variantes,
            eliminado: false
        })) || [];
    };

    const handleOpenRectificarVenta = (venta) => {
        setSelectedVenta(venta);
        setSelectedMov(null);
        setNuevosDetalles(buildNuevosDetalles(venta));
        setSelectedTipo('');
        setMotivoLibre('');
        setObservaciones('');
        setEsAnulacionTotal(false);
        setMotivo('');
        setIsRectificarModalOpen(true);
    };

    const handleOpenRectificarMov = (mov) => {
        setSelectedMov(mov);
        setSelectedVenta(null);
        setMotivo('');
        setIsRectificarModalOpen(true);
    };

    const handleCloseRectificarModal = () => {
        setIsRectificarModalOpen(false);
        setSelectedVenta(null);
        setSelectedMov(null);
    };

    const handleVerCadena = async (venta) => {
        setSelectedVenta(venta);
        setIsLoadingCadena(true);
        setIsCadenaModalOpen(true);
        try {
            const data = await rectificacionesService.getCadenaVentas(venta.id_venta);
            setCadenaVentas(data);
        } catch (e) {
            console.error(e);
            toast.error('Error cargando cadena de ventas');
        } finally {
            setIsLoadingCadena(false);
        }
    };

    const updateDetalleCantidad = (idx, delta) => {
        setNuevosDetalles(prev => {
            const next = [...prev];
            const nuevo = Math.max(1, next[idx].cantidad + delta);
            next[idx] = { ...next[idx], cantidad: nuevo };
            return next;
        });
    };

    const updateDetallePrecio = (idx, precio) => {
        setNuevosDetalles(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], precio_unitario: parseFloat(precio) || 0 };
            return next;
        });
    };

    const removeDetalle = (idx) => {
        setNuevosDetalles(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], eliminado: true };
            return next;
        });
    };

    const restoreDetalle = (idx) => {
        setNuevosDetalles(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], eliminado: false };
            return next;
        });
    };

    const handleSubmitRectificacion = async () => {
        const tipoSeleccionado = tipos.find(t => t.id_tipo === selectedTipo);
        if (!selectedTipo) {
            toast.error('Debe seleccionar un tipo de rectificación.');
            return;
        }
        if (tipoSeleccionado?.es_otro && !motivoLibre.trim()) {
            toast.error('Debe detallar el motivo cuando selecciona "Otros".');
            return;
        }

        const motivoFinal = tipoSeleccionado?.es_otro ? motivoLibre : tipoSeleccionado?.nombre;

        setIsProcessing(true);
        try {
            if (!canApprove) {
                await rectificacionesService.crearSolicitud({
                    tipo_entidad: selectedVenta ? 'VENTA' : 'MOVIMIENTO_STOCK',
                    id_entidad: selectedVenta ? selectedVenta.id_venta : selectedMov.id_movimiento,
                    id_comercio: selectedVenta ? selectedVenta.id_comercio : selectedMov.id_comercio,
                    motivo: motivoFinal,
                    datos_corregidos: selectedVenta ? { nuevos_detalles: nuevosDetalles.filter(d => !d.eliminado) } : null
                });
                toast.success('Solicitud de rectificación enviada para aprobación.');
            } else {
                if (selectedVenta) {
                    const detallesParaEnviar = esAnulacionTotal
                        ? []
                        : nuevosDetalles.filter(d => !d.eliminado).map(d => ({
                            id_producto: d.id_producto,
                            id_variante: d.id_variante,
                            cantidad: d.cantidad,
                            precio_unitario: d.precio_unitario
                        }));

                    await rectificacionesService.rectificarVenta({
                        id_venta: selectedVenta.id_venta,
                        motivo: motivoFinal,
                        nuevos_detalles: detallesParaEnviar,
                        metodo_pago: selectedVenta.metodo_pago,
                        id_tipo_rectificacion: selectedTipo,
                        motivo_libre: tipoSeleccionado?.es_otro ? motivoLibre : null,
                        observaciones,
                        es_anulacion_total: esAnulacionTotal
                    });
                    toast.success(esAnulacionTotal ? 'Venta anulada correctamente.' : 'Venta rectificada correctamente.');
                    loadVentas();
                } else {
                    await rectificacionesService.rectificarMovimiento({
                        id_movimiento: selectedMov.id_movimiento,
                        motivo: motivoFinal,
                        nuevos_items: null
                    });
                    toast.success('Movimiento revertido correctamente.');
                    loadMovimientos();
                }
            }
            handleCloseRectificarModal();
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.error || 'Error procesando la solicitud.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResolver = async (accion) => {
        if (accion === 'RECHAZAR' && !motivo) {
            toast.error('Debe indicar un motivo para rechazar.');
            return;
        }
        setIsProcessing(true);
        try {
            if (accion === 'APROBAR') {
                await rectificacionesService.aprobar(selectedSolicitud.id_solicitud);
                toast.success('Solicitud aprobada y ejecutada.');
            } else {
                await rectificacionesService.rechazar(selectedSolicitud.id_solicitud, motivo);
                toast.success('Solicitud rechazada.');
            }
            setIsResolucionModalOpen(false);
            loadSolicitudes();
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Error procesando la resolución.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Renderers ─────────────────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 max-w-[1400px] mx-auto pb-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black dark:border-gray-600 pb-6 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">AUDITORÍA Y CORRECCIONES</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Módulo de <span className="text-amber-500">Rectificaciones</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-2">
                        Corrección inmutable de operaciones
                    </p>
                </div>
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 bg-neutral-100 dark:bg-gray-700 p-1 rounded-xl">
                    {[
                        { id: 'ventas', label: 'Ventas', icon: FileEdit },
                        { id: 'movimientos', label: 'Movimientos', icon: Package },
                        { id: 'solicitudes', label: 'Pendientes', icon: Clock, show: canApprove },
                        { id: 'historial', label: 'Historial', icon: CheckCircle2 }
                    ].filter(t => t.show !== false).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id
                                    ? 'bg-black dark:bg-amber-500 text-white shadow-sm'
                                    : 'text-neutral-400 dark:text-gray-400 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ─── TAB VENTAS ─── */}
                {activeTab === 'ventas' && (
                    <motion.div key="ventas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                        {/* Columna Izquierda: Lista de Ventas */}
                        <div className="lg:col-span-5 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            <div className="p-4 border-b border-neutral-100 dark:border-gray-700">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white mb-3">
                                    Ventas Activas
                                </h3>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTermVenta}
                                        onChange={(e) => setSearchTermVenta(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-[10px] font-bold uppercase text-black dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 dark:divide-gray-700">
                                {isLoadingVentas ? <div className="p-10 text-center text-xs text-neutral-400">Cargando...</div> :
                                 filteredVentas.length === 0 ? (
                                    <div className="p-10 text-center text-xs text-neutral-400">
                                        No hay ventas activas disponibles para rectificar.
                                    </div>
                                 ) : filteredVentas.map(venta => (
                                    <div 
                                        key={venta.id_venta} 
                                        onClick={() => setSelectedVenta(venta)}
                                        className={`p-3 cursor-pointer transition-colors ${
                                            selectedVenta?.id_venta === venta.id_venta 
                                                ? 'bg-amber-50 dark:bg-amber-950/20 border-l-4 border-l-amber-500' 
                                                : 'hover:bg-neutral-50 dark:hover:bg-gray-700 border-l-4 border-l-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                                venta.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' :
                                                venta.estado === 'RECTIFICADA' ? 'bg-amber-100 text-amber-700' :
                                                venta.estado === 'ANULADA' ? 'bg-red-100 text-red-700' :
                                                'bg-neutral-100 text-neutral-600'
                                            }`}>
                                                {venta.estado}
                                            </span>
                                            <p className="font-sport text-sm text-black dark:text-white">${parseFloat(venta.total_venta).toLocaleString()}</p>
                                        </div>
                                        <p className="text-[9px] text-neutral-500 truncate">{new Date(venta.fecha_hora).toLocaleString()}</p>
                                        <p className="text-[8px] text-neutral-400 uppercase tracking-wider">
                                            {venta.comercio?.nombre} · {venta.usuario?.nombre} {venta.usuario?.apellido}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Columna Derecha: Detalles de Venta Seleccionada */}
                        <div className="lg:col-span-7 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            {selectedVenta ? (
                                <>
                                    <div className="p-5 border-b border-neutral-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">
                                                Detalles de Venta
                                            </h3>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                                selectedVenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' :
                                                selectedVenta.estado === 'RECTIFICADA' ? 'bg-amber-100 text-amber-700' :
                                                selectedVenta.estado === 'ANULADA' ? 'bg-red-100 text-red-700' :
                                                'bg-neutral-100 text-neutral-600'
                                            }`}>
                                                {selectedVenta.estado}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-neutral-400 mb-1">Fecha y Hora</p>
                                                <p className="text-xs font-bold text-black dark:text-white">{new Date(selectedVenta.fecha_hora).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-neutral-400 mb-1">Sucursal</p>
                                                <p className="text-xs font-bold text-black dark:text-white">{selectedVenta.comercio?.nombre}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-neutral-400 mb-1">Vendedor</p>
                                                <p className="text-xs font-bold text-black dark:text-white">{selectedVenta.usuario?.nombre} {selectedVenta.usuario?.apellido}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-neutral-400 mb-1">Método de Pago</p>
                                                <p className="text-xs font-bold text-black dark:text-white">{selectedVenta.metodo_pago}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-gray-700">
                                            <p className="text-[8px] font-black uppercase text-neutral-400 mb-1">Total</p>
                                            <p className="font-sport text-2xl text-black dark:text-white">${parseFloat(selectedVenta.total_venta).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5">
                                        <p className="text-[9px] font-black uppercase text-neutral-400 mb-3">Productos ({selectedVenta.detalles?.length || 0})</p>
                                        <div className="space-y-2">
                                            {selectedVenta.detalles?.map(d => {
                                                const precioPublico = d.producto?.precio_venta_sugerido || 0;
                                                const precioPush = Number(d.producto?.precio_pushsport || 0);
                                                const precioCobrado = Number(d.precio_unitario_cobrado);
                                                const ganancia = precioPublico - precioPush;
                                                return (
                                                    <div key={d.id_detalle} className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-black dark:text-white truncate">{d.producto?.nombre}</p>
                                                                {d.variantes?.[0]?.variante?.atributos_valores && (
                                                                    <p className="text-[9px] text-neutral-500 truncate">
                                                                        {Object.entries(d.variantes[0].variante.atributos_valores).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] text-neutral-500">x{d.cantidad}</p>
                                                                <p className="text-xs font-bold text-black dark:text-white">${precioCobrado.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-gray-600 space-y-1">
                                                            <div className="flex justify-between text-[9px]">
                                                                <span className="text-neutral-500">Precio público</span>
                                                                <span className="font-bold text-neutral-600 dark:text-gray-300">${precioPublico.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[9px]">
                                                                <span className="text-neutral-500">Precio Push</span>
                                                                <span className="font-bold text-neutral-600 dark:text-gray-300">${precioPush.toLocaleString()}</span>
                                                            </div>
                                                            <div className={`flex justify-between text-[9px] ${
                                                                ganancia > 0 ? 'text-green-600' : 'text-neutral-500'
                                                            }`}>
                                                                <span>Ganancia</span>
                                                                <span className="font-bold">${ganancia.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[9px] text-neutral-500">
                                                                <span>Subtotal</span>
                                                                <span className="font-bold text-black dark:text-white">${(precioCobrado * d.cantidad).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-neutral-100 dark:border-gray-700 flex gap-3">
                                        <button
                                            onClick={() => handleVerCadena(selectedVenta)}
                                            disabled={!selectedVenta._rectificacionesCount || selectedVenta._rectificacionesCount === 0}
                                            className={`flex-1 p-3 text-[10px] font-bold uppercase flex items-center justify-center gap-2 rounded-lg transition-colors ${
                                                !selectedVenta._rectificacionesCount || selectedVenta._rectificacionesCount === 0
                                                    ? 'bg-neutral-100 dark:bg-gray-700 text-neutral-400 dark:text-gray-500 cursor-not-allowed'
                                                    : 'bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300 hover:bg-black hover:text-white'
                                            }`}
                                        >
                                            <History size={14} /> Ver historial ({selectedVenta._rectificacionesCount || 0})
                                        </button>
                                        {canApprove && selectedVenta.estado === 'ACTIVA' && !selectedVenta.id_liquidacion && (
                                            <button
                                                onClick={() => handleOpenRectificarVenta(selectedVenta)}
                                                className="flex-1 p-3 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-amber-500 transition-colors uppercase"
                                            >
                                                Rectificar
                                            </button>
                                        )}
                                        {!canApprove && selectedVenta.estado === 'ACTIVA' && !selectedVenta.id_liquidacion && (
                                            <button
                                                onClick={() => handleOpenRectificarVenta(selectedVenta)}
                                                className="flex-1 p-3 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-amber-500 transition-colors uppercase"
                                            >
                                                Solicitar
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-10">
                                    <div className="text-center">
                                        <Package size={48} className="mx-auto text-neutral-300 mb-4" />
                                        <p className="text-xs text-neutral-400">Seleccioná una venta para ver sus detalles</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ─── TAB MOVIMIENTOS ─── */}
                {activeTab === 'movimientos' && (
                    <motion.div key="movimientos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-neutral-100 dark:border-gray-700">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white mb-4">
                                    Seleccionar Movimiento a Rectificar
                                </h3>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                    <input
                                        type="text"
                                        placeholder="Buscar producto o ID..."
                                        value={searchTermMov}
                                        onChange={(e) => setSearchTermMov(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs font-bold uppercase text-black dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[500px] divide-y divide-neutral-50 dark:divide-gray-700">
                                {isLoadingMov ? <div className="p-10 text-center text-xs text-neutral-400">Cargando...</div> :
                                 filteredMovimientos.map(mov => (
                                    <div key={mov.id_movimiento} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-neutral-400">#{mov.id_movimiento.split('-')[0]}</p>
                                            <p className="text-xs font-bold text-black dark:text-white">{mov.producto?.nombre}</p>
                                            <p className="text-xs mt-1">Cambio: <span className="font-bold">{mov.cantidad_cambio > 0 ? '+'+mov.cantidad_cambio : mov.cantidad_cambio}</span></p>
                                        </div>
                                        {mov.id_movimiento_origen ? (
                                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Es Rectificación</span>
                                        ) : (
                                            <button onClick={() => handleOpenRectificarMov(mov)} className="px-3 py-2 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-amber-500 transition-colors">
                                                {canApprove ? 'Rectificar' : 'Solicitar'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── TAB PENDIENTES (SOLICITUDES) ─── */}
                {activeTab === 'solicitudes' && (
                    <motion.div key="listado" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm p-4">
                            {isLoadingSol ? <p className="text-center p-10 text-xs text-neutral-400">Cargando...</p> : (
                                <DataTable 
                                    data={solicitudes}
                                    columns={[
                                        { 
                                            header: 'Fecha', 
                                            accessor: 'fecha_solicitud',
                                            render: (sol) => <span className="text-xs font-bold">{new Date(sol.fecha_solicitud).toLocaleDateString()}</span> 
                                        },
                                        { 
                                            header: 'Entidad', 
                                            accessor: 'tipo_entidad',
                                            render: (sol) => (
                                                <div className="text-xs font-bold">
                                                    {sol.tipo_entidad} <br/>
                                                    <span className="text-[10px] text-neutral-400">{sol.id_entidad.split('-')[0]}</span>
                                                </div>
                                            )
                                        },
                                        { 
                                            header: 'Motivo', 
                                            accessor: 'motivo',
                                            render: (sol) => <div className="text-xs text-neutral-600 dark:text-gray-300 max-w-xs truncate">{sol.motivo}</div> 
                                        },
                                        { 
                                            header: 'Estado', 
                                            accessor: 'estado',
                                            render: (sol) => (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                    sol.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                                    sol.estado === 'APROBADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {sol.estado}
                                                </span>
                                            )
                                        }
                                    ]}
                                    onView={(sol) => { setSelectedSolicitud(sol); setMotivo(''); setIsResolucionModalOpen(true); }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ─── TAB HISTORIAL (RECTIFICACIONES EJECUTADAS) ─── */}
                {activeTab === 'historial' && (
                    <motion.div key="historial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm p-4">
                            {isLoadingSol ? <p className="text-center p-10 text-xs text-neutral-400">Cargando...</p> : (
                                <DataTable 
                                    data={solicitudes}
                                    columns={[
                                        { 
                                            header: 'Fecha', 
                                            accessor: 'fecha_rectificacion',
                                            render: (rect) => (
                                                <div className="text-xs">
                                                    <span className="font-bold block">{new Date(rect.fecha_rectificacion).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-neutral-400">{new Date(rect.fecha_rectificacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            )
                                        },
                                        { 
                                            header: 'Venta Original', 
                                            accessor: 'id_venta_origen',
                                            render: (rect) => (
                                                <div className="text-xs">
                                                    <span className="font-bold block">VENTA</span>
                                                    <span className="text-[10px] text-neutral-400 font-mono">#{rect.id_venta_origen.split('-')[0].toUpperCase()}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: 'Sucursal',
                                            accessor: 'comercio_nombre',
                                            render: (rect) => <span className="text-xs font-bold uppercase">{rect.comercio_nombre}</span>
                                        },
                                        { 
                                            header: 'Tipo', 
                                            accessor: 'tipo_rectificacion',
                                            render: (rect) => (
                                                <div className="text-xs">
                                                    <span className="font-bold block">{rect.tipo_rectificacion || 'Rectificación'}</span>
                                                    {rect.es_anulacion && <span className="text-[10px] text-red-500">ANULACIÓN</span>}
                                                </div>
                                            )
                                        },
                                        { 
                                            header: 'Motivo', 
                                            accessor: 'motivo_rectificacion',
                                            render: (rect) => <div className="text-xs text-neutral-600 dark:text-gray-300 max-w-xs truncate">{rect.motivo_rectificacion}</div> 
                                        },
                                        { 
                                            header: 'Usuario', 
                                            accessor: 'usuario_nombre',
                                            render: (rect) => <span className="text-xs text-neutral-500">{rect.usuario_nombre}</span>
                                        },
                                        {
                                            header: 'Acciones',
                                            render: (rect) => (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRectificacion(rect);
                                                        setIsDetalleRectModalOpen(true);
                                                    }}
                                                    className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                    title="Ver Detalles"
                                                >
                                                    <Eye size={16} strokeWidth={2.5} />
                                                </button>
                                            )
                                        }
                                    ]}
                                    searchPlaceholder="Buscar rectificaciones..."
                                    variant="minimal"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Creación/Ejecución */}
            <Modal isOpen={isRectificarModalOpen} onClose={handleCloseRectificarModal} title={canApprove ? "Ejecutar Rectificación" : "Solicitar Rectificación"}>
                <div className="space-y-4 p-2 max-h-[70vh] overflow-y-auto">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-800 font-bold mb-1">Advertencia de Inmutabilidad</p>
                        <p className="text-[10px] text-amber-700 leading-relaxed">
                            Esta acción anulará la venta original de forma segura y actualizará inventarios y saldos automáticamente. Quedará registro permanente.
                        </p>
                    </div>

                    {selectedVenta && (
                        <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl border border-neutral-200 dark:border-gray-600">
                            <p className="text-[9px] font-black uppercase text-neutral-500 mb-2">Venta a rectificar</p>
                            <p className="text-xs font-bold text-black dark:text-white">{new Date(selectedVenta.fecha_hora).toLocaleString()}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                                {selectedVenta.usuario?.nombre} {selectedVenta.usuario?.apellido} · {selectedVenta.metodo_pago}
                            </p>
                            <p className="font-sport text-lg text-black dark:text-white mt-1">${parseFloat(selectedVenta.total_venta).toLocaleString()}</p>
                            <div className="mt-2 space-y-1">
                                <p className="text-[9px] font-black uppercase text-neutral-400">Ítems actuales ({selectedVenta.detalles?.length || 0})</p>
                                {selectedVenta.detalles?.map(d => (
                                    <div key={d.id_detalle} className="flex justify-between text-[10px] text-neutral-600 dark:text-gray-300">
                                        <span className="truncate">{d.producto?.nombre} {d.variantes?.[0]?.variante?.atributos_valores ? `(${Object.values(d.variantes[0].variante.atributos_valores).join(', ')})` : ''} x{d.cantidad}</span>
                                        <span className="font-bold">${(Number(d.precio_unitario_cobrado) * d.cantidad).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tipo de rectificación */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-500 mb-2">Tipo de Rectificación</label>
                        <div className="relative">
                            <select
                                value={selectedTipo}
                                onChange={e => setSelectedTipo(e.target.value)}
                                disabled={isLoadingTipos}
                                className="w-full p-3 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs font-bold bg-white dark:bg-gray-700 text-black dark:text-white disabled:opacity-50 appearance-none"
                            >
                                <option value="">Seleccionar tipo...</option>
                                {tipos.map(t => (
                                    <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                                ))}
                            </select>
                            {isLoadingTipos && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <RefreshCw size={14} className="animate-spin text-neutral-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalle si es Otros */}
                    {tipos.find(t => t.id_tipo === selectedTipo)?.es_otro && (
                        <div>
                            <label className="block text-[10px] font-black uppercase text-neutral-500 mb-2">Detalle del motivo *</label>
                            <textarea
                                value={motivoLibre}
                                onChange={e => setMotivoLibre(e.target.value)}
                                placeholder="Describí el motivo en detalle..."
                                className="w-full p-3 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs bg-neutral-50 dark:bg-gray-700 min-h-[80px]"
                            />
                        </div>
                    )}

                    {/* Observaciones */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-500 mb-2">Observaciones (opcional)</label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Información adicional para la auditoría..."
                            className="w-full p-3 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs bg-neutral-50 dark:bg-gray-700 min-h-[60px]"
                        />
                    </div>

                    {/* Anulación total */}
                    {selectedVenta && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                            <input
                                type="checkbox"
                                id="anulacion-total"
                                checked={esAnulacionTotal}
                                onChange={e => setEsAnulacionTotal(e.target.checked)}
                                className="w-4 h-4 accent-black"
                            />
                            <label htmlFor="anulacion-total" className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-widest cursor-pointer">
                                Anulación total (sin crear nueva venta)
                            </label>
                        </div>
                    )}

                    {/* Edición de ítems */}
                    {selectedVenta && !esAnulacionTotal && (
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-neutral-500">Ítems a rectificar</label>
                            <p className="text-[9px] text-neutral-400">Modificá cantidades o precios. Podés eliminar ítems que no van en la nueva venta.</p>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                {nuevosDetalles.map((det, idx) => (
                                    <div key={det.id_detalle_original} className={`p-2 rounded-xl border ${det.eliminado ? 'bg-red-50 border-red-200 opacity-60' : 'bg-white dark:bg-gray-700 border-neutral-200 dark:border-gray-600'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-black dark:text-white truncate">{det.nombre}</p>
                                                {det.variante && (
                                                    <p className="text-[9px] text-neutral-500 truncate">
                                                        {Object.entries(det.variante.atributos_valores || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {!det.eliminado ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => updateDetalleCantidad(idx, -1)} className="p-1 bg-neutral-100 dark:bg-gray-600 rounded hover:bg-black hover:text-white transition-colors"><Minus size={12} /></button>
                                                            <span className="text-xs font-bold w-6 text-center">{det.cantidad}</span>
                                                            <button onClick={() => updateDetalleCantidad(idx, 1)} className="p-1 bg-neutral-100 dark:bg-gray-600 rounded hover:bg-black hover:text-white transition-colors"><Plus size={12} /></button>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-bold text-neutral-500">$</span>
                                                            <input
                                                                type="number"
                                                                value={det.precio_unitario}
                                                                onChange={e => updateDetallePrecio(idx, e.target.value)}
                                                                className="w-20 p-1 text-xs font-bold border border-neutral-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeDetalle(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => restoreDetalle(idx)} className="px-2 py-1 text-[9px] font-bold text-black bg-white border border-neutral-200 rounded hover:bg-black hover:text-white transition-colors">
                                                        Restaurar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 bg-black rounded-lg">
                                <p className="text-[10px] font-bold text-white uppercase tracking-widest flex justify-between">
                                    <span>Nuevo total estimado:</span>
                                    <span className="font-sport text-lg">
                                        ${nuevosDetalles.filter(d => !d.eliminado).reduce((acc, d) => acc + (d.precio_unitario * d.cantidad), 0).toLocaleString()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmitRectificacion}
                        disabled={isProcessing}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold uppercase text-xs flex justify-center items-center gap-2 hover:bg-amber-500 transition-colors"
                    >
                        {isProcessing ? 'Procesando...' : canApprove ? 'EJECUTAR AHORA' : 'ENVIAR SOLICITUD'}
                    </button>
                </div>
            </Modal>

            {/* Modal Cadena de Ventas */}
            <Modal isOpen={isCadenaModalOpen} onClose={() => setIsCadenaModalOpen(false)} title="Historial de Rectificaciones">
                <div className="p-2 max-h-[70vh] overflow-y-auto space-y-3">
                    {isLoadingCadena ? (
                        <div className="p-10 text-center text-xs text-neutral-400">Cargando historial...</div>
                    ) : cadenaVentas.length === 0 ? (
                        <div className="p-10 text-center text-xs text-neutral-400">Esta venta no tiene rectificaciones.</div>
                    ) : (
                        cadenaVentas.map((v, idx) => (
                            <div key={v.id_venta} className="relative pl-6">
                                {idx < cadenaVentas.length - 1 && (
                                    <div className="absolute left-[11px] top-8 bottom-[-12px] w-0.5 bg-neutral-200 dark:bg-gray-600" />
                                )}
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">
                                    {idx + 1}
                                </div>
                                <div className={`p-3 rounded-xl border ${v.tipo_venta === 'RECTIFICACION' ? 'bg-amber-50 border-amber-200' : 'bg-white dark:bg-gray-700 border-neutral-200 dark:border-gray-600'}`}>
                                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                            v.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' :
                                            v.estado === 'RECTIFICADA' ? 'bg-amber-100 text-amber-700' :
                                            v.estado === 'ANULADA' ? 'bg-red-100 text-red-700' :
                                            'bg-neutral-100 text-neutral-600'
                                        }`}>
                                            {v.estado}
                                        </span>
                                        {v.tipo_venta === 'RECTIFICACION' && (
                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                RECTIFICACIÓN
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{new Date(v.fecha_hora).toLocaleString()}</p>
                                    <p className="text-[10px] text-neutral-500">Sucursal: {v.comercio?.nombre}</p>
                                    <p className="text-[10px] text-neutral-500">Por: {v._rectificacion?.usuario?.nombre || v.usuario?.nombre} {v._rectificacion?.usuario?.apellido || v.usuario?.apellido}</p>
                                    {v.metodo_pago && (
                                        <p className="text-[10px] text-neutral-500">Método: {v.metodo_pago}</p>
                                    )}
                                    <p className="font-sport text-lg text-black dark:text-white mt-1">${parseFloat(v.total_venta).toLocaleString()}</p>
                                    {v._rectificacion && (
                                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                            {v._rectificacion.tipo_rectificacion && (
                                                <p className="text-[9px] font-bold text-amber-800 dark:text-amber-300">
                                                    Tipo: {v._rectificacion.tipo_rectificacion.nombre}
                                                </p>
                                            )}
                                            {v._rectificacion.motivo_libre && (
                                                <p className="text-[9px] text-amber-700 dark:text-amber-400 italic">
                                                    Detalle: "{v._rectificacion.motivo_libre}"
                                                </p>
                                            )}
                                            {v._rectificacion.observaciones && (
                                                <p className="text-[8px] text-neutral-500 mt-1">Obs: {v._rectificacion.observaciones}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        <p className="text-[9px] font-black uppercase text-neutral-400">Ítems ({v.detalles?.length || 0})</p>
                                        {v.detalles?.map(d => {
                                            const precioPublico = d.producto?.precio_venta_sugerido || 0;
                                            const precioPush = Number(d.producto?.precio_pushsport || 0);
                                            const precioCobrado = Number(d.precio_unitario_cobrado);
                                            const ganancia = precioPublico - precioPush;
                                            return (
                                                <div key={d.id_detalle} className="p-2 bg-neutral-50 dark:bg-gray-600 rounded">
                                                    <div className="flex justify-between text-[10px] text-neutral-600 dark:text-gray-300">
                                                        <span className="truncate">{d.producto?.nombre} {d.variantes?.[0]?.variante?.atributos_valores ? `(${Object.values(d.variantes[0].variante.atributos_valores).join(', ')})` : ''} x{d.cantidad}</span>
                                                        <span className="font-bold">${(precioCobrado * d.cantidad).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[8px] text-neutral-500 mt-1">
                                                        <span>Público: ${precioPublico.toLocaleString()}</span>
                                                        <span>Push: ${precioPush.toLocaleString()}</span>
                                                        <span className={ganancia > 0 ? 'text-green-600' : ''}>Ganancia: $${ganancia.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {/* Modal Resolución */}
            <Modal isOpen={isResolucionModalOpen} onClose={() => setIsResolucionModalOpen(false)} title="Resolver Solicitud">
                <div className="space-y-4 p-2">
                    <div className="p-4 bg-neutral-50 rounded-xl">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase">Motivo del Solicitante</p>
                        <p className="text-xs text-black mt-1 font-medium">{selectedSolicitud?.motivo}</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-500 mb-2">Comentario / Motivo Rechazo (Opcional si aprueba)</label>
                        <textarea
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            className="w-full p-3 border rounded-xl text-xs bg-neutral-50 min-h-[80px]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleResolver('RECHAZAR')}
                            disabled={isProcessing}
                            className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold uppercase text-xs"
                        >
                            RECHAZAR
                        </button>
                        <button
                            onClick={() => handleResolver('APROBAR')}
                            disabled={isProcessing}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold uppercase text-xs"
                        >
                            APROBAR
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Detalles de Rectificación */}
            <Modal 
                isOpen={isDetalleRectModalOpen} 
                onClose={() => setIsDetalleRectModalOpen(false)} 
                title="Detalles de Rectificación"
            >
                {selectedRectificacion && (
                    <div className="space-y-4 p-4 max-h-[70vh] overflow-y-auto">
                        {/* Información General */}
                        <div className="bg-neutral-50 dark:bg-gray-800 p-4 rounded-xl border border-neutral-200 dark:border-gray-700">
                            <h3 className="text-xs font-black uppercase text-neutral-500 mb-3">Información General</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Fecha de Rectificación</p>
                                    <p className="text-xs font-bold text-black dark:text-white">
                                        {new Date(selectedRectificacion.fecha_rectificacion).toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Sucursal</p>
                                    <p className="text-xs font-bold text-black dark:text-white">{selectedRectificacion.comercio_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Realizado por</p>
                                    <p className="text-xs font-bold text-black dark:text-white">{selectedRectificacion.usuario_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Tipo de Rectificación</p>
                                    <p className="text-xs font-bold text-black dark:text-white">
                                        {selectedRectificacion.tipo_rectificacion ? (
                                            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg font-bold">
                                                {selectedRectificacion.tipo_rectificacion}
                                            </span>
                                        ) : (
                                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 rounded-lg font-bold">
                                                Sin especificar
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Venta Original */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h3 className="text-xs font-black uppercase text-blue-700 dark:text-blue-400 mb-3">Venta Original</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Fecha de Venta</p>
                                    <p className="text-xs font-bold text-black dark:text-white">
                                        {selectedRectificacion.venta_origen_fecha 
                                            ? new Date(selectedRectificacion.venta_origen_fecha).toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Método de Pago</p>
                                    <p className="text-xs font-bold text-black dark:text-white">{selectedRectificacion.metodo_pago}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Total de la Venta</p>
                                    <p className="text-lg font-black text-black dark:text-white">
                                        ${Number(selectedRectificacion.venta_origen_total || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Descripción de la Rectificación */}
                        {selectedRectificacion.motivo_rectificacion && 
                         selectedRectificacion.motivo_rectificacion !== selectedRectificacion.tipo_rectificacion && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                                <h3 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 mb-2">Descripción</h3>
                                <p className="text-sm text-black dark:text-white leading-relaxed">{selectedRectificacion.motivo_rectificacion}</p>
                            </div>
                        )}

                        {/* Productos */}
                        {selectedRectificacion.detalles && selectedRectificacion.detalles.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                <h3 className="text-xs font-black uppercase text-green-700 dark:text-green-400 mb-3">
                                    {selectedRectificacion.es_anulacion ? 'Productos Anulados' : 'Nueva Venta Generada'}
                                </h3>
                                
                                {/* Productos de la nueva venta */}
                                {selectedRectificacion.detalles && selectedRectificacion.detalles.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-2">
                                            Productos ({selectedRectificacion.detalles.length})
                                        </p>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedRectificacion.detalles.map((det, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-neutral-200 dark:border-gray-700">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-black dark:text-white">{det.producto_nombre}</p>
                                                        <p className="text-xs text-neutral-500">Cantidad: {det.cantidad} × ${Number(det.precio_unitario || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                                    </div>
                                                    <p className="text-sm font-black text-black dark:text-white ml-3">
                                                        ${Number((det.cantidad * det.precio_unitario) || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-green-300 dark:border-green-700 pt-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Nuevo Total</p>
                                        <p className="text-lg font-black text-black dark:text-white">
                                            ${Number(selectedRectificacion.total_venta || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Diferencia */}
                        {!selectedRectificacion.es_anulacion && (
                            <div className="bg-neutral-100 dark:bg-gray-800 p-4 rounded-xl border border-neutral-300 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-neutral-600 dark:text-neutral-400">Diferencia</span>
                                    <span className={`text-lg font-black ${
                                        (selectedRectificacion.total_venta - selectedRectificacion.venta_origen_total) > 0 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {(selectedRectificacion.total_venta - selectedRectificacion.venta_origen_total) > 0 ? '+' : ''}
                                        ${(selectedRectificacion.total_venta - selectedRectificacion.venta_origen_total).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

        </motion.div>
    );
};

export default Rectificaciones;
