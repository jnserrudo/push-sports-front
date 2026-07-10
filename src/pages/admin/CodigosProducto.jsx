import React from 'react';
import { Tag } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { codigosProductoService as service } from '../../services/genericServices';

const CodigosProducto = () => {
    const columns = [
        {
            header: 'Código',
            accessor: 'codigo',
            render: (row) => (
                <span className="font-bold text-sm text-black dark:text-white uppercase tracking-widest">{row.codigo}</span>
            )
        },
        {
            header: 'Descripción',
            accessor: 'descripcion',
            render: (row) => (
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{row.descripcion || '-'}</span>
            )
        },
    ];

    const formFields = [
        { name: 'codigo', label: 'Código del Producto', required: true },
        { name: 'descripcion', label: 'Descripción', required: false, type: 'textarea' },
    ];

    return (
        <GenericABM
            title="Códigos de Producto"
            description="Administra los códigos de producto para utilizarlos en los reportes y listados."
            icon={Tag}
            service={service}
            columns={columns}
            formFields={formFields}
            idField="id_codigo"
        />
    );
};

export default CodigosProducto;
