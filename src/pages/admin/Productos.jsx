import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Package,
    AlignLeft,
    Layout,
    Tag,
    Truck,
    CircleDollarSign,
    Settings,
    Info,
    Hash,
    Plus,
    X,
    UploadCloud,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ImagePlus,
    Trash2,
    Component,
    Save,
    TrendingUp,
    FileText,
    ShoppingCart,
    ChevronDown,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import Modal from '../../components/ui/Modal';
import Accordion from '../../components/ui/Accordion';
import BulkPriceUpdateModal from '../../components/modals/BulkPriceUpdateModal';
import { ExportButton } from '../../components/ui/ExportButton';
import { useAuthStore } from '../../store/authStore';
import { productosService } from '../../services/productosService';
import { variantesService } from '../../services/variantesService';
import VariantesTabSystem from '../../components/variantes/VariantesTabSystem';
import PremiumSelect from '../../components/ui/PremiumSelect';
import {
    uploadProductImage,
    deleteProductImage,
    parseImagenes,
    serializeImagenes
} from '../../lib/supabaseStorage';
import { toast } from '../../store/toastStore';

// ─── Product Card Preview ──────────────────────────────────────────────────────
const ProductCardPreview = ({ formData, categorias, marcas, isPrivileged, variantes = [] }) => {
    const imagenes = (formData._imagenesTemp || []).filter(Boolean);
    const [activeImg, setActiveImg] = useState(0);
    const [showVariantes, setShowVariantes] = useState(false);
    const [showCaracteristicas, setShowCaracteristicas] = useState(false);
    const cat  = categorias.find(c => c.id_categoria === Number(formData.id_categoria));
    const marc = marcas.find(m => m.id_marca === Number(formData.id_marca));

    // Calcular totales de variantes
    const totalVariantes = variantes.length;
    const variantesActivas = variantes.filter(v => v.activo).length;
    const stockTotal = variantes.reduce((sum, v) => sum + (v.stock_central || 0), 0);
    
    // Parsear atributos técnicos
    const atributosTecnicos = formData.atributos 
        ? (typeof formData.atributos === 'string' ? JSON.parse(formData.atributos) : formData.atributos)
        : {};
    const tieneCaracteristicas = Object.keys(atributosTecnicos).length > 0;

    return (
        <div className="sticky top-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-3 text-center">
                Vista Previa del Producto
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-100 dark:border-gray-700 overflow-hidden shadow-md max-w-[200px] mx-auto">
                {/* Image gallery */}
                <div className="aspect-square bg-neutral-50 dark:bg-gray-700 relative overflow-hidden">
                    {imagenes.length > 0 ? (
                        <>
                            <img
                                src={imagenes[activeImg] || imagenes[0]}
                                alt="preview"
                                className="w-full h-full object-cover transition-all duration-500"
                            />
                            {imagenes.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                                    {imagenes.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setActiveImg(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                activeImg === i ? 'bg-white dark:bg-gray-300 scale-125' : 'bg-white/50 dark:bg-gray-500/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-neutral-200">
                            <Box size={48} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sin Imagen</span>
                        </div>
                    )}
                    {/* Category badge */}
                    {cat && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                            {cat.nombre}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-3">
                    <p className="text-[8px] font-black uppercase tracking-wider text-brand-cyan dark:text-cyan-400 mb-0.5">
                        {marc?.nombre_marca || 'Marca'}
                    </p>
                    <h3 className="font-sport text-sm uppercase leading-tight text-black dark:text-white mb-2 min-h-[2rem]">
                        {formData.nombre || 'Nombre del Producto'}
                    </h3>
                    {formData.descripcion && (
                        <p className="text-[9px] font-medium text-neutral-400 dark:text-gray-300 mb-2 line-clamp-2">
                            {formData.descripcion}
                        </p>
                    )}

                    {/* Características Técnicas */}
                    {tieneCaracteristicas && (
                        <div className="mb-2">
                            <button
                                type="button"
                                onClick={() => setShowCaracteristicas(!showCaracteristicas)}
                                className="w-full p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">CARACTERÍSTICAS</span>
                                    {showCaracteristicas 
                                        ? <ChevronDown size={14} className="text-blue-700 dark:text-blue-400" />
                                        : <ChevronRight size={14} className="text-blue-700 dark:text-blue-400" />
                                    }
                                </div>
                            </button>
                            {showCaracteristicas && (
                                <div className="mt-1 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-1">
                                    {Object.entries(atributosTecnicos).map(([key, valores]) => (
                                        <div key={key} className="text-[8px]">
                                            <span className="font-black uppercase text-blue-700 dark:text-blue-400">{key}:</span>
                                            <span className="ml-1 text-neutral-600 dark:text-gray-300">{Array.isArray(valores) ? valores.join(', ') : valores}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Variant Summary Badge */}
                    {totalVariantes > 0 && (
                        <div className="mb-2">
                            <button
                                type="button"
                                onClick={() => setShowVariantes(!showVariantes)}
                                className="w-full p-2 bg-brand-cyan/10 dark:bg-cyan-900/20 rounded-lg border border-brand-cyan/20 dark:border-cyan-800/30 hover:bg-brand-cyan/20 dark:hover:bg-cyan-900/40 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-brand-cyan dark:text-cyan-400">VARIANTES</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-sport text-brand-cyan dark:text-cyan-400">{totalVariantes}</span>
                                        {showVariantes 
                                            ? <ChevronDown size={14} className="text-brand-cyan dark:text-cyan-400" />
                                            : <ChevronRight size={14} className="text-brand-cyan dark:text-cyan-400" />
                                        }
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[8px]">
                                    <span className="text-neutral-500 dark:text-gray-400">Activas: {variantesActivas}</span>
                                    <span className="text-neutral-500 dark:text-gray-400">Stock: {stockTotal}</span>
                                </div>
                            </button>
                            {showVariantes && (
                                <div className="mt-1 max-h-[200px] overflow-y-auto space-y-1">
                                    {variantes.map((variante, idx) => (
                                        <div key={idx} className="p-2 bg-cyan-50/50 dark:bg-cyan-900/10 rounded border border-cyan-100 dark:border-cyan-800/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[8px] font-black uppercase text-cyan-700 dark:text-cyan-400">
                                                    {Object.entries(variante.atributos_valores || {}).map(([k, v]) => v).join(' / ')}
                                                </span>
                                                <span className={`text-[7px] px-1 py-0.5 rounded ${variante.activo ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-neutral-300 dark:bg-gray-700 text-neutral-600 dark:text-gray-400'}`}>
                                                    {variante.activo ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[7px] text-neutral-600 dark:text-gray-400">
                                                <span>Stock: {variante.stock_central || 0}</span>
                                                <span className="font-mono">{variante.sku_variante}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-sport text-base text-black dark:text-white leading-none">
                                ${Number(formData.precio_venta_sugerido || 0).toLocaleString()} <span className="text-[8px] text-neutral-400 uppercase tracking-wider">Público</span>
                            </span>
                            {isPrivileged && (
                                <span className="font-sport text-sm text-brand-cyan mt-0.5">
                                    ${Number(formData.precio_pushsport || 0).toLocaleString()} <span className="text-[8px] text-brand-cyan uppercase tracking-wider">Push</span>
                                </span>
                            )}
                        </div>
                        {isPrivileged && (
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase tracking-wider text-green-500 mb-0.5">Ganancia</span>
                                <span className="font-sport text-sm text-green-500">
                                    ${(Number(formData.precio_venta_sugerido || 0) - Number(formData.precio_pushsport || 0)).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Image Slot ───────────────────────────────────────────────────────────────
const ImageSlot = ({ url, uploadingLocal, onFileSelect, onRemove, index }) => {
    const inputRef = useRef(null);

    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
                Foto {index + 1} {index === 0 ? '(Principal)' : ''}
            </p>
            <div
                onClick={() => !url && !uploadingLocal && inputRef.current?.click()}
                className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden
                    ${url
                        ? 'border-brand-cyan cursor-default'
                        : 'border-dashed border-neutral-200 bg-neutral-50 hover:border-brand-cyan hover:bg-brand-cyan/5 cursor-pointer'
                    }`}
            >
                {uploadingLocal ? (
                    <>
                        {typeof uploadingLocal === 'string' && (
                            <img src={uploadingLocal} alt="preview" className="w-full h-full object-cover opacity-50 grayscale" />
                        )}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${typeof uploadingLocal === 'string' ? 'bg-black/40' : 'bg-neutral-50 dark:bg-gray-800'}`}>
                            <Loader2 size={20} className="animate-spin text-brand-cyan" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-brand-cyan">Subiendo...</span>
                        </div>
                    </>
                ) : url ? (
                    <>
                        <img src={url} alt={`img-${index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors group flex items-center justify-center">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-red-500"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="absolute top-1.5 right-1.5">
                            <CheckCircle2 size={14} className="text-brand-cyan bg-white dark:bg-gray-800 rounded-full" />
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-300">
                        <ImagePlus size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Agregar</span>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={e => onFileSelect(e.target.files?.[0], index)}
            />
        </div>
    );
};

// ─── Multi Image Picker ────────────────────────────────────────────────────────
const MultiImagePicker = ({ formData, setFormData }) => {
    // _imagenesTemp: up to 3 public URLs (already uploaded)
    const urls     = formData._imagenesTemp || ['', '', ''];
    const uploading = formData._uploading || [false, false, false];

    const handleFile = async (file, index) => {
        if (!file) return;
        
        // Validación estricta de tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Formato no soportado. Por favor, selecciona una imagen JPG, PNG o WEBP válida.');
            return;
        }

        // Validación de tamaño (5MB como indica la UI)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen debe pesar menos de 5MB');
            return;
        }

        // Crear preview local
        const previewUrl = URL.createObjectURL(file);
        
        // Marcar como subiendo y mostrar preview
        const newUploading = [...uploading];
        newUploading[index] = previewUrl;
        setFormData(prev => ({ ...prev, _uploading: newUploading }));

        try {
            const publicUrl = await uploadProductImage(file);
            const newUrls = [...urls];
            newUrls[index] = publicUrl;
            setFormData(prev => ({
                ...prev,
                _imagenesTemp: newUrls,
                _uploading: newUploading.map((_, i) => i === index ? false : _),
                imagen_url: serializeImagenes(newUrls),
            }));
        } catch (err) {
            console.error('Error uploading image:', err);
            toast.error(`Error de conexión al subir imagen: ${err.message}`);
            const newUploading2 = [...uploading];
            newUploading2[index] = false;
            setFormData(prev => ({ ...prev, _uploading: newUploading2 }));
        } finally {
            // Liberar memoria del preview
            URL.revokeObjectURL(previewUrl);
        }
    };

    const handleRemove = async (index) => {
        const urlToDelete = urls[index];
        const newUrls = [...urls];
        newUrls[index] = '';
        setFormData(prev => ({
            ...prev,
            _imagenesTemp: newUrls,
            imagen_url: serializeImagenes(newUrls),
        }));
        // Delete from storage (best effort)
        if (urlToDelete) deleteProductImage(urlToDelete);
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">
                Imágenes del Producto <span className="text-neutral-400">(hasta 3 · máx. 5MB c/u)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[0, 1, 2].map(i => (
                    <ImageSlot
                        key={i}
                        index={i}
                        url={urls[i]}
                        uploadingLocal={uploading[i]}
                        onFileSelect={handleFile}
                        onRemove={handleRemove}
                    />
                ))}
            </div>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                Formatos: JPG, PNG, WEBP — Máx. 5MB por imagen
            </p>
        </div>
    );
};

// ─── Constants & Helpers ──────────────────────────────────────────────────
const CATEGORY_SUGGESTIONS = {
    1: ['PESO', 'SABOR', 'FORMATO'], // Suplementos (SIN Tamaño - usar Variantes)
    2: ['MATERIAL', 'GÉNERO', 'USO'], // Indumentaria (SIN Talle/Color - usar Variantes)
    3: ['MATERIAL', 'USO', 'ORIGEN'], // Accesorios (SIN Color - usar Variantes)
    4: ['PESO', 'TIPO', 'ORIGEN'], // Alimentos (SIN Sabor - usar Variantes)
};

// ─── Tag Input Component ───────────────────────────────────────────────────
const TagInput = ({ tags = [], onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = (val) => {
        // Dividir por comas y procesar cada valor como tag separado
        const values = val.split(',').map(v => v.trim().toUpperCase()).filter(v => v);
        const newTags = [...tags];
        values.forEach(value => {
            if (!newTags.includes(value)) {
                newTags.push(value);
            }
        });
        onChange(newTags);
        setInputValue('');
    };

    const removeTag = (tagToRemove) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg focus-within:border-brand-cyan dark:focus-within:border-cyan-400 transition-all min-h-[42px]">
            {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-brand-cyan text-white text-[9px] font-black uppercase rounded-md animate-in zoom-in-50 duration-200">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-200 transition-colors">
                        <X size={10} strokeWidth={3} />
                    </button>
                </span>
            ))}
            <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-black dark:text-white uppercase placeholder:text-neutral-300 dark:placeholder:text-gray-500 min-w-[120px] p-0.5"
                placeholder={tags.length === 0 ? placeholder : "MÁS..."}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => addTag(inputValue)}
            />
        </div>
    );
};

// ─── Attribute Manager ────────────────────────────────────────────────────────
const AttributesManager = ({ formData, setFormData }) => {
    const [customAttrName, setCustomAttrName] = useState('');
    const rawAtributos = formData.atributos || {};
    const suggestions = CATEGORY_SUGGESTIONS[formData.id_categoria] || [];
    
    // Convert current attributes object to array for editing
    let attributesArray = [];
    try {
        const obj = typeof rawAtributos === 'string' ? JSON.parse(rawAtributos) : rawAtributos;
        attributesArray = Object.entries(obj).map(([key, value]) => ({
            key,
            value: Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean)
        }));
    } catch (e) {
        attributesArray = [];
    }

    const updateAttributes = (newArray) => {
        const newObj = {};
        newArray.forEach(attr => {
            if (attr.key.trim()) {
                newObj[attr.key.trim()] = attr.value;
            }
        });
        setFormData(prev => ({ ...prev, atributos: newObj }));
    };

    const addAttribute = (specificKey = '') => {
        const key = specificKey.toUpperCase();
        // Evitar duplicados
        if (attributesArray.some(a => a.key.toUpperCase() === key)) {
            return;
        }
        const newArray = [...attributesArray, { key, value: [] }];
        updateAttributes(newArray);
    };

    const removeAttribute = (index) => {
        const newArray = attributesArray.filter((_, i) => i !== index);
        updateAttributes(newArray);
    };

    const handleChange = (index, field, newValue) => {
        const newArray = [...attributesArray];
        newArray[index] = { ...newArray[index], [field]: newValue };
        updateAttributes(newArray);
    };

    const getPlaceholder = (key) => {
        const k = key.toUpperCase();
        if (k.includes('SABOR')) return 'EJ: VAINILLA, FRUTILLA...';
        if (k.includes('TALLE')) return 'EJ: XL, M, 42...';
        if (k.includes('COLOR')) return 'EJ: ROJO, NEGRO...';
        if (k.includes('MATERIAL')) return 'EJ: ALGODÓN, CUERO...';
        return 'ESCRIBE Y PRESIONA ENTER...';
    };

    const handleAddCustomAttribute = () => {
        if (!customAttrName.trim()) return;
        addAttribute(customAttrName.trim());
        setCustomAttrName('');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-[9px] font-bold text-black dark:text-white uppercase tracking-widest">
                    Características del producto
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        value={customAttrName}
                        onChange={(e) => setCustomAttrName(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomAttribute();
                            }
                        }}
                        placeholder="NUEVA CARACTERÍSTICA..."
                        className="flex-1 sm:w-48 px-3 py-1.5 text-[9px] font-bold uppercase bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400"
                    />
                    <button
                        type="button"
                        onClick={handleAddCustomAttribute}
                        disabled={!customAttrName.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={12} className="stroke-[3]" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Añadir</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Suggestions Pills */}
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(sug => {
                            const existingAttr = attributesArray.find(a => a.key.toUpperCase() === sug);
                            const isComplete = existingAttr && existingAttr.value.length > 0;
                            const isEmpty = existingAttr && existingAttr.value.length === 0;
                            const canAdd = !existingAttr;
                            return (
                                <button
                                    key={sug}
                                    type="button"
                                    onClick={() => canAdd && addAttribute(sug)}
                                    disabled={!canAdd}
                                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${
                                        isComplete 
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 cursor-not-allowed shadow-none' 
                                            : isEmpty
                                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 cursor-not-allowed shadow-none'
                                                : 'bg-white dark:bg-gray-700 text-neutral-500 dark:text-gray-400 border-neutral-200 dark:border-gray-600 hover:border-brand-cyan hover:text-brand-cyan shadow-sm active:scale-95'
                                    }`}
                                >
                                    {isComplete ? '✓ ' : isEmpty ? '• ' : '+ '}{sug}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="grid gap-3">
                    {attributesArray.length > 0 ? (
                        attributesArray.map((attr, index) => {
                            const isEmpty = attr.value.length === 0;
                            return (
                                <div key={index} className={`flex flex-col sm:grid sm:grid-cols-[120px_1fr_40px] gap-2 sm:gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300 p-2 rounded-lg ${isEmpty ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50' : ''}`}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="ETIQUETA"
                                            className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border rounded-lg text-[10px] font-bold text-black dark:text-white uppercase focus:border-brand-cyan dark:focus:border-cyan-400 outline-none transition-all shadow-sm ${isEmpty ? 'border-amber-300 dark:border-amber-700 focus:border-amber-400 dark:focus:border-amber-500' : 'border-neutral-200 dark:border-gray-600'}`}
                                            value={attr.key}
                                            onChange={(e) => handleChange(index, 'key', e.target.value.toUpperCase())}
                                        />
                                        {isEmpty && (
                                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-400 dark:bg-amber-600 text-white text-[7px] font-black uppercase rounded">
                                                Vacío
                                            </span>
                                        )}
                                    </div>
                                    <TagInput
                                        tags={attr.value}
                                        placeholder={getPlaceholder(attr.key)}
                                        onChange={(newTags) => handleChange(index, 'value', newTags)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAttribute(index)}
                                        className="w-10 h-10 flex items-center justify-center text-neutral-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-50 dark:hover:bg-gray-600 rounded-lg transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 border border-dashed border-neutral-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-300 dark:text-gray-600 grayscale opacity-60">
                            <Settings size={32} strokeWidth={1} className="animate-pulse" />
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] block">Personaliza tu producto</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-60">Sabor, Talle, Color, Material...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: GESTIÓN DE VARIANTES
// ═══════════════════════════════════════════════════════════
const VariantesManager = ({ producto, refresh, onVariantesChange }) => {
    const [modo, setModo] = useState('gestion'); // 'gestion' | 'crear'
    const [variantes, setVariantes] = useState([]);
    const [generando, setGenerando] = useState(false);
    const [atributos, setAtributos] = useState({});

    // Sincronizar atributos cuando cambie el producto
    useEffect(() => {
        const parsedAtributos = typeof producto.atributos === 'string' 
            ? JSON.parse(producto.atributos || '{}') 
            : (producto.atributos || {});
        setAtributos(parsedAtributos);
    }, [producto.atributos]);
    
    useEffect(() => {
        if (producto.id_producto) {
            loadVariantes();
        }
    }, [producto.id_producto]);
    
    // Notificar cambios de variantes al componente padre
    useEffect(() => {
        if (onVariantesChange) {
            onVariantesChange(variantes);
        }
    }, [variantes, onVariantesChange]);

    const loadVariantes = async () => {
        try {
            const data = await variantesService.getByProducto(producto.id_producto);
            setVariantes(data.variantes || []);
        } catch (err) {
            console.error('Error al cargar variantes:', err);
        }
    };

    const handleGenerar = async (combinacionesEspecificas = null) => {
        setGenerando(true);
        try {
            const result = await variantesService.generarDesdeAtributos(
                producto.id_producto, 
                atributos,
                combinacionesEspecificas
            );
            return result;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al generar variantes');
            throw err;
        } finally {
            setGenerando(false);
        }
    };

    const [confirmToggle, setConfirmToggle] = useState(null);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggleUsaVariantes = async () => {
        const nuevoValor = !producto.usa_variantes;
        
        if (nuevoValor && variantes.length === 0) {
            toast.error('Primero debés generar variantes antes de activar la gestión');
            return;
        }

        // Si hay stock central y estamos activando, verificar si las variantes ya tienen stock propio
        if (nuevoValor && producto.stock_central > 0) {
            const stockEnVariantes = variantes.reduce((sum, v) => sum + (v.stock_central || 0), 0);
            
            if (stockEnVariantes > 0) {
                // Las variantes YA tienen stock propio: activar directamente sin migración
                setConfirmToggle({
                    action: 'activate',
                    nuevoValor: true,
                    title: '¿Activar Gestión por Variantes?',
                    message: (
                        <>
                            Las variantes de este producto ya tienen stock registrado.<br /><br />
                            Al activar, el stock central del producto se recalculará como la suma de todas las variantes.
                        </>
                    )
                });
                return;
            }
            
            // Las variantes NO tienen stock: mostrar wizard de distribución
            try {
                const freshProduct = await productosService.getById(producto.id_producto);
                setDistribucion({});
                // Actualizar localmente el stock central por si cambió en DB
                producto.stock_central = freshProduct.stock_central; 
                
                const initDistribucion = {};
                variantes.forEach(v => {
                    initDistribucion[v.id_variante] = '';
                });
                setDistribucion(initDistribucion);
                setShowMigracion(true);
            } catch (err) {
                toast.error('Error al sincronizar stock antes de la migración');
            }
            return;
        }

        // Confirmación antes de desactivar
        if (!nuevoValor && variantes.length > 0) {
            setConfirmToggle({
                action: 'deactivate',
                nuevoValor: false,
                title: '¿Desactivar Gestión por Variantes?',
                message: (
                    <>
                        Las variantes seguirán existiendo pero no se usarán en ventas.<br /><br />
                        Podés reactivarlas en cualquier momento.
                    </>
                )
            });
            return;
        }

        ejecutarToggleUsaVariantes(nuevoValor);
    };

    const ejecutarToggleUsaVariantes = async (nuevoValor, action = null) => {
        setIsToggling(true);
        try {
            await variantesService.toggleUsaVariantes(producto.id_producto, nuevoValor);
            toast.success(nuevoValor 
                ? 'Gestión por variantes activada correctamente' 
                : 'Gestión por variantes desactivada correctamente'
            );
            if (action === 'activate') {
                if (refresh) refresh();
            } else {
                await loadVariantes();
            }
            setConfirmToggle(null);
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.message || 'Error al cambiar configuración');
        } finally {
            setIsToggling(false);
        }
    };

    // Actualizar una variante (SKU, stock, precio, estado)
    const handleActualizarVariante = async (id_variante, cambios, silent = false) => {
        try {
            await variantesService.actualizarVariante(id_variante, cambios);
            
            // Actualizar estado local
            setVariantes(prev => prev.map(v => 
                v.id_variante === id_variante ? { ...v, ...cambios } : v
            ));
            
            // Mostrar mensaje según el cambio solo si no es silencioso
            if (!silent) {
                if (cambios.precio_variante !== undefined) {
                    toast.success(cambios.precio_variante > 0 
                        ? `Precio específico guardado: $${cambios.precio_variante}`
                        : 'Usando precio base del producto'
                    );
                } else if (cambios.stock_central !== undefined) {
                    toast.success(`Stock actualizado: ${cambios.stock_central} unidades`);
                } else if (cambios.activo !== undefined) {
                    toast.success(cambios.activo ? 'Variante activada' : 'Variante desactivada');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar variante');
        }
    };

    // Estado para modal de confirmación
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Eliminar una variante (solo si no tiene stock)
    const handleEliminarVariante = async (id_variante) => {
        const variante = variantes.find(v => v.id_variante === id_variante);
        
        if (variante?.stock_central > 0) {
            toast.error('No se puede eliminar: la variante tiene stock en el depósito central');
            return;
        }

        // Mostrar modal de confirmación elegante
        setConfirmDelete(variante);
    };

    const confirmarEliminacion = async () => {
        if (!confirmDelete || isDeleting) return;
        
        setIsDeleting(true);
        
        try {
            await variantesService.eliminarVariante(confirmDelete.id_variante);
            setVariantes(prev => prev.filter(v => v.id_variante !== confirmDelete.id_variante));
            toast.success('Variante eliminada exitosamente');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar variante');
        } finally {
            setIsDeleting(false);
            setConfirmDelete(null);
        }
    };

    const handleMigrarStock = async () => {
        const totalDistribuido = Object.values(distribucion).reduce((a, b) => a + parseInt(b || 0), 0);
        
        if (totalDistribuido !== producto.stock_central) {
            toast.error(`La suma debe ser igual al stock central (${producto.stock_central}). Actual: ${totalDistribuido}`);
            return;
        }

        setMigrando(true);
        try {
            await variantesService.migrarStock(producto.id_producto, distribucion);
            await variantesService.toggleUsaVariantes(producto.id_producto, true);
            toast.success('Stock migrado exitosamente y sistema de variantes activado');
            setShowMigracion(false);
            if (refresh) refresh();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al migrar stock');
        } finally {
            setMigrando(false);
        }
    };

    const handleStockChange = (id_variante, valor) => {
        // Evitar ceros a la izquierda: limpiar y parsear
        const cleanVal = valor === '' ? '' : String(parseInt(valor) || 0);
        setDistribucion(prev => ({
            ...prev,
            [id_variante]: cleanVal
        }));
    };

    const renderAtributos = (atributos_valores) => {
        if (!atributos_valores) return '-';
        return Object.entries(atributos_valores)
            .map(([k, v]) => v)
            .join(' / ');
    };

    return (
        <div className="space-y-4">
            {modo === 'gestion' ? (
                // MODO GESTIÓN: Vista principal con tabla de variantes
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-900 dark:text-cyan-300">
                                Variantes Existentes
                            </h4>
                            <p className="text-[9px] text-cyan-600 dark:text-cyan-400 mt-1">
                                {variantes.length} variante{variantes.length !== 1 ? 's' : ''} registrada{variantes.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setModo('crear')}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all font-black text-[10px] uppercase tracking-wider"
                        >
                            <Plus size={14} />
                            Crear Nuevas Variantes
                        </button>
                    </div>
                    
                    {/* Renderizar GestionTab directamente */}
                    <VariantesTabSystem
                        producto={producto}
                        atributos={atributos}
                        setAtributos={setAtributos}
                        variantes={variantes}
                        onGenerar={handleGenerar}
                        onRefresh={loadVariantes}
                        generando={generando}
                        modoInicial="gestion"
                    />
                </div>
            ) : (
                // MODO CREAR: Flujo de creación con tabs
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-900 dark:text-cyan-200">
                                Crear Nuevas Variantes
                            </h4>
                            <p className="text-[9px] text-cyan-600 dark:text-cyan-400 mt-1">
                                Define atributos y selecciona las combinaciones a crear
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                console.log('Cambiando a modo gestión');
                                setModo('gestion');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-all font-black text-[10px] uppercase tracking-wider"
                        >
                            <ChevronLeft size={14} />
                            Volver a Gestión
                        </button>
                    </div>
                    
                    <VariantesTabSystem
                        key={`crear-${modo}`}
                        producto={producto}
                        atributos={atributos}
                        setAtributos={setAtributos}
                        variantes={variantes}
                        onGenerar={handleGenerar}
                        onRefresh={loadVariantes}
                        generando={generando}
                        modoInicial="crear"
                        onVolverAGestion={() => setModo('gestion')}
                        forzarTab={modo === 'crear' ? 'atributos' : 'gestion'}
                    />
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: MODAL REPOSICIÓN
// ═══════════════════════════════════════════════════════════
const ModalReposicion = ({ isOpen, onClose, producto: initialProducto, onSave }) => {
    const [producto, setProducto] = useState(null);
    const [cantidadSimple, setCantidadSimple] = useState('');
    const [cantidadesVariantes, setCantidadesVariantes] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset when modal opens/closes or product changes
    useEffect(() => {
        if (isOpen && initialProducto?.id_producto) {
            setCantidadSimple('');
            setCantidadesVariantes({});
            setSubmitting(false);
            setLoading(true);
            productosService.getById(initialProducto.id_producto)
                .then(data => setProducto(data))
                .catch(err => {
                    console.error(err);
                    toast.error('Error al obtener datos actualizados del producto');
                    onClose();
                })
                .finally(() => setLoading(false));
        } else {
            setProducto(null);
        }
    }, [isOpen, initialProducto]);

    const handleVarianteChange = (id_variante, value) => {
        const cleanVal = value === '' ? '' : String(parseInt(value) || 0);
        setCantidadesVariantes(prev => ({
            ...prev,
            [id_variante]: cleanVal
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let payload = {};
            const hasVariantes = producto.variantes && producto.variantes.length > 0;

            if (hasVariantes) {
                const items = Object.entries(cantidadesVariantes)
                    .map(([id_variante, cantidad]) => ({ id_variante, cantidad }))
                    .filter(item => item.cantidad > 0);
                
                if (items.length === 0) {
                    toast.error('Debes ingresar al menos una cantidad mayor a 0 en alguna variante');
                    setSubmitting(false);
                    return;
                }
                payload = { items };
            } else {
                if (!cantidadSimple || parseInt(cantidadSimple) <= 0) {
                    toast.error('Debes ingresar una cantidad válida');
                    setSubmitting(false);
                    return;
                }
                payload = { cantidad: parseInt(cantidadSimple) };
            }

            await onSave(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (loading || !producto) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Ingreso a Casa Central (Reposición)">
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 size={32} className="animate-spin text-brand-cyan" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Cargando producto...</span>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ingreso a Casa Central (Reposición)">
            <form onSubmit={handleSubmit} className="space-y-4 py-1">
                <div className="p-3 border border-neutral-100 dark:border-gray-700 rounded bg-neutral-50/50 dark:bg-gray-800">
                    <p className="text-neutral-400 dark:text-gray-400 text-[8px] font-black uppercase tracking-[0.3em] mb-0.5">Producto Seleccionado</p>
                    <p className="text-black dark:text-white font-sport text-lg uppercase truncate leading-tight">{producto.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-neutral-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-widest">Stock Central: {producto.stock_central} UN.</p>
                        {producto.usa_variantes && (
                            <span className="px-1.5 py-0.5 bg-black dark:bg-gray-700 text-white text-[7px] font-black uppercase rounded">Variantes Activas</span>
                        )}
                    </div>
                </div>

                {producto.variantes && producto.variantes.length > 0 ? (
                    <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Desglose de Stock por Variantes</label>
                            </div>
                            {!producto.usa_variantes && (
                                <div className="p-2 border border-neutral-200 rounded">
                                    <p className="text-[8px] text-neutral-500 leading-tight uppercase font-bold">
                                        Gestión por variantes no activada. Se recomienda activar en pestaña "Variantes".
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="border border-neutral-200 dark:border-gray-600 rounded-lg overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400">Atributos</th>
                                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 text-center">Actual</th>
                                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 text-center w-28">Ingreso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-gray-600">
                                    {producto.variantes?.filter(v => v.activo !== false).map(v => {
                                        const attrs = typeof v.atributos_valores === 'string' ? JSON.parse(v.atributos_valores) : v.atributos_valores;
                                        return (
                                            <tr key={v.id_variante} className="bg-white dark:bg-gray-800">
                                                <td className="px-3 py-2">
                                                    <span className="text-[10px] font-bold uppercase text-black dark:text-white">
                                                        {Object.values(attrs || {}).join(' / ')}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center text-[10px] font-black text-neutral-400 dark:text-gray-400">
                                                    {v.stock_central}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number" min="0" placeholder="0"
                                                        value={cantidadesVariantes[v.id_variante] || ''}
                                                        onChange={(e) => handleVarianteChange(v.id_variante, e.target.value)}
                                                        className="w-full text-center px-2 py-1.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded text-xs font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 transition-colors"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 mt-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-gray-400 block ml-1">Cantidad a Ingresar</label>
                        <div className="relative">
                            <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <input
                                type="number" min="1" required
                                value={cantidadSimple}
                                onChange={(e) => setCantidadSimple(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded text-lg font-black text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2 mt-4">
                    <button
                        type="submit" disabled={submitting}
                        className="w-full bg-black dark:bg-cyan-600 text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-800 dark:hover:bg-cyan-700 transition-colors disabled:opacity-50 h-11"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Confirmar Reposición
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-[9px] font-black text-neutral-400 dark:text-gray-400 uppercase tracking-widest py-2 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                        Cancelar Operación
                    </button>
                </div>
            </form>
        </Modal>
    );
};
const Productos = () => {
    const { user } = useAuthStore();
    const isPrivileged = user?.id_rol === 1 || user?.id_rol === 2; // Admin or Supervisor
    const isSuperAdmin = user?.id_rol === 1;
    
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [reposicionProducto, setReposicionProducto] = useState(null);
    const [isReposicionModalOpen, setIsReposicionModalOpen] = useState(false);
    const refreshABM = useRef(null);
    const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        Promise.all([
            productosService.getCategorias(),
            productosService.getMarcas(),
            productosService.getProveedores(),
        ]).then(([cats, mars, provs]) => {
            setCategorias(cats);
            setMarcas(mars);
            setProveedores(provs);
        }).catch(console.error);
    }, []);

    const columns = [
        {
            header: 'Producto / Especificación',
            accessor: 'nombre',
            width: 'min-w-[300px]',
            render: (row) => {
                const atributos = typeof row.atributos === 'string' ? JSON.parse(row.atributos || '{}') : (row.atributos || {});
                const imgs = parseImagenes(row.imagen_url).filter(Boolean);
                return (
                    <div className="flex items-center gap-3 py-1">
                        {/* Mini Thumbnail */}
                        <div className="flex-shrink-0 relative group">
                            {imgs[0] ? (
                                <img src={imgs[0]} alt="" className="w-10 h-10 object-cover rounded border border-neutral-100 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-110" />
                            ) : (
                                <div className="w-10 h-10 bg-neutral-50 dark:bg-gray-800 rounded border border-neutral-100 dark:border-gray-700 flex items-center justify-center">
                                    <Box size={12} className="text-neutral-200" />
                                </div>
                            )}
                            {imgs.length > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-black text-white text-[7px] font-black px-1 rounded-sm">+{imgs.length - 1}</span>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-[10px] text-black dark:text-white uppercase tracking-wider truncate">{row.nombre}</span>
                                <span className="text-[7px] font-bold text-neutral-400 dark:text-gray-300 uppercase tracking-widest border-l border-neutral-200 dark:border-gray-600 pl-1.5">
                                    {row.marca?.nombre_marca || 'GEN'} · {row.categoria?.nombre || 'S/C'}
                                </span>
                            </div>
                            <span className="text-[8px] font-medium text-neutral-400 dark:text-gray-300 uppercase tracking-tighter truncate max-w-[200px]">
                                {row.descripcion || 'Sin descripción'}
                            </span>
                            {Object.keys(atributos).length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0 mt-0.5">
                                    {Object.entries(atributos).slice(0, 3).map(([key, value]) => (
                                        <span key={key} className="text-[7px] font-bold text-neutral-300 dark:text-gray-500 uppercase">
                                            {key}: <span className="text-neutral-500 dark:text-gray-400">{Array.isArray(value) ? value.join('/') : String(value)}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Gestión / Inventario',
            width: 'w-[120px]',
            render: (row) => {
                const variantesCount = row.variantes?.length || 0;
                const stockTotal = row.variantes?.reduce((sum, v) => sum + (v.stock_central || 0), 0) || 0;
                const tieneVariantes = variantesCount > 0;

                return (
                    <div className="flex flex-col gap-0.5 py-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-black dark:text-white">
                                {stockTotal} <span className="text-neutral-300 dark:text-gray-500 font-bold text-[7px]">STOCK</span>
                            </span>
                            <div className="w-px h-2 bg-neutral-200 dark:bg-gray-600" />
                            <span className="text-[9px] font-black text-neutral-400 dark:text-gray-400">
                                {variantesCount} <span className="text-neutral-200 dark:text-gray-600 font-bold text-[7px]">VAR</span>
                            </span>
                        </div>
                        <div className="flex items-center">
                            {row.usa_variantes && tieneVariantes ? (
                                <span className="text-[7px] font-black uppercase text-green-600 flex items-center gap-0.5">
                                    <CheckCircle2 size={7} /> Variantes
                                </span>
                            ) : !row.usa_variantes && tieneVariantes ? (
                                <span className="text-[7px] font-black uppercase text-amber-500 flex items-center gap-0.5">
                                    <AlertCircle size={7} /> Pendiente
                                </span>
                            ) : (
                                <span className="text-[7px] font-black uppercase text-neutral-300 dark:text-gray-500 flex items-center gap-0.5">
                                    <Layout size={7} /> Simple
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Precios (AR$)',
            width: 'w-[110px]',
            render: (row) => (
                <div className="flex flex-col py-1">
                    <div className="flex items-baseline gap-0.5">
                        <span className="font-black text-[10px] text-black dark:text-white">
                            ${Number(row.precio_venta_sugerido || 0).toLocaleString()}
                        </span>
                        <span className="text-[6px] text-neutral-300 dark:text-gray-400 font-black uppercase">PÚB</span>
                    </div>
                    {isPrivileged && (
                        <div className="flex flex-col border-t border-neutral-50 dark:border-gray-700 mt-0.5 pt-0.5">
                            <span className="font-black text-[8px] text-brand-cyan dark:text-cyan-400 leading-none">
                                ${Number(row.precio_pushsport || 0).toLocaleString()} <span className="text-[6px] opacity-40">PUSH</span>
                            </span>
                            <span className="text-[6px] font-bold text-neutral-300 dark:text-gray-500 uppercase mt-0.5">
                                COST: ${Number(row.costo_compra || 0).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Estado',
            width: 'w-[70px]',
            render: (row) => (
                <div className="flex items-center justify-center">
                    <div className={`px-1.5 py-0.5 rounded-sm text-[7px] font-black uppercase tracking-tighter border ${
                        row.activo !== false
                            ? 'bg-green-500 text-white border-green-500 dark:bg-green-600 dark:border-green-600'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                    }`}>
                        {row.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                    </div>
                </div>
            )
        },
    ];

    const renderForm = (formData, setFormData, refresh) => {
        // Initialize temp image state from existing imagen_url on edit
        if (!formData._imagenesTemp) {
            const existing = parseImagenes(formData.imagen_url);
            const padded = [...existing, '', '', ''].slice(0, 3);
            setFormData(prev => ({ ...prev, _imagenesTemp: padded, _uploading: [false, false, false] }));
        }

        // Estados para acordeones
        const [isFichaTecnicaOpen, setIsFichaTecnicaOpen] = useState(true);
        const [isVariantesOpen, setIsVariantesOpen] = useState(true);
        
        // Estado para variantes (compartido con VariantesManager)
        const [variantesPreview, setVariantesPreview] = useState([]);

        return (
            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* ── LEFT: Form fields (75%) ── */}
                <div className="space-y-4 w-full lg:w-[75%]">

                    {/* Images */}
                    <MultiImagePicker formData={formData} setFormData={setFormData} />

                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Nombre del Producto *</label>
                        <div className="relative group">
                            <Box size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                            <input
                                required type="text"
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all"
                                placeholder="EJ: WHEY PROTEIN 1KG"
                                value={formData.nombre || ''}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>

                    {/* Descripcion */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Descripción</label>
                        <div className="relative group">
                            <AlignLeft size={16} className="absolute left-4 top-4 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                            <textarea
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all min-h-[70px] resize-none"
                                placeholder="Notas generales..."
                                value={formData.descripcion || ''}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                    </div>


                    {/* Categoría + Marca */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Categoría *</label>
                            <PremiumSelect
                                icon={Component}
                                placeholder="SELECCIONAR..."
                                options={categorias.map(c => ({ value: c.id_categoria, label: c.nombre }))}
                                value={formData.id_categoria || ''}
                                onChange={val => {
                                    const nextVal = parseInt(val);
                                    if (nextVal !== formData.id_categoria) {
                                        setFormData({ ...formData, id_categoria: nextVal, atributos: {} });
                                    } else {
                                        setFormData({ ...formData, id_categoria: nextVal });
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Marca *</label>
                            <PremiumSelect
                                icon={Tag}
                                placeholder="SELECCIONAR..."
                                options={marcas.map(m => ({ value: m.id_marca, label: m.nombre_marca }))}
                                value={formData.id_marca || ''}
                                onChange={val => setFormData({ ...formData, id_marca: parseInt(val) })}
                            />
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Proveedor</label>
                        <PremiumSelect
                            icon={Truck}
                            placeholder="SIN PROVEEDOR"
                            options={proveedores.map(p => ({ value: p.id_proveedor, label: p.nombre_proveedor }))}
                            value={formData.id_proveedor || ''}
                            onChange={val => setFormData({ ...formData, id_proveedor: val || null })}
                        />
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        ACORDEÓN: FICHA TÉCNICA
                    ═══════════════════════════════════════════════════════════ */}
                    <Accordion
                        isOpen={isFichaTecnicaOpen}
                        onToggle={() => setIsFichaTecnicaOpen(!isFichaTecnicaOpen)}
                        title="FICHA TÉCNICA"
                        subtitle="Información descriptiva del producto"
                        icon={FileText}
                        color="blue"
                    >
                        <AttributesManager formData={formData} setFormData={setFormData} />
                    </Accordion>

                    {/* Separador visual */}
                    <div className="relative py-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-neutral-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-gray-800 px-4 text-xs font-black text-neutral-400 dark:text-gray-500 uppercase tracking-widest">
                                Configuración de Variantes
                            </span>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        ACORDEÓN: VARIANTES DE VENTA
                    ═══════════════════════════════════════════════════════════ */}
                    {formData.id_producto && (
                        <Accordion
                            isOpen={isVariantesOpen}
                            onToggle={() => setIsVariantesOpen(!isVariantesOpen)}
                            title="VARIANTES DE VENTA"
                            subtitle="Opciones con stock y precio propio"
                            icon={ShoppingCart}
                            color="cyan"
                            badge={formData.usa_variantes && (
                                <span className="px-2 py-1 bg-green-500 text-white text-[8px] font-black uppercase rounded-full">
                                    Sistema Activo
                                </span>
                            )}
                        >
                            <VariantesManager 
                                producto={formData} 
                                refresh={refresh}
                                onVariantesChange={setVariantesPreview}
                            />
                        </Accordion>
                    )}

                    {/* Precios + Stock Mínimo */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Costo */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black dark:text-white truncate block">Costo *</label>
                            <div className="relative group">
                                <CircleDollarSign size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-bold text-black dark:text-gray-100 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 transition-all dark:placeholder-gray-500"
                                    placeholder="0.00"
                                    value={formData.costo_compra ?? ''}
                                    onChange={e => setFormData({ ...formData, costo_compra: e.target.value })}
                                />
                            </div>
                        </div>
                        {/* Push Sport */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors truncate block ${
                                Number(formData.precio_pushsport) > 0 && Number(formData.precio_pushsport) < Number(formData.costo_compra) 
                                ? 'text-red-500' 
                                : 'text-brand-cyan'
                            }`}>Precio Base *</label>
                            <div className="relative group">
                                <CircleDollarSign size={14} className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                                    Number(formData.precio_pushsport) > 0 && Number(formData.precio_pushsport) < Number(formData.costo_compra) 
                                    ? 'text-red-500' 
                                    : 'text-brand-cyan'
                                }`} />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className={`w-full pl-8 sm:pl-10 pr-7 sm:pr-10 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-1 ${
                                        Number(formData.precio_pushsport) > 0 && Number(formData.precio_pushsport) < Number(formData.costo_compra) 
                                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                                        : 'bg-brand-cyan/5 dark:bg-cyan-900/20 border border-brand-cyan dark:border-cyan-700 text-brand-cyan dark:text-cyan-400 focus:ring-brand-cyan dark:focus:ring-cyan-400'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.precio_pushsport ?? ''}
                                    onChange={e => setFormData({ ...formData, precio_pushsport: e.target.value })}
                                />
                                {Number(formData.precio_pushsport) > 0 && Number(formData.precio_pushsport) < Number(formData.costo_compra) && (
                                    <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                                )}
                            </div>
                            {Number(formData.precio_pushsport) > 0 && Number(formData.precio_pushsport) < Number(formData.costo_compra) && (
                                <p className="text-[8px] font-bold text-red-500 uppercase tracking-wider">Menor al costo</p>
                            )}
                        </div>
                        {/* Público */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors truncate block ${
                                Number(formData.precio_venta_sugerido) > 0 && Number(formData.precio_venta_sugerido) < Number(formData.precio_pushsport) 
                                ? 'text-red-500' 
                                : 'text-black dark:text-white'
                            }`}>Público *</label>
                            <div className="relative group">
                                <CircleDollarSign size={14} className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                                    Number(formData.precio_venta_sugerido) > 0 && Number(formData.precio_venta_sugerido) < Number(formData.precio_pushsport) 
                                    ? 'text-red-500' 
                                    : 'text-neutral-400'
                                }`} />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className={`w-full pl-8 sm:pl-10 pr-7 sm:pr-10 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-1 ${
                                        Number(formData.precio_venta_sugerido) > 0 && Number(formData.precio_venta_sugerido) < Number(formData.precio_pushsport) 
                                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                                        : 'bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:ring-black dark:focus:ring-cyan-400'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.precio_venta_sugerido ?? ''}
                                    onChange={e => setFormData({ ...formData, precio_venta_sugerido: e.target.value })}
                                />
                                {Number(formData.precio_venta_sugerido) > 0 && Number(formData.precio_venta_sugerido) < Number(formData.precio_pushsport) && (
                                    <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none animate-pulse" />
                                )}
                            </div>
                            {Number(formData.precio_venta_sugerido) > 0 && Number(formData.precio_venta_sugerido) < Number(formData.precio_pushsport) && (
                                <p className="text-[8px] font-bold text-red-500 uppercase tracking-wider">Pérdida</p>
                            )}
                        </div>
                        {/* Stock Mínimo */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black dark:text-white truncate block">Stock Mín.</label>
                            <div className="relative group">
                                <Settings size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    type="number" min="0"
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 transition-all"
                                    placeholder="5"
                                    value={formData.stock_minimo ?? ''}
                                    onChange={e => setFormData({ ...formData, stock_minimo: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Central */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Stock Casa Central</label>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Unidades disponibles en depósito PushSport para distribuir a comercios</p>
                        <div className="relative">
                            <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cyan pointer-events-none" />
                            <input
                                type="number" min="0"
                                className="w-full pl-10 pr-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 border-2 border-brand-cyan/30 dark:border-cyan-700 rounded-lg text-sm font-bold text-black dark:text-white focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan dark:focus:ring-cyan-400 transition-all"
                                placeholder="0"
                                value={formData.stock_central ?? ''}
                                onChange={e => setFormData({ ...formData, stock_central: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Activo toggle */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Estado del Producto</p>
                            <p className="text-[9px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                                {formData.activo === false ? 'Inactivo - No visible en catálogo ni POS' : 'Activo - Visible en catálogo y POS'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                                formData.activo === false ? 'text-neutral-400 dark:text-gray-500' : 'text-brand-cyan dark:text-cyan-400'
                            }`}>
                                {formData.activo === false ? 'Inactivo' : 'Activo'}
                            </span>
                            <div
                                onClick={() => setFormData({ ...formData, activo: formData.activo === false ? true : false })}
                                className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                                    formData.activo === false ? 'bg-neutral-200 dark:bg-gray-600' : 'bg-brand-cyan dark:bg-cyan-600'
                                }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-gray-300 rounded-full shadow absolute top-1 transition-all ${
                                    formData.activo === false ? 'left-1' : 'left-6'
                                }`} />
                            </div>
                        </div>
                    </div>

                    {/* Info banner */}
                    <div className="p-3 sm:p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-2 sm:gap-3">
                        <Info size={14} className="text-black mt-0.5 shrink-0" />
                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-neutral-500 leading-relaxed m-0 space-y-1">
                            <p>El <span className="text-brand-cyan">Stock Mínimo</span> genera alertas cuando el stock es bajo.</p>
                            <p>Las <span className="text-brand-cyan">Variantes</span> permiten gestionar diferentes combinaciones (ej: Tamaño/Sabor) del mismo producto.</p>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Vista Previa (25%) ── */}
                <div className="hidden lg:block w-[25%] min-w-[200px]">
                    <div className="sticky top-4">
                        <ProductCardPreview
                            formData={formData}
                            categorias={categorias}
                            marcas={marcas}
                            isPrivileged={isPrivileged}
                            variantes={variantesPreview}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const handleValidate = (form) => {
        if (!form.nombre?.trim()) return "El nombre del producto es obligatorio.";
        if (!form.id_categoria) return "Debes seleccionar una categoría.";
        if (!form.id_marca) return "Debes seleccionar una marca.";
        if (!form.costo_compra && form.costo_compra !== 0) return "El costo de compra es obligatorio.";
        if (!form.precio_pushsport && form.precio_pushsport !== 0) return "El precio Push Sport es obligatorio.";
        if (!form.precio_venta_sugerido && form.precio_venta_sugerido !== 0) return "El precio público es obligatorio.";
        
        // Logical validations - Convertir a números para comparación correcta
        const costo = Number(form.costo_compra);
        const precioPush = Number(form.precio_pushsport);
        const precioPublico = Number(form.precio_venta_sugerido);
        
        if (precioPush < costo) {
            return "Advertencia: El precio Push Sport no puede ser menor al costo de compra.";
        }
        if (precioPublico < precioPush) {
            return "Advertencia: El precio público no puede ser menor al precio Push Sport.";
        }

        return null;
    };

    const handleReponerClick = (row) => {
        setReposicionProducto(row);
        setIsReposicionModalOpen(true);
    };

    const handleSaveReposicion = async (payload, refresh) => {
        try {
            await productosService.reponerStock(reposicionProducto.id_producto, payload);
            toast.success('Stock central actualizado exitosamente');
            setIsReposicionModalOpen(false);
            setReposicionProducto(null);
            // Refresh data in GenericABM without full reload
            if (refresh) refresh();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al reponer stock');
        }
    };

    const handleBulkPriceUpdate = async (data) => {
        console.log('========== FRONTEND: Enviando bulk update ==========');
        console.log('Data a enviar:', data);
        
        try {
            const result = await productosService.bulkUpdatePrices(data);
            console.log('Resultado:', result);
            toast.success(`${result.count} producto${result.count !== 1 ? 's' : ''} actualizado${result.count !== 1 ? 's' : ''} exitosamente`);
            setIsBulkPriceModalOpen(false);
            setSelectedProducts([]);
            if (refreshABM.current) refreshABM.current();
        } catch (err) {
            console.error('Error en bulk update:', err);
            toast.error(err.response?.data?.error || 'Error al actualizar precios');
        }
    };

    const customActions = isPrivileged ? (row, isInDropdown = false, refresh, onCloseDropdown) => {
        if (isInDropdown) {
            // Versión para dropdown con texto
            return (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Click en Reponer Stock');
                        setReposicionProducto(row);
                        setIsReposicionModalOpen(true);
                        if (onCloseDropdown) onCloseDropdown();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all cursor-pointer pointer-events-auto min-h-[44px]"
                >
                    <Package size={14} className="opacity-70" />
                    <span>Reponer Stock</span>
                </button>
            );
        }
        // Versión compacta para tabla
        return (
            <button
                onClick={() => {
                    setReposicionProducto(row);
                    setIsReposicionModalOpen(true);
                }}
                title="Reponer Stock Central"
                className="w-6 h-6 flex items-center justify-center rounded border border-green-100 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all"
            >
                <Package size={12} />
            </button>
        );
    } : null;

    const headerActions = isSuperAdmin ? (
        <button
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-cyan text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-md"
        >
            <TrendingUp size={16} />
            Actualizar Precios
        </button>
    ) : null;

    return (
        <>
            <GenericABM
            title="Catálogo de Productos"
            description="Administra el catálogo global de artículos. Establece el Precio Público para venta directa y el Precio Push Sport (Base) para calcular la ganancia que retendrá cada franquicia o sede."
            icon={Package}
            service={productosService}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            validate={handleValidate}
            onSaveSuccess={(newProduct) => {
                toast.success('Producto creado. Ya podés configurar las variantes debajo.');
            }}
            idField="id_producto"
            modalMaxWidth="max-w-4xl"
            customActions={customActions}
            headerActions={headerActions}
            onDataLoaded={(data) => setAllProducts(data)}
            onRefreshReady={(refreshFn) => { refreshABM.current = refreshFn; }}
        />
        
        <ModalReposicion 
            isOpen={isReposicionModalOpen} 
            onClose={() => {
                setIsReposicionModalOpen(false);
                setReposicionProducto(null);
            }}
            producto={reposicionProducto}
            onSave={(payload) => handleSaveReposicion(payload, refreshABM.current)}
        />
        
        <BulkPriceUpdateModal
            isOpen={isBulkPriceModalOpen}
            onClose={() => {
                setIsBulkPriceModalOpen(false);
                setSelectedProducts([]);
            }}
            onConfirm={handleBulkPriceUpdate}
            products={allProducts}
            selectedProductIds={selectedProducts}
        />
        </>
    );
};

export default Productos;
