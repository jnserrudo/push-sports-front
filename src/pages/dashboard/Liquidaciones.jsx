import React, { useState, useEffect } from 'react';
import { WalletCheck, CardPos, Setting2, InfoCircle, TickCircle, Clock, MoneySend } from 'iconsax-react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { liquidacionesService } from '../../services/liquidacionesService';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

const Liquidaciones = () => {
    const { role, sucursalId } = useAuthStore();
    const isSuperAdmin = role === 'SUPER_ADMIN';

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
                sucs = sucs.filter(s => s.id === sucursalId);
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
            const netoPagado = selectedSucursal.saldo_pendiente;
            const comision = selectedSucursal.comision_porcentaje;
            const totalVendido = netoPagado / (1 - (comision / 100));

            await liquidacionesService.liquidarSucursal(
                selectedSucursal.id, 
                totalVendido, 
                comision, 
                netoPagado
            );
            
            await sucursalesService.update(selectedSucursal.id, { saldo_pendiente: 0 });

            setIsConfirmOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const columnsHistorial = [
        { header: 'ID Liq', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id.split('-')[0]}...</span> },
        { 
            header: 'Sede Liquidada', 
            accessor: 'sucursal_nombre',
            render: (row) => <span className="font-bold text-xs text-neutral-900 uppercase tracking-tight">{row.sucursal_nombre}</span>
        },
        { 
            header: 'Cronología', 
            accessor: 'fecha',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-neutral-300" />
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{new Date(row.fecha).toLocaleDateString()}</span>
                </div>
            )
        },
        { 
            header: 'Volumen Bruto', 
            render: (row) => <span className="text-sm font-medium text-neutral-600">${Math.round(row.total_vendido).toLocaleString()}</span>
        },
        { 
            header: 'Deducción (%)', 
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-400">-${Math.round(row.monto_comision).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-brand-cyan tracking-widest">({row.comision_porcentaje}%)</span>
                </div>
            )
        },
        { 
            header: 'Neto Recibido', 
            render: (row) => (
                <div className="inline-flex px-3 py-1 bg-neutral-900 text-white rounded-xl font-bold text-xs shadow-lg">
                    ${Math.round(row.neto_pagado).toLocaleString()}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-100 pb-10 gap-6">
                 <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">ADMINISTRACIÓN FINANCIERA</span>
                    <h2 className="text-4xl font-bold tracking-tight mt-2 text-neutral-900">
                        Cierre de Liquidaciones
                    </h2>
                 </div>
                 
                 <div className="p-4 bg-white border border-neutral-100 rounded-2xl flex items-center gap-4">
                    <WalletCheck size={24} className="text-brand-cyan" variant="Bold" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Estado de Tesorería</span>
                        <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest">Auditado y Verificado</span>
                    </div>
                 </div>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="w-12 h-12 border-4 border-neutral-100 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">Recuperando Saldos...</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <MoneySend size={20} className="text-neutral-900" variant="Bold" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-900">Arqueos Pendientes de Cobro</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sucursales.map(suc => (
                                <div key={suc.id} className="card-premium p-8 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-56">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{suc.nombre}</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                        </div>
                                        <div>
                                            <p className="text-4xl font-bold tracking-tighter text-neutral-900">
                                                ${suc.saldo_pendiente.toLocaleString()}
                                            </p>
                                            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-2 leading-relaxed">
                                                Responsabilidad: Central / Sede <br/> Proceso de conciliación pendiente
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isSuperAdmin && suc.saldo_pendiente > 0 ? (
                                        <button 
                                            onClick={() => handleLiquidarClick(suc)}
                                            className="w-full mt-6 bg-neutral-900 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group"
                                        >
                                            LIQUIDAR SALDO <TickCircle size={16} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    ) : (
                                        <div className="mt-6 pt-4 border-t border-neutral-50 flex items-center justify-center">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-500">
                                                {suc.saldo_pendiente === 0 ? '✓ CUENTA SALDADA' : 'ESPERANDO COBRO'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-12 space-y-6">
                        <div className="flex items-center gap-3">
                            <Setting2 size={20} className="text-neutral-900" variant="Bold" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-900">Historial Consolidado</h3>
                        </div>
                        <div className="card-premium overflow-hidden">
                            <DataTable 
                                data={historial}
                                columns={columnsHistorial}
                                searchPlaceholder="Filtrar liquidaciones..."
                                variant="minimal"
                            />
                        </div>
                    </div>
                </>
            )}

            <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Autorizar Liquidación">
                <div className="space-y-8 p-1">
                    <div className="p-6 bg-brand-cyan/5 rounded-[2rem] border border-brand-cyan/10 flex items-start gap-4">
                        <InfoCircle size={20} className="text-brand-cyan mt-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed">
                            Confirme la <span className="text-neutral-900">recepción física o digital</span> del monto detallado. Al autorizar, el saldo de la sucursal volverá a cero y se emitirá un log de auditoría.
                        </p>
                    </div>
                    
                    <div className="bg-neutral-50 p-8 rounded-[2rem] space-y-6">
                        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <span>Monto Conciliado:</span>
                            <span className="text-neutral-900 text-base">${selectedSucursal?.saldo_pendiente.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-neutral-200"></div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-[0.3em]">NETO A RECIBIR:</span>
                            <span className="text-4xl font-bold tracking-tighter text-neutral-900">${selectedSucursal?.saldo_pendiente.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={confirmLiquidacion}
                            disabled={isProcessing}
                            className="w-full btn-cyan py-5 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                        >
                            {isProcessing ? 'AUTORIZANDO...' : <><CardPos size={20} variant="Bold" /> CONFIRMAR INGRESO DE CAJA</>}
                        </button>
                        <button 
                            onClick={() => setIsConfirmOpen(false)}
                            className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors"
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
