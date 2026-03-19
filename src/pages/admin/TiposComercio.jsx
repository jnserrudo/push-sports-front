import React from 'react';
import { Tag } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { tipoComercioService as service } from '../../services/tipoComercioService';

const TiposComercio = () => {
    const columns = [
        { header: 'ID', accessor: 'id_tipo_comercio', className: 'w-16 hidden md:table-cell' },
        { 
            header: 'Tipo de Negocio', 
            accessor: 'nombre',
            render: (row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20">
                        <Tag size={16} className="text-brand-cyan hidden md:block" />
                        <Tag size={14} className="text-brand-cyan md:hidden" />
                    </div>
                    <div>
                        <span className="font-bold text-xs md:text-sm text-black tracking-widest uppercase">
                            {row.nombre}
                        </span>
                    </div>
                </div>
            )
        },
        { header: 'Descripción', accessor: 'descripcion', className: 'hidden md:table-cell' }
    ];

    const formFields = [
        { 
            name: 'nombre', 
            label: 'Nombre del Tipo *', 
            type: 'text', 
            required: true 
        },
        { 
            name: 'descripcion', 
            label: 'Descripción Breve', 
            type: 'text', 
            required: false 
        }
    ];

    return (
        <GenericABM
            title="Tipos de Sedes"
            description="Clasificación operativa de los puntos de venta (Ej: Franquicia, Local Propio, Mayorista). Define las reglas de negocio base de cada sucursal."
            icon={Tag}
            service={service}
            columns={columns}
            formFields={formFields}
            idField="id_tipo_comercio"
        />
    );
};

export default TiposComercio;
