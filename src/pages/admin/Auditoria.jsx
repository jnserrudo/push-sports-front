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
            case 'CREATE':  return 'bg-white text-black border-black';
            case 'UPDATE':  return 'bg-brand-cyan text-black border-brand-cyan';
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-black">
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
                    <span className="font-bold text-xs text-black uppercase tracking-widest">
                        {row.usuario?.nombre || 'SISTEMA'} {row.usuario?.apellido || ''}
                    </span>
                    <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">Firma Verificada</span>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert size={16} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">REGISTRO DE SEGURIDAD</span>
                        <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${isSuperAdmin ? 'bg-black text-white border-black' : 'bg-transparent text-black border-black'}`}>
                            {isSuperAdmin ? 'CORE' : 'SEDE'}
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl uppercase leading-none m-0 font-sport">
                        Auditoría <span className="text-brand-cyan">{isSuperAdmin ? 'Global.' : 'Local.'}</span>
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium mt-2 m-0">
                        {transacciones.length} registros cargados
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-neutral-100 text-black hover:bg-neutral-200 transition-colors px-4 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        ACTUALIZAR
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!transacciones.length}
                        className="flex items-center gap-2 bg-black text-white hover:bg-brand-cyan hover:text-black transition-colors px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-md disabled:opacity-40"
                    >
                        <Download size={14} /> EXPORTAR CSV
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Sincronizando Registros...</p>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
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