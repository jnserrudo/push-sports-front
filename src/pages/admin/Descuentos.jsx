import React from 'react';
import { TicketDiscount, DollarCircle, PercentageSquare, Hashtag } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { descuentosService } from '../../services/genericServices';

const Descuentos = () => {
    const columns = [
        { header: 'ID', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id}</span> },
        { 
            header: 'Cupón / Código', 
            accessor: 'codigo',
            render: (row) => (
                <div className="inline-flex bg-neutral-900 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] tracking-[0.2em] shadow-lg">
                    {row.codigo.toUpperCase()}
                </div>
            )
        },
        { 
            header: 'Beneficio', 
            accessor: 'valor_descuento',
            render: (row) => {
                const isPerc = row.tipo_descuento === 'porcentaje';
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                            {isPerc ? `${row.valor_descuento}%` : `$${row.valor_descuento.toLocaleString()}`}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">{isPerc ? 'OFF' : 'DESC'}</span>
                    </div>
                );
            }
        },
        { 
            header: 'Rendimiento', 
            accessor: 'usos',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-neutral-900 text-xs">{row.usos_actuales} Aplicados</span>
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Límite: {row.usos_maximos || 'Sin límite'}</span>
                </div>
            )
        },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                    {row.activo ? 'Habilitado' : 'Expirado'}
                </div>
            )
        },
    ];

    const renderForm = (formData, setFormData) => {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Código Promocional</label>
                    <div className="relative group">
                        <input 
                            required type="text" 
                            className="input-premium uppercase"
                            placeholder="Ej: VERANO2026"
                            value={formData.codigo || ''} 
                            onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})} 
                        />
                        <Hashtag size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Tipo de Descuento</label>
                        <select 
                            required 
                            className="input-premium"
                            value={formData.tipo_descuento || 'porcentaje'} 
                            onChange={e => setFormData({...formData, tipo_descuento: e.target.value})} 
                        >
                            <option value="porcentaje">Porcentaje (%)</option>
                            <option value="fijo">Monto Fijo (AR$)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Valor</label>
                        <div className="relative">
                            <input 
                                required type="number" min="1"
                                className="input-premium pl-10"
                                value={formData.valor_descuento || ''} 
                                onChange={e => setFormData({...formData, valor_descuento: Number(e.target.value)})} 
                            />
                            {formData.tipo_descuento === 'fijo' ? (
                                <DollarCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                            ) : (
                                <PercentageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Límite de Usos Global</label>
                    <input 
                        type="number" min="1" 
                        placeholder="Dejar vacío para usos ilimitados"
                        className="input-premium"
                        value={formData.usos_maximos || ''} 
                        onChange={e => setFormData({...formData, usos_maximos: e.target.value ? Number(e.target.value) : null})} 
                    />
                </div>
            </div>
        )
    };

    return (
        <GenericABM 
            title="Cupones y Descuentos"
            icon={TicketDiscount}
            service={descuentosService}
            columns={columns}
            formFields={[]} 
            renderForm={renderForm}
        />
    );
};

export default Descuentos;
