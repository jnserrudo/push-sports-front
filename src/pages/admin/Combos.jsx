import React from 'react';
import { PackageSearch } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { combosService } from '../../services/genericServices';

const Combos = () => {
    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Nombre del Combo', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold">{row.nombre}</span>
        },
        { 
            header: 'Precio Final', 
            accessor: 'precio_final',
            render: (row) => <span className="text-green-600 font-black">${row.precio_final}</span>
        },
         { header: 'Descripción', accessor: 'descripcion' },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${row.activo ? 'bg-black' : 'bg-neutral-400'}`}>
                    {row.activo ? 'Vigente' : 'Inactivo'}
                </span>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre del Combo', required: true },
        { name: 'descripcion', label: 'Descripción Breve (Ej: Whey + Creatina)', required: false },
        { name: 'precio_final', label: 'Precio Final de Venta ($)', required: true, type: 'number' },
    ];

    return (
        <GenericABM 
            title="Armado de Combos"
            icon={PackageSearch}
            service={combosService}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Combos;
