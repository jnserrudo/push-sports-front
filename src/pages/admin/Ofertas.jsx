import React from 'react';
import { PercentageSquare, CalendarTick, ArchiveBook, EmptyWalletTick } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { ofertasService as service } from '../../services/genericServices';

const Ofertas = () => {
    const columns = [
        { header: 'ID', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id}</span> },
        { 
            header: 'Nombre de Oferta', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold text-sm text-neutral-900 uppercase tracking-tight">{row.nombre}</span>
        },
        { 
            header: 'Descuento', 
            accessor: 'descuento_porcentaje',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <PercentageSquare size={16} className="text-brand-cyan" variant="Bold" />
                    <span className="font-bold text-neutral-900">{row.descuento_porcentaje}% OFF</span>
                </div>
            )
        },
        { 
            header: 'Vigencia', 
            render: (row) => (
                <div className="flex items-center gap-2 text-neutral-400">
                    <CalendarTick size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{row.fecha_fin ? `Hasta ${new Date(row.fecha_fin).toLocaleDateString()}` : 'Indefinida'}</span>
                </div>
            )
        },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Oferta Activa' : 'Finalizada'}
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'nombre', label: 'Nombre de la Oferta', required: true },
        { name: 'descuento_porcentaje', label: 'Porcentaje de Descuento (%)', required: true, type: 'number' },
        { name: 'fecha_inicio', label: 'Fecha Inicio', required: true, type: 'date' },
        { name: 'fecha_fin', label: 'Fecha Fin', required: false, type: 'date' },
    ];

    return (
        <GenericABM 
            title="Ofertas Relámpago"
            icon={EmptyWalletTick}
            service={service}
            columns={columns}
            formFields={formFields}
        />
    );
};

export default Ofertas;
