import React from 'react';
import { Truck } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { proveedoresService } from '../../services/genericServices';

const Proveedores = () => {
    const columns = [
        { header: 'ID Proveedor', accessor: 'id_proveedor' },
        { 
            header: 'Razón Social', 
            accessor: 'razon_social',
            render: (row) => <span className="font-bold">{row.razon_social}</span>
        },
        { header: 'CUIT', accessor: 'cuit' },
        { header: 'Teléfono', accessor: 'telefono' },
        { header: 'Email', accessor: 'email' },
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
        { name: 'razon_social', label: 'Razón Social / Nombre', required: true },
        { name: 'cuit', label: 'CUIT', required: true },
        { name: 'telefono', label: 'Teléfono', required: true },
        { name: 'email', label: 'Correo Electrónico', required: false, type: 'email' },
        { name: 'direccion', label: 'Dirección Comercial', required: false }
    ];

    return (
        <GenericABM 
            title="Gestión de Proveedores"
            icon={Truck}
            service={proveedoresService}
            columns={columns}
            formFields={formFields}
            idField="id_proveedor"
        />
    );
};

export default Proveedores;
