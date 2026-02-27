import React from 'react';
import { PackagePlus } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { combosService as service } from '../../services/genericServices';

const Combos = () => {
    const columns = [
        {
            header: 'ID',
            accessor: 'id_combo',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_combo).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Combo Promocional',
            accessor: 'nombre',
            render: (row) => (
                <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
            )
        },
        {
            header: 'Valor Final',
            accessor: 'precio_combo',
            render: (row) => (
                <div className="flex items-start gap-1 text-black">
                    <span className="text-[10px] font-bold mt-1">$</span>
                    <span className="font-sport text-2xl leading-none">
                        {(Number(row.precio_combo) || 0).toLocaleString()}
                    </span>
                </div>
            )
        },
        {
            header: 'Disponibilidad',
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    row.activo
                        ? 'bg-brand-cyan text-black border-brand-cyan'
                        : 'bg-transparent text-neutral-400 border-neutral-200'
                }`}>
                    {row.activo ? 'Habilitado' : 'Agotado'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre',       label: 'Nombre del Combo',   required: true },
        { name: 'descripcion',  label: 'Descripción',        required: false },
        { name: 'precio_combo', label: 'Precio Final (AR$)', required: true, type: 'number' },
        { name: 'activo',       label: 'Habilitado',         required: false, type: 'checkbox' },
    ];

    return (
        <GenericABM
            title="Packs & Combos"
            icon={PackagePlus}
            service={service}
            columns={columns}
            formFields={formFields}
            idField="id_combo"
        />
    );
};

export default Combos;