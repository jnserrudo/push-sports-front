import React from 'react';
import { Tag } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { ofertasService } from '../../services/genericServices';

const Ofertas = () => {
    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Nombre de la Oferta', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold">{row.nombre}</span>
        },
        { 
            header: 'Nuevo Precio', 
            accessor: 'precio_oferta',
            render: (row) => <span className="text-red-600 font-black">${row.precio_oferta}</span>
        },
        { 
            header: 'Válido Hasta', 
            accessor: 'fecha_fin',
            render: (row) => new Date(row.fecha_fin).toLocaleDateString()
        },
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
        { name: 'nombre', label: 'Nombre o Motivo (Ej: Hot Sale)', required: true },
        { name: 'producto_id', label: 'ID de Producto (a aplicar)', required: true },
        { name: 'precio_oferta', label: 'Precio Rebajado ($)', required: true, type: 'number' },
        { name: 'fecha_fin', label: 'Fecha Límite', required: true, type: 'date' }
    ];

    return (
        <GenericABM 
            title="Ofertas Diarias"
            icon={Tag}
            service={ofertasService}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Ofertas;
