import React, { useMemo } from 'react';
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
    // Debug: Ver qué recibimos
    console.log('PreviewTab - atributos recibidos:', atributos);
    console.log('PreviewTab - tipo de atributos:', typeof atributos);
    console.log('PreviewTab - keys:', atributos ? Object.keys(atributos) : 'null');
    
    // Validar que atributos existe y tiene valores
    if (!atributos || typeof atributos !== 'object') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle size={48} className="text-amber-500 mb-4" />
                <h4 className="text-lg font-black uppercase text-black mb-2">
                    No hay atributos definidos
                </h4>
                <p className="text-sm text-neutral-500 mb-4">
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
            const result = await onGenerar();
            
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
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black mb-2 sm:mb-3 flex items-center gap-2">
                    <Package size={14} className="sm:w-4 sm:h-4 text-brand-cyan" />
                    PASO 2: Preview de Variantes a Crear
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-white rounded-lg p-2 sm:p-3 border border-neutral-200">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-neutral-500 mb-1">
                            Total Combinaciones
                        </p>
                        <p className="text-[16px] sm:text-[18px] font-sport text-black">
                            {combinaciones.length}
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 sm:p-3 border border-green-200">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-green-600 mb-1">
                            Nuevas a Crear
                        </p>
                        <p className="text-[16px] sm:text-[18px] font-sport text-green-600">
                            {nuevasVariantes.length}
                        </p>
                    </div>
                    
                    {variantesExistentesCount > 0 && (
                        <div className="bg-white rounded-lg p-2 sm:p-3 border border-amber-200">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-600 mb-1">
                                Ya Existen
                            </p>
                            <p className="text-[16px] sm:text-[18px] font-sport text-amber-600">
                                {variantesExistentesCount}
                            </p>
                        </div>
                    )}
                </div>
                
                {nuevasVariantes.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex items-start gap-2">
                        <AlertCircle size={14} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[8px] sm:text-[9px] text-neutral-600 leading-relaxed">
                            Las variantes se crearán con stock 0. Podrás ajustar el stock individualmente después de generarlas.
                        </p>
                    </div>
                )}
            </div>
            
            {/* Grid de cards de preview */}
            <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4">
                <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-3 sm:mb-4">
                    Vista Previa de Variantes
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1">
                    {variantesConEstado.map((variante, idx) => (
                        <div
                            key={idx}
                            className={`
                                border rounded-lg p-2.5 sm:p-3 transition-all
                                ${variante.yaExiste
                                    ? 'border-amber-200 bg-amber-50/50'
                                    : 'border-neutral-200 bg-white hover:border-brand-cyan hover:shadow-sm'
                                }
                            `}
                        >
                            {/* Icono y nombre */}
                            <div className="flex items-start gap-2 mb-2">
                                <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${variante.yaExiste ? 'bg-amber-100' : 'bg-neutral-100'}
                                `}>
                                    <Package size={14} className={`sm:w-4 sm:h-4 ${variante.yaExiste ? 'text-amber-600' : 'text-neutral-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h6 className="text-[9px] sm:text-[10px] font-black uppercase text-black truncate">
                                        {producto.nombre}
                                    </h6>
                                    {variante.yaExiste && (
                                        <span className="inline-block px-1.5 py-0.5 bg-amber-200 text-amber-800 text-[7px] sm:text-[8px] font-black uppercase rounded mt-1">
                                            Ya existe
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Atributos */}
                            <div className="space-y-1 mb-2">
                                {Object.entries(variante.atributos).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                        <span className="font-black uppercase text-neutral-500">{key}:</span>
                                        <span className="font-bold text-neutral-700">{value}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* SKU y Stock */}
                            <div className="pt-2 border-t border-neutral-200 space-y-1">
                                <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                    <span className="font-black uppercase text-neutral-500">SKU:</span>
                                    <span className="font-mono font-bold text-neutral-700">{variante.sku}</span>
                                </div>
                                <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                                    <span className="font-black uppercase text-neutral-500">Stock:</span>
                                    <span className="font-bold text-neutral-700">0</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={generando}
                    className="px-4 py-2.5 sm:py-3 bg-neutral-100 text-neutral-700 rounded-lg font-black text-[10px] sm:text-[11px] uppercase tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-2 sm:order-1"
                >
                    <ChevronLeft size={14} />
                    Volver
                </button>
                
                <button
                    type="button"
                    onClick={handleGenerar}
                    disabled={generando || nuevasVariantes.length === 0}
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
                            Generar {nuevasVariantes.length} Variantes
                        </>
                    )}
                </button>
            </div>
            
            {nuevasVariantes.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Todas las combinaciones ya existen. No hay variantes nuevas para generar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PreviewTab;
