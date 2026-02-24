import React from 'react';
import { PackageSearch } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { inventarioService } from '../../services/inventarioService';

const Inventario = () => {
    const columns = [
        { header: 'ID Inventario', accessor: 'id_inventario' },
        { 
            header: 'Producto', 
            accessor: 'producto_nombre',
            render: (row) => <span className="font-bold">{row.producto?.nombre || row.producto_nombre || 'N/A'}</span>
        },
        { 
            header: 'Sucursal', 
            accessor: 'sucursal_nombre',
            render: (row) => <span>{row.sucursal?.nombre || row.sucursal_nombre || 'N/A'}</span>
        },
        { 
            header: 'Stock Actual', 
            accessor: 'cantidad_actual',
            render: (row) => (
                <span className={`font-mono font-bold ${row.cantidad_actual <= row.stock_minimo ? 'text-red-500' : 'text-black'}`}>
                    {row.cantidad_actual}
                </span>
            )
        },
        { header: 'Stock Mínimo', accessor: 'stock_minimo' },
        { 
            header: 'Comisión (%)', 
            accessor: 'comision_pactada_porcentaje',
            render: (row) => <span className="font-mono">{row.comision_pactada_porcentaje}%</span>
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
            title="Control de Inventario"
            icon={PackageSearch}
            service={inventarioService}
            columns={columns}
            formFields={formFields}
            idField="id_inventario"
        />
    );
};

export default Inventario;
