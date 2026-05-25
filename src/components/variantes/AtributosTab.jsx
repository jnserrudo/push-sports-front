import React, { useState } from 'react';
import { Plus, X, ChevronRight, Info, Zap } from 'lucide-react';

const AtributosTab = ({ 
    atributos, 
    setAtributos, 
    numVariantesAGenerar,
    onNext,
    tieneAtributosConValores
}) => {
    const [nuevoAtributo, setNuevoAtributo] = useState('');
    const [nuevoValor, setNuevoValor] = useState({});
    
    const handleAgregarAtributo = () => {
        if (!nuevoAtributo.trim()) return;
        
        const atributoUpper = nuevoAtributo.toUpperCase().trim();
        if (atributos[atributoUpper]) {
            return; // Ya existe
        }
        
        setAtributos({
            ...atributos,
            [atributoUpper]: []
        });
        setNuevoAtributo('');
    };
    
    const handleEliminarAtributo = (key) => {
        const newAtributos = { ...atributos };
        delete newAtributos[key];
        setAtributos(newAtributos);
        
        // Limpiar input de valor si existía
        const newValores = { ...nuevoValor };
        delete newValores[key];
        setNuevoValor(newValores);
    };
    
    const handleAgregarValor = (key) => {
        const valor = nuevoValor[key]?.trim();
        if (!valor) return;
        
        const valores = atributos[key] || [];
        if (valores.includes(valor)) {
            return; // Ya existe
        }
        
        setAtributos({
            ...atributos,
            [key]: [...valores, valor]
        });
        
        setNuevoValor({
            ...nuevoValor,
            [key]: ''
        });
    };
    
    const handleEliminarValor = (key, valor) => {
        setAtributos({
            ...atributos,
            [key]: atributos[key].filter(v => v !== valor)
        });
    };
    
    const handleKeyPress = (e, action, ...args) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action(...args);
        }
    };
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Ejemplo destacado */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                        <Info size={16} className="sm:w-5 sm:h-5 text-brand-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black mb-1.5 sm:mb-2">
                            PASO 1: Define los Atributos de tu Producto
                        </h4>
                        <p className="text-[9px] sm:text-[10px] text-neutral-700 leading-relaxed mb-2 sm:mb-3">
                            <span className="font-bold">Ejemplo:</span> Si vendes remeras, podrías tener:
                        </p>
                        <div className="space-y-1 text-[8px] sm:text-[9px] text-neutral-600">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0"></span>
                                <span><span className="font-black">TALLE:</span> S, M, L, XL</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0"></span>
                                <span><span className="font-black">COLOR:</span> Rojo, Azul, Negro</span>
                            </div>
                        </div>
                        <p className="text-[8px] sm:text-[9px] text-neutral-500 mt-2 sm:mt-3 font-bold">
                            Esto generará 12 variantes (4 talles × 3 colores)
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Formulario de atributos */}
            <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 space-y-4">
                {/* Agregar nuevo atributo */}
                <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-600">
                        Agregar Atributo
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={nuevoAtributo}
                            onChange={(e) => setNuevoAtributo(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, handleAgregarAtributo)}
                            placeholder="Ej: TALLE, COLOR, SABOR..."
                            className="flex-1 px-3 py-2 sm:py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] sm:text-[11px] font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                        />
                        <button
                            type="button"
                            onClick={handleAgregarAtributo}
                            disabled={!nuevoAtributo.trim()}
                            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-cyan text-black rounded-lg font-black text-[9px] sm:text-[10px] uppercase tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
                        >
                            <Plus size={14} />
                            <span className="hidden sm:inline">Agregar</span>
                        </button>
                    </div>
                </div>
                
                {/* Lista de atributos con valores */}
                {Object.keys(atributos).length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-neutral-400">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                            Aún no has agregado atributos
                        </p>
                        <p className="text-[8px] sm:text-[9px] mt-1">
                            Comienza agregando un atributo como TALLE o COLOR
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {Object.entries(atributos).map(([key, valores]) => (
                            <div key={key} className="border border-neutral-200 rounded-lg p-3 sm:p-4 space-y-3">
                                {/* Header del atributo */}
                                <div className="flex items-center justify-between gap-2">
                                    <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black">
                                        {key}
                                    </h5>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarAtributo(key)}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center flex-shrink-0"
                                        title="Eliminar atributo"
                                    >
                                        <X size={12} className="sm:w-3.5 sm:h-3.5" />
                                    </button>
                                </div>
                                
                                {/* Valores existentes */}
                                {valores.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {valores.map((valor, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider group hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                {valor}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarValor(key, valor)}
                                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-200 group-hover:bg-red-200 flex items-center justify-center transition-colors"
                                                >
                                                    <X size={8} className="sm:w-2.5 sm:h-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Agregar valor */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={nuevoValor[key] || ''}
                                        onChange={(e) => setNuevoValor({ ...nuevoValor, [key]: e.target.value })}
                                        onKeyPress={(e) => handleKeyPress(e, handleAgregarValor, key)}
                                        placeholder={`Ej: ${key === 'TALLE' ? 'S, M, L' : key === 'COLOR' ? 'Rojo, Azul' : 'Valor'}`}
                                        className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-neutral-50 border border-neutral-200 rounded text-[9px] sm:text-[10px] font-bold text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAgregarValor(key)}
                                        disabled={!nuevoValor[key]?.trim()}
                                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-neutral-800 text-white rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 flex-shrink-0"
                                    >
                                        <Plus size={12} />
                                        <span className="hidden sm:inline">Valor</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Contador y botón siguiente */}
            {tieneAtributosConValores && (
                <div className="bg-black text-white rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-cyan flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="sm:w-5 sm:h-5 text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                                Listo para generar
                            </p>
                            <p className="text-[12px] sm:text-[14px] font-sport text-brand-cyan">
                                {numVariantesAGenerar} variantes
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onNext}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-cyan text-black rounded-lg font-black text-[10px] sm:text-[11px] uppercase tracking-wider hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
                    >
                        Siguiente: Ver Preview
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </button>
                </div>
            )}
            
            {/* Mensaje de ayuda si no está listo */}
            {!tieneAtributosConValores && Object.keys(atributos).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Agrega al menos 2 valores a cada atributo para continuar
                    </p>
                </div>
            )}
        </div>
    );
};

export default AtributosTab;
