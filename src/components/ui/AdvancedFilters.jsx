import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import PremiumSelect from './PremiumSelect';

export const AdvancedFilters = ({ filters, onApply, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState({});
    
    const handleApply = () => {
        onApply(values);
        setIsOpen(false);
    };

    const handleClear = () => {
        setValues({});
        onClear();
        setIsOpen(false);
    };
    
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-neutral-100 rounded-lg flex items-center gap-2 hover:bg-neutral-200 transition-colors text-xs font-bold uppercase tracking-wider"
            >
                <Filter size={16} />
                Filtros
                {Object.keys(values).filter(k => values[k]).length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-brand-cyan text-black rounded-full text-[10px]">
                        {Object.keys(values).filter(k => values[k]).length}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 w-80 z-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider">Filtros Avanzados</h3>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-black">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filters.map(filter => (
                                <div key={filter.key}>
                                    <label className="block text-xs font-bold mb-1.5 text-neutral-600 uppercase tracking-wider">
                                        {filter.label}
                                    </label>
                                    {filter.type === 'select' ? (
                                        <PremiumSelect
                                            placeholder="Todos"
                                            options={[
                                                { value: '', label: 'Todos' },
                                                ...(filter.options || [])
                                            ]}
                                            value={values[filter.key] || ''}
                                            onChange={val => setValues({...values, [filter.key]: val})}
                                        />
                                    ) : filter.type === 'range' ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Mín"
                                                value={values[`${filter.key}_min`] || ''}
                                                onChange={e => setValues({...values, [`${filter.key}_min`]: e.target.value})}
                                                className="w-1/2 px-3 py-2 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-cyan-400"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Máx"
                                                value={values[`${filter.key}_max`] || ''}
                                                onChange={e => setValues({...values, [`${filter.key}_max`]: e.target.value})}
                                                className="w-1/2 px-3 py-2 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-cyan-400"
                                            />
                                        </div>
                                    ) : filter.type === 'text' ? (
                                        <input
                                            type="text"
                                            placeholder={filter.placeholder || ''}
                                            value={values[filter.key] || ''}
                                            onChange={e => setValues({...values, [filter.key]: e.target.value})}
                                            className="w-full px-3 py-2 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400"
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200">
                            <button
                                onClick={handleClear}
                                className="flex-1 px-3 py-2 bg-neutral-100 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-3 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
