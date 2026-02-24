import React from 'react';
import { Tag } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { descuentosService } from '../../services/genericServices';

const Descuentos = () => {
    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Código', 
            accessor: 'codigo',
            render: (row) => <span className="font-bold border-2 border-black px-2 py-1 bg-neutral-100">{row.codigo}</span>
        },
        { 
            header: 'Descuento', 
            accessor: 'valor_descuento',
            render: (row) => row.tipo_descuento === 'porcentaje' ? `${row.valor_descuento}%` : `$${row.valor_descuento.toLocaleString()}`
        },
        { 
            header: 'Usos', 
            accessor: 'usos',
            render: (row) => `${row.usos_actuales} / ${row.usos_maximos || '∞'}`
        },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${row.activo ? 'bg-black' : 'bg-neutral-400'}`}>
                    {row.activo ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
    ];

    const renderForm = (formData, setFormData) => {
        return (
            <>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider">Código de Descuento</label>
                    <input required type="text" className="w-full border-2 border-black p-2 focus:outline-none uppercase"
                        value={formData.codigo || ''} onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Tipo</label>
                        <select required className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.tipo_descuento || 'porcentaje'} onChange={e => setFormData({...formData, tipo_descuento: e.target.value})} >
                            <option value="porcentaje">Porcentaje (%)</option>
                            <option value="fijo">Monto Fijo ($)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Valor</label>
                        <input required type="number" min="1" className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.valor_descuento || ''} onChange={e => setFormData({...formData, valor_descuento: Number(e.target.value)})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Usos Máximos</label>
                        <input type="number" min="1" placeholder="Vacio = Sin límite" className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.usos_maximos || ''} onChange={e => setFormData({...formData, usos_maximos: e.target.value ? Number(e.target.value) : null})} />
                    </div>
                </div>
            </>
        )
    };

    return (
        <GenericABM 
            title="Códigos de Descuento"
            icon={Tag}
            service={descuentosService}
            columns={columns}
            formFields={[]} // Usamos renderForm
            renderForm={renderForm}
        />
    );
};

export default Descuentos;
