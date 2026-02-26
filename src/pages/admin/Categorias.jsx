import React from 'react';
import { Layout } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { categoriasService as service } from '../../services/genericServices';

const Categorias = () => {
    const columns = [
        {
            header: 'ID',
            accessor: 'id_categoria',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">#{row.id_categoria}</span>
            )
        },
        {
            header: 'Nombre de Categoría',
            accessor: 'nombre',
            render: (row) => (
                <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre de la Categoría', required: true },
    ];

    return (
        <GenericABM
            title="Categorías Master"
            icon={Layout}
            service={service}
            columns={columns}
            formFields={formFields}
            idField="id_categoria"
        />
    );
};

export default Categorias;