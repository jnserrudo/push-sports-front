import React, { useState, useEffect } from 'react';
import { History, Search, FileText } from 'lucide-react';
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
            case 'VENTA': return 'bg-black text-white';
            case 'ENVIO': return 'bg-neutral-600 text-white';
            case 'LIQUIDACION': return 'bg-white border text-black border-black';
            default: return 'bg-neutral-200 text-black';
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Tipo', 
            accessor: 'tipo',
            render: (row) => (
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getTypeColor(row.tipo)}`}>
                    {row.tipo}
                </span>
            )
        },
        { 
            header: 'Fecha y Hora', 
            accessor: 'fecha',
            render: (row) => <span className="font-mono text-sm">{new Date(row.fecha).toLocaleString()}</span>
        },
        { 
            header: 'Usuario', 
            accessor: 'usuario',
            render: (row) => <span className="font-bold">{row.usuario}</span>
        },
        { 
            header: 'Detalle', 
            accessor: 'descripcion',
            render: (row) => <span className="text-neutral-600">{row.descripcion}</span>
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4 text-black">
                <div className="flex items-center gap-3">
                    <History size={32} />
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                        Auditoría de Sistema
                    </h2>
                </div>
                <button className="flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    <FileText size={16} /> Exportar CSV
                </button>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12 font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
                    CARGANDO REGISTROS DE SISTEMA...
                </div>
            ) : (
                <DataTable 
                    data={transacciones}
                    columns={columns}
                    searchPlaceholder="Buscar por usuario, detalle o tipo..."
                />
            )}
        </div>
    );
};

export default Auditoria;
