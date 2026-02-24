import React from 'react';
import { BoxSearch } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { inventarioService } from '../../services/inventarioService';

const Inventario = () => {
    const columns = [
        { header: 'Cod. Inv', accessor: 'id_inventario', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id_inventario.split('-')[0]}...</span> },
        { 
            header: 'Producto / Especificación', 
            accessor: 'producto_nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-neutral-900">{row.producto?.nombre || row.producto_nombre || 'N/A'}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">SKU: {row.producto?.codigo_barras || 'N/A'}</span>
                </div>
            )
        },
        { 
            header: 'Ubicación Sede', 
            accessor: 'sucursal_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-tight">{row.sucursal?.nombre || row.sucursal_nombre || 'N/A'}</span>
                </div>
            )
        },
        { 
            header: 'Existencias', 
            accessor: 'cantidad_actual',
            render: (row) => {
                const isCritical = row.cantidad_actual <= row.stock_minimo;
                return (
                    <div className="flex flex-col">
                        <span className={`font-bold text-sm ${isCritical ? 'text-amber-500' : 'text-neutral-900'}`}>{row.cantidad_actual} Unidades</span>
                        <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Alerta en: {row.stock_minimo}</span>
                    </div>
                );
            }
        },
        { 
            header: 'Rentabilidad', 
            accessor: 'comision_pactada_porcentaje',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                    Comisión: {row.comision_pactada_porcentaje}%
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'id_producto', label: 'ID Producto (UUID)', required: true },
        { name: 'id_comercio', label: 'ID Sucursal (UUID)', required: true },
        { name: 'cantidad_actual', label: 'Stock Inicial', required: true, type: 'number' },
        { name: 'stock_minimo', label: 'Alerta Stock Mínimo', required: true, type: 'number' },
        { name: 'comision_pactada_porcentaje', label: 'Comisión Pactada (%)', required: true, type: 'number' },
    ];

    return (
        <GenericABM 
            title="Saldos de Inventario"
            icon={BoxSearch}
            service={inventarioService}
            columns={columns}
            formFields={formFields}
            idField="id_inventario"
        />
    );
};

export default Inventario;
