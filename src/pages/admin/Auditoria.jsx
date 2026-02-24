import React, { useState, useEffect } from 'react';
import { Activity, DocumentText, SearchNormal1, FilterSearch, Clock } from 'iconsax-react';
import DataTable from '../../components/ui/DataTable';
import { auditoriaService } from '../../services/auditoriaService';

const Auditoria = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const data = await auditoriaService.getAll();
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
        { header: 'ID Log', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-40">{row.id.split('-')[0]}...</span> },
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">REGISTRO DE SEGURIDAD</span>
                    <h2 className="text-4xl font-bold tracking-tight mt-2 text-neutral-900">
                        Auditoría Transaccional
                    </h2>
                 </div>
                 
                 <button className="bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <DocumentText size={18} /> Exportar Auditoría (.csv)
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
