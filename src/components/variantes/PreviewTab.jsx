import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, Loader2, Package, AlertCircle } from 'lucide-react';
import { toast } from '../../store/toastStore';

const PreviewTab = ({ 
    producto, 
    atributos, 
    variantesExistentes,
    onGenerar,
    onBack,
    onSuccess,
    generando
}) => {
    // Estado para combinaciones seleccionadas
    const [selectedCombos, setSelectedCombos] = useState([]);
    // Estado para modo de creación
    const [modoCreacion, setModoCreacion] = useState('auto'); // 'auto' | 'manual'
    // Estado para variantes individuales
    const [variantesIndividuales, setVariantesIndividuales] = useState([]);
    // Debug: Ver qué recibimos
    console.log('PreviewTab - atributos recibidos:', atributos);
    console.log('PreviewTab - tipo de atributos:', typeof atributos);
    console.log('PreviewTab - keys:', atributos ? Object.keys(atributos) : 'null');
    
    // Validar que atributos existe y tiene valores
    if (!atributos || typeof atributos !== 'object') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle size={48} className="text-amber-500 mb-4" />
                <h4 className="text-lg font-black uppercase text-black dark:text-gray-100 mb-2">
                    No hay atributos definidos
                </h4>
                <p className="text-sm text-neutral-500 dark:text-gray-300 mb-4">
                    Vuelve al paso anterior y agrega atributos con sus valores
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-bold text-sm uppercase hover:bg-black transition-colors"
                >
                    Volver a Atributos
                </button>
            </div>
        );
    }
    
    // Generar combinaciones de variantes
    const combinaciones = useMemo(() => {
        const generarCombinaciones = (attrs) => {
            const keys = Object.keys(attrs);
            console.log('generarCombinaciones - keys:', keys);
            
            if (keys.length === 0) return [];
            
            // Filtrar solo atributos con valores
            const keysConValores = keys.filter(key => {
                const valores = attrs[key];
                return Array.isArray(valores) && valores.length > 0;
            });
            
            console.log('generarCombinaciones - keysConValores:', keysConValores);
            
            if (keysConValores.length === 0) return [];
            
            const combinar = (index) => {
                if (index === keysConValores.length) return [{}];
                
                const key = keysConValores[index];
                const valores = attrs[key];
                const subCombinaciones = combinar(index + 1);
                
                const resultado = [];
                for (const valor of valores) {
                    for (const subCombo of subCombinaciones) {
                        resultado.push({ [key]: valor, ...subCombo });
                    }
                }
                return resultado;
            };
            
            const result = combinar(0);
            console.log('generarCombinaciones - resultado:', result);
            return result;
        };
        
        return generarCombinaciones(atributos);
    }, [atributos]);
    
    // Verificar cuáles ya existen
    const variantesConEstado = useMemo(() => {
        const existentesSet = new Set(
            variantesExistentes.map(v => JSON.stringify(v.atributos_valores))
        );
        
        return combinaciones.map(combo => ({
            atributos: combo,
            yaExiste: existentesSet.has(JSON.stringify(combo)),
            sku: generarSKU(combo, producto.nombre)
        }));
    }, [combinaciones, variantesExistentes, producto.nombre]);
    
    const nuevasVariantes = variantesConEstado.filter(v => !v.yaExiste);
    const variantesExistentesCount = variantesConEstado.filter(v => v.yaExiste).length;
    
    // Inicializar selectedCombos con todas las nuevas variantes
    useEffect(() => {
        const nuevosIndices = variantesConEstado
            .map((v, idx) => !v.yaExiste ? idx : null)
            .filter(idx => idx !== null);
        setSelectedCombos(nuevosIndices);
    }, [variantesConEstado]);
    
    // Función para toggle de selección
    const toggleCombo = (index) => {
        setSelectedCombos(prev => 
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };
    
    // Calcular variantes seleccionadas según el modo
    const variantesSeleccionadas = modoCreacion === 'auto'
        ? variantesConEstado.filter((_, idx) => 
            selectedCombos.includes(idx) && !variantesConEstado[idx].yaExiste
          )
        : variantesIndividuales.filter(v => !v.yaExiste);
    
    // Función para agregar variante individual
    const agregarVarianteIndividual = () => {
        // Crear un objeto con el primer valor de cada atributo
        const nuevaVariante = {};
        Object.keys(atributos).forEach(key => {
            if (Array.isArray(atributos[key]) && atributos[key].length > 0) {
                nuevaVariante[key] = atributos[key][0];
            }
        });
        
        // Verificar si ya existe
        const existentesSet = new Set(
            variantesExistentes.map(v => JSON.stringify(v.atributos_valores))
        );
        const yaExiste = existentesSet.has(JSON.stringify(nuevaVariante));
        
        setVariantesIndividuales([...variantesIndividuales, {
            atributos: nuevaVariante,
            yaExiste,
            sku: generarSKU(nuevaVariante, producto.nombre)
        }]);
    };
    
    // Función para eliminar variante individual
    const eliminarVarianteIndividual = (index) => {
        setVariantesIndividuales(variantesIndividuales.filter((_, i) => i !== index));
    };
    
    // Función para actualizar atributo de variante individual
    const actualizarVarianteIndividual = (index, atributo, valor) => {
        const nuevasVariantes = [...variantesIndividuales];
        nuevasVariantes[index].atributos[atributo] = valor;
        
        // Recalcular si ya existe
        const existentesSet = new Set(
            variantesExistentes.map(v => JSON.stringify(v.atributos_valores))
        );
        nuevasVariantes[index].yaExiste = existentesSet.has(JSON.stringify(nuevasVariantes[index].atributos));
        nuevasVariantes[index].sku = generarSKU(nuevasVariantes[index].atributos, producto.nombre);
        
        setVariantesIndividuales(nuevasVariantes);
    };
    
    // Generar SKU simple
    function generarSKU(atributos, nombreProducto) {
        const prefijo = nombreProducto
            .substring(0, 3)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
        
        const valores = Object.values(atributos)
            .map(v => String(v).substring(0, 1).toUpperCase())
            .join('');
        
        return `${prefijo}-${valores}`;
    }
    
    const handleGenerar = async () => {
        try {
            // Pasar solo las combinaciones seleccionadas
            const combinacionesAGenerar = variantesSeleccionadas.map(v => v.atributos);
            const result = await onGenerar(combinacionesAGenerar);
            
            // Mostrar mensaje según resultado
            if (result.variantes_creadas === 0) {
                toast.info('Todas las combinaciones de variantes ya existen. No se generaron variantes nuevas.');
            } else {
                let mensaje = `${result.variantes_creadas} variantes creadas exitosamente`;
                
                if (result.variantes_existentes > 0) {
                    mensaje += `. ${result.variantes_existentes} ya existían.`;
                }
                
                if (result.warnings && result.warnings.length > 0) {
                    toast.warning(result.warnings[0]);
                }
                
                toast.success(mensaje);
                onSuccess();
            }
        } catch (error) {
            // El error ya se maneja en el componente padre
        }
    };
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header con resumen */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-900/60 dark:to-slate-800/60 border border-cyan-200 dark:border-slate-700/50 rounded-lg p-3 sm:p-4">
                <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
                    <Package size={14} className="sm:w-4 sm:h-4 text-brand-cyan" />
                    PASO 2: Preview de Variantes a Crear
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-neutral-200 dark:border-slate-700">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:text-gray-300 mb-1">
                            Total Combinaciones
                        </p>
                        <p className="text-[16px] sm:text-[18px] font-sport text-black dark:text-gray-100">
                            {combinaciones.length}
                        </p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-green-200 dark:border-green-800">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">
                            Seleccionadas
                        </p>
                        <p className="text-[16px] sm:text-[18px] font-sport text-green-600 dark:text-green-400">
                            {variantesSeleccionadas.length}
                        </p>
                    </div>
                    
                    {variantesExistentesCount > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-amber-200 dark:border-amber-800">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-300 mb-1">
                                Ya Existen
                            </p>
                            <p className="text-[16px] sm:text-[18px] font-sport text-amber-600 dark:text-amber-300">
                                {variantesExistentesCount}
                            </p>
                        </div>
                    )}
                </div>
                
                {nuevasVariantes.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex items-start gap-2">
                        <AlertCircle size={14} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[8px] sm:text-[9px] text-neutral-600 dark:text-gray-300 leading-relaxed">
                            Las variantes se crearán con stock 0. Podrás ajustar el stock individualmente después de generarlas.
                        </p>
                    </div>
                )}
            </div>
            
            {/* Toggle de modo */}
            <div className="bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
                <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300 mb-3">
                    Modo de Creación
                </h5>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setModoCreacion('auto')}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${
                            modoCreacion === 'auto'
                                ? 'bg-cyan-600 text-white shadow-md'
                                : 'bg-neutral-100 dark:bg-slate-700 text-neutral-600 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        ⚡ Auto-Combinar
                    </button>
                    <button
                        type="button"
                        onClick={() => setModoCreacion('manual')}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${
                            modoCreacion === 'manual'
                                ? 'bg-cyan-600 text-white shadow-md'
                                : 'bg-neutral-100 dark:bg-slate-700 text-neutral-600 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        ✋ Manual
                    </button>
                </div>
                <p className="text-[8px] text-neutral-500 dark:text-gray-300 mt-2">
                    {modoCreacion === 'auto' 
                        ? 'Selecciona las combinaciones automáticas que deseas crear'
                        : 'Agrega variantes individuales sin combinar todos los atributos'
                    }
                </p>
            </div>
            
            {/* Grid de cards de preview */}
            <div className="bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-600 dark:text-gray-300">
                        {modoCreacion === 'auto' ? 'Combinaciones Automáticas' : 'Variantes Individuales'}
                    </h5>
                    {modoCreacion === 'manual' && (
                        <button
                            type="button"
                            onClick={agregarVarianteIndividual}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all text-[8px] font-black uppercase"
                        >
                            <Plus size={12} />
                            Agregar
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1">
                    {modoCreacion === 'auto' ? (
                        // Modo Auto: Mostrar combinaciones con checkboxes
                        variantesConEstado.map((variante, idx) => {
                        const isSelected = selectedCombos.includes(idx);
                        const isDisabled = variante.yaExiste;
                        
                        return (
                            <div
                                key={idx}
                                className={`
                                    relative border rounded-lg p-2.5 sm:p-3 transition-all
                                    ${variante.yaExiste
                                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 opacity-60'
                                        : isSelected
                                            ? 'border-cyan-400 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 shadow-md'
                                            : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-300 dark:hover:border-cyan-600'
                                    }
                                `}
                            >
                                {/* Checkbox en esquina superior derecha */}
                                {!variante.yaExiste && (
                                    <div className="absolute top-2 right-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleCombo(idx)}
                                            className="w-4 h-4 text-cyan-600 bg-white dark:bg-slate-950 border-neutral-300 dark:border-slate-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:ring-2 cursor-pointer"
                                        />
                                    </div>
                                )}
                                
                                {/* Icono y nombre */}
                                <div className="flex items-start gap-2 mb-2 pr-6">
                                    <div className={`
                                        w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${variante.yaExiste ? 'bg-amber-100 dark:bg-amber-900/30' : isSelected ? 'bg-cyan-100 dark:bg-cyan-900/40' : 'bg-neutral-100 dark:bg-slate-700'}
                                    `}>
                                        <Package size={14} className={`sm:w-4 sm:h-4 ${variante.yaExiste ? 'text-amber-600 dark:text-amber-300' : isSelected ? 'text-cyan-600 dark:text-cyan-300' : 'text-neutral-600 dark:text-gray-300'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h6 className="text-[9px] sm:text-[10px] font-black uppercase text-black dark:text-gray-100 truncate">
                                            {producto.nombre}
                                        </h6>
                                        {variante.yaExiste && (
                                            <span className="inline-block px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300 text-[7px] sm:text-[8px] font-black uppercase rounded mt-1">
                                                Ya existe
                                            </span>
                                        )}
                                    </div>
                                </div>
                            
                            {/* Atributos */}
                            <div className="space-y-1 mb-2">
                                {Object.entries(variante.atributos).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                        <span className="font-black uppercase text-neutral-500 dark:text-gray-300">{key}:</span>
                                        <span className="font-bold text-neutral-700 dark:text-gray-300">{value}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* SKU y Stock */}
                            <div className="pt-2 border-t border-neutral-200 dark:border-slate-700 space-y-1">
                                <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                    <span className="font-black uppercase text-neutral-500 dark:text-gray-300">SKU:</span>
                                    <span className="font-mono font-bold text-neutral-700 dark:text-gray-300">{variante.sku}</span>
                                </div>
                                <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                    <span className="font-black uppercase text-neutral-500 dark:text-gray-300">Stock:</span>
                                    <span className="font-bold text-neutral-700 dark:text-gray-300">0</span>
                                </div>
                            </div>
                        </div>
                        );
                    })
                    ) : (
                        // Modo Manual: Mostrar variantes individuales con selects
                        variantesIndividuales.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Package size={48} className="mx-auto text-neutral-300 mb-3" />
                                <p className="text-[10px] font-bold text-neutral-400 uppercase">
                                    No hay variantes agregadas
                                </p>
                                <p className="text-[8px] text-neutral-400 mt-1">
                                    Haz click en "Agregar" para crear una variante individual
                                </p>
                            </div>
                        ) : (
                            variantesIndividuales.map((variante, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        relative border rounded-lg p-2.5 sm:p-3 transition-all
                                        ${variante.yaExiste
                                            ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20'
                                            : 'border-cyan-400 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                        }
                                    `}
                                >
                                    {/* Botón eliminar */}
                                    <button
                                        type="button"
                                        onClick={() => eliminarVarianteIndividual(idx)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                                    >
                                        <X size={12} />
                                    </button>
                                    
                                    {/* Icono y nombre */}
                                    <div className="flex items-start gap-2 mb-3 pr-8">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center flex-shrink-0">
                                            <Package size={14} className="sm:w-4 sm:h-4 text-cyan-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h6 className="text-[9px] sm:text-[10px] font-black uppercase text-black dark:text-gray-100 truncate">
                                                {producto.nombre}
                                            </h6>
                                            {variante.yaExiste && (
                                                <span className="inline-block px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300 text-[7px] sm:text-[8px] font-black uppercase rounded mt-1">
                                                    Ya existe
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Selects para atributos */}
                                    <div className="space-y-2 mb-2">
                                        {Object.keys(atributos).map(key => (
                                            <div key={key}>
                                                <label className="text-[7px] font-black uppercase text-neutral-500 dark:text-gray-300 block mb-1">
                                                    {key}
                                                </label>
                                                <select
                                                    value={variante.atributos[key] || ''}
                                                    onChange={(e) => actualizarVarianteIndividual(idx, key, e.target.value)}
                                                    className="w-full px-2 py-1.5 text-[8px] font-bold border border-neutral-300 dark:border-slate-600 rounded bg-white dark:bg-slate-950 text-black dark:text-gray-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                                >
                                                    {atributos[key].map(valor => (
                                                        <option key={valor} value={valor}>
                                                            {valor}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* SKU y Stock */}
                                    <div className="pt-2 border-t border-neutral-200 dark:border-slate-700 space-y-1">
                                        <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                            <span className="font-black uppercase text-neutral-500 dark:text-gray-300">SKU:</span>
                                            <span className="font-mono font-bold text-neutral-700 dark:text-gray-300">{variante.sku}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                            <span className="font-black uppercase text-neutral-500 dark:text-gray-300">Stock:</span>
                                            <span className="font-bold text-neutral-700 dark:text-gray-300">0</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={generando}
                    className="px-4 py-2.5 sm:py-3 bg-neutral-100 dark:bg-slate-700 text-neutral-700 dark:text-gray-300 rounded-lg font-black text-[10px] sm:text-[11px] uppercase tracking-wider hover:bg-neutral-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-2 sm:order-1"
                >
                    <ChevronLeft size={14} />
                    Volver
                </button>
                
                <button
                    type="button"
                    onClick={handleGenerar}
                    disabled={generando || variantesSeleccionadas.length === 0}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-brand-cyan text-black rounded-lg font-black text-[10px] sm:text-[11px] uppercase tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                    {generando ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Generando Variantes...
                        </>
                    ) : (
                        <>
                            <Sparkles size={14} />
                            Generar {variantesSeleccionadas.length} Variantes
                        </>
                    )}
                </button>
            </div>
            
            {variantesSeleccionadas.length === 0 && nuevasVariantes.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        No has seleccionado ninguna variante para crear. Marca las casillas de las variantes que deseas generar.
                    </p>
                </div>
            )}
            
            {nuevasVariantes.length === 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Todas las combinaciones ya existen. No hay variantes nuevas para generar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PreviewTab;
