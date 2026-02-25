import React, { useState, useEffect } from 'react';
import { Activity, FileText, Search, Filter, Clock, ShieldAlert } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { auditoriaService } from '../../services/auditoriaService';
import { useAuthStore } from '../../store/authStore';

const Auditoria = () => {
    const { user, role, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    const [transacciones, setTransacciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        let data = await auditoriaService.getAll();
        
        // Simular filtrado por comercio si no es Super Admin
        if (!isSuperAdmin && sucursalId) {
            data = data.filter(t => t.id_comercio === sucursalId || t.descripcion.includes('Sede') || !t.id_comercio);
        }
        
        setTransacciones(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const getTypeColor = (tipo) => {
        switch(tipo) {
            case 'VENTA': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'ENVIO': return 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20';
            case 'LIQUIDACION': return 'bg-neutral-900 text-white border-neutral-800';
            default: return 'bg-neutral-50 text-neutral-400 border-neutral-100';
        }
    };

    const columns = [
        { header: 'ID Log', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-40">{String(row.id).split('-')[0]}...</span> },
        { 
            header: 'Operación', 
            accessor: 'tipo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getTypeColor(row.tipo)}`}>
                    {row.tipo}
                </div>
            )
        },
        { 
            header: 'Cronología', 
            accessor: 'fecha',
            render: (row) => (
                <div className="flex items-center gap-2 text-neutral-600">
                    <Clock size={14} className="opacity-40" />
                    <span className="text-[11px] font-bold tracking-tight">{new Date(row.fecha).toLocaleString()}</span>
                </div>
            )
        },
        { 
            header: 'Operador Responsable', 
            accessor: 'usuario',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-neutral-900 tracking-tight">{row.usuario}</span>
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest italic">Acción Verificada</span>
                </div>
            )
        },
        { 
            header: 'Descripción del Evento', 
            accessor: 'descripcion',
            render: (row) => <span className="text-[11px] font-medium text-neutral-500 leading-relaxed uppercase tracking-tight">{row.descripcion}</span>
        },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-100 pb-10 gap-6">
                 <div>
                    <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">REGISTRO DE SEGURIDAD</span>
                         <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSuperAdmin ? 'bg-neutral-900 text-white' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'}`}>
                             {isSuperAdmin ? 'Consola Central' : 'Vista de Sede'}
                         </div>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight mt-4 text-neutral-900">
                        Auditoría {isSuperAdmin ? 'Global' : 'Local'}
                    </h2>
                 </div>
                 
                 <button className="bg-neutral-900 text-white hover:bg-black hover:scale-105 transition-all px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-xl shadow-neutral-900/10">
                    <FileText size={20} className="text-brand-cyan" /> Exportar Auditoría (.csv)
                 </button>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="w-12 h-12 border-4 border-neutral-100 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">Recuperando Registros...</p>
                </div>
            ) : (
                <div className="card-premium overflow-hidden">
                    <DataTable 
                        data={transacciones}
                        columns={columns}
                        searchPlaceholder="Filtrar por usuario, acción o descripción..."
                        variant="minimal"
                    />
                </div>
            )}
        </div>
    );
};

export default Auditoria;
