import React, { useState, useRef, useEffect } from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';
import AtributosTab from './AtributosTab';
import PreviewTab from './PreviewTab';
import GestionTab from './GestionTab';

const VariantesTabSystem = ({ 
    producto, 
    atributos, 
    setAtributos,
    variantes,
    onGenerar,
    onRefresh,
    generando
}) => {
    const [activeTab, setActiveTab] = useState('atributos');
    const containerRef = useRef(null);
    const [hasChangedTab, setHasChangedTab] = useState(false);
    
    // Scroll al contenedor SOLO cuando el usuario cambia de tab manualmente
    useEffect(() => {
        if (hasChangedTab && containerRef.current) {
            containerRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
            setHasChangedTab(false);
        }
    }, [hasChangedTab]);
    
    // Calcular si hay atributos y valores
    const tieneAtributos = atributos && Object.keys(atributos).length > 0;
    const tieneAtributosConValores = tieneAtributos && Object.values(atributos).some(vals => 
        Array.isArray(vals) && vals.length > 0
    );
    
    // Calcular número de variantes a generar
    const numVariantesAGenerar = tieneAtributosConValores 
        ? Object.values(atributos).reduce((acc, vals) => acc * (vals?.length || 1), 1)
        : 0;
    
    const tabs = [
        { 
            id: 'atributos', 
            label: '1. Atributos',
            enabled: true,
            badge: tieneAtributosConValores ? numVariantesAGenerar : null
        },
        { 
            id: 'preview', 
            label: '2. Preview',
            enabled: tieneAtributosConValores,
            badge: null
        },
        { 
            id: 'gestion', 
            label: '3. Variantes',
            enabled: variantes.length > 0,
            badge: variantes.length > 0 ? variantes.length : null
        }
    ];
    
    return (
        <div ref={containerRef} className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-brand-cyan mt-4 sm:mt-6 bg-gradient-to-br from-neutral-50/80 to-cyan-50/30 rounded-xl w-full p-3 sm:p-4">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black flex items-center gap-2 flex-wrap">
                            <Settings size={14} className="text-brand-cyan flex-shrink-0" />
                            <span className="truncate">Variantes de Venta</span>
                            {producto.usa_variantes && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={10} />
                                    Sistema Activo
                                </span>
                            )}
                        </h3>
                        <p className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider sm:tracking-widest mt-1">
                            Gestiona stock y precios por Talle, Color u otras opciones
                        </p>
                    </div>
                </div>
                
                {/* Info Card */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                    <p className="text-[9px] font-bold text-cyan-900 leading-relaxed">
                        <strong className="text-black">¿Qué son las variantes?</strong> Son las diferentes opciones de un mismo producto que tus clientes pueden elegir (ej: Remera Roja Talle M, Remera Azul Talle L). Cada variante tiene su propio stock y precio.
                    </p>
                </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex gap-1 sm:gap-2 border-b border-neutral-200 overflow-x-auto pb-0">
                {tabs.map(tab => (
                    <button
                        type="button"
                        key={tab.id}
                        onClick={() => {
                            if (tab.enabled) {
                                setActiveTab(tab.id);
                                setHasChangedTab(true);
                            }
                        }}
                        disabled={!tab.enabled}
                        className={`
                            relative px-3 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest
                            transition-all duration-200 whitespace-nowrap flex-shrink-0
                            ${activeTab === tab.id
                                ? 'bg-brand-cyan text-black border-b-2 border-brand-cyan'
                                : tab.enabled
                                    ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-b-2 border-transparent'
                                    : 'bg-neutral-50 text-neutral-300 cursor-not-allowed border-b-2 border-transparent'
                            }
                            rounded-t-lg
                        `}
                    >
                        <span className="flex items-center gap-1.5">
                            {tab.label}
                            {tab.badge !== null && (
                                <span className={`
                                    px-1.5 py-0.5 rounded-full text-[7px] font-black
                                    ${activeTab === tab.id
                                        ? 'bg-black text-white'
                                        : 'bg-brand-cyan text-black'
                                    }
                                `}>
                                    {tab.badge}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
            
            {/* Tab Content */}
            <div className="min-h-[300px] sm:min-h-[400px]">
                {activeTab === 'atributos' && (
                    <AtributosTab
                        atributos={atributos}
                        setAtributos={setAtributos}
                        numVariantesAGenerar={numVariantesAGenerar}
                        onNext={() => {
                            setActiveTab('preview');
                            setHasChangedTab(true);
                        }}
                        tieneAtributosConValores={tieneAtributosConValores}
                    />
                )}
                
                {activeTab === 'preview' && (
                    <PreviewTab
                        producto={producto}
                        atributos={atributos}
                        variantesExistentes={variantes}
                        onGenerar={onGenerar}
                        onBack={() => {
                            setActiveTab('atributos');
                            setHasChangedTab(true);
                        }}
                        onSuccess={() => {
                            onRefresh();
                            setActiveTab('gestion');
                            setHasChangedTab(true);
                        }}
                        generando={generando}
                    />
                )}
                
                {activeTab === 'gestion' && (
                    <GestionTab
                        producto={producto}
                        variantes={variantes}
                        onRefresh={onRefresh}
                    />
                )}
            </div>
        </div>
    );
};

export default VariantesTabSystem;
