import React, { useState, useEffect, useCallback } from 'react';
import { Activity, ArrowUpRight, ArrowDownLeft, RefreshCw, Filter, List, Search, Clock, Box, User, Store } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { enviosService } from '../../services/enviosService';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';

const Movimientos = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    
    const [movimientos, setMovimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sucursalesOptions, setSucursalesOptions] = useState([]);
    const [globalFilterId, setGlobalFilterId] = useState('ALL');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isSuperAdmin && sucursalesOptions.length === 0) {
                 const sucs = await sucursalesService.getAll().catch(()=>[]);
                 setSucursalesOptions(sucs);
            }

            // Determine which ID to send to the service
            const targetId = isSuperAdmin ? (globalFilterId === 'ALL' ? null : globalFilterId) : sucursalId;
            
            // enviosService ahora acepta targetId para filtrar desde el Backend
            const data = await enviosService.getAll(targetId);
            setMovimientos(data);
        } catch (err) {
            console.error('Error cargando movimientos:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isSuperAdmin, sucursalId, globalFilterId, sucursalesOptions.length]);

    useEffect(() => { loadData(); }, [loadData]);

    const getTipoIcon = (tipo) => {
        const t = tipo?.toUpperCase();
        if (t?.includes('INGRESO') || t?.includes('COMPRA')) return <ArrowDownLeft size={14} className="text-green-500" />;
        if (t?.includes('EGRESO') || t?.includes('VENTA')) return <ArrowUpRight size={14} className="text-red-500" />;
        return <Activity size={14} className="text-brand-cyan" />;
    };

    const columns = [
        {
            header: 'ID Mov',
            accessor: 'id',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Cronología',
            accessor: 'fecha',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-neutral-400" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">
                        {row.fecha ? new Date(row.fecha).toLocaleString() : '—'}
                    </span>
                </div>
            )
        },
        {
            header: 'Operación',
            accessor: 'tipo',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center">
                        {getTipoIcon(row.tipo)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">
                        {row.tipo}
                    </span>
                </div>
            )
        },
        {
            header: 'Sede / Punto',
            accessor: 'sucursal_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Store size={12} className="text-brand-cyan" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">
                        {row.sucursal_nombre}
                    </span>
                </div>
            )
        },
        {
            header: 'Ítem / Producto',
            accessor: 'producto_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Box size={12} className="text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest leading-none">
                        {row.producto_nombre}
                    </span>
                </div>
            )
        },
        {
            header: 'Cantidad',
            accessor: 'cantidad',
            render: (row) => (
                <div className={`px-2 py-1 rounded-md text-[11px] font-sport text-center border ${
                    row.cantidad > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                    {row.cantidad > 0 ? '+' : ''}{row.cantidad}
                </div>
            )
        },
        {
            header: 'Operador',
            accessor: 'usuario',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <User size={12} className="text-neutral-400" />
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                        {row.usuario}
                    </span>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Activity size={16} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">TRAZABILIDAD DE STOCK</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl uppercase leading-none m-0 font-sport text-black">
                        Movimientos de <span className="text-brand-cyan">Stock.</span>
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium mt-2 m-0">
                        Historial completo de entradas, salidas y transferencias
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                    {isSuperAdmin && (
                        <div className="w-full sm:w-auto flex items-center bg-white border border-neutral-200 rounded-lg px-4 py-3 md:py-2">
                            <Store size={14} className="text-brand-cyan mr-3" />
                            <select
                                value={globalFilterId}
                                onChange={(e) => setGlobalFilterId(e.target.value)}
                                className="bg-transparent text-black text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none flex-1 pr-6"
                            >
                                <option value="ALL">KARDEX GLOBAL (TODAS LAS SEDES)</option>
                                {sucursalesOptions.map(suc => (
                                    <option key={suc.id_sucursal || suc.id_comercio} value={suc.id_sucursal || suc.id_comercio}>
                                        {suc.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-brand-cyan hover:text-black transition-colors px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        ACTUALIZAR
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Sincronizando Historial...</p>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                    <DataTable
                        data={movimientos}
                        columns={columns}
                        searchPlaceholder="Filtrar por producto, sede o tipo..."
                        variant="minimal"
                    />
                </div>
            )}
        </div>
    );
};

export default Movimientos;
