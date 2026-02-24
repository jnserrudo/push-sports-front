import React from 'react';
import { Truck } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { proveedoresService as service } from '../../services/genericServices';

const Proveedores = () => {
    const columns = [
        { header: 'ID', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id}</span> },
        { 
            header: 'Suministrador / Razón Social', 
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-neutral-900 uppercase tracking-tight">{row.nombre}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{row.email || 'Sin Contacto'}</span>
                </div>
            )
        },
        { 
            header: 'Estado Logístico', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Proveedor Activo' : 'Suspendido'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Razón Social / Nombre', required: true },
        { name: 'email', label: 'Email de contacto', required: false },
    ];

    return (
        <GenericABM 
            title="Proveedores y Logística"
            icon={Truck}
            service={service}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Proveedores;
