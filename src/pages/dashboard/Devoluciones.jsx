import React, { useState, useEffect } from 'react';
import { Search, Package, RotateCcw, CheckCircle2, AlertCircle, ChevronRight, History, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { devolucionesService } from '../../services/devolucionesService';
import { toast } from '../../store/toastStore';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';

const Devoluciones = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [activeTab, setActiveTab] = useState('nueva'); // 'nueva' o 'historial'

    // --- Nueva Devolución ---
    const [searchTerm, setSearchTerm] = useState('');
    const [ventas, setVentas] = useState([]);
    const [isLoadingVentas, setIsLoadingVentas] = useState(true);
    const [selectedVenta, setSelectedVenta] = useState(null);

    // --- Modal Confirmación ---
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cantidadDevolucion, setCantidadDevolucion] = useState(1);
    const [motivo, setMotivo] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Historial ---
    const [historial, setHistorial] = useState([]);
    const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);

    // ─── Load ventas ────────────────────────────────────────────────────────
    const loadVentas = async () => {
        setIsLoadingVentas(true);
        try {
            const data = await devolucionesService.getVentas();
            const filtered = isSuperAdmin
                ? data
                : data.filter(v => v.id_comercio === (sucursalId || user?.id_comercio_asignado));
            setVentas(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingVentas(false);
        }
    };

    const loadHistorial = async () => {
        setIsLoadingHistorial(true);
        try {
            const data = isSuperAdmin
                ? await devolucionesService.getHistorialGlobal()
                : await devolucionesService.getHistorialComercio(sucursalId || user?.id_comercio_asignado);
            setHistorial(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingHistorial(false);
        }
    };

    useEffect(() => {
        loadVentas();
        loadHistorial();
    }, [isSuperAdmin, sucursalId]);

    // ─── Filtrado de Ventas ─────────────────────────────────────────────────
    const filteredVentas = ventas.filter(v => {
        const searchLower = searchTerm.toLowerCase();
        const idMatch = v.id_venta?.toLowerCase().includes(searchLower);
        const fechaMatch = new Date(v.fecha_hora).toLocaleDateString().includes(searchTerm);
        return idMatch || fechaMatch;
    });

    // ─── Abrir modal de devolución ──────────────────────────────────────────
    const handleOpenDevolucion = (item) => {
        setSelectedItem(item);
        setCantidadDevolucion(1);
        setMotivo('');
        setIsConfirmOpen(true);
    };

    // ─── Confirmar devolución ───────────────────────────────────────────────
    const confirmDevolucion = async () => {
        if (!selectedItem || cantidadDevolucion <= 0) return;
        setIsProcessing(true);
        try {
            await devolucionesService.procesarDevolucion({
                id_venta: selectedVenta.id_venta,
                id_producto: selectedItem.id_producto,
                cantidad: cantidadDevolucion,
                motivo
            });
            toast.success(`Devolución procesada: ${cantidadDevolucion}x ${selectedItem.producto?.nombre || ''}. El stock fue actualizado.`);
            setIsConfirmOpen(false);
            setSelectedVenta(null);
            await loadHistorial();
            await loadVentas();
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.error || 'Error al procesar la devolución');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Columnas del historial ─────────────────────────────────────────────
    const columnsHistorial = [
        {
            header: 'Producto',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Package size={14} className="text-neutral-400" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest text-black">{row.producto?.nombre || '—'}</span>
                </div>
            )
        },
        {
            header: 'Cantidad',
            render: (row) => (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg">
                    <span className="font-sport text-lg leading-none">{row.cantidad}</span>
                    <span className="text-[9px] font-black text-neutral-400 uppercase">Unid.</span>
                </div>
            )
        },
        {
            header: 'Reembolso',
            render: (row) => (
                <span className="font-sport text-xl text-black">
                    ${parseFloat(row.monto_reembolso).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-black">{new Date(row.fecha).toLocaleDateString()}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{new Date(row.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: 'Motivo',
            render: (row) => (
                <span className="text-[10px] font-bold text-neutral-500 capitalize">{row.motivo || 'Sin motivo especificado'}</span>
            )
        },
        {
            header: 'Autorizado por',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    {row.usuario?.nombre} {row.usuario?.apellido}
                </span>
            )
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 max-w-[1400px] mx-auto pb-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <RotateCcw size={14} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">CONTROL DE INVENTARIO</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl uppercase leading-none m-0 font-sport text-black">
                        Centro de <span className="text-brand-cyan">Devoluciones.</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-2">
                        Revertí ventas y actualizá el stock automáticamente
                    </p>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
                    {[
                        { id: 'nueva', label: 'Nueva Devolución', icon: RotateCcw },
                        { id: 'historial', label: 'Historial', icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id
                                    ? 'bg-black text-white shadow-sm'
                                    : 'text-neutral-400 hover:text-black'
                            }`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'nueva' && (
                    <motion.div
                        key="nueva"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Panel Izquierdo: Buscar Venta */}
                        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-neutral-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-4">
                                    1 · Seleccionar Ticket de Venta
                                </h3>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por ID o fecha..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[500px] divide-y divide-neutral-50">
                                {isLoadingVentas ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="w-6 h-6 border-2 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                                    </div>
                                ) : filteredVentas.length === 0 ? (
                                    <div className="py-16 text-center text-neutral-300">
                                        <Package size={40} className="mx-auto mb-3" strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Sin ventas encontradas</p>
                                    </div>
                                ) : filteredVentas.map(venta => (
                                    <motion.button
                                        layout
                                        whileHover={{ backgroundColor: '#f9fafb' }}
                                        key={venta.id_venta}
                                        onClick={() => setSelectedVenta(venta)}
                                        className={`w-full text-left p-4 transition-colors flex items-center justify-between gap-3 ${
                                            selectedVenta?.id_venta === venta.id_venta ? 'bg-neutral-50 border-l-4 border-black' : ''
                                        }`}
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                                #{venta.id_venta?.toString().split('-')[0]}
                                            </p>
                                            <p className="text-xs font-bold text-black">
                                                {new Date(venta.fecha_hora).toLocaleString()} · {venta.metodo_pago}
                                            </p>
                                            <p className="font-sport text-xl text-black leading-none mt-1">
                                                ${parseFloat(venta.total_venta).toLocaleString()}
                                            </p>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-300 flex-shrink-0" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Panel Derecho: Items de la venta seleccionada */}
                        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-neutral-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
                                    2 · Seleccionar Producto a Devolver
                                </h3>
                            </div>
                            <div className="overflow-y-auto max-h-[500px] divide-y divide-neutral-50">
                                {!selectedVenta ? (
                                    <div className="py-16 text-center text-neutral-300">
                                        <RotateCcw size={40} className="mx-auto mb-3" strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Seleccioná un ticket primero</p>
                                    </div>
                                ) : selectedVenta.detalles?.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Sin ítems en esta venta</p>
                                    </div>
                                ) : selectedVenta.detalles?.map(item => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={item.id_detalle}
                                        className="p-4 flex items-center justify-between gap-4"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-black uppercase tracking-tight">{item.producto?.nombre}</p>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                                {item.cantidad} unid. · ${parseFloat(item.precio_unitario_cobrado).toLocaleString()} c/u
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenDevolucion(item)}
                                            className="px-3 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-cyan hover:text-black transition-colors flex items-center gap-2 flex-shrink-0"
                                        >
                                            <RotateCcw size={12} />
                                            Devolver
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'historial' && (
                    <motion.div
                        key="historial"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                            <DataTable
                                data={historial}
                                columns={columnsHistorial}
                                searchPlaceholder="Filtrar devoluciones..."
                                variant="minimal"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmación */}
            <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirmar Devolución">
                <div className="space-y-6 p-2">
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-3">
                        <AlertCircle size={18} className="text-black shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                            Esta acción <span className="text-black font-black">re-ingresará las unidades</span> al inventario de la sede y ajustará el saldo de la misma.
                        </p>
                    </div>

                    {selectedItem && (
                        <div className="bg-black p-5 rounded-xl border border-neutral-800 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-28 h-28 bg-brand-cyan/10 blur-3xl rounded-full" />
                            <p className="text-brand-cyan text-[9px] font-black uppercase tracking-[0.3em] mb-1 relative z-10">Producto</p>
                            <p className="text-white font-sport text-2xl uppercase leading-none relative z-10">
                                {selectedItem.producto?.nombre}
                            </p>
                            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-2 relative z-10">
                                Máx: {selectedItem.cantidad} unidades vendidas
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">
                                Cantidad a Devolver
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCantidadDevolucion(Math.max(1, cantidadDevolucion - 1))}
                                    className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center font-black text-black hover:bg-black hover:text-white transition-colors"
                                >−</button>
                                <span className="font-sport text-3xl text-black w-12 text-center">{cantidadDevolucion}</span>
                                <button
                                    onClick={() => setCantidadDevolucion(Math.min(selectedItem?.cantidad || 1, cantidadDevolucion + 1))}
                                    className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center font-black text-black hover:bg-black hover:text-white transition-colors"
                                >+</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">
                                Motivo (Opcional)
                            </label>
                            <input
                                type="text"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Ej: Talle incorrecto, Producto defectuoso..."
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-black transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={confirmDevolucion}
                            disabled={isProcessing}
                            className="w-full bg-brand-cyan text-black py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black hover:text-brand-cyan transition-colors border border-transparent"
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><CheckCircle2 size={16} /> CONFIRMAR DEVOLUCIÓN</>
                            )}
                        </motion.button>
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                        >
                            CANCELAR
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default Devoluciones;
