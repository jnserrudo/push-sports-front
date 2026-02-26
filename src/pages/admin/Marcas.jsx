import React from 'react';
import { Tag } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { marcasService as service } from '../../services/genericServices';

const Marcas = () => {
    const columns = [
        {
            header: 'ID',
            accessor: 'id_marca',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">#{row.id_marca}</span>
            )
        },
        {
            header: 'Marca / Partner',
            accessor: 'nombre_marca',
            render: (row) => (
                <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre_marca}</span>
            )
        },
    ];

    return (
        <GenericABM
            title="Directorio de Marcas"
            icon={Tag}
            service={service}
            columns={columns}
            formFields={[{ name: 'nombre_marca', label: 'Nombre de la Marca', required: true }]}
            idField="id_marca"
        />
    );
};

export default Marcas;