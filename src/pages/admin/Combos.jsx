import React from 'react';
import { BoxAdd, DollarCircle, ArchiveBook, Flash } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { combosService as service } from '../../services/genericServices';

const Combos = () => {
    const columns = [
        { header: 'ID', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id}</span> },
        { 
            header: 'Combo Promocional', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold text-sm text-neutral-900 uppercase tracking-tight">{row.nombre}</span>
        },
        { 
            header: 'Valor del Pack', 
            accessor: 'precio_final_combo',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <DollarCircle size={16} className="text-neutral-900" variant="Bold" />
                    <span className="font-bold text-neutral-900 text-sm">${row.precio_final_combo?.toLocaleString() || 0}</span>
                </div>
            )
        },
        { 
            header: 'Estado de Venta', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Combo Habilitado' : 'Agotado/Finalizado'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre del Combo', required: true },
        { name: 'precio_final_combo', label: 'Precio Final del Combo ($)', required: true, type: 'number' },
    ];

    return (
        <GenericABM 
            title="Combos y Packs Especiales"
            icon={BoxAdd}
            service={service}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Combos;
