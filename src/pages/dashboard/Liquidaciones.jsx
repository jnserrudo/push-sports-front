import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Send, ShieldCheck, FileText, Settings2, AlertCircle, RotateCcw, CalendarDays, DollarSign, Wallet, History } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { liquidacionesService } from '../../services/liquidacionesService';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

// --- LIBRERÍAS DE UI Y PDF ---
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

const Liquidaciones = () => {
    const { sucursalId, user } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [sucursales, setSucursales] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para el Modal de Preview y Liquidación
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [montoRecibidoManual, setMontoRecibidoManual] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let sucs = await sucursalesService.getAll();
            if (!isSuperAdmin) {
                sucs = sucs.filter(s => s.id_comercio === sucursalId);
            }
            setSucursales(sucs);

            const hist = await liquidacionesService.getHistorial(!isSuperAdmin ? sucursalId : null);
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

    const handleOpenPreview = async (sucursal) => {
        setSelectedSucursal(sucursal);
        setIsPreviewOpen(true);
        setIsLoadingPreview(true);
        setMontoRecibidoManual(''); // Resetear el input manual
        
        try {
            const data = await liquidacionesService.getPreview(sucursal.id_comercio || sucursal.id);
            setPreviewData(data);
        } catch (error) {
            console.error('Error al obtener preview:', error);
            toast.error("Error al calcular la liquidación");
            setIsPreviewOpen(false);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const confirmLiquidacion = async () => {
        setIsProcessing(true);
        try {
            const sucId = selectedSucursal.id_comercio || selectedSucursal.id;
            
            // Si el input está vacío o es inválido, enviamos null para que el backend use el saldo real
            const monto = (montoRecibidoManual !== '' && !isNaN(montoRecibidoManual)) 
                ? parseFloat(montoRecibidoManual) 
                : null;

            await liquidacionesService.liquidarSucursal(sucId, monto);
            
            toast.success("Liquidación procesada correctamente");
            setIsPreviewOpen(false);
            loadData();
        } catch (error) {
            console.error('Error al liquidar:', error);
            toast.error("Error al procesar liquidación");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- FUNCIÓN DE EXPORTACIÓN A PDF (COMPROBANTE ENRIQUECIDO) ---
    const generatePDF = (row) => {
        const doc = new jsPDF({ format: 'a5' });

        // Diseño estilo Brutalista / Receipt
        doc.setFillColor(0, 0, 0); // Fondo negro cabecera
        doc.rect(0, 0, 148, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("PUSH SPORTS", 10, 20);

        doc.setTextColor(0, 229, 255); // Brand Cyan
        doc.setFontSize(10);
        doc.text("RECIBO OFICIAL DE LIQUIDACIÓN", 10, 30);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`ID Transacción: #${String(row.id_liquidacion).split('-')[0].toUpperCase()}`, 10, 50);
        doc.text(`Fecha Cierre: ${new Date(row.fecha_cierre).toLocaleString()}`, 10, 58);
        doc.text(`Sede Auditada: ${row.comercio_nombre}`, 10, 66);
        doc.text(`Ventas Incluidas: ${row.cant_ventas || 0} tickets`, 10, 74);

        doc.setLineWidth(0.5);
        doc.line(10, 80, 138, 80);

        doc.setFont('helvetica', 'bold');
        doc.text("RESUMEN DE FONDOS", 10, 90);
        
        doc.setFont('helvetica', 'normal');
        doc.text("Volumen Bruto (Todas las ventas):", 10, 100);
        doc.text(`$${Math.round(row.total_bruto || 0).toLocaleString()}`, 138, 100, { align: 'right' });

        // Desglose por método de pago si existe en metadata
        let yPos = 110;
        if (row.desglose_metodo_pago && Object.keys(row.desglose_metodo_pago).length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text("--- DESGLOSE POR MÉTODO DE PAGO ---", 10, yPos);
            yPos += 8;
            for (const [metodo, total] of Object.entries(row.desglose_metodo_pago)) {
                doc.text(`${metodo}:`, 10, yPos);
                doc.text(`$${Math.round(total).toLocaleString()}`, 138, yPos, { align: 'right' });
                yPos += 8;
            }
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            yPos += 2;
        }

        doc.line(10, yPos, 138, yPos);
        yPos += 10;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("NETO LIQUIDADO:", 10, yPos);
        doc.text(`$${Math.round(row.total_ventas_netas || 0).toLocaleString()}`, 138, yPos, { align: 'right' });
        
        yPos += 12;
        doc.setFontSize(10);
        doc.text("MONTO RECIBIDO:", 10, yPos);
        doc.text(`$${Math.round(row.monto_recibido || 0).toLocaleString()}`, 138, yPos, { align: 'right' });

        if (row.diferencia !== 0) {
            yPos += 8;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(row.diferencia > 0 ? 0 : 255, row.diferencia > 0 ? 150 : 0, 0);
            doc.text(row.diferencia > 0 ? "Sobrante de caja:" : "Faltante de caja:", 10, yPos);
            doc.text(`${row.diferencia > 0 ? '+' : ''}$${Math.round(row.diferencia).toLocaleString()}`, 138, yPos, { align: 'right' });
            doc.setTextColor(0, 0, 0);
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("Este documento es un comprobante oficial generado por el Core.", 74, 190, { align: 'center' });
        doc.text("Firma Verificada: PUSH SPORT - SISTEMA", 74, 195, { align: 'center' });

        doc.save(`Liq_${row.comercio_nombre.replace(/\s+/g, '_')}_${String(row.id_liquidacion).split('-')[0]}.pdf`);
        toast.success("Comprobante PDF generado");
    };

    const getSaldo = (suc) => Number(suc.saldo_acumulado_mili) || 0;
    const getId = (suc) => suc.id_comercio ?? suc.id;

    // --- COLUMNAS DEL HISTORIAL ---
    // Mapeadas correctamente a los datos que retorna el backend enriquecido
    const columnsHistorial = [
        { header: 'ID Liq', accessor: 'id_liquidacion', render: (row) => <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">#{String(row.id_liquidacion).split('-')[0]}</span> },
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
            header: 'Volumen Bruto', 
            render: (row) => (
                <div className="flex items-baseline gap-1 text-neutral-600 dark:text-gray-400">
                    <span className="text-[10px] font-bold">$</span>
                    <span className="font-sport text-lg leading-none">{Math.round(row.total_bruto || 0).toLocaleString()}</span>
                </div>
            )
        },
        { 
            header: 'Neto Liquidado', 
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
                <button
                    onClick={() => generatePDF(row)}
                    className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Exportar Recibo PDF"
                >
                    <FileText size={16} strokeWidth={2.5} />
                </button>
            )
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 max-w-[1400px] mx-auto pb-6"
        >
            
            {/* Header Técnico */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-4 gap-4">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                         <ShieldCheck size={14} className="text-brand-cyan" />
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">TESORERÍA CENTRAL</span>
                         <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest bg-black text-white border-black`}>
                             {isSuperAdmin ? 'GLOBAL' : 'SEDE'}
                         </div>
                    </div>
                     <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Cierre de Caja <span className="text-brand-cyan">/ Liquidaciones</span>
                    </h2>
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal">
                        Módulo de auditoría y cierre. Revisa las ventas pendientes de cada sucursal, comprueba los desgloses de métodos de pago y emite los comprobantes finales.
                    </p>
                 </div>
                 
                 <div className="px-4 py-2 bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg flex items-center gap-3 shadow-sm">
                    <CreditCard size={16} className="text-brand-cyan" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Estado Financiero</span>
                        <span className="text-[9px] font-black text-black dark:text-white uppercase tracking-widest">Auditado</span>
                    </div>
                 </div>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Recopilando registros financieros...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas de Sucursales */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Send size={16} className="text-black dark:text-white" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black dark:text-white m-0">Estado de Sucursales</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {sucursales.map((suc, i) => {
                                const saldo = getSaldo(suc);
                                const hasDebt = saldo > 0;

                                return (
                                <motion.div 
                                    key={getId(suc)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`bg-white dark:bg-gray-800 border p-4 md:p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-premium ${hasDebt ? 'border-neutral-200 dark:border-gray-600 hover:border-brand-cyan' : 'border-neutral-100 dark:border-gray-700'}`}
                                >
                                    {/* Marcador de deuda */}
                                    {hasDebt && (
                                        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
                                            <div className="absolute top-0 right-0 bg-brand-cyan text-black text-[7px] font-black uppercase tracking-[0.2em] py-1 px-10 rotate-45 translate-x-[32px] translate-y-[12px] shadow-sm">
                                                PENDIENTE
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-gray-700 flex items-center justify-center">
                                                <Wallet size={12} className={hasDebt ? 'text-brand-cyan' : 'text-neutral-400'} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white block">{suc.nombre}</span>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Saldo a cobrar (Neto PUSH)</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-sm font-bold ${hasDebt ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-gray-500'}`}>$</span>
                                                <p className={`text-4xl font-sport m-0 leading-none ${hasDebt ? 'text-black dark:text-white' : 'text-neutral-800 dark:text-gray-400'}`}>
                                                    {saldo.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isSuperAdmin && hasDebt ? (
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleOpenPreview(suc)}
                                            className="w-full mt-5 bg-black dark:bg-gray-700 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Settings2 size={14} /> VER RESUMEN Y LIQUIDAR
                                        </motion.button>
                                    ) : (
                                        <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-gray-700 flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasDebt ? 'bg-amber-400 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${hasDebt ? 'text-amber-500' : 'text-green-500'}`}>
                                                {!hasDebt ? 'CAJA AL DÍA' : 'LIQUIDACIÓN PENDIENTE'}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )})}
                        </div>
                    </div>

                    {/* Tabla de Historial */}
                    <div className="pt-8 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <History size={16} className="text-black dark:text-white" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black dark:text-white m-0">Historial Consolidado</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-premium border border-neutral-100 dark:border-gray-700 p-2 md:p-4 transition-all duration-500 hover:shadow-premium-hover">
                            <DataTable 
                                data={historial}
                                columns={columnsHistorial}
                                searchPlaceholder="Buscar por ID o sede..."
                                variant="minimal"
                            />
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
                            <div className="space-y-6">
                                {/* Encabezado Informativo */}
                                <div className="bg-neutral-50 dark:bg-gray-800 p-4 rounded-xl border border-neutral-200 dark:border-gray-700 flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-neutral-100 dark:border-gray-600 flex items-center justify-center">
                                            <CalendarDays size={18} className="text-brand-cyan" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Período Analizado</p>
                                            <p className="text-xs font-bold text-black dark:text-white uppercase">
                                                {new Date(previewData.rangoFechas.desde).toLocaleDateString()} 
                                                <span className="text-neutral-400 mx-1">al</span> 
                                                {new Date(previewData.rangoFechas.hasta).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Tickets Pendientes</p>
                                        <p className="text-lg font-sport text-black dark:text-white leading-none">{previewData.cantVentas}</p>
                                    </div>
                                </div>

                                {/* Desglose por Método de Pago */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3 ml-1">Desglose de Ingresos Brutos</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(previewData.desgloseMetodoPago || {}).map(([metodo, data]) => (
                                            <div key={metodo} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-neutral-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                                                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2 truncate">{metodo}</span>
                                                <span className="text-sm font-sport text-black dark:text-white">${Math.round(data.bruto).toLocaleString()}</span>
                                                <span className="text-[8px] font-bold text-neutral-400 mt-1">{data.cantidad} transacciones</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumen Financiero Total */}
                                <div className="bg-black p-5 md:p-6 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden relative">
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-cyan/20 blur-3xl rounded-full pointer-events-none" />
                                    
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex justify-between items-center text-neutral-300">
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Volumen Bruto Total:</span>
                                            <span className="font-sport text-sm">${Math.round(previewData.totalVentasBruto).toLocaleString()}</span>
                                        </div>
                                        
                                        {previewData.totalDevoluciones > 0 && (
                                            <div className="flex justify-between items-center text-amber-400 border-b border-neutral-800 pb-3">
                                                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <RotateCcw size={10} /> Devoluciones ({previewData.cantDevoluciones}):
                                                </span>
                                                <span className="font-sport text-sm">-${Math.round(previewData.totalDevoluciones).toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pt-2 gap-4">
                                            <div>
                                                <span className="text-[11px] font-black text-brand-cyan uppercase tracking-[0.3em] block mb-1">NETO A COBRAR:</span>
                                                <div className="flex items-baseline gap-1 text-white">
                                                    <span className="text-lg font-bold">$</span>
                                                    <span className="text-5xl md:text-6xl font-sport leading-none">
                                                        {Math.round(previewData.netoFinal).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Input opcional para arqueo real */}
                                            <div className="w-full md:w-auto bg-neutral-900 border border-neutral-700 rounded-lg p-3 shrink-0">
                                                <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Monto Físico Recibido (Opcional)</label>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign size={14} className="text-neutral-500" />
                                                    <input 
                                                        type="number"
                                                        value={montoRecibidoManual}
                                                        onChange={(e) => setMontoRecibidoManual(e.target.value)}
                                                        placeholder={Math.round(previewData.netoFinal).toString()}
                                                        className="bg-transparent border-none outline-none text-white font-sport text-lg w-24 md:w-32 placeholder-neutral-700"
                                                    />
                                                </div>
                                                {montoRecibidoManual && !isNaN(montoRecibidoManual) && parseFloat(montoRecibidoManual) !== previewData.netoFinal && (
                                                    <p className={`text-[8px] font-bold uppercase tracking-widest mt-2 ${parseFloat(montoRecibidoManual) > previewData.netoFinal ? 'text-green-400' : 'text-red-400'}`}>
                                                        {parseFloat(montoRecibidoManual) > previewData.netoFinal ? 'SOBRANTE: +' : 'FALTANTE: '}
                                                        ${Math.abs(parseFloat(montoRecibidoManual) - previewData.netoFinal).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex items-start gap-3">
                                    <AlertCircle size={16} className="text-brand-cyan shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-300 leading-relaxed m-0">
                                        Al confirmar, las <span className="text-black dark:text-white">{previewData.cantVentas} ventas</span> se marcarán como liquidadas y el saldo de la sede volverá a CERO.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <motion.button 
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmLiquidacion}
                                        disabled={isProcessing}
                                        className="w-full bg-brand-cyan text-black py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-brand-cyan shadow-md"
                                    >
                                        {isProcessing ? 'PROCESANDO...' : <><CheckCircle2 size={18} /> CONFIRMAR LIQUIDACIÓN</>}
                                    </motion.button>
                                    <button 
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        CANCELAR
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </Modal>
            )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Liquidaciones;