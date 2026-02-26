import React from 'react';
import { Search } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { inventarioService } from '../../services/inventarioService';

const Inventario = () => {
    const columns = [
        {
            header: 'ID Inv',
            accessor: 'id_inventario',
            render: (row) => (
                // FIX: id_inventario puede ser número o UUID — convertir a string antes de split
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_inventario).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Especificación',
            accessor: 'producto_nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black uppercase tracking-widest">
                        {row.producto?.nombre || row.producto_nombre || 'N/A'}
                    </span>
                    <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">
                        {row.producto?.categoria?.nombre || row.producto?.descripcion || ''}
                    </span>
                </div>
            )
        },
        {
            header: 'Ubicación Sede',
            accessor: 'sucursal_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                        {row.sucursal?.nombre || row.sucursal_nombre || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Existencias',
            accessor: 'cantidad_actual',
            render: (row) => {
                const cantidad = row.cantidad_actual ?? 0;
                const minimo = row.stock_minimo ?? 0;
                const isEmpty   = cantidad === 0;
                const isCritical = cantidad <= minimo && !isEmpty;

                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isEmpty ? 'bg-red-500 animate-pulse' :
                            isCritical ? 'bg-amber-400' : 'bg-black'
                        }`} />
                        <div className="flex flex-col">
                            <span className={`font-sport text-2xl leading-none ${
                                isEmpty ? 'text-red-500' :
                                isCritical ? 'text-amber-500' : 'text-black'
                            }`}>
                                {cantidad}
                            </span>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                Alerta en: {minimo}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Rentabilidad',
            accessor: 'comision_pactada_porcentaje',
            render: (row) => (
                <div className="inline-flex px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-black text-white border border-black">
                    COM. {row.comision_pactada_porcentaje ?? 0}%
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'id_producto',                label: 'ID Producto (UUID)',         required: true },
        { name: 'id_comercio',                label: 'ID Sucursal (UUID)',          required: true },
        { name: 'cantidad_actual',            label: 'Stock Inicial',              required: true, type: 'number' },
        { name: 'stock_minimo',               label: 'Alerta Stock Mínimo',        required: true, type: 'number' },
        { name: 'comision_pactada_porcentaje',label: 'Comisión Pactada (%)',       required: true, type: 'number' },
    ];

    return (
        <GenericABM
            title="Control de Inventario"
            icon={Search}
            service={inventarioService}
            columns={columns}
            formFields={formFields}
            idField="id_inventario"
        />
    );
};

export default Inventario;