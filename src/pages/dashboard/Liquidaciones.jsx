import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, Send, ShieldCheck, History, Download, DollarSign, X, FileText, Settings2, AlertCircle, RotateCcw } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { liquidacionesService } from '../../services/liquidacionesService';
import { devolucionesService } from '../../services/devolucionesService';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

// --- NUEVAS LIBRERÍAS ---
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

const Liquidaciones = () => {
    const { role, sucursalId, user } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [sucursales, setSucursales] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [devolucionesPorSucursal, setDevolucionesPorSucursal] = useState({}); // { id_comercio: totalMonto }
    const [isLoading, setIsLoading] = useState(true);
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let sucs = await sucursalesService.getAll();
            if (!isSuperAdmin) {
                sucs = sucs.filter(s => s.id_comercio === sucursalId || s.id === sucursalId);
            }
            setSucursales(sucs);

            const hist = await liquidacionesService.getHistorial(!isSuperAdmin ? sucursalId : null);
            setHistorial(hist);

            // Cargar devoluciones pendientes (sin liquidar) por cada sucursal
            // para restar del saldo antes de mostrar el monto a cobrar
            const devsMap = {};
            for (const suc of sucs) {
                const sucId = suc.id_comercio || suc.id;
                try {
                    const devs = await devolucionesService.getHistorialComercio(sucId);
                    // Solo contamos devoluciones que NO están en una liquidación ya cerrada
                    // (las ventas sin id_liquidacion son las pendientes)
                    const totalDevolucionesPendientes = devs.reduce((acc, d) => {
                        // Si la venta asociada no tiene liquidacion, la devolución afecta saldo actual
                        if (!d.venta?.id_liquidacion) {
                            return acc + parseFloat(d.monto_reembolso || 0);
                        }
                        return acc;
                    }, 0);
                    devsMap[sucId] = totalDevolucionesPendientes;
                } catch {
                    devsMap[sucId] = 0;
                }
            }
            setDevolucionesPorSucursal(devsMap);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [isSuperAdmin, sucursalId]);

    const handleLiquidarClick = (sucursal) => {
        setSelectedSucursal(sucursal);
        setIsConfirmOpen(true);
    };

    const confirmLiquidacion = async () => {
        setIsProcessing(true);
        try {
            const netoPagado = selectedSucursal.saldo_acumulado_mili || selectedSucursal.saldo_pendiente;
            const comision = selectedSucursal.comision_porcentaje || 0;
            const totalVendido = netoPagado / (1 - (comision / 100));

            const sucId = selectedSucursal.id_comercio || selectedSucursal.id;

            await liquidacionesService.liquidarSucursal(
                sucId, 
                totalVendido, 
                comision, 
                netoPagado
            );
            
            await sucursalesService.update(sucId, { saldo_pendiente: 0, saldo_acumulado_mili: 0 });

            toast.success("Liquidación procesada correctamente");
            setIsConfirmOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar liquidación");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- FUNCIÓN DE EXPORTACIÓN A PDF (COMPROBANTE) ---
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
        doc.text("RECIBO OFICIAL DE TESORERÍA", 10, 30);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`ID Transacción: #${String(row.id).split('-')[0]}`, 10, 50);
        doc.text(`Fecha: ${new Date(row.fecha).toLocaleString()}`, 10, 60);
        doc.text(`Sede Auditada: ${row.sucursal_nombre}`, 10, 70);

        doc.setLineWidth(0.5);
        doc.line(10, 80, 138, 80);

        doc.setFont('helvetica', 'bold');
        doc.text("DETALLE FINANCIERO", 10, 95);
        
        doc.setFont('helvetica', 'normal');
        doc.text("Volumen Bruto:", 10, 110);
        doc.text(`$${Math.round(row.total_vendido).toLocaleString()}`, 100, 110, { align: 'right' });

        doc.text(`Comisión Sede (${row.comision_porcentaje}%):`, 10, 120);
        doc.text(`-$${Math.round(row.monto_comision).toLocaleString()}`, 100, 120, { align: 'right' });

        doc.line(10, 130, 138, 130);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("NETO CONSOLIDADO:", 10, 145);
        doc.text(`$${Math.round(row.neto_pagado).toLocaleString()}`, 138, 145, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("Este documento es un comprobante oficial generado por el Core.", 74, 180, { align: 'center' });
        doc.text("Firma Verificada: SISTEMA", 74, 185, { align: 'center' });

        doc.save(`Comprobante_Liq_${String(row.id).split('-')[0]}.pdf`);
        toast.success("Comprobante PDF generado");
    };

    const getSaldo = (suc) => suc.saldo_acumulado_mili ?? suc.saldo_pendiente ?? 0;
    const getDevolucionTotal = (suc) => devolucionesPorSucursal[suc.id_comercio ?? suc.id] ?? 0;
    const getSaldoNeto = (suc) => Math.max(0, getSaldo(suc) - getDevolucionTotal(suc));
    const getId = (suc) => suc.id_comercio ?? suc.id;

    const columnsHistorial = [
        { header: 'ID Liq', accessor: 'id', render: (row) => <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">#{String(row.id).split('-')[0]}</span> },
        { 
            header: 'Sede Auditada', 
            accessor: 'sucursal_nombre',
            render: (row) => <span className="font-bold text-sm text-black uppercase tracking-widest">{row.sucursal_nombre}</span>
        },
        { 
            header: 'Cronología', 
            accessor: 'fecha',
            render: (row) => (
                <div className="flex flex-col text-black">
                    <span className="text-xs font-bold uppercase tracking-widest">{new Date(row.fecha).toLocaleDateString()}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{new Date(row.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            )
        },
        { 
            header: 'Volumen Bruto', 
            render: (row) => (
                <div className="flex items-baseline gap-1 text-neutral-600">
                    <span className="text-[10px] font-bold">$</span>
                    <span className="font-sport text-xl leading-none">{Math.round(row.total_vendido).toLocaleString()}</span>
                </div>
            )
        },
        { 
            header: 'Deducción (Comisión)', 
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-black uppercase tracking-widest">
                        -${Math.round(row.monto_comision).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">({row.comision_porcentaje}% Sede)</span>
                </div>
            )
        },
        { 
            header: 'Neto Consolidado', 
            render: (row) => (
                <div className="inline-flex px-3 py-1.5 bg-black text-white rounded-lg font-sport text-lg tracking-widest items-baseline gap-1 shadow-md">
                    <span className="text-[10px] font-sans font-bold">$</span>
                    {Math.round(row.neto_pagado).toLocaleString()}
                </div>
            )
        },
        {
            header: 'Comprobante',
            render: (row) => (
                <button
                    onClick={() => generatePDF(row)}
                    className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-md transition-colors"
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
            className="space-y-8 max-w-[1400px] mx-auto"
        >
            
            {/* Header Técnico */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-6">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                         <ShieldCheck size={16} className="text-brand-cyan" />
                         <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">TESORERÍA CENTRAL</span>
                         <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest bg-black text-white border-black`}>
                             {isSuperAdmin ? 'GLOBAL' : 'SEDE'}
                         </div>
                    </div>
                     <h2 className="text-4xl md:text-5xl uppercase leading-none m-0 font-sport text-black">
                        {isSuperAdmin ? 'Cierre de' : 'Conciliación de'} <span className="text-brand-cyan">{isSuperAdmin ? 'Caja.' : 'Fondos.'}</span>
                    </h2>
                 </div>
                 
                 <div className="px-5 py-3.5 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center gap-4 shadow-sm">
                    <CreditCard size={20} className="text-brand-cyan" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Estado Financiero</span>
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Auditado & Verificado</span>
                    </div>
                 </div>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Recuperando Saldos...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas de Saldos Pendientes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Send size={16} className="text-black" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black m-0">Arqueos Pendientes de Cobro</h3>
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
                                    className={`bg-white border ${hasDebt ? 'border-neutral-200 hover:border-black' : 'border-neutral-100'} p-6 rounded-xl flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-sm relative overflow-hidden group`}
                                >
                                    {/* Marcador de deuda */}
                                    {hasDebt && (
                                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-brand-cyan text-black text-[8px] font-black uppercase tracking-widest py-1 px-8 rotate-45 translate-x-[25px] translate-y-[10px] shadow-sm">
                                                PENDIENTE
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1 relative z-10">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 block mb-2">{suc.nombre}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-sm font-bold ${hasDebt ? 'text-black' : 'text-neutral-300'}`}>$</span>
                                            <p className={`text-5xl font-sport m-0 leading-none ${hasDebt ? 'text-black' : 'text-neutral-300'}`}>
                                                {getSaldoNeto(suc).toLocaleString()}
                                            </p>
                                        </div>
                                        {getSaldo(suc) > 0 && getDevolucionTotal(suc) > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <RotateCcw size={10} className="text-amber-500" />
                                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                                                    Dev. descontadas: -${getDevolucionTotal(suc).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {hasDebt && (
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                                                Responsabilidad: Central
                                            </p>
                                        )}
                                    </div>
                                    
                                    {isSuperAdmin && hasDebt ? (
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleLiquidarClick(suc)}
                                            className="w-full mt-6 bg-black text-white py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center gap-2"
                                        >
                                            LIQUIDAR ${getSaldoNeto(suc).toLocaleString()} <CheckCircle2 size={14} />
                                        </motion.button>
                                    ) : (
                                        <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasDebt ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${hasDebt ? 'text-amber-500' : 'text-green-500'}`}>
                                                {!hasDebt ? 'CUENTA SALDADA (OK)' : 'ESPERANDO COBRO CENTRAL'}
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
                            <Settings2 size={16} className="text-black" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black m-0">Historial Consolidado</h3>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                            <DataTable 
                                data={historial}
                                columns={columnsHistorial}
                                searchPlaceholder="Filtrar liquidaciones o sedes..."
                                variant="minimal"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Modal Técnico de Confirmación */}
            <AnimatePresence>
            {isConfirmOpen && (
                <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Autorizar Arqueo">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="space-y-6 p-2"
                    >
                        
                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3">
                            <AlertCircle size={18} className="text-black shrink-0" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                                Confirme la <span className="text-black font-black">recepción del monto</span>. Al autorizar, el saldo de la sede volverá a CERO y se emitirá el log de auditoría.
                            </p>
                        </div>
                        
                        <div className="bg-black p-6 rounded-xl border border-neutral-800 shadow-xl overflow-hidden relative">
                            {/* Glow estético interno */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-cyan/20 blur-3xl rounded-full" />
                            
                            <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                                <span>Monto Total a Conciliar:</span>
                            </div>
                            <div className="relative z-10 flex justify-between items-baseline">
                                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.3em]">NETO A INGRESAR:</span>
                                <div className="flex items-baseline gap-1 text-white">
                                    <span className="text-sm font-bold">$</span>
                                    <span className="text-5xl font-sport leading-none">
                                        {selectedSucursal ? getSaldoNeto(selectedSucursal).toLocaleString() : '0'}
                                    </span>
                                </div>
                            </div>
                            {selectedSucursal && getDevolucionTotal(selectedSucursal) > 0 && (
                                <div className="relative z-10 flex items-center gap-2 mt-2 pt-2 border-t border-neutral-700">
                                    <RotateCcw size={10} className="text-amber-400" />
                                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                                        Incluye descuento por devoluciones: -${getDevolucionTotal(selectedSucursal).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={confirmLiquidacion}
                                disabled={isProcessing}
                                className="w-full bg-brand-cyan text-black py-4 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-colors border border-transparent hover:border-black"
                            >
                                {isProcessing ? 'AUTORIZANDO...' : <><CreditCard size={18} /> CONFIRMAR INGRESO</>}
                            </motion.button>
                            <button 
                                onClick={() => setIsConfirmOpen(false)}
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                            >
                                CANCELAR OPERACIÓN
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