import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, ShieldAlert, RefreshCw, Download } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { auditoriaService } from '../../services/auditoriaService';
import { useAuthStore } from '../../store/authStore';

const Auditoria = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    const [transacciones, setTransacciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            let data = await auditoriaService.getAll();
            if (!isSuperAdmin && sucursalId) {
                data = data.filter(t =>
                    t.id_comercio === sucursalId ||
                    t.descripcion?.includes('Sede') ||
                    !t.id_comercio
                );
            }
            setTransacciones(data);
        } catch (err) {
            console.error('Error cargando auditoría:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isSuperAdmin, sucursalId]);

    useEffect(() => { loadData(); }, [loadData]);

    // Export a CSV real
    const handleExport = () => {
        if (!transacciones.length) return;
        const headers = ['ID', 'Accion', 'Entidad', 'Fecha', 'Usuario'];
        const rows = transacciones.map(t => [
            t.id_auditoria,
            t.accion || '',
            t.entidad_afectada || '',
            t.fecha_hora ? new Date(t.fecha_hora).toLocaleString() : '',
            t.usuario?.nombre || 'Sistema',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_pushsport_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getTypeColor = (accion) => {
        switch (accion) {
            case 'CREATE':  return 'bg-white text-black dark:text-white border-black';
            case 'UPDATE':  return 'bg-brand-cyan text-black dark:text-white border-brand-cyan';
            case 'DELETE':  return 'bg-black text-white border-black';
            default:        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
        }
    };

    const columns = [
        {
            header: 'ID Log',
            accessor: 'id_auditoria',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_auditoria).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Operación',
            accessor: 'accion',
            render: (row) => (
                <div className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getTypeColor(row.accion)}`}>
                    {row.accion || 'SISTEMA'}
                </div>
            )
        },
        {
            header: 'Entidad',
            accessor: 'entidad_afectada',
            render: (row) => (
                <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                    {row.entidad_afectada || '—'}
                </span>
            )
        },
        {
            header: 'Cronología',
            accessor: 'fecha_hora',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-brand-cyan" strokeWidth={3} />
                    <span className="text-[11px] font-bold tracking-widest uppercase">
                        {row.fecha_hora ? new Date(row.fecha_hora).toLocaleString() : '—'}
                    </span>
                </div>
            )
        },
        {
            header: 'Operador / Autoría',
            accessor: 'usuario',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-black dark:text-white uppercase tracking-widest">
                        {row.usuario?.nombre || 'SISTEMA'} {row.usuario?.apellido || ''}
                    </span>
                    <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">Firma Verificada</span>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-3 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-3 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={12} className="text-brand-cyan" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">SEGURIDAD</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Auditoría <span className="text-brand-cyan">{isSuperAdmin ? 'Global' : 'Local'}</span>
                    </h2>
                    <p className="text-neutral-500 text-xs font-medium mt-1 m-0">
                        {transacciones.length} registros
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 bg-neutral-100 dark:bg-gray-700 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-gray-600 transition-colors px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                        ACTUALIZAR
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!transacciones.length}
                        className="flex items-center gap-1.5 bg-black text-white hover:bg-brand-cyan hover:text-black dark:text-white transition-colors px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm disabled:opacity-40"
                    >
                        <Download size={12} /> EXPORTAR
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
                        data={transacciones}
                        columns={columns}
                        searchPlaceholder="Buscar ID, Operador o Evento..."
                        variant="minimal"
                    />
                </div>
            )}
        </div>
    );
};

export default Auditoria;