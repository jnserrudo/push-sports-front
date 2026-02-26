import React from 'react';
import { Truck } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { proveedoresService as service } from '../../services/genericServices';

const Proveedores = () => {
    const columns = [
        {
            header: 'ID',
            accessor: 'id_proveedor',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_proveedor).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Razón Social / Proveedor',
            accessor: 'nombre_proveedor',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre_proveedor}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        {row.razon_social || row.cuit || 'SIN DATOS FISCALES'}
                    </span>
                </div>
            )
        },
        {
            header: 'Contacto',
            accessor: 'telefono',
            render: (row) => (
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                    {row.telefono || 'Sin teléfono'}
                </span>
            )
        },
        {
            header: 'Estado Comercial',
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    row.activo
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                }`}>
                    {row.activo ? 'Activo' : 'Suspendido'}
                </div>
            )
        },
    ];

    return (
        <GenericABM
            title="Logística y Proveedores"
            icon={Truck}
            service={service}
            columns={columns}
            formFields={[
                { name: 'nombre_proveedor', label: 'Nombre del Proveedor', required: true  },
                { name: 'razon_social',     label: 'Razón Social',         required: false },
                { name: 'cuit',             label: 'CUIT',                 required: false },
                { name: 'telefono',         label: 'Teléfono de Contacto', required: false },
            ]}
            idField="id_proveedor"
        />
    );
};

export default Proveedores;