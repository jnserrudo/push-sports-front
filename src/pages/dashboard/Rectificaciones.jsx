import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, FileEdit, CheckCircle2, XCircle, Clock, Package, Send, ChevronRight, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { rectificacionesService } from '../../services/rectificacionesService';
import { toast } from '../../store/toastStore';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';

const Rectificaciones = () => {
    const { user, sucursalId } = useAuthStore();
    // Roles 1 y 2 aprueban y rectifican directo. Rol 3 solicita.
    const canApprove = user?.id_rol === 1 || user?.id_rol === 2;
    const isSuperAdmin = user?.id_rol === 1;

    const [activeTab, setActiveTab] = useState('ventas'); // 'ventas', 'movimientos', 'solicitudes', 'historial'

    // --- Tab Ventas ---
    const [ventas, setVentas] = useState([]);
    const [searchTermVenta, setSearchTermVenta] = useState('');
    const [isLoadingVentas, setIsLoadingVentas] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);

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
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    // Formulario de Rectificación / Solicitud
    const [motivo, setMotivo] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // ─── Cargas Iniciales ──────────────────────────────────────────────────
    const loadVentas = async () => {
        setIsLoadingVentas(true);
        try {
            const data = await rectificacionesService.getVentas();
            // Filtrar por sucursal si no es superadmin
            const filtered = isSuperAdmin ? data : data.filter(v => v.id_comercio === (sucursalId || user?.id_comercio_asignado));
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
            // Filtrar movimientos de envíos o ajustes (simplificado aquí)
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
            setSolicitudes(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingSol(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ventas') loadVentas();
        if (activeTab === 'movimientos') loadMovimientos();
        if (activeTab === 'solicitudes' || activeTab === 'historial') loadSolicitudes();
    }, [activeTab, sucursalId]);

    // ─── Filtros ───────────────────────────────────────────────────────────
    const filteredVentas = ventas.filter(v => 
        v.id_venta?.toLowerCase().includes(searchTermVenta.toLowerCase()) ||
        new Date(v.fecha_hora).toLocaleDateString().includes(searchTermVenta)
    );

    const filteredMovimientos = movimientos.filter(m => 
        m.id_movimiento?.toLowerCase().includes(searchTermMov.toLowerCase()) ||
        m.producto?.nombre?.toLowerCase().includes(searchTermMov.toLowerCase())
    );

    // ─── Handlers ──────────────────────────────────────────────────────────
    const handleOpenRectificarVenta = (venta) => {
        setSelectedVenta(venta);
        setSelectedMov(null);
        setMotivo('');
        setIsRectificarModalOpen(true);
    };

    const handleOpenRectificarMov = (mov) => {
        setSelectedMov(mov);
        setSelectedVenta(null);
        setMotivo('');
        setIsRectificarModalOpen(true);
    };

    const handleSubmitRectificacion = async () => {
        if (!motivo) {
            toast.error('El motivo es obligatorio.');
            return;
        }

        setIsProcessing(true);
        try {
            if (!canApprove) {
                // Modo Solicitud (Vendedor)
                await rectificacionesService.crearSolicitud({
                    tipo_entidad: selectedVenta ? 'VENTA' : 'MOVIMIENTO_STOCK',
                    id_entidad: selectedVenta ? selectedVenta.id_venta : selectedMov.id_movimiento,
                    id_comercio: selectedVenta ? selectedVenta.id_comercio : selectedMov.id_comercio,
                    motivo,
                    // Para simplificar esta versión, no enviamos datos corregidos complejos, solo la anulación
                    datos_corregidos: null
                });
                toast.success('Solicitud de rectificación enviada para aprobación.');
            } else {
                // Ejecución Directa (Admin/Supervisor)
                if (selectedVenta) {
                    await rectificacionesService.rectificarVenta({
                        id_venta: selectedVenta.id_venta,
                        motivo,
                        nuevos_detalles: null // Simplificación: solo anula la original. Para "corregir", el usuario haría una venta nueva después.
                    });
                    toast.success('Venta anulada (rectificada) correctamente.');
                    loadVentas();
                } else {
                    await rectificacionesService.rectificarMovimiento({
                        id_movimiento: selectedMov.id_movimiento,
                        motivo,
                        nuevos_items: null // Simplificación
                    });
                    toast.success('Movimiento revertido correctamente.');
                    loadMovimientos();
                }
            }
            setIsRectificarModalOpen(false);
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
                    <motion.div key="ventas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-neutral-100 dark:border-gray-700">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white mb-4">
                                    Seleccionar Venta a Rectificar
                                </h3>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                    <input
                                        type="text"
                                        placeholder="Buscar ticket..."
                                        value={searchTermVenta}
                                        onChange={(e) => setSearchTermVenta(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl text-xs font-bold uppercase text-black dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[500px] divide-y divide-neutral-50 dark:divide-gray-700">
                                {isLoadingVentas ? <div className="p-10 text-center text-xs text-neutral-400">Cargando...</div> :
                                 filteredVentas.map(venta => (
                                    <div key={venta.id_venta} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-neutral-400">#{venta.id_venta.split('-')[0]}</p>
                                            <p className="text-xs font-bold text-black dark:text-white">{new Date(venta.fecha_hora).toLocaleString()}</p>
                                            <p className="font-sport text-xl mt-1">${parseFloat(venta.total_venta).toLocaleString()}</p>
                                        </div>
                                        {venta.tipo_venta !== 'VENTA' ? (
                                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Ya Rectificada/Anulada</span>
                                        ) : venta.id_liquidacion ? (
                                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">Liquidada</span>
                                        ) : (
                                            <button onClick={() => handleOpenRectificarVenta(venta)} className="px-3 py-2 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-amber-500 transition-colors">
                                                {canApprove ? 'Rectificar' : 'Solicitar'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
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

                {/* ─── TAB SOLICITUDES / HISTORIAL ─── */}
                {(activeTab === 'solicitudes' || activeTab === 'historial') && (
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
                                    onView={activeTab === 'solicitudes' ? (sol) => { setSelectedSolicitud(sol); setMotivo(''); setIsResolucionModalOpen(true); } : null}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Creación/Ejecución */}
            <Modal isOpen={isRectificarModalOpen} onClose={() => setIsRectificarModalOpen(false)} title={canApprove ? "Ejecutar Rectificación" : "Solicitar Rectificación"}>
                <div className="space-y-4 p-2">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-800 font-bold mb-2">Advertencia de Inmutabilidad</p>
                        <p className="text-[10px] text-amber-700">
                            Esta acción anulará el registro original de forma segura y actualizará inventarios y saldos automáticamente. Quedará registro permanente.
                        </p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-500 mb-2">Motivo Detallado</label>
                        <textarea
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Ej: Se cargó mal la cantidad, el precio era incorrecto..."
                            className="w-full p-3 border rounded-xl text-xs bg-neutral-50 min-h-[100px]"
                        />
                    </div>

                    <button
                        onClick={handleSubmitRectificacion}
                        disabled={isProcessing}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold uppercase text-xs flex justify-center items-center gap-2"
                    >
                        {isProcessing ? 'Procesando...' : canApprove ? 'EJECUTAR AHORA' : 'ENVIAR SOLICITUD'}
                    </button>
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

        </motion.div>
    );
};

export default Rectificaciones;
