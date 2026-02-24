import React from 'react';
import { Award } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { marcasService } from '../../services/genericServices';

const Marcas = () => {
    const columns = [
        { header: 'ID Marca', accessor: 'id_marca' },
        { 
            header: 'Nombre', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold">{row.nombre}</span>
        },
        { header: 'Descripción', accessor: 'descripcion' },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${row.activo ? 'bg-black' : 'bg-neutral-400'}`}>
                    {row.activo ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre de la Marca', required: true },
        { name: 'descripcion', label: 'Descripción', required: false }
    ];

    return (
        <GenericABM 
            title="Marcas de Productos"
            icon={Award}
            service={marcasService}
            columns={columns}
            formFields={formFields}
            idField="id_marca"
        />
    );
};

export default Marcas;
