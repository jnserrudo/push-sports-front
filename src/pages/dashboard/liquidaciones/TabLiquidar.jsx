import React from 'react';
import { Send, Wallet, Settings2, CheckCircle2, CalendarDays, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../../components/ui/Modal';

const TabLiquidar = ({
    sucursales,
    isLoading,
    isSuperAdmin,
    isPreviewOpen,
    setIsPreviewOpen,
    handleOpenPreview,
    isLoadingPreview,
    previewData,
    selectedSucursal,
    ventasSeleccionadas,
    setVentasSeleccionadas,
    toggleVentaSeleccionada,
    seleccionarTodas,
    previewConSeleccion,
    isLoadingPreviewSeleccion,
    montoRecibidoManual,
    setMontoRecibidoManual,
    confirmLiquidacion,
    isProcessing,
    currentModalPage,
    setCurrentModalPage,
    rowsPerModalPage,
    showAllProducts,
    setShowAllProducts
}) => {
    const getSaldo = (suc) => Number(suc.saldo_acumulado_mili) || 0;
    const getId = (suc) => suc.id_comercio ?? suc.id;

    const dataToShow = previewConSeleccion || previewData;
    const totalProductos = dataToShow?.resumenProductos?.length || 0;
    const productosPaginados = showAllProducts 
        ? dataToShow?.resumenProductos 
        : dataToShow?.resumenProductos?.slice((currentModalPage - 1) * rowsPerModalPage, currentModalPage * rowsPerModalPage);
    const totalPages = Math.ceil(totalProductos / rowsPerModalPage);

    return (
        <>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-8 h-8 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Recopilando registros financieros...</p>
                </div>
            ) : (
                <>
                    {/* Explanation Banner */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl mb-4">
                        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">
                                ¿Cómo funciona el flujo de Liquidaciones y Caja?
                            </h4>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                                1. <strong>Ventas:</strong> Cada venta realizada en la sección <strong>Ventas</strong> descuenta stock del local automáticamente y suma dinero al saldo acumulado de la sucursal.
                                <br />
                                2. <strong>Control:</strong> En esta sección, auditás esas ventas y contás el dinero físico real entregado por el encargado.
                                <br />
                                3. <strong>Cierre:</strong> Al liquidar una sucursal, confirmás el monto físico recibido, emitís el recibo PDF y <strong>el saldo a rendir de la sucursal se reinicia a cero ($0)</strong> para comenzar un nuevo ciclo.
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
                                {/* Resto del modal - continúa en el siguiente mensaje debido al límite de caracteres */}
                                {/* Por ahora, simplemente mostramos un placeholder */}
                                <p className="text-xs text-neutral-500">Modal content will be implemented...</p>
                            </div>
                        )}
                    </motion.div>
                </Modal>
            )}
            </AnimatePresence>
        </>
    );
};

export default TabLiquidar;
