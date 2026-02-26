import React from 'react';
import { Ticket, CircleDollarSign, Percent, Hash } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { descuentosService } from '../../services/genericServices';

const Descuentos = () => {
    const columns = [
        {
            header: 'ID',
            accessor: 'id_descuento',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_descuento).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Código Promo',
            accessor: 'codigo',
            render: (row) => (
                <div className="inline-flex bg-black text-white px-3 py-1.5 rounded-lg font-sport text-lg tracking-widest">
                    {(row.codigo || '').toUpperCase()}
                </div>
            )
        },
        {
            header: 'Beneficio',
            accessor: 'valor_descuento',
            render: (row) => {
                const isPerc = row.tipo_descuento === 'porcentaje';
                return (
                    <div className="flex items-baseline gap-1">
                        {!isPerc && <span className="text-[10px] font-bold text-black">$</span>}
                        <span className="font-sport text-2xl text-brand-cyan leading-none">
                            {(row.valor_descuento || 0).toLocaleString()}
                        </span>
                        {isPerc && <span className="font-sport text-xl text-brand-cyan leading-none">%</span>}
                        <span className="text-[9px] font-black text-black uppercase tracking-widest ml-1">OFF</span>
                    </div>
                );
            }
        },
        {
            header: 'Uso / Límite',
            accessor: 'usos_actuales',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-black uppercase tracking-widest">
                        {row.usos_actuales ?? 0} Aplicados
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        Tope: {row.usos_maximos || 'Ilimitado'}
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
                        ? 'bg-transparent text-black border-black'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                }`}>
                    {row.activo ? 'Activo' : 'Expirado'}
                </div>
            )
        },
    ];

    const renderForm = (formData, setFormData) => (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Código Promocional</label>
                <div className="relative group">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                    <input
                        required type="text"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                        placeholder="EJ: VERANO26"
                        value={formData.codigo || ''}
                        onChange={e => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Mecánica</label>
                    <select
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all appearance-none"
                        value={formData.tipo_descuento || 'porcentaje'}
                        onChange={e => setFormData({ ...formData, tipo_descuento: e.target.value })}
                    >
                        <option value="porcentaje">Porcentaje (%)</option>
                        <option value="fijo">Monto Fijo ($)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Valor del Descuento</label>
                    <div className="relative group">
                        {formData.tipo_descuento === 'fijo'
                            ? <CircleDollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                            : <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                        }
                        <input
                            required type="number" min="1"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                            placeholder="0.00"
                            value={formData.valor_descuento || ''}
                            onChange={e => setFormData({ ...formData, valor_descuento: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Tope de Usos (Opcional)</label>
                <input
                    type="number" min="1"
                    placeholder="Dejar vacío para ilimitado"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    value={formData.usos_maximos || ''}
                    onChange={e => setFormData({ ...formData, usos_maximos: e.target.value ? Number(e.target.value) : null })}
                />
            </div>
        </div>
    );

    return (
        <GenericABM
            title="Motor de Descuentos"
            icon={Ticket}
            service={descuentosService}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            idField="id_descuento"
        />
    );
};

export default Descuentos;