import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Send, ShieldCheck, FileText, Settings2, AlertCircle, RotateCcw, CalendarDays, DollarSign, Wallet, History, Eye, Search, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [descuentoTipo, setDescuentoTipo] = useState('monto');
    const [descuentoValor, setDescuentoValor] = useState('');
    const [ajustandoSaldo, setAjustandoSaldo] = useState(false);
    const [mostrarInactivas, setMostrarInactivas] = useState(false);

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
        setDescuentoTipo('monto');
        setDescuentoValor('');

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
            toast.error(error?.response?.data?.error || "Error al calcular la liquidación");
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

            const netoBase = Number(previewConSeleccion?.netoFinal ?? previewData?.netoFinal ?? 0);
            const descRaw = parseFloat(descuentoValor) || 0;
            const descuento = descuentoTipo === 'porcentaje'
                ? Math.round(netoBase * (Math.min(100, Math.max(0, descRaw)) / 100) * 100) / 100
                : Math.min(Math.max(0, descRaw), netoBase);

            await liquidacionesService.liquidarSucursal(sucId, monto, idsVentas, descuento);

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
    const getTicketsPendientes = (suc) => suc._count?.ventas_registradas || 0;

    const netoSeleccionado = Number(previewConSeleccion?.netoFinal ?? previewData?.netoFinal ?? 0);
    const descuentoCalculado = (() => {
        const raw = parseFloat(descuentoValor) || 0;
        if (descuentoTipo === 'porcentaje') {
            return Math.round(netoSeleccionado * (Math.min(100, Math.max(0, raw)) / 100) * 100) / 100;
        }
        return Math.min(Math.max(0, raw), netoSeleccionado);
    })();
    const aCobrar = Math.max(0, Math.round((netoSeleccionado - descuentoCalculado) * 100) / 100);

    const handleAjustarSaldoHuerfano = async () => {
        const sucId = selectedSucursal?.id_comercio || selectedSucursal?.id;
        if (!sucId) return;
        setAjustandoSaldo(true);
        try {
            await liquidacionesService.ajustarSaldoHuerfano(sucId);
            toast.success('Saldo ajustado a $0. Ya no figura como pendiente.');
            setIsPreviewOpen(false);
            loadData();
        } catch (error) {
            toast.error(error?.response?.data?.error || 'No se pudo ajustar el saldo');
        } finally {
            setAjustandoSaldo(false);
        }
    };

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
                    <p className="text-neutral-500 text-[10px] font-medium leading-relaxed max-w-xl mt-1.5 m-0">
                        Acá cobrás el Push. El número grande es todo lo impago de esa sucursal, no la última venta.
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

            <QueQueresHacer extra="Para vender más barato: en Registrar Ventas, tocá Descuento en el producto." />

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
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl mb-2">
                        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-[13px] text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed m-0">
                            Si el total es más alto que la última venta, hay ventas viejas sin cobrar. Para vender un producto más barato: Registrar Ventas → Descuento en ese producto.
                        </p>
                    </div>

                    {/* Tarjetas de Sucursales */}
                    {(() => {
                        const activas = sucursales.filter(s => s.activo !== false);
                        const inactivasConSaldo = sucursales.filter(s => s.activo === false && getSaldo(s) > 0);
                        const renderCard = (suc, i, inactiva = false) => {
                            const saldo = getSaldo(suc);
                            const hasDebt = saldo > 0;
                            const tickets = suc.resumen_pendiente?.tickets ?? getTicketsPendientes(suc);
                            const ultimaPush = Number(suc.resumen_pendiente?.ultima_push || 0);
                            const anterioresPush = Number(suc.resumen_pendiente?.anteriores_push || 0);
                            const ultimaFecha = suc.resumen_pendiente?.ultima_fecha
                                ? new Date(suc.resumen_pendiente.ultima_fecha).toLocaleDateString('es-AR')
                                : null;
                            return (
                                <motion.div
                                    key={getId(suc)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`bg-white dark:bg-gray-800 border p-3 md:p-4 rounded-xl flex flex-col justify-between transition-all duration-300 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-premium ${hasDebt ? 'border-neutral-200 dark:border-gray-600 hover:border-brand-cyan' : 'border-neutral-100 dark:border-gray-700'} ${inactiva ? 'ring-1 ring-amber-300' : ''}`}
                                >
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
                                            {inactiva && (
                                                <span className="text-[7px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Inactiva</span>
                                            )}
                                        </div>
                                        <div className="pt-1">
                                            <span className="text-[10px] font-semibold text-neutral-500 block mb-0.5">
                                                Te debe (Push de todas las ventas sin cobrar)
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xs font-bold ${hasDebt ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-gray-500'}`}>$</span>
                                                <p className={`text-3xl font-sport m-0 leading-none ${hasDebt ? 'text-black dark:text-white' : 'text-neutral-800 dark:text-gray-400'}`}>
                                                    {saldo.toLocaleString()}
                                                </p>
                                            </div>
                                            {hasDebt && tickets > 1 && (
                                                <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 px-2 py-1.5 space-y-0.5">
                                                    <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 m-0 leading-snug">
                                                        No es solo la última venta. Son {tickets} juntas:
                                                    </p>
                                                    <p className="text-[11px] text-amber-900 dark:text-amber-200 m-0">
                                                        Última{ultimaFecha ? ` (${ultimaFecha})` : ''}: ${Math.round(ultimaPush).toLocaleString()} Push
                                                    </p>
                                                    <p className="text-[11px] text-amber-900 dark:text-amber-200 m-0">
                                                        Anteriores sin cobrar: ${Math.round(anterioresPush).toLocaleString()} Push
                                                    </p>
                                                </div>
                                            )}
                                            {hasDebt && tickets === 1 && (
                                                <p className="text-[11px] text-neutral-600 dark:text-gray-400 mt-1.5 m-0">
                                                    1 venta sin cobrar{ultimaFecha ? ` · ${ultimaFecha}` : ''}.
                                                </p>
                                            )}
                                            {hasDebt && tickets === 0 && (
                                                <p className="text-[11px] text-neutral-500 mt-1.5 m-0">
                                                    Hay saldo, pero no hay tickets. Abrí el resumen para ajustarlo.
                                                </p>
                                            )}
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
                            );
                        };
                        return (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Send size={14} className="text-black dark:text-white" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white m-0">Sucursales activas</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {activas.map((suc, i) => renderCard(suc, i, false))}
                                    </div>
                                </div>
                                {inactivasConSaldo.length > 0 && !mostrarInactivas && (
                                    <button
                                        type="button"
                                        onClick={() => setMostrarInactivas(true)}
                                        className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest hover:text-neutral-600"
                                    >
                                        Hay {inactivasConSaldo.length} sucursal{inactivasConSaldo.length === 1 ? '' : 'es'} que ya no opera{inactivasConSaldo.length === 1 ? '' : 'n'} (no se muestran). Ver.
                                    </button>
                                )}
                                {inactivasConSaldo.length > 0 && mostrarInactivas && (
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 m-0">Inactivas con saldo</h3>
                                                <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mt-1 m-0">
                                                    No operan. Si no las vas a cobrar, no hace falta entrar. Podés ocultarlas de nuevo.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setMostrarInactivas(false)}
                                                className="text-[9px] font-black uppercase tracking-widest text-neutral-500 shrink-0"
                                            >
                                                Ocultar
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {inactivasConSaldo.map((suc, i) => renderCard(suc, i, true))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
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
                            <div className="py-8 text-center space-y-3 bg-neutral-50 dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 px-4">
                                {previewData?.saldoHuerfano ? (
                                    <>
                                        <AlertCircle size={32} className="mx-auto text-amber-500" />
                                        <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">Hay un saldo, pero no hay tickets</h3>
                                        <p className="text-xs text-neutral-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                                            {selectedSucursal?.nombre} figura debiendo ${Math.round(previewData.saldoAcumulado || 0).toLocaleString()} Push, pero no hay ventas activas para liquidar. Suele pasar si se liquidó a medias o quedó un resto viejo.
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                                            Si no hay nada real para cobrar, ajustá el saldo a $0 para que deje de aparecer pendiente.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                                            <button
                                                onClick={() => setIsPreviewOpen(false)}
                                                className="px-6 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                            >
                                                VOLVER
                                            </button>
                                            <button
                                                onClick={handleAjustarSaldoHuerfano}
                                                disabled={ajustandoSaldo}
                                                className="px-6 py-2 bg-amber-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {ajustandoSaldo ? 'AJUSTANDO...' : 'AJUSTAR SALDO A $0'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={32} className="mx-auto text-green-500" />
                                        <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">Todo al día</h3>
                                        <p className="text-xs text-neutral-500 dark:text-gray-400">No hay ventas pendientes para liquidar en esta sede.</p>
                                        <button
                                            onClick={() => setIsPreviewOpen(false)}
                                            className="mt-4 px-6 py-2 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                                        >
                                            VOLVER
                                        </button>
                                    </>
                                )}
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

                                {previewData.cantVentas > 1 && (
                                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 px-3 py-2">
                                        <p className="text-[12px] font-semibold text-amber-900 dark:text-amber-200 m-0 leading-snug">
                                            Este total es la suma de {previewData.cantVentas} ventas, no de la última sola.
                                            Podés destildar las viejas si ahora solo querés cobrar una.
                                        </p>
                                    </div>
                                )}

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
                                        <span className="text-[10px] font-medium text-neutral-500">Cliente pagó · te deben Push</span>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {[...(previewData.ventas || [])]
                                            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                            .map((v, idx) => (
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
                                                    <p className="text-[11px] font-bold text-black dark:text-white truncate m-0">
                                                        {idx === 0 ? 'Última venta' : `Venta anterior`}
                                                        {v.vendedor ? ` · ${v.vendedor}` : ''}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 truncate m-0">
                                                        {new Date(v.fecha).toLocaleString('es-AR')} · {v.metodo_pago}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] text-neutral-500 m-0">Cliente ${Math.round(v.total).toLocaleString()}</p>
                                                    <p className="text-[12px] font-sport text-brand-cyan m-0">Push ${Math.round(v.neto || 0).toLocaleString()}</p>
                                                </div>
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
                                {(previewConSeleccion?.resumenProductos || previewData.resumenProductos)?.length > 0 && (() => {
                                     const productosLista = previewConSeleccion?.resumenProductos || previewData.resumenProductos;
                                     const itemsPerPage = rowsPerModalPage;
                                     const totalModalPages = Math.ceil(productosLista.length / itemsPerPage);
                                     const paginatedItemsModal = productosLista.slice(
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
                                                        <th className="px-1 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-200 dark:border-gray-600 text-right">Público</th>
                                                        <th className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-cyan border-b border-neutral-200 dark:border-gray-600 text-right">Push al vender</th>
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
                                                                {prod.precio_unitario_push_actual > 0 && Math.round(prod.precio_unitario_push_actual) !== Math.round(prod.precio_unitario_push) && (
                                                                    <p className="text-[8px] font-bold text-amber-600 uppercase tracking-tight m-0 mt-0.5">
                                                                        Hoy vale ${Math.round(prod.precio_unitario_push_actual).toLocaleString()} · se cobra el de esa venta
                                                                    </p>
                                                                )}
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


                                {/* Totales + descuento a la sucursal */}
                                <div className="space-y-2">
                                    <div className="bg-black p-3 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center text-neutral-300">
                                            <span className="text-[12px]">Lo que pagaron los clientes (Público)</span>
                                            <span className="font-sport text-sm">${Math.round(previewConSeleccion?.totalVentasBruto ?? previewData.totalVentasBruto).toLocaleString()}</span>
                                        </div>
                                        {(previewConSeleccion?.totalDevoluciones ?? previewData.totalDevoluciones) > 0 && (
                                            <div className="flex justify-between items-center text-amber-400">
                                                <span className="text-[12px] flex items-center gap-1">
                                                    <RotateCcw size={12} /> Devoluciones
                                                </span>
                                                <span className="font-sport text-sm">-${Math.round(previewConSeleccion?.totalDevoluciones ?? previewData.totalDevoluciones).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end pt-1 border-t border-neutral-800">
                                            <span className="text-[13px] font-semibold text-white">Te debe de Push</span>
                                            <div className="flex items-baseline gap-0.5 text-white">
                                                <span className="text-sm font-bold">$</span>
                                                <span className="text-2xl font-sport leading-none">
                                                    {isLoadingPreviewSeleccion ? '...' : Math.round(netoSeleccionado).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border-2 border-brand-cyan bg-white dark:bg-gray-800 p-3 space-y-2">
                                        <p className="text-[15px] font-bold text-neutral-900 dark:text-white m-0 leading-snug">
                                            Descuento extra a esta liquidación
                                        </p>
                                        <p className="text-[13px] text-neutral-600 dark:text-gray-300 m-0 leading-snug">
                                            Opcional. Si ya descontaste el producto en la venta, no hace falta. Esto baja el total de Push de esta cobranza.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex rounded-lg overflow-hidden border border-neutral-300 dark:border-gray-600">
                                                <button type="button" onClick={() => setDescuentoTipo('monto')} className={`px-3 py-1.5 text-[12px] font-bold ${descuentoTipo === 'monto' ? 'bg-brand-cyan text-black' : 'text-neutral-500 bg-neutral-50 dark:bg-gray-700'}`}>
                                                    En pesos
                                                </button>
                                                <button type="button" onClick={() => setDescuentoTipo('porcentaje')} className={`px-3 py-1.5 text-[12px] font-bold ${descuentoTipo === 'porcentaje' ? 'bg-brand-cyan text-black' : 'text-neutral-500 bg-neutral-50 dark:bg-gray-700'}`}>
                                                    En %
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={descuentoValor}
                                                onChange={(e) => setDescuentoValor(e.target.value)}
                                                placeholder={descuentoTipo === 'porcentaje' ? 'Ej: 10' : 'Ej: 20000'}
                                                className="flex-1 min-w-0 border border-neutral-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-lg font-sport text-neutral-900 dark:text-white bg-white dark:bg-gray-900 outline-none focus:border-brand-cyan"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-lg bg-neutral-50 dark:bg-gray-900 py-2 px-1">
                                                <p className="text-[10px] text-neutral-500 m-0">Te debe</p>
                                                <p className="text-[13px] font-bold text-neutral-900 dark:text-white m-0">${Math.round(netoSeleccionado).toLocaleString()}</p>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 dark:bg-gray-900 py-2 px-1">
                                                <p className="text-[10px] text-neutral-500 m-0">Le descontás</p>
                                                <p className="text-[13px] font-bold text-amber-700 m-0">${Math.round(descuentoCalculado).toLocaleString()}</p>
                                            </div>
                                            <div className="rounded-lg bg-brand-cyan/15 py-2 px-1">
                                                <p className="text-[10px] text-neutral-600 m-0">Te tiene que pagar</p>
                                                <p className="text-[13px] font-bold text-neutral-900 dark:text-white m-0">${Math.round(aCobrar).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 p-3 space-y-1">
                                        <p className="text-[13px] font-bold text-neutral-900 dark:text-white m-0">¿Cuánta plata te dieron hoy?</p>
                                        <p className="text-[12px] text-neutral-500 m-0 leading-snug">
                                            Si te pagaron exactamente ${Math.round(aCobrar).toLocaleString()}, dejalo vacío. Esto no es el descuento: es para anotar si te dieron de más o de menos.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-neutral-400" />
                                            <input
                                                type="number"
                                                value={montoRecibidoManual}
                                                onChange={(e) => setMontoRecibidoManual(e.target.value)}
                                                placeholder={Math.round(aCobrar).toString()}
                                                className="flex-1 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-600 rounded-lg px-3 py-1.5 font-sport text-lg text-neutral-900 dark:text-white outline-none"
                                            />
                                            {montoRecibidoManual && !isNaN(montoRecibidoManual) && parseFloat(montoRecibidoManual) !== aCobrar && (
                                                <span className={`text-[12px] font-bold whitespace-nowrap ${parseFloat(montoRecibidoManual) > aCobrar ? 'text-green-600' : 'text-red-500'}`}>
                                                    {parseFloat(montoRecibidoManual) > aCobrar ? 'De más ' : 'De menos '}
                                                    ${Math.round(Math.abs(parseFloat(montoRecibidoManual) - aCobrar)).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                                    <p className="text-[13px] font-medium text-emerald-900 dark:text-emerald-200 m-0 leading-snug">
                                        Se cierran {ventasSeleccionadas.size} de {previewData.cantVentas} ventas. El saldo baja solo esas. Las que no marques siguen debiendo.
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
                                        {isProcessing ? 'PROCESANDO...' : <><CheckCircle2 size={12} /> COBRAR ${Math.round(aCobrar).toLocaleString()}</>}
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
                                    {Number(selectedLiquidacion.descuento_comercial) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-600 dark:text-gray-400">Descuento comercial:</span>
                                            <span className="text-sm font-bold text-brand-cyan">-${Math.round(selectedLiquidacion.descuento_comercial).toLocaleString()}</span>
                                        </div>
                                    )}
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
                                {Number(selectedVenta.monto_descuento) > 0 && (
                                    <div>
                                        <span className="text-[8px] font-bold text-neutral-400 uppercase block">Código {selectedVenta.codigo_descuento || ''}</span>
                                        <span className="text-sm font-bold text-green-700">-${Math.round(selectedVenta.monto_descuento).toLocaleString()}</span>
                                    </div>
                                )}
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
                                                <span className="text-[10px] text-neutral-500">
                                                    Cant: {detalle.cantidad}
                                                    {detalle.descuento_tipo
                                                        ? ` · Dto ${detalle.descuento_tipo === 'porcentaje' ? `${detalle.descuento_valor}%` : `$${Number(detalle.descuento_valor).toLocaleString()}`}`
                                                        : ''}
                                                    {detalle.precio_lista && Number(detalle.precio_lista) > Number(detalle.precio_unitario_cobrado)
                                                        ? ` · lista $${Math.round(detalle.precio_lista).toLocaleString()}`
                                                        : ''}
                                                </span>
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