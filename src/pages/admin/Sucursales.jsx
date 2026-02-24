import React from 'react';
import { Shop } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { sucursalesService as service } from '../../services/sucursalesService';

const Sucursales = () => {
    const columns = [
        { header: 'ID', accessor: 'id_comercio', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id_comercio.split('-')[0]}...</span> },
        { 
            header: 'Nombre del Local', 
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-neutral-900">{row.nombre}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{row.direccion}</span>
                </div>
            )
        },
        { 
            header: 'Contacto', 
            accessor: 'telefono',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-neutral-600">{row.telefono || 'Sin Teléfono'}</span>
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Línea Directa</span>
                </div>
            )
        },
        { 
            header: 'Saldo Acumulado', 
            accessor: 'saldo_acumulado_mili',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <span className="font-bold text-neutral-900 text-sm">${row.saldo_acumulado_mili?.toLocaleString() || 0}</span>
                </div>
            )
        },
        { 
            header: 'Estado Operativo', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Venta Habilitada' : 'Cerrado/Inactivo'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre del Comercio', required: true },
        { name: 'direccion', label: 'Dirección Completa', required: true },
        { name: 'telefono', label: 'Teléfono de Contacto', required: false },
        { name: 'saldo_acumulado_mili', label: 'Saldo Inicial ($)', type: 'number', required: true, defaultValue: 0 },
    ];

    return (
        <GenericABM 
            title="Sedes y Sucursales"
            icon={Shop}
            service={service}
            columns={columns}
            formFields={formFields}
            idField="id_comercio"
        />
    );
};

export default Sucursales;
