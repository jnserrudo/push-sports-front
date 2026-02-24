import React from 'react';
import { Category } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { categoriasService as service } from '../../services/genericServices';

const Categorias = () => {
    const columns = [
        { header: 'ID', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id}</span> },
        { 
            header: 'Nombre de Categoría', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold text-sm text-neutral-900 uppercase tracking-tight">{row.nombre}</span>
        },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Vigente' : 'Inactiva'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre de la Categoría', required: true },
    ];

    return (
        <GenericABM 
            title="Categorías de Productos"
            icon={Category}
            service={service}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Categorias;
