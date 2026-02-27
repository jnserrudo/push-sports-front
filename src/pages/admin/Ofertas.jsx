import React from 'react';
import { Ticket, CalendarCheck2 } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { ofertasService as service } from '../../services/genericServices';

const Ofertas = () => {
    const columns = [
        {
            header: 'ID',
            accessor: 'id_oferta',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_oferta).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Oferta',
            accessor: 'nombre',
            render: (row) => (
                <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
            )
        },
        {
            header: 'Descuento',
            accessor: 'descuento_porcentaje',
            render: (row) => (
                <div className="flex items-baseline gap-1">
                    <span className="font-sport text-2xl text-brand-cyan leading-none">{row.descuento_porcentaje}</span>
                    <span className="font-sport text-xl text-brand-cyan leading-none">%</span>
                    <span className="text-[9px] font-black text-black uppercase tracking-widest ml-1">OFF</span>
                </div>
            )
        },
        {
            header: 'Vigencia',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <CalendarCheck2 size={14} className="text-brand-cyan flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {row.fecha_fin
                            ? `HASTA ${new Date(row.fecha_fin).toLocaleDateString()}`
                            : 'INDEFINIDA'}
                    </span>
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    row.activo
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                }`}>
                    {row.activo ? 'Vigente' : 'Finalizada'}
                </div>
            )
        },
    ];

    return (
        <GenericABM
            title="Ofertas Relámpago"
            icon={Ticket}
            service={service}
            columns={columns}
            formFields={[
                { name: 'nombre',               label: 'Nombre de la Oferta', required: true              },
                { name: 'descuento_porcentaje', label: 'Porcentaje (%)',       required: true, type:'number'},
                { name: 'fecha_inicio',         label: 'Fecha Inicio',        required: true, type:'date'  },
                { name: 'fecha_fin',            label: 'Fecha Fin',           required: false,type:'date'  },
                { name: 'activo',               label: 'Oferta Vigente',      required: false,type:'checkbox' },
            ]}
            idField="id_oferta"
        />
    );
};

export default Ofertas;