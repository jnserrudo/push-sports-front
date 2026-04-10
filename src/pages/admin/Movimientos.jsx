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
        <div className="space-y-3 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-3 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className="text-brand-cyan" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">TRAZABILIDAD</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Movimientos <span className="text-brand-cyan">Stock</span>
                    </h2>
                    <p className="text-neutral-500 text-xs font-medium mt-1 m-0">
                        Entradas, salidas y asignaciones
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
                    {isSuperAdmin && (
                        <div className="w-full sm:w-auto flex items-center bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 rounded-lg px-3 py-2">
                            <Store size={12} className="text-brand-cyan mr-2" />
                            <select
                                value={globalFilterId}
                                onChange={(e) => setGlobalFilterId(e.target.value)}
                                className="bg-transparent text-black dark:text-white text-[9px] font-black uppercase tracking-wider outline-none cursor-pointer appearance-none flex-1 pr-4"
                            >
                                <option value="ALL">GLOBAL (TODAS)</option>
                                {sucursalesOptions.map(suc => (
                                    <option key={suc.id_comercio} value={suc.id_comercio}>
                                        {suc.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:bg-brand-cyan hover:text-black transition-colors px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                        ACTUALIZAR
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-3 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Sincronizando...</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
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
