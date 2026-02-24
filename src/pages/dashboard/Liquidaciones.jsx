import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
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
    
    // Liquidar Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Si es superadmin ve todas las sucursales, si no, solo la suya
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
            // Calculo inverso para deducir total_vendido si sabemos saldo_pendiente y comision
            // saldo_pendiente = total - comision -> neto_a_pagar
            const netoPagado = selectedSucursal.saldo_pendiente;
            const comision = selectedSucursal.comision_porcentaje;
            const totalVendido = netoPagado / (1 - (comision / 100));

            await liquidacionesService.liquidarSucursal(
                selectedSucursal.id, 
                totalVendido, 
                comision, 
                netoPagado
            );
            
            // Simular actualizar sucursal a saldo 0
            await sucursalesService.update(selectedSucursal.id, { saldo_pendiente: 0 });

            setIsConfirmOpen(false);
            loadData();
            alert("Liquidación registrada con éxito");
        } catch (error) {
            alert("Error al liquidar");
        } finally {
            setIsProcessing(false);
        }
    };

    const columnsHistorial = [
        { header: 'ID Liq', accessor: 'id' },
        { header: 'Sucursal', accessor: 'sucursal_nombre' },
        { 
            header: 'Fecha', 
            accessor: 'fecha',
            render: (row) => new Date(row.fecha).toLocaleDateString()
        },
        { 
            header: 'Monto Total', 
            accessor: 'total_vendido',
            render: (row) => `$${Math.round(row.total_vendido).toLocaleString()}`
        },
        { 
            header: 'Comisión Local', 
            accessor: 'monto_comision',
            render: (row) => <span className="text-neutral-500">${Math.round(row.monto_comision).toLocaleString()} ({row.comision_porcentaje}%)</span>
        },
        { 
            header: 'Neto Pagado', 
            accessor: 'neto_pagado',
            render: (row) => <span className="font-black text-black">${Math.round(row.neto_pagado).toLocaleString()}</span>
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-black">
                <CreditCard size={32} />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    Liquidaciones
                </h2>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12 font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
                    CARGANDO DATOS...
                </div>
            ) : (
                <>
                    {/* PANELS PENDIENTES */}
                    <div className="mb-8">
                        <h3 className="text-lg font-black uppercase mb-4 tracking-wider">Saldos Pendientes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {sucursales.map(suc => (
                                <div key={suc.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-48">
                                    <div>
                                        <h4 className="font-bold uppercase tracking-widest bg-black text-white inline-block px-2 py-1 text-xs mb-2">
                                            {suc.nombre}
                                        </h4>
                                        <p className="text-4xl font-black tracking-tighter italic text-black">
                                            ${suc.saldo_pendiente.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-neutral-500 font-bold uppercase mt-1">A rendir a Push Central</p>
                                    </div>
                                    
                                    {isSuperAdmin && suc.saldo_pendiente > 0 && (
                                        <div className="flex justify-end mt-4 border-t-2 border-dashed border-neutral-300 pt-4">
                                            <button 
                                                onClick={() => handleLiquidarClick(suc)}
                                                className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex flex-row items-center gap-2"
                                            >
                                                Liquidar Ahora
                                            </button>
                                        </div>
                                    )}
                                    {(!isSuperAdmin || suc.saldo_pendiente === 0) && (
                                        <div className="mt-4 border-t-2 border-dashed border-neutral-300 pt-4 text-right">
                                            <span className="text-xs font-bold uppercase text-neutral-400">
                                                {suc.saldo_pendiente === 0 ? 'Al día' : 'Pendiente de cobro'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HISTORIAL */}
                    <div>
                        <h3 className="text-lg font-black uppercase mb-4 tracking-wider border-t-4 border-black pt-8">Historial de Liquidaciones</h3>
                        <DataTable 
                            data={historial}
                            columns={columnsHistorial}
                            searchPlaceholder="Buscar liquidación..."
                        />
                    </div>
                </>
            )}

            {/* CONFIRMAR LIQUIDACION MODAL */}
            {selectedSucursal && (
                <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirmar Liquidación">
                    <div className="space-y-6">
                        <p className="font-bold text-sm uppercase text-neutral-600">
                            Estás a punto de confirmar la recepción del dinero por las ventas de <span className="text-black">{selectedSucursal.nombre}</span>.
                        </p>
                        
                        <div className="bg-neutral-100 p-6 border-2 border-black space-y-3 font-mono">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Saldo Pendiente Neto:</span>
                                <span className="font-bold">${selectedSucursal.saldo_pendiente.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Comisión Local Deductida:</span>
                                <span>{selectedSucursal.comision_porcentaje}%</span>
                            </div>
                            <div className="border-t-2 border-black pt-3 mt-3 flex justify-between">
                                <span className="font-black uppercase tracking-wider">A RECIBIR:</span>
                                <span className="font-black text-xl italic">${selectedSucursal.saldo_pendiente.toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={confirmLiquidacion}
                            disabled={isProcessing}
                            className="w-full bg-black text-white font-black uppercase tracking-widest py-4 mt-6 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 border-2 border-black"
                        >
                            {isProcessing ? 'Procesando...' : <><CheckCircle2 size={18} /> Confirmar Ingreso Completo</>}
                        </button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default Liquidaciones;
