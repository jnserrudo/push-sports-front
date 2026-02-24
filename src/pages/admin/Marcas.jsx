import React from 'react';
import { Tag } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { marcasService as service } from '../../services/genericServices';

const Marcas = () => {
    const columns = [
        { header: 'ID', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id}</span> },
        { 
            header: 'Nombre de Marca / Partner', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold text-sm text-neutral-900 uppercase tracking-tight">{row.nombre}</span>
        },
        { 
            header: 'Estado Alianza', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Colaborador Activo' : 'Finalizado'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre de la Marca', required: true },
    ];

    return (
        <GenericABM 
            title="Marcas y Partners"
            icon={Tag}
            service={service}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Marcas;
