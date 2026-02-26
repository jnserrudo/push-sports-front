import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Settings2, Info, CheckCircle2, Clock, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { liquidacionesService } from '../../services/liquidacionesService';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

const Liquidaciones = () => {
    const { role, sucursalId, user } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;

    const [sucursales, setSucursales] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let sucs = await sucursalesService.getAll();
            if (!isSuperAdmin) {
                sucs = sucs.filter(s => s.id_comercio === sucursalId || s.id === sucursalId); // Adaptado si tu DB usa id o id_comercio
            }
            setSucursales(sucs);

            const hist = await liquidacionesService.getHistorial(!isSuperAdmin ? sucursalId : null);
            setHistorial(hist);
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
            const netoPagado = selectedSucursal.saldo_acumulado_mili || selectedSucursal.saldo_pendiente; // Adaptado según tu modelo
            const comision = selectedSucursal.comision_porcentaje || 0; // Ajusta si la comisión viene de otro lado
            const totalVendido = netoPagado / (1 - (comision / 100));

            // Si el backend espera el ID de sucursal
            const sucId = selectedSucursal.id_comercio || selectedSucursal.id;

            await liquidacionesService.liquidarSucursal(
                sucId, 
                totalVendido, 
                comision, 
                netoPagado
            );
            
            await sucursalesService.update(sucId, { saldo_pendiente: 0, saldo_acumulado_mili: 0 });

            setIsConfirmOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Funciones Helper para normalizar propiedades de tu DB
    const getSaldo = (suc) => suc.saldo_acumulado_mili ?? suc.saldo_pendiente ?? 0;
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
    ];

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Técnico */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-6">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                         <ShieldCheck size={16} className="text-brand-cyan" variant="Bold" />
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
                    <Wallet size={20} className="text-brand-cyan" />
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
                            {sucursales.map(suc => {
                                const saldo = getSaldo(suc);
                                const hasDebt = saldo > 0;

                                return (
                                <div key={getId(suc)} className={`bg-white border ${hasDebt ? 'border-neutral-200 hover:border-black' : 'border-neutral-100'} p-6 rounded-xl flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-sm relative overflow-hidden group`}>
                                    
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
                                                {saldo.toLocaleString()}
                                            </p>
                                        </div>
                                        
                                        {hasDebt && (
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-2">
                                                Responsabilidad: Central
                                            </p>
                                        )}
                                    </div>
                                    
                                    {isSuperAdmin && hasDebt ? (
                                        <button 
                                            onClick={() => handleLiquidarClick(suc)}
                                            className="w-full mt-6 bg-black text-white py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center gap-2"
                                        >
                                            LIQUIDAR SALDO <CheckCircle2 size={14} />
                                        </button>
                                    ) : (
                                        <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasDebt ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${hasDebt ? 'text-amber-500' : 'text-green-500'}`}>
                                                {!hasDebt ? 'CUENTA SALDADA (OK)' : 'ESPERANDO COBRO CENTRAL'}
                                            </span>
                                        </div>
                                    )}
                                </div>
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
            <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Autorizar Arqueo">
                <div className="space-y-6 p-2">
                    
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3">
                        <AlertCircle size={18} className="text-black shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                            Confirme la <span className="text-black font-black">recepción del monto</span>. Al autorizar, el saldo de la sede volverá a CERO y se emitirá el log de auditoría.
                        </p>
                    </div>
                    
                    <div className="bg-black p-6 rounded-xl border border-neutral-800">
                        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                            <span>Monto Total a Conciliar:</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.3em]">NETO A INGRESAR:</span>
                            <div className="flex items-baseline gap-1 text-white">
                                <span className="text-sm font-bold">$</span>
                                <span className="text-5xl font-sport leading-none">
                                    {selectedSucursal ? getSaldo(selectedSucursal).toLocaleString() : '0'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button 
                            onClick={confirmLiquidacion}
                            disabled={isProcessing}
                            className="w-full bg-brand-cyan text-black py-4 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-colors"
                        >
                            {isProcessing ? 'AUTORIZANDO...' : <><CreditCard size={18} /> CONFIRMAR INGRESO</>}
                        </button>
                        <button 
                            onClick={() => setIsConfirmOpen(false)}
                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                        >
                            CANCELAR OPERACIÓN
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Liquidaciones;