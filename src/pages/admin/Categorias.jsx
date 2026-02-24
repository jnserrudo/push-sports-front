import React from 'react';
import { Tags } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { categoriasService } from '../../services/genericServices';

const Categorias = () => {
    const columns = [
        { header: 'ID Categoría', accessor: 'id_categoria' },
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
        { name: 'nombre', label: 'Nombre de la Categoría', required: true },
        { name: 'descripcion', label: 'Descripción', required: false }
    ];

    return (
        <GenericABM 
            title="Categorías de Productos"
            icon={Tags}
            service={categoriasService}
            columns={columns}
            formFields={formFields}
            idField="id_categoria"
        />
    );
};

export default Categorias;
