import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Send, ShieldCheck, FileText, Settings2, AlertCircle, RotateCcw, CalendarDays, DollarSign, Wallet, History, Eye, Search, FileSpreadsheet } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { liquidacionesService } from '../../services/liquidacionesService';
import { ventasService } from '../../services/ventasService';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Tabs from '../../components/ui/Tabs';
import FiltrosVentas from '../../components/ui/FiltrosVentas';
import FiltrosLiquidaciones from '../../components/ui/FiltrosLiquidaciones';

// --- LIBRERÍAS DE UI Y PDF ---
import { pdf } from '@react-pdf/renderer';
import LiquidacionPDF from '../../components/reports/LiquidacionPDF';
import { exportToExcel } from '../../utils/exportExcel';
import { parseImagenes } from '../../lib/supabaseStorage';
import { motion, AnimatePresence } from 'framer-motion';
import QueQueresHacer from '../../components/ui/QueQueresHacer';

const Liquidaciones = () => {
    const { sucursalId, user } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    // Estado de tabs
    const [activeTab, setActiveTab] = useState('liquidar');

    const [sucursales, setSucursales] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para modal de detalles de liquidación
    const [selectedLiquidacion, setSelectedLiquidacion] = useState(null);
    const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false);
    const [filtrosLiquidaciones, setFiltrosLiquidaciones] = useState({});

    // Estados para tab de ventas
    const [ventas, setVentas] = useState([]);
    const [isLoadingVentas, setIsLoadingVentas] = useState(false);
    const [filtrosVentas, setFiltrosVentas] = useState({});
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [isDetallesVentaModalOpen, setIsDetallesVentaModalOpen] = useState(false);
    const [loadingVentaId, setLoadingVentaId] = useState(null);
    
    // Estados para el Modal de Preview y Liquidación
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [montoRecibidoManual, setMontoRecibidoManual] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [currentModalPage, setCurrentModalPage] = useState(1);
    const [rowsPerModalPage, setRowsPerModalPage] = useState(5);
    const [ventasSeleccionadas, setVentasSeleccionadas] = useState(new Set());
    const [previewConSeleccion, setPreviewConSeleccion] = useState(null);
    const [isLoadingPreviewSeleccion, setIsLoadingPreviewSeleccion] = useState(false);

    // Modo de vista del PDF: 'interno' (ambos precios) | 'sucursal' (solo PUSH)
    const [pdfViewMode, setPdfViewMode] = useState(() => {
        try { return localStorage.getItem('pdfViewMode') || 'sucursal'; } catch { return 'sucursal'; }
    });

    useEffect(() => {
        try { localStorage.setItem('pdfViewMode', pdfViewMode); } catch { /* ignore */ }
    }, [pdfViewMode]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let sucs = await sucursalesService.getAll();
            if (!isSuperAdmin) {
                sucs = sucs.filter(s => s.id_comercio === sucursalId);
            }
            setSucursales(sucs);

            const hist = await liquidacionesService.getHistorial(!isSuperAdmin ? sucursalId : null);
            console.log('📊 Liquidaciones cargadas:', hist.length, hist);
            setHistorial(hist);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error("Error al sincronizar con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [isSuperAdmin, sucursalId]);

    const loadVentas = async () => {
        setIsLoadingVentas(true);
        try {
            const filtros = { ...filtrosVentas };
            if (!isSuperAdmin) {
                filtros.id_comercio = sucursalId;
            }
            const data = await ventasService.getAllVentas(filtros);
            setVentas(data);
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            toast.error("Error al cargar ventas");
        } finally {
            setIsLoadingVentas(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ventas') {
            loadVentas();
        }
    }, [activeTab, filtrosVentas, isSuperAdmin, sucursalId]);

    const handleOpenPreview = async (sucursal) => {
        setSelectedSucursal(sucursal);
        setIsPreviewOpen(true);
        setIsLoadingPreview(true);
        setMontoRecibidoManual('');
        setShowAllProducts(false);
        setCurrentModalPage(1);
        setRowsPerModalPage(5);
        setVentasSeleccionadas(new Set());
        setPreviewConSeleccion(null);

        try {
            const data = await liquidacionesService.getPreview(sucursal.id_comercio || sucursal.id);
            setPreviewData(data);
            if (data.hayDatos) {
                const todas = new Set(data.ventas.map(v => v.id_venta));
                setVentasSeleccionadas(todas);
                await recalcularPreviewSeleccion(todas, data.ventas, sucursal.id_comercio || sucursal.id);
            }
        } catch (error) {
            console.error('Error al obtener preview:', error);
            toast.error("Error al calcular la liquidación");
            setIsPreviewOpen(false);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const recalcularPreviewSeleccion = async (seleccion, ventasBase, idComercio) => {
        if (!seleccion || seleccion.size === 0) {
            setPreviewConSeleccion(null);
            return;
        }
        const idsArray = Array.from(seleccion);
        // Si son todas, usar preview original para no saturar al servidor
        const sonTodas = ventasBase && seleccion.size === ventasBase.length;
        if (sonTodas) {
            setPreviewConSeleccion(null);
            return;
        }
        setIsLoadingPreviewSeleccion(true);
        try {
            const data = await liquidacionesService.getPreview(idComercio, idsArray);
            setPreviewConSeleccion(data);
        } catch (error) {
            console.error('Error al recalcular preview:', error);
            toast.error("Error al recalcular la liquidación");
        } finally {
            setIsLoadingPreviewSeleccion(false);
        }
    };

    const toggleVentaSeleccionada = async (idVenta) => {
        const nuevas = new Set(ventasSeleccionadas);
        if (nuevas.has(idVenta)) {
            nuevas.delete(idVenta);
        } else {
            nuevas.add(idVenta);
        }
        setVentasSeleccionadas(nuevas);
        await recalcularPreviewSeleccion(nuevas, previewData?.ventas, selectedSucursal?.id_comercio || selectedSucursal?.id);
    };

    const seleccionarTodas = async (seleccionar) => {
        const nuevas = seleccionar ? new Set(previewData?.ventas?.map(v => v.id_venta)) : new Set();
        setVentasSeleccionadas(nuevas);
        await recalcularPreviewSeleccion(nuevas, previewData?.ventas, selectedSucursal?.id_comercio || selectedSucursal?.id);
    };

    const confirmLiquidacion = async () => {
        setIsProcessing(true);
        try {
            const sucId = selectedSucursal.id_comercio || selectedSucursal.id;
            const monto = (montoRecibidoManual !== '' && !isNaN(montoRecibidoManual))
                ? parseFloat(montoRecibidoManual)
                : null;
            const idsVentas = ventasSeleccionadas.size > 0 ? Array.from(ventasSeleccionadas) : null;

            await liquidacionesService.liquidarSucursal(sucId, monto, idsVentas);

            toast.success("Liquidación procesada correctamente");
            setIsPreviewOpen(false);
            loadData();
        } catch (error) {
            console.error('Error al liquidar:', error);
            toast.error(error?.response?.data?.error || "Error al procesar liquidación");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- FUNCIÓN DE EXPORTACIÓN A PDF (COMPROBANTE ENRIQUECIDO) ---
    const generatePDF = async (row) => {
        try {
            const blob = await pdf(<LiquidacionPDF row={row} viewMode={pdfViewMode} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const idLiq = String(row.id_liquidacion).split('-')[0].toUpperCase();
            const sufijo = pdfViewMode === 'sucursal' ? '_sucursal' : '';
            link.download = `Liq_${row.comercio_nombre.replace(/\s+/g, '_')}_${idLiq}${sufijo}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Comprobante PDF generado exitosamente");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar PDF");
        }
    };

    const generateExcel = (row) => {
        const productos = row.resumen_productos || [];
        const rows = productos.length > 0
            ? productos.map(prod => ({
                _imageUrl: parseImagenes(prod.imagen_url || prod.imagen)[0] || '',
                Sucursal: row.comercio_nombre,
                Fecha: new Date(row.fecha_cierre).toLocaleDateString('es-AR'),
                Producto: prod.nombre || prod.producto || '',
                Cantidad: prod.cantidad || prod.unidades || 0,
                Bruto: Number(prod.total_bruto || 0),
                Neto: Number(prod.total_neto || 0),
            }))
            : [{
                Sucursal: row.comercio_nombre,
                Fecha: new Date(row.fecha_cierre).toLocaleDateString('es-AR'),
                Tickets: row.cant_ventas,
                'Total cobrado': Number(row.total_bruto || 0),
                'Total a liquidar': Number(row.total_ventas_netas || 0),
            }];
        const idLiq = String(row.id_liquidacion).split('-')[0].toUpperCase();
        exportToExcel(rows, `Liq_${String(row.comercio_nombre).replace(/\s+/g, '_')}_${idLiq}`);
    };

    const getSaldo = (suc) => Number(suc.saldo_acumulado_mili) || 0;
    const getId = (suc) => suc.id_comercio ?? suc.id;

    const handleVerDetallesLiquidacion = (liquidacion) => {
        setSelectedLiquidacion(liquidacion);
        setIsDetallesModalOpen(true);
    };

    const handleVerDetallesVenta = async (venta) => {
        if (loadingVentaId === venta.id_venta) return; // Prevenir clics múltiples en la misma venta
        
        setLoadingVentaId(venta.id_venta);
        try {
            const detalles = await ventasService.getVentaDetalle(venta.id_venta);
            setSelectedVenta(detalles);
            setIsDetallesVentaModalOpen(true);
        } catch (error) {
            console.error('Error al cargar detalles de venta:', error);
            toast.error("Error al cargar detalles de la venta");
        } finally {
            setLoadingVentaId(null);
        }
    };

    // Filtrar historial de liquidaciones
    const historialFiltrado = historial.filter(liq => {
        if (filtrosLiquidaciones.id_comercio && liq.id_comercio !== filtrosLiquidaciones.id_comercio) return false;
        if (filtrosLiquidaciones.fecha_desde && new Date(liq.fecha_cierre) < new Date(filtrosLiquidaciones.fecha_desde)) return false;
        if (filtrosLiquidaciones.fecha_hasta && new Date(liq.fecha_cierre) > new Date(filtrosLiquidaciones.fecha_hasta)) return false;
        return true;
    });

    // --- COLUMNAS DEL HISTORIAL ---
    // Mapeadas correctamente a los datos que retorna el backend enriquecido
    const columnsHistorial = [
        { 
            header: 'Sede Auditada', 
            accessor: 'comercio_nombre',
            render: (row) => <span className="font-bold text-sm text-black dark:text-white uppercase tracking-widest">{row.comercio_nombre}</span>
        },
        { 
            header: 'Fecha de Cierre', 
            accessor: 'fecha_cierre',
            render: (row) => (
                <div className="flex flex-col text-black dark:text-white">
                    <span className="text-xs font-bold uppercase tracking-widest">{new Date(row.fecha_cierre).toLocaleDateString()}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{new Date(row.fecha_cierre).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            )
        },
        { 
            header: 'Tickets', 
            accessor: 'cant_ventas',
            render: (row) => (
                <span className="text-xs font-bold bg-neutral-100 dark:bg-gray-700 px-2 py-1 rounded-md text-black dark:text-white">
                    {row.cant_ventas}
                </span>
            )
        },
        { 
            header: 'Total Cobrado', 
            render: (row) => (
                <div className="flex items-baseline gap-1 text-neutral-600 dark:text-gray-400">
                    <span className="text-[10px] font-bold">$</span>
                    <span className="font-sport text-lg leading-none">{Math.round(row.total_bruto || 0).toLocaleString()}</span>
                </div>
            )
        },
        { 
            header: 'Ganancia Total', 
            render: (row) => {
                const gananciaTotal = row.resumen_productos?.reduce((acc, prod) => {
                    return acc + ((prod.total_bruto || 0) - (prod.total_neto || 0));
                }, 0) || 0;
                return (
                    <div className="flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
                        <span className="text-[10px] font-bold">+$</span>
                        <span className="font-sport text-lg leading-none">{Math.round(gananciaTotal).toLocaleString()}</span>
                    </div>
                );
            }
        },
        { 
            header: 'Total a Liquidar', 
            render: (row) => (
                <div className="inline-flex px-3 py-1.5 bg-black dark:bg-brand-cyan text-white dark:text-black rounded-lg font-sport text-lg tracking-widest items-baseline gap-1 shadow-md">
                    <span className="text-[10px] font-sans font-bold">$</span>
                    {Math.round(row.total_ventas_netas || 0).toLocaleString()}
                </div>
            )
        },
        {
            header: 'Comprobante',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => generatePDF(row)}
                        className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Exportar Recibo PDF"
                    >
                        <FileText size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => generateExcel(row)}
                        className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Exportar Excel"
                    >
                        <FileSpreadsheet size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 max-w-[1400px] mx-auto pb-4"
        >
            
            {/* Header Técnico */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-3 gap-3">
                 <div>
                    <div className="flex items-center gap-1.5 mb-1">
                         <ShieldCheck size={12} className="text-brand-cyan" />
                         <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">TESORERÍA CENTRAL</span>
                         <div className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest bg-black text-white border-black`}>
                             {isSuperAdmin ? 'GLOBAL' : 'SEDE'}
                         </div>
                    </div>
                     <h2 className="text-lg md:text-xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        <span className="text-brand-cyan">Liquidaciones</span>
                    </h2>
                    <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-1.5 whitespace-normal">
                        Acá cobrás a la sucursal. El monto a rendir es precio Push, no el Público que ella le cobró al cliente.
                    </p>
                 </div>
                 
                 <div className="px-3 py-1.5 bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-md flex items-center gap-2 shadow-sm">
                    <CreditCard size={14} className="text-brand-cyan" />
                    <div className="flex flex-col">
                        <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Estado Financiero</span>
                        <span className="text-[8px] font-black text-black dark:text-white uppercase tracking-widest">Auditado</span>
                    </div>
                 </div>
            </div>

            <QueQueresHacer />

            {/* Tabs Navigation */}
            <Tabs
                tabs={[
                    { id: 'liquidar', label: 'Liquidar', icon: Wallet },
                    { id: 'historial', label: 'Historial', icon: History },
                    { id: 'ventas', label: 'Consulta de Ventas', icon: Search }
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />
            
            {/* Tab Content: Liquidar */}
            {activeTab === 'liquidar' && (
            <>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-8 h-8 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Recopilando registros financieros...</p>
                </div>
            ) : (
                <>
                    {/* Explanation Banner for Liquidaciones */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl mb-2">
                        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">
                                ¿Cómo funciona el flujo de Liquidaciones y Caja?
                            </h4>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                                1. <strong>Ventas:</strong> En Registrar Ventas la sucursal cobra <strong>Público</strong> al cliente y se descuenta stock.
                                <br />
                                2. <strong>Lo que te pagan:</strong> acá liquidás el <strong>precio Push</strong> (no el Público).
                                <br />
                                3. <strong>Cierre:</strong> confirmás el monto recibido, emitís el PDF y el saldo a rendir vuelve a $0.
                            </p>
                        </div>
                    </div>

                    {/* Tarjetas de Sucursales */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Send size={14} className="text-black dark:text-white" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white m-0">Estado de Sucursales</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {sucursales.map((suc, i) => {
                                const saldo = getSaldo(suc);
                                const hasDebt = saldo > 0;

                                return (
                                <motion.div 
                                    key={getId(suc)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`bg-white dark:bg-gray-800 border p-3 md:p-4 rounded-xl flex flex-col justify-between transition-all duration-300 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-premium ${hasDebt ? 'border-neutral-200 dark:border-gray-600 hover:border-brand-cyan' : 'border-neutral-100 dark:border-gray-700'}`}
                                >
                                    {/* Marcador de deuda */}
                                    {hasDebt && (
                                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                                            <div className="absolute top-0 right-0 bg-brand-cyan text-black text-[6px] font-black uppercase tracking-[0.2em] py-0.5 px-8 rotate-45 translate-x-[28px] translate-y-[10px] shadow-sm">
                                                PENDIENTE
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5 relative z-10">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded bg-neutral-100 dark:bg-gray-700 flex items-center justify-center">
                                                <Wallet size={10} className={hasDebt ? 'text-brand-cyan' : 'text-neutral-400'} />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-black dark:text-white block">{suc.nombre}</span>
                                        </div>
                                        
                                        <div className="pt-1">
                                            <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Saldo a cobrar (Neto PUSH)</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xs font-bold ${hasDebt ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-gray-500'}`}>$</span>
                                                <p className={`text-3xl font-sport m-0 leading-none ${hasDebt ? 'text-black dark:text-white' : 'text-neutral-800 dark:text-gray-400'}`}>
                                                    {saldo.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isSuperAdmin && hasDebt ? (
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleOpenPreview(suc)}
                                            className="w-full mt-4 bg-black dark:bg-gray-700 text-white py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Settings2 size={12} /> VER RESUMEN Y LIQUIDAR
                                        </motion.button>
                                    ) : (
                                        <div className="mt-4 pt-2 border-t border-neutral-100 dark:border-gray-700 flex items-center gap-2">
                                            <div className={`w-1 h-1 rounded-full ${hasDebt ? 'bg-amber-400 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${hasDebt ? 'text-amber-500' : 'text-green-500'}`}>
                                                {!hasDebt ? 'CAJA AL DÍA' : 'LIQUIDACIÓN PENDIENTE'}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )})}
                        </div>
                    </div>
                </>
            )}

            {/* MODAL DE PRE-LIQUIDACIÓN */}
            <AnimatePresence>
            {isPreviewOpen && (
                <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Resumen de Liquidación">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-1 max-h-[80vh] overflow-y-auto custom-scrollbar"
                    >
                        {isLoadingPreview ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Analizando registros...</p>
                            </div>
                        ) : !previewData?.hayDatos ? (
                            <div className="py-12 text-center space-y-3 bg-neutral-50 dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700">
                                <CheckCircle2 size={32} className="mx-auto text-green-500" />
                                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">Todo al día</h3>
                                <p className="text-xs text-neutral-500 dark:text-gray-400">No hay ventas pendientes para liquidar en esta sede.</p>
                                <button 
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="mt-4 px-6 py-2 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                                >
                                    VOLVER
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {/* Encabezado compacto: periodo + tickets + métodos de pago inline */}
                                <div className="bg-neutral-50 dark:bg-gray-800 p-2 rounded border border-neutral-200 dark:border-gray-700">
                                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays size={12} className="text-brand-cyan" />
                                            <span className="text-[8px] font-bold text-black dark:text-white uppercase">
                                                {new Date(previewData.rangoFechas.desde).toLocaleDateString()} al {new Date(previewData.rangoFechas.hasta).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-black text-brand-cyan uppercase">{ventasSeleccionadas.size} de {previewData.cantVentas} tickets seleccionados</span>
                                    </div>
                                    {/* Métodos de pago inline */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {(previewConSeleccion?.desgloseMetodoPago ? Object.entries(previewConSeleccion.desgloseMetodoPago) : Object.entries(previewData.desgloseMetodoPago || {})).map(([metodo, data]) => (
                                            <div key={metodo} className="bg-white dark:bg-gray-700 px-2 py-1 rounded border border-neutral-200 dark:border-gray-600 flex items-center gap-1.5">
                                                <span className="text-[7px] font-bold text-neutral-500 uppercase">{metodo}</span>
                                                <span className="text-[9px] font-sport text-black dark:text-white">${Math.round(data.bruto).toLocaleString()}</span>
                                                <span className="text-[7px] text-neutral-400">({data.cantidad})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Selección de ventas */}
                                <div className="bg-white dark:bg-gray-800 rounded border border-neutral-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-2 border-b border-neutral-100 dark:border-gray-700 bg-neutral-50 dark:bg-gray-700/50 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="select-all-ventas"
                                                checked={ventasSeleccionadas.size === previewData.ventas?.length && previewData.ventas?.length > 0}
                                                onChange={(e) => seleccionarTodas(e.target.checked)}
                                                className="w-4 h-4 accent-black"
                                            />
                                            <label htmlFor="select-all-ventas" className="text-[9px] font-black uppercase text-black dark:text-white cursor-pointer">
                                                Seleccionar todas las ventas
                                            </label>
                                        </div>
                                        <span className="text-[8px] font-bold text-neutral-500 uppercase">Ticket · Vendedor · Método · Total</span>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {previewData.ventas?.map(v => (
                                            <div
                                                key={v.id_venta}
                                                className={`p-2 flex items-center gap-2 border-b border-neutral-100 dark:border-gray-700 last:border-0 ${ventasSeleccionadas.has(v.id_venta) ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : 'opacity-70'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={ventasSeleccionadas.has(v.id_venta)}
                                                    onChange={() => toggleVentaSeleccionada(v.id_venta)}
                                                    className="w-4 h-4 accent-black shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-black dark:text-white truncate">
                                                        #{v.id_venta?.split('-')[0]} · {v.vendedor}
                                                    </p>
                                                    <p className="text-[9px] text-neutral-500 truncate">
                                                        {new Date(v.fecha).toLocaleString()} · {v.metodo_pago}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-sport text-black dark:text-white">
                                                    ${Math.round(v.total).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {ventasSeleccionadas.size < previewData.ventas?.length && (
                                        <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800/50">
                                            <p className="text-[9px] font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                                                <AlertCircle size={12} className="inline mr-1" />
                                                Las ventas <strong>no seleccionadas</strong> quedarán activas para poder rectificarlas después.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Detalle de Artículos Vendidos — pagina después de 5 */}
                                {previewData.resumenProductos && previewData.resumenProductos.length > 0 && (() => {
                                     const itemsPerPage = rowsPerModalPage;
                                     const totalModalPages = Math.ceil(previewData.resumenProductos.length / itemsPerPage);
                                     const paginatedItemsModal = previewData.resumenProductos.slice(
                                         (currentModalPage - 1) * itemsPerPage,
                                         currentModalPage * itemsPerPage
                                     );

                                     return (
                                    <div>
                                                                                 <div className="flex items-center justify-between mb-1 ml-1">
                                             <h4 className="text-[9px] font-black uppercase tracking-[0.1em] text-neutral-500">Artículos Vendidos</h4>
                                             <div className="flex items-center gap-1.5">
                                                 <span className="text-[7px] font-black text-neutral-400 uppercase">VER:</span>
                                                 <select 
                                                     value={rowsPerModalPage}
                                                     onChange={(e) => {
                                                         setRowsPerModalPage(Number(e.target.value));
                                                         setCurrentModalPage(1);
                                                     }}
                                                     className="bg-transparent border-none text-[8px] font-black text-neutral-500 focus:ring-0 cursor-pointer outline-none p-0 appearance-none hover:text-brand-cyan transition-colors"
                                                 >
                                                     {[5, 10, 20, 50].map(val => (
                                                         <option key={val} value={val}>{val}</option>
                                                     ))}
                                                 </select>
                                             </div>
                                         </div>
                                        <div className="bg-white dark:bg-gray-800 rounded border border-neutral-200 dark:border-gray-700 overflow-hidden">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-neutral-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-200 dark:border-gray-600">Prod / Var</th>
                                                        <th className="px-1 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-200 dark:border-gray-600 text-center">Cant</th>
                                                        <th className="px-1 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-200 dark:border-gray-600 text-right">Bruto</th>
                                                        <th className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-cyan border-b border-neutral-200 dark:border-gray-600 text-right">Neto</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedItemsModal.map((prod, idx) => (
                                                        <tr key={idx} className="border-b border-neutral-100 dark:border-gray-700 last:border-0">
                                                            <td className="px-2 py-1.5">
                                                                <span className="text-[11px] font-bold text-neutral-800 dark:text-gray-200 uppercase">{prod.nombre}</span>
                                                            </td>
                                                            <td className="px-1 py-1.5 text-center">
                                                                <span className="text-[11px] font-bold text-neutral-600 dark:text-gray-400">{prod.cantidad}</span>
                                                            </td>
                                                            <td className="px-1 py-1.5 text-right">
                                                                <span className="text-[11px] font-sport text-neutral-500">${Math.round(prod.total_bruto).toLocaleString()}</span>
                                                            </td>
                                                            <td className="px-2 py-1.5 text-right">
                                                                <span className="text-[11px] font-sport text-black dark:text-white">${Math.round(prod.total_neto).toLocaleString()}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {totalModalPages > 1 && (
                                                 <div className="flex items-center justify-center gap-4 py-1.5 bg-neutral-50 dark:bg-gray-700/50 border-t border-neutral-200 dark:border-gray-600">
                                                     <button 
                                                         onClick={() => setCurrentModalPage(prev => Math.max(prev - 1, 1))}
                                                         disabled={currentModalPage === 1}
                                                         className="text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                                                     >
                                                         <ChevronLeft size={12} />
                                                     </button>
                                                     <span className="text-[8px] font-black text-neutral-400">
                                                         {currentModalPage} / {totalModalPages}
                                                     </span>
                                                     <button 
                                                         onClick={() => setCurrentModalPage(prev => Math.min(prev + 1, totalModalPages))}
                                                         disabled={currentModalPage === totalModalPages}
                                                         className="text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                                                     >
                                                         <ChevronRight size={12} />
                                                     </button>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 )})}


                                {/* Resumen Financiero Compacto */}
                                <div className="bg-black p-2 rounded border border-neutral-800 overflow-hidden relative">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-cyan/20 blur-2xl rounded-full pointer-events-none" />

                                    <div className="relative z-10 space-y-1">
                                        <div className="flex justify-between items-center text-neutral-300">
                                            <span className="text-[7px] font-bold uppercase tracking-widest">Bruto Total Seleccionado:</span>
                                            <span className="font-sport text-[9px]">${Math.round(previewConSeleccion?.totalVentasBruto ?? previewData.totalVentasBruto).toLocaleString()}</span>
                                        </div>

                                        {(previewConSeleccion?.totalDevoluciones ?? previewData.totalDevoluciones) > 0 && (
                                            <div className="flex justify-between items-center text-amber-400 border-b border-neutral-800 pb-0.5">
                                                <span className="text-[7px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <RotateCcw size={7} /> Devol. ({previewConSeleccion?.cantDevoluciones ?? previewData.cantDevoluciones}):
                                                </span>
                                                <span className="font-sport text-[9px]">-${Math.round(previewConSeleccion?.totalDevoluciones ?? previewData.totalDevoluciones).toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-end pt-0.5">
                                            <span className="text-[8px] font-black text-brand-cyan uppercase tracking-[0.1em]">NETO:</span>
                                            <div className="flex items-baseline gap-0.5 text-white">
                                                <span className="text-[10px] font-bold">$</span>
                                                <span className="text-xl font-sport leading-none">
                                                    {isLoadingPreviewSeleccion ? '...' : Math.round(previewConSeleccion?.netoFinal ?? previewData.netoFinal).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Input monto recibido inline */}
                                        <div className="bg-neutral-900 border border-neutral-700 rounded p-1 mt-1">
                                            <div className="flex items-center gap-1">
                                                <label className="text-[6px] font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">Recibido:</label>
                                                <div className="flex items-center gap-1 flex-1">
                                                    <DollarSign size={8} className="text-neutral-600" />
                                                    <input 
                                                        type="number"
                                                        value={montoRecibidoManual}
                                                        onChange={(e) => setMontoRecibidoManual(e.target.value)}
                                                        placeholder={Math.round(previewData.netoFinal).toString()}
                                                        className="bg-transparent border-none outline-none text-white font-sport text-[10px] w-full placeholder-neutral-700 h-4"
                                                    />
                                                </div>
                                                {montoRecibidoManual && !isNaN(montoRecibidoManual) && parseFloat(montoRecibidoManual) !== previewData.netoFinal && (
                                                    <span className={`text-[7px] font-black uppercase whitespace-nowrap ${parseFloat(montoRecibidoManual) > previewData.netoFinal ? 'text-green-400' : 'text-red-400'}`}>
                                                        {parseFloat(montoRecibidoManual) > previewData.netoFinal ? '+' : ''}
                                                        ${Math.round(parseFloat(montoRecibidoManual) - previewData.netoFinal).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alerta + Botones compactos */}
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded flex items-start gap-1.5">
                                    <AlertCircle size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300 m-0 leading-normal">
                                        IMPORTANTE: Al confirmar, se archivarán {ventasSeleccionadas.size} de {previewData.cantVentas} ventas seleccionadas, se registrará el dinero en el historial consolidado, se generará el recibo PDF y el saldo a cobrar de la sede volverá a $0. Las no seleccionadas quedan activas para rectificar.
                                    </p>
                                </div>

                                <div className="flex gap-1.5 pt-0.5">
                                    <button
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors border border-neutral-200 dark:border-gray-600 rounded"
                                    >
                                        CANCELAR
                                    </button>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmLiquidacion}
                                        disabled={isProcessing || ventasSeleccionadas.size === 0}
                                        className="flex-1 bg-brand-cyan text-black py-1.5 rounded text-[9px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-brand-cyan disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? 'PROCESANDO...' : <><CheckCircle2 size={12} /> LIQUIDAR {ventasSeleccionadas.size} VENTAS</>}
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </Modal>
            )}
            </AnimatePresence>
            </>
            )}

            {/* Tab Content: Historial de Liquidaciones */}
            {activeTab === 'historial' && (
                <div className="space-y-4">
                    {/* Filtros */}
                    <FiltrosLiquidaciones
                        sucursales={sucursales}
                        filtros={filtrosLiquidaciones}
                        onFiltrosChange={setFiltrosLiquidaciones}
                        onLimpiar={() => setFiltrosLiquidaciones({})}
                    />

                    {/* Selector de modo de vista del PDF */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1.5">
                            <FileText size={12} className="text-brand-cyan" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Modo del Comprobante PDF</span>
                        </div>
                        <div className="inline-flex rounded-lg border border-neutral-200 dark:border-gray-700 overflow-hidden ml-auto">
                            <button
                                onClick={() => setPdfViewMode('interno')}
                                className={`px-3 py-1.5 flex flex-col items-start leading-tight transition-colors ${
                                    pdfViewMode === 'interno'
                                        ? 'bg-black text-white dark:bg-brand-cyan dark:text-black'
                                        : 'bg-white text-neutral-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-neutral-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">Vista Interna</span>
                                <span className="text-[7px] font-medium normal-case tracking-normal opacity-70">(Público + Push — uso interno)</span>
                            </button>
                            <button
                                onClick={() => setPdfViewMode('sucursal')}
                                className={`px-3 py-1.5 flex flex-col items-start leading-tight transition-colors ${
                                    pdfViewMode === 'sucursal'
                                        ? 'bg-black text-white dark:bg-brand-cyan dark:text-black'
                                        : 'bg-white text-neutral-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-neutral-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">Vista para Sucursal</span>
                                <span className="text-[7px] font-medium normal-case tracking-normal opacity-70">(lo que te debe abonar — solo Push)</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-8 h-8 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Cargando historial...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-neutral-100 dark:border-gray-700 p-1 md:p-2 transition-all duration-500 hover:shadow-premium-hover">
                            <DataTable 
                                data={historialFiltrado}
                                columns={[
                                    ...columnsHistorial,
                                    {
                                        header: 'Acciones',
                                        render: (row) => (
                                            <button
                                                onClick={() => handleVerDetallesLiquidacion(row)}
                                                className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                title="Ver Detalles"
                                            >
                                                <Eye size={16} strokeWidth={2.5} />
                                            </button>
                                        )
                                    }
                                ]}
                                searchPlaceholder="Buscar por ID o sede..."
                                variant="minimal"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content: Consulta de Ventas */}
            {activeTab === 'ventas' && (
                <div className="space-y-4">
                    {/* Filtros */}
                    <FiltrosVentas
                        sucursales={sucursales}
                        filtros={filtrosVentas}
                        onFiltrosChange={setFiltrosVentas}
                        onLimpiar={() => setFiltrosVentas({})}
                    />

                    {isLoadingVentas ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-8 h-8 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Cargando ventas...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-neutral-100 dark:border-gray-700 p-1 md:p-2 transition-all duration-500 hover:shadow-premium-hover">
                            <DataTable 
                                data={ventas}
                                columns={[
                                    {
                                        header: 'ID Venta',
                                        accessor: 'id_venta',
                                        render: (row) => (
                                            <span className="font-mono text-xs text-black dark:text-white">
                                                #{String(row.id_venta).split('-')[0].toUpperCase()}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Fecha',
                                        accessor: 'fecha_hora',
                                        render: (row) => (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-black dark:text-white">
                                                    {new Date(row.fecha_hora).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-neutral-400">
                                                    {new Date(row.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Sucursal',
                                        accessor: 'comercio',
                                        render: (row) => (
                                            <span className="text-xs font-bold text-black dark:text-white uppercase">
                                                {row.comercio?.nombre || 'N/A'}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Total',
                                        accessor: 'total_venta',
                                        render: (row) => (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[10px] font-bold text-neutral-600 dark:text-gray-400">$</span>
                                                <span className="font-sport text-base text-black dark:text-white">
                                                    {Math.round(row.total_venta || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Método de Pago',
                                        accessor: 'metodo_pago',
                                        render: (row) => (
                                            <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-gray-700 rounded text-black dark:text-white">
                                                {row.metodo_pago}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Estado',
                                        accessor: 'estado',
                                        render: (row) => {
                                            const esRectificada = row.id_venta_rectificada || row.es_rectificacion;
                                            const estado = esRectificada ? 'RECTIFICADA' : 'ACTIVA';
                                            const color = esRectificada ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                                            return (
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${color}`}>
                                                    {estado}
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        header: 'Liquidación',
                                        render: (row) => {
                                            const liquidada = row.liquidacion_id;
                                            return liquidada ? (
                                                <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    LIQUIDADA
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-neutral-100 text-neutral-600 dark:bg-gray-700 dark:text-gray-400">
                                                    PENDIENTE
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        header: 'Acciones',
                                        render: (row) => (
                                            <button
                                                onClick={() => handleVerDetallesVenta(row)}
                                                disabled={loadingVentaId === row.id_venta}
                                                className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Ver Detalles"
                                            >
                                                {loadingVentaId === row.id_venta ? (
                                                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-brand-cyan rounded-full animate-spin"></div>
                                                ) : (
                                                    <Eye size={16} strokeWidth={2.5} />
                                                )}
                                            </button>
                                        )
                                    }
                                ]}
                                searchPlaceholder="Buscar por ID de venta, sucursal o método de pago..."
                                variant="minimal"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE DETALLES DE LIQUIDACIÓN */}
            <AnimatePresence>
            {isDetallesModalOpen && selectedLiquidacion && (
                <Modal 
                    isOpen={isDetallesModalOpen} 
                    onClose={() => setIsDetallesModalOpen(false)} 
                    title={`Detalles de Liquidación #${String(selectedLiquidacion.id_liquidacion).split('-')[0].toUpperCase()}`}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-2 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-4"
                    >
                        {/* Información General */}
                        <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Información General</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Sucursal</span>
                                    <span className="text-sm font-bold text-black dark:text-white">{selectedLiquidacion.comercio_nombre}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Fecha de Cierre</span>
                                    <span className="text-sm font-bold text-black dark:text-white">{new Date(selectedLiquidacion.fecha_cierre).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Estado</span>
                                    <span className="text-sm font-bold text-emerald-600">{selectedLiquidacion.estado}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Tickets Incluidos</span>
                                    <span className="text-sm font-bold text-black dark:text-white">{selectedLiquidacion.cant_ventas}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resumen Financiero */}
                        <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Resumen Financiero</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-600 dark:text-gray-400">Total Cobrado:</span>
                                    <span className="text-lg font-sport text-black dark:text-white">${Math.round(selectedLiquidacion.total_bruto || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-600 dark:text-gray-400">Ganancia Total:</span>
                                    <span className="text-lg font-sport text-emerald-600">
                                        +${Math.round(selectedLiquidacion.resumen_productos?.reduce((acc, prod) => acc + ((prod.total_bruto || 0) - (prod.total_neto || 0)), 0) || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-gray-700">
                                    <span className="text-sm font-bold text-black dark:text-white">Total a Liquidar:</span>
                                    <span className="text-xl font-sport text-black dark:text-white">${Math.round(selectedLiquidacion.total_ventas_netas || 0).toLocaleString()}</span>
                                </div>
                                {selectedLiquidacion.diferencia !== 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-neutral-600 dark:text-gray-400">{selectedLiquidacion.diferencia > 0 ? 'Sobrante:' : 'Faltante:'}</span>
                                        <span className={`text-sm font-bold ${selectedLiquidacion.diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedLiquidacion.diferencia > 0 ? '+' : ''}${Math.round(selectedLiquidacion.diferencia).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desglose por Método de Pago */}
                        {selectedLiquidacion.desglose_metodo_pago && Object.keys(selectedLiquidacion.desglose_metodo_pago).length > 0 && (
                            <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Desglose por Método de Pago</h4>
                                <div className="space-y-1.5">
                                    {Object.entries(selectedLiquidacion.desglose_metodo_pago).map(([metodo, total]) => (
                                        <div key={metodo} className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-600 dark:text-gray-400">{metodo}:</span>
                                            <span className="text-sm font-bold text-black dark:text-white">${Math.round(total).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resumen de Productos */}
                        {selectedLiquidacion.resumen_productos && selectedLiquidacion.resumen_productos.length > 0 && (
                            <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Productos Vendidos</h4>
                                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                    {selectedLiquidacion.resumen_productos.map((prod, idx) => {
                                        const ganancia = (prod.total_bruto || 0) - (prod.total_neto || 0);
                                        return (
                                            <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-200 dark:border-gray-700 pb-1.5 last:border-0">
                                                <div className="flex-1">
                                                    <span className="font-bold text-black dark:text-white block">{prod.nombre}</span>
                                                    <span className="text-[10px] text-neutral-500">Cant: {prod.cantidad}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-sport text-black dark:text-white block">${Math.round(prod.total_bruto).toLocaleString()}</span>
                                                    <span className="text-[10px] text-emerald-600">+${Math.round(ganancia).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Ventas Incluidas */}
                        {selectedLiquidacion.ventas && selectedLiquidacion.ventas.length > 0 && (
                            <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Ventas Incluidas ({selectedLiquidacion.ventas.length})</h4>
                                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                    {selectedLiquidacion.ventas.map((venta) => (
                                        <div key={venta.id_venta} className="flex justify-between items-center text-xs bg-white dark:bg-gray-700 p-2 rounded border border-neutral-200 dark:border-gray-600">
                                            <div>
                                                <span className="font-bold text-black dark:text-white block">#{String(venta.id_venta).split('-')[0].toUpperCase()}</span>
                                                <span className="text-[10px] text-neutral-500">{new Date(venta.fecha_hora).toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-sport text-black dark:text-white block">${Number(venta.total_venta).toLocaleString()}</span>
                                                <span className="text-[10px] text-neutral-500">{venta.metodo_pago}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Observaciones */}
                        {selectedLiquidacion.observacion && (
                            <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Observaciones</h4>
                                <p className="text-xs text-neutral-600 dark:text-gray-400">{selectedLiquidacion.observacion}</p>
                            </div>
                        )}

                        {/* Botones de Acción */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => generatePDF(selectedLiquidacion)}
                                className="flex-1 bg-black dark:bg-gray-700 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center gap-2"
                            >
                                <FileText size={14} /> Descargar PDF
                            </button>
                            <button
                                onClick={() => generateExcel(selectedLiquidacion)}
                                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FileSpreadsheet size={14} /> Excel
                            </button>
                            <button
                                onClick={() => setIsDetallesModalOpen(false)}
                                className="px-6 py-2 bg-neutral-200 dark:bg-gray-600 text-black dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-neutral-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </Modal>
            )}
            </AnimatePresence>

            {/* MODAL DE DETALLES DE VENTA */}
            <AnimatePresence>
            {isDetallesVentaModalOpen && selectedVenta && (
                <Modal 
                    isOpen={isDetallesVentaModalOpen} 
                    onClose={() => setIsDetallesVentaModalOpen(false)} 
                    title={`Detalles de Venta #${String(selectedVenta.id_venta).split('-')[0].toUpperCase()}`}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-2 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-4"
                    >
                        {/* Información General */}
                        <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Información General</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Sucursal</span>
                                    <span className="text-sm font-bold text-black dark:text-white">{selectedVenta.comercio?.nombre || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Fecha y Hora</span>
                                    <span className="text-sm font-bold text-black dark:text-white">{new Date(selectedVenta.fecha_hora).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Método de Pago</span>
                                    <span className="text-sm font-bold text-black dark:text-white">{selectedVenta.metodo_pago}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-bold text-neutral-400 uppercase block">Total</span>
                                    <span className="text-lg font-sport text-black dark:text-white">${Math.round(selectedVenta.total_venta || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Productos Vendidos */}
                        {selectedVenta.detalles && selectedVenta.detalles.length > 0 && (
                            <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Productos Vendidos</h4>
                                <div className="space-y-1.5">
                                    {selectedVenta.detalles.map((detalle, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-gray-700 p-2 rounded border border-neutral-200 dark:border-gray-600">
                                            <div className="flex-1">
                                                <span className="font-bold text-black dark:text-white block">{detalle.producto?.nombre || 'Producto'}</span>
                                                <span className="text-[10px] text-neutral-500">Cant: {detalle.cantidad}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-sport text-black dark:text-white block">${Math.round((detalle.precio_unitario_cobrado || 0) * detalle.cantidad).toLocaleString()}</span>
                                                <span className="text-[10px] text-neutral-500">${Math.round(detalle.precio_unitario_cobrado || 0).toLocaleString()} c/u</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estado de Liquidación */}
                        <div className="bg-neutral-50 dark:bg-gray-800 p-3 rounded-xl border border-neutral-200 dark:border-gray-700">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Estado de Liquidación</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-neutral-600 dark:text-gray-400">Estado:</span>
                                {selectedVenta.liquidacion_id ? (
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-blue-600 block">LIQUIDADA</span>
                                        <span className="text-[10px] text-neutral-500">ID: #{String(selectedVenta.liquidacion_id).split('-')[0].toUpperCase()}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm font-bold text-amber-600">PENDIENTE</span>
                                )}
                            </div>
                        </div>

                        {/* Botón de Cerrar */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsDetallesVentaModalOpen(false)}
                                className="flex-1 px-6 py-2 bg-black dark:bg-gray-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </Modal>
            )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Liquidaciones;