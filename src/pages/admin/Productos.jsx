import React, { useState, useEffect, useRef } from 'react';
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
    Trash2
} from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { ExportButton } from '../../components/ui/ExportButton';
import { useAuthStore } from '../../store/authStore';
import { productosService } from '../../services/productosService';
import { variantesService } from '../../services/variantesService';
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
    const cat  = categorias.find(c => c.id_categoria === Number(formData.id_categoria));
    const marc = marcas.find(m => m.id_marca === Number(formData.id_marca));

    // Calcular totales de variantes
    const totalVariantes = variantes.length;
    const variantesActivas = variantes.filter(v => v.activo).length;
    const stockTotal = variantes.reduce((sum, v) => sum + (v.stock_central || 0), 0);

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
                    <p className="text-[8px] font-black uppercase tracking-wider text-brand-cyan mb-0.5">
                        {marc?.nombre_marca || 'Marca'}
                    </p>
                    <h3 className="font-sport text-sm uppercase leading-tight text-black dark:text-white mb-2 min-h-[2rem]">
                        {formData.nombre || 'Nombre del Producto'}
                    </h3>
                    {formData.descripcion && (
                        <p className="text-[9px] font-medium text-neutral-400 dark:text-gray-500 mb-2 line-clamp-2">
                            {formData.descripcion}
                        </p>
                    )}

                    {/* Variant Summary Badge */}
                    {totalVariantes > 0 && (
                        <div className="mb-2 p-2 bg-brand-cyan/10 rounded-lg border border-brand-cyan/20">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-brand-cyan">VARIANTES</span>
                                <span className="text-[10px] font-sport text-brand-cyan">{totalVariantes}</span>
                            </div>
                            <div className="flex items-center justify-between text-[8px]">
                                <span className="text-neutral-500">Activas: {variantesActivas}</span>
                                <span className="text-neutral-500">Stock: {stockTotal}</span>
                            </div>
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-50">
                        <Loader2 size={20} className="animate-spin text-brand-cyan" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-brand-cyan">Subiendo...</span>
                    </div>
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
                accept="image/*"
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
        if (file.size > 10 * 1024 * 1024) {
            toast.error('La imagen debe pesar menos de 10MB');
            return;
        }
        // Mark uploading
        const newUploading = [...uploading];
        newUploading[index] = true;
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
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
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
    1: ['SABORES', 'TAMAÑO', 'FORMATO'], // Suplementos
    2: ['TALLES', 'COLOR', 'MATERIAL', 'GÉNERO'], // Indumentaria
    3: ['MATERIAL', 'COLOR', 'USO'], // Accesorios
    4: ['SABORES', 'PESO', 'TIPO'], // Alimentos
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
                className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-black uppercase placeholder:text-neutral-300 min-w-[120px] p-0.5"
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

    return (
        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">
                        Especificaciones / Atributos
                    </label>
                    <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                        Define variantes para el catálogo
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => addAttribute()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-lg hover:bg-brand-cyan/20 transition-all"
                >
                    <Plus size={12} className="stroke-[3]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Añadir</span>
                </button>
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
                                            ? 'bg-green-50 text-green-600 border-green-200 cursor-not-allowed shadow-none' 
                                            : isEmpty
                                                ? 'bg-amber-50 text-amber-600 border-amber-200 cursor-not-allowed shadow-none'
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
                                <div key={index} className={`flex flex-col sm:grid sm:grid-cols-[120px_1fr_40px] gap-2 sm:gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300 p-2 rounded-lg ${isEmpty ? 'bg-amber-50/50 border border-amber-200' : ''}`}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="ETIQUETA"
                                            className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border rounded-lg text-[10px] font-bold text-black dark:text-white uppercase focus:border-brand-cyan dark:focus:border-cyan-400 outline-none transition-all shadow-sm ${isEmpty ? 'border-amber-300 focus:border-amber-400' : 'border-neutral-200 dark:border-gray-600'}`}
                                            value={attr.key}
                                            onChange={(e) => handleChange(index, 'key', e.target.value.toUpperCase())}
                                        />
                                        {isEmpty && (
                                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-400 text-white text-[7px] font-black uppercase rounded">
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
                                        className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-neutral-50 rounded-lg transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 border border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-300 grayscale opacity-60">
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
const VariantesManager = ({ producto }) => {
    const [variantes, setVariantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState(null);
    const [migrando, setMigrando] = useState(false);
    const [distribucion, setDistribucion] = useState({});
    const [showMigracion, setShowMigracion] = useState(false);
    // Estado local de atributos para sincronización en tiempo real
    const [atributos, setAtributos] = useState({});

    // Sincronizar atributos cuando cambie el producto
    useEffect(() => {
        const parsedAtributos = typeof producto.atributos === 'string' 
            ? JSON.parse(producto.atributos || '{}') 
            : (producto.atributos || {});
        setAtributos(parsedAtributos);
    }, [producto.atributos]);
    
    const tieneAtributos = Object.keys(atributos).length > 0;
    const tieneAtributosConValores = Object.values(atributos).some(arr => Array.isArray(arr) && arr.length > 0);

    useEffect(() => {
        if (producto.id_producto) {
            loadVariantes();
        }
    }, [producto.id_producto]);

    const loadVariantes = async () => {
        setLoading(true);
        try {
            const data = await variantesService.getByProducto(producto.id_producto);
            setVariantes(data.variantes || []);
            setError(null);
        } catch (err) {
            setError('Error al cargar variantes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerar = async () => {
        if (!tieneAtributosConValores) {
            toast.error('Los atributos no tienen valores definidos');
            return;
        }

        setGenerando(true);
        try {
            // Enviar atributos directamente al backend para generar variantes
            // El backend guardará los atributos y generará las variantes en una sola operación
            const result = await variantesService.generarDesdeAtributos(
                producto.id_producto, 
                atributos
            );
            if (result.variantes_creadas === 0) {
                toast.info('Todas las combinaciones de variantes ya existen. No se generaron variantes nuevas.');
            } else {
                toast.success(`Se generaron ${result.variantes_creadas} variantes nuevas`);
            }
            loadVariantes();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al generar variantes');
        } finally {
            setGenerando(false);
        }
    };

    const handleToggleUsaVariantes = async () => {
        const nuevoValor = !producto.usa_variantes;
        
        if (nuevoValor && variantes.length === 0) {
            toast.error('Primero debes generar variantes antes de activar el sistema');
            return;
        }

        // Si hay stock central y estamos activando, mostrar wizard de migración
        if (nuevoValor && producto.stock_central > 0) {
            setShowMigracion(true);
            // Inicializar distribución con 0 para cada variante
            const initDistribucion = {};
            variantes.forEach(v => {
                initDistribucion[v.id_variante] = 0;
            });
            setDistribucion(initDistribucion);
            return;
        }

        // Confirmación antes de desactivar
        if (!nuevoValor && variantes.length > 0) {
            const confirmar = window.confirm(
                '¿Estás seguro de desactivar el sistema de variantes?\n\n' +
                'Las variantes seguirán existiendo pero no se usarán en ventas.\n' +
                'Podés reactivarlas en cualquier momento.'
            );
            if (!confirmar) return;
        }

        try {
            await variantesService.toggleUsaVariantes(producto.id_producto, nuevoValor);
            toast.success(nuevoValor 
                ? '✅ Sistema de variantes activado. Ahora podés usar las variantes en ventas.' 
                : '⚠️ Sistema de variantes desactivado. Se usará el producto base en ventas.'
            );
            // Recargar variantes para actualizar estado
            await cargarVariantes();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al cambiar configuración');
        }
    };

    // Actualizar una variante (SKU, stock, precio, estado)
    const handleActualizarVariante = async (id_variante, cambios) => {
        try {
            await variantesService.actualizarVariante(id_variante, cambios);
            
            // Actualizar estado local
            setVariantes(prev => prev.map(v => 
                v.id_variante === id_variante ? { ...v, ...cambios } : v
            ));
            
            // Mostrar mensaje según el cambio
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
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al migrar stock');
        } finally {
            setMigrando(false);
        }
    };

    const handleStockChange = (id_variante, valor) => {
        setDistribucion(prev => ({
            ...prev,
            [id_variante]: parseInt(valor) || 0
        }));
    };

    const renderAtributos = (atributos_valores) => {
        if (!atributos_valores) return '-';
        return Object.entries(atributos_valores)
            .map(([k, v]) => v)
            .join(' / ');
    };

    const totalDistribuido = Object.values(distribucion).reduce((a, b) => a + (parseInt(b) || 0), 0);
    const distribucionValida = totalDistribuido === producto.stock_central;

    return (
        <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-brand-cyan mt-4 sm:mt-6 bg-gradient-to-br from-neutral-50/80 to-cyan-50/30 rounded-xl w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black flex items-center gap-2 flex-wrap">
                        <Settings size={14} className="text-brand-cyan flex-shrink-0" />
                        <span className="truncate">Gestión de Variantes</span>
                        {producto.usa_variantes && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase rounded-full">
                                Activo
                            </span>
                        )}
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider sm:tracking-widest mt-1">
                        Control de stock por combinación de atributos
                    </p>
                </div>
            </div>

            {/* Card explicativa - siempre visible */}
            <div className="p-3 sm:p-4 bg-white border border-neutral-200 rounded-lg shadow-sm">
                <h4 className="text-[9px] sm:text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Info size={12} className="text-brand-cyan" />
                    ¿Cómo funciona?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-[9px] font-bold flex-shrink-0">1</div>
                        <p className="text-[9px] text-neutral-600 leading-snug">
                            <strong>Definí atributos</strong> arriba (ej: SABOR = Vainilla, Chocolate)
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-[9px] font-bold flex-shrink-0">2</div>
                        <p className="text-[9px] text-neutral-600 leading-snug">
                            <strong>Clic en "Generar Variantes"</strong> para crear todas las combinaciones posibles
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-[9px] font-bold flex-shrink-0">3</div>
                        <p className="text-[9px] text-neutral-600 leading-snug">
                            <strong>Clic en "Activar Sistema"</strong> para habilitar las variantes en ventas
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={handleGenerar}
                    disabled={generando || !tieneAtributosConValores}
                    className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-brand-cyan text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Generar Variantes
                </button>

                {variantes.length > 0 && (
                    <button
                        type="button"
                        onClick={handleToggleUsaVariantes}
                        className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest rounded-lg transition-colors ${
                            producto.usa_variantes
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                    >
                        {producto.usa_variantes ? (
                            <><AlertCircle size={14} /> Desactivar Sistema</>
                        ) : (
                            <><CheckCircle2 size={14} /> Activar Sistema</>
                        )}
                    </button>
                )}
            </div>

            {/* Explicación de botones */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-blue-700 leading-relaxed">
                    <strong>Generar Variantes:</strong> Crea automáticamente todas las combinaciones de variantes (ej: Chocolate 50g, Chocolate 100g, Vainilla 50g, etc.). Si ya existen todas las combinaciones, no creará duplicados.
                    <br className="hidden sm:block" />
                    <strong>Activar Sistema:</strong> Habilita el uso de variantes en el catálogo y POS. Sin activar, el producto se venderá sin opción de elegir variantes.
                </p>
            </div>

            {/* Estados del sistema - Alertas progresivas */}
            
            {/* Estado 1: Sin atributos definidos */}
            {!tieneAtributos && (
                <div className="p-3 sm:p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <h5 className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                                Paso 1 pendiente: Definir atributos
                            </h5>
                            <p className="text-[9px] sm:text-[10px] text-amber-700 mt-1 leading-relaxed">
                                Para crear variantes, primero necesitás definir atributos en la sección de arriba.
                                <br className="hidden sm:block" />
                                <strong>Ejemplos:</strong> SABOR (Vainilla, Chocolate), TAMAÑO (1kg, 2kg), COLOR (Rojo, Azul)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado 2: Atributos sin valores */}
            {tieneAtributos && !tieneAtributosConValores && (
                <div className="p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Tag size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h5 className="text-[10px] sm:text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                                Paso 2 pendiente: Agregar valores a los atributos
                            </h5>
                            <p className="text-[9px] sm:text-[10px] text-blue-700 mt-1 leading-relaxed">
                                Tenés atributos definidos pero <strong>sin valores</strong>. Agregalos en los campos de texto arriba.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {Object.entries(atributos || {})
                                    .filter(([_, vals]) => !vals || vals.length === 0)
                                    .map(([key]) => (
                                        <span key={key} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-bold uppercase rounded">
                                            {key}: vacío
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado 3: Listo para generar */}
            {tieneAtributosConValores && variantes.length === 0 && !generando && (
                <div className="p-3 sm:p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                        <div>
                            <h5 className="text-[10px] sm:text-[11px] font-bold text-green-800 uppercase tracking-wider">
                                ¡Listo para generar variantes!
                            </h5>
                            <p className="text-[9px] sm:text-[10px] text-green-700 mt-1 leading-relaxed">
                                Hacé clic en <strong>"Generar Variantes"</strong> para crear automáticamente todas las combinaciones.
                                <br className="hidden sm:block" />
                                Se crearán: {Object.values(atributos)
                                    .filter(vals => Array.isArray(vals) && vals.length > 0)
                                    .reduce((acc, vals) => acc * vals.length, 1)} variantes posibles
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Wizard de migración - Modal Mejorado */}
            {showMigracion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-cyan-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                                    <Settings size={20} className="text-brand-cyan" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-black">
                                        Activar Sistema de Variantes
                                    </h4>
                                    <p className="text-[10px] text-neutral-500">
                                        Paso 1 de 2: Distribuir stock existente
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Explicación */}
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 mx-4 mt-4 rounded-r-lg">
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                                <strong>¿Qué está pasando?</strong><br />
                                El producto tiene <strong className="text-amber-900">{producto.stock_central} unidades</strong> en stock central sin clasificar por variantes.
                                <br /><br />
                                <strong>Debes distribuir TODO el stock</strong> entre las variantes antes de activar el sistema.
                                <br /><br />
                                <span className="text-[10px]">
                                    💡 Tip: Si no sabés la distribución exacta, poné todo en una variante (ej: "CF") y luego ajustá con movimientos de stock.
                                </span>
                            </p>
                        </div>

                        {/* Tabla de distribución */}
                        <div className="p-4">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-3 flex items-center gap-2">
                                <Box size={12} />
                                Distribución de Stock
                            </h5>
                            
                            <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-3 py-2 text-[9px] font-bold uppercase text-neutral-500">Variante</th>
                                            <th className="px-3 py-2 text-[9px] font-bold uppercase text-neutral-500 text-right">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {variantes.map(variante => (
                                            <tr key={variante.id_variante} className="hover:bg-neutral-50">
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-black">
                                                            {variante.sku_variante || 'Sin SKU'}
                                                        </span>
                                                        <span className="text-[9px] text-neutral-500">
                                                            {renderAtributos(variante.atributos_valores)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={producto.stock_central}
                                                        value={distribucion[variante.id_variante] || 0}
                                                        onChange={e => handleStockChange(variante.id_variante, e.target.value)}
                                                        className="w-20 px-2 py-1.5 text-sm font-bold text-right border border-neutral-200 rounded focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Indicador de progreso */}
                            <div className="mt-4 p-3 rounded-lg border ${distribucionValida ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-neutral-700">
                                        Progreso de distribución
                                    </span>
                                    <span className={`text-[11px] font-black ${distribucionValida ? 'text-green-700' : 'text-amber-700'}`}>
                                        {totalDistribuido} / {producto.stock_central}
                                    </span>
                                </div>
                                
                                {/* Barra de progreso */}
                                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-300 ${
                                            distribucionValida ? 'bg-green-500' : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${Math.min((totalDistribuido / producto.stock_central) * 100, 100)}%` }}
                                    />
                                </div>
                                
                                {!distribucionValida && (
                                    <p className="text-[9px] mt-2 text-amber-700">
                                        {totalDistribuido < producto.stock_central 
                                            ? `⚠️ Faltan ${producto.stock_central - totalDistribuido} unidades por distribuir` 
                                            : `⚠️ Sobran ${totalDistribuido - producto.stock_central} unidades (debe ser exacto)`
                                        }
                                    </p>
                                )}
                                {distribucionValida && (
                                    <p className="text-[9px] mt-2 text-green-700">
                                        ✅ ¡Distribución completa! Podés continuar.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-3">
                            <button
                                onClick={handleMigrarStock}
                                disabled={!distribucionValida || migrando}
                                className="flex-1 py-3 bg-brand-cyan text-black text-[11px] font-black uppercase rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {migrando ? (
                                    <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                                ) : (
                                    <><CheckCircle2 size={16} /> Confirmar y Activar</>
                                )}
                            </button>
                            <button
                                onClick={() => setShowMigracion(false)}
                                disabled={migrando}
                                className="px-6 py-3 bg-white border border-neutral-300 text-neutral-600 text-[11px] font-bold uppercase rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección informativa sobre variantes */}
            {variantes.length > 0 && (
                <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                        <Info size={16} className="text-brand-cyan shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-brand-cyan mb-1">
                                Gestión de Variantes
                            </p>
                            <p className="text-[9px] text-neutral-600 leading-relaxed">
                                <strong>SKU único:</strong> Código de identificación que no se puede modificar.<br />
                                <strong>Desactivar (Inactivo):</strong> Oculta la variante del catálogo pero conserva stock e historial. Podés reactivarla cuando quieras.<br />
                                <strong>Eliminar (🗑️):</strong> Borra permanentemente SOLO si stock = 0. Si tiene stock o historial de ventas, no se puede eliminar.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de variantes - Con scroll horizontal en móvil */}
            {variantes.length > 0 && (
                <div className="border border-neutral-200 rounded-xl w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-neutral-100 border-b border-neutral-200">
                            <tr>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider" style={{ width: '28%' }}>Combinación</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider" style={{ width: '18%' }}>SKU <span className="text-[8px] text-neutral-400 font-normal">(Código único)</span></th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-center" style={{ width: '12%' }}>Stock</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-right" style={{ width: '18%' }}>
                                    <div className="flex flex-col items-end">
                                        <span>Precio</span>
                                        <span className="text-[8px] text-neutral-400 font-normal">Base: ${producto?.precio_venta_sugerido || 0}</span>
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-center" style={{ width: '14%' }}>
                                    <div className="flex flex-col items-center">
                                        <span>Estado</span>
                                        <span className="text-[8px] text-neutral-400 font-normal">Activo = Visible en ventas</span>
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-center" style={{ width: '10%' }}>
                                    <div className="flex flex-col items-center">
                                        <span>Acciones</span>
                                        <span className="text-[8px] text-neutral-400 font-normal">Eliminar (solo stock 0)</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {variantes.map(variante => (
                                <tr 
                                    key={variante.id_variante} 
                                    className={`hover:bg-neutral-50/50 transition-colors ${
                                        !variante.activo ? 'bg-neutral-100/50 opacity-75' : ''
                                    }`}
                                >
                                    <td className="px-3 py-2.5 align-middle" style={{ width: '28%' }}>
                                        <span className="text-[10px] font-bold text-neutral-900 leading-tight block break-words">
                                            {renderAtributos(variante.atributos_valores)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle" style={{ width: '18%' }}>
                                        <div className="group relative">
                                            <input
                                                type="text"
                                                value={variante.sku_variante || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-[10px] font-mono bg-neutral-100 border border-neutral-200 rounded text-neutral-600 cursor-not-allowed"
                                                placeholder="SKU"
                                                title="Código único de identificación - No editable"
                                            />
                                            {/* Tooltip SKU */}
                                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                                                <div className="bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap">
                                                    Código único (SKU) - No editable
                                                    <div className="absolute top-full left-4 border-4 border-transparent border-t-black"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle text-center" style={{ width: '12%' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={variante.stock_central}
                                            onChange={e => handleActualizarVariante(variante.id_variante, { stock_central: parseInt(e.target.value) || 0 })}
                                            className="w-full px-2 py-1 text-[10px] text-center bg-white border border-neutral-200 rounded focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 focus:outline-none transition-all"
                                        />
                                    </td>
                                    <td className="px-3 py-2.5 align-middle" style={{ width: '18%' }}>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] text-neutral-400">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={variante.precio_variante || 0}
                                                    onChange={e => handleActualizarVariante(variante.id_variante, { precio_variante: parseFloat(e.target.value) || 0 })}
                                                    className="w-20 px-2 py-1 text-[10px] text-right bg-white border border-neutral-200 rounded focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 focus:outline-none transition-all"
                                                    placeholder={producto.precio_venta_sugerido}
                                                />
                                            </div>
                                            {/* Indicador de precio propio */}
                                            {variante.precio_variante > 0 && (
                                                <span className="px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan text-[8px] font-bold uppercase rounded">Propio</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle text-center" style={{ width: '14%' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleActualizarVariante(variante.id_variante, { activo: !variante.activo })}
                                            title={variante.activo ? 'Clic para ocultar esta variante del catálogo (desactivar)' : 'Clic para mostrar esta variante en el catálogo (activar)'}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                                variante.activo 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${variante.activo ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {variante.activo ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle text-center" style={{ width: '10%' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarVariante(variante.id_variante)}
                                            disabled={variante.stock_central > 0 || !variante.activo}
                                            className="p-1.5 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                            title={
                                                variante.stock_central > 0 
                                                    ? 'No se puede eliminar: tiene stock en depósito' 
                                                    : !variante.activo 
                                                        ? 'Primero activá la variante para poder eliminarla' 
                                                        : 'Eliminar permanentemente (no se puede deshacer)'
                                            }
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-brand-cyan" />
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="p-5">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={20} className="text-red-600" />
                            </div>
                            <h3 className="text-base font-black text-center text-neutral-900 mb-2">
                                ¿Eliminar variante?
                            </h3>
                            <p className="text-xs text-neutral-600 text-center mb-4">
                                ¿Eliminar <strong className="text-neutral-900">"{confirmDelete.sku_variante || 'Sin SKU'}"</strong>?
                                <br />
                                <span className="text-red-600 font-medium text-[10px]">No se puede deshacer.</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarEliminacion}
                                    disabled={isDeleting}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Eliminar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Productos Component ─────────────────────────────────────────────────
const Productos = () => {
    const { user } = useAuthStore();
    const isPrivileged = user?.id_rol === 1 || user?.id_rol === 2; // Admin or Supervisor
    
    const [categorias,  setCategorias]  = useState([]);
    const [marcas,      setMarcas]      = useState([]);
    const [proveedores, setProveedores] = useState([]);

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
            header: 'Imagen',
            accessor: 'imagen_url',
            render: (row) => {
                const imgs = parseImagenes(row.imagen_url);
                return imgs[0] ? (
                    <img src={imgs[0]} alt={row.nombre} className="w-40 h-40 object-cover rounded-lg border border-neutral-200 dark:border-gray-600" />
                ) : (
                    <div className="w-40 h-40 bg-neutral-100 dark:bg-gray-700 rounded-lg border border-neutral-200 dark:border-gray-600 flex items-center justify-center">
                        <Box size={16} className="text-neutral-300" />
                    </div>
                );
            }
        },
        {
            header: 'Especificación',
            accessor: 'nombre',
            render: (row) => {
                const atributos = typeof row.atributos === 'string' ? JSON.parse(row.atributos || '{}') : (row.atributos || {});
                const variantesCount = row.variantes?.length || 0;
                const variantesActivas = row.variantes?.filter(v => v.activo).length || 0;
                const stockTotal = row.variantes?.reduce((sum, v) => sum + (v.stock_central || 0), 0) || 0;

                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">
                            {row.descripcion || 'Sin descripción'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            {Object.keys(atributos).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(atributos).slice(0, 2).map(([key, value]) => (
                                        <span key={key} className="text-[8px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-sm font-black uppercase">
                                            {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {variantesCount > 0 && (
                                <span className="text-[8px] bg-brand-cyan/10 text-brand-cyan px-1.5 py-0.5 rounded-sm font-black uppercase">
                                    {variantesCount} variantes · {stockTotal} stock
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Clasificación',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">
                        {row.marca?.nombre_marca || 'Genérico'}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan">
                        {row.categoria?.nombre || 'Sin Cat.'}
                    </span>
                </div>
            )
        },
        {
            header: 'Precios (AR$)',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-sport text-xl text-black leading-none">
                        ${Number(row.precio_venta_sugerido || 0).toLocaleString()} <span className="text-[10px] font-bold text-neutral-400">PÚBLICO</span>
                    </span>
                    {isPrivileged && (
                        <>
                            <span className="font-sport text-base text-brand-cyan leading-none mt-1">
                                ${Number(row.precio_pushsport || 0).toLocaleString()} <span className="text-[9px] font-bold text-brand-cyan">PUSH SPORT</span>
                            </span>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                                Costo: ${Number(row.costo_compra || 0).toLocaleString()}
                            </span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Imágenes',
            render: (row) => {
                const imgs = parseImagenes(row.imagen_url).filter(Boolean);
                return (
                    <div className="flex gap-1">
                        {imgs.map((url, i) => (
                            <img key={i} src={url} alt="" className="w-15 h-15 object-cover rounded-md border border-neutral-200" />
                        ))}
                        {imgs.length === 0 && <span className="text-[9px] text-neutral-400 uppercase font-bold">—</span>}
                    </div>
                );
            }
        },
        {
            header: 'Estado',
            render: (row) => (
                <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    row.activo !== false
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through'
                }`}>
                    {row.activo !== false ? 'Activo' : 'Inactivo'}
                </div>
            )
        },
    ];

    const renderForm = (formData, setFormData) => {
        // Initialize temp image state from existing imagen_url on edit
        if (!formData._imagenesTemp) {
            const existing = parseImagenes(formData.imagen_url);
            const padded = [...existing, '', '', ''].slice(0, 3);
            setFormData(prev => ({ ...prev, _imagenesTemp: padded, _uploading: [false, false, false] }));
        }

        return (
            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* ── LEFT: Form fields (75%) ── */}
                <div className="space-y-4 w-full lg:w-[75%]">

                    {/* Images */}
                    <MultiImagePicker formData={formData} setFormData={setFormData} />

                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Nombre del Producto *</label>
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
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Descripción</label>
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
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Categoría *</label>
                            <div className="relative group">
                                <Layout size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <select
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase focus:outline-none focus:border-brand-cyan transition-all appearance-none"
                                    value={formData.id_categoria || ''}
                                    onChange={e => {
                                        const nextVal = parseInt(e.target.value);
                                        // Reset attributes if category changes to avoid mixing
                                        if (nextVal !== formData.id_categoria) {
                                            setFormData({ ...formData, id_categoria: nextVal, atributos: {} });
                                        } else {
                                            setFormData({ ...formData, id_categoria: nextVal });
                                        }
                                    }}
                                >
                                    <option value="">SELECCIONAR...</option>
                                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Marca *</label>
                            <div className="relative group">
                                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <select
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase focus:outline-none focus:border-brand-cyan transition-all appearance-none"
                                    value={formData.id_marca || ''}
                                    onChange={e => setFormData({ ...formData, id_marca: parseInt(e.target.value) })}
                                >
                                    <option value="">SELECCIONAR...</option>
                                    {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Proveedor</label>
                        <div className="relative group">
                            <Truck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase focus:outline-none focus:border-brand-cyan transition-all appearance-none"
                                value={formData.id_proveedor || ''}
                                onChange={e => setFormData({ ...formData, id_proveedor: e.target.value || null })}
                            >
                                <option value="">SIN PROVEEDOR</option>
                                {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_proveedor}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Atributos Variables (Dinámico) - MOVED TO BOTTOM */}
                    <AttributesManager formData={formData} setFormData={setFormData} />

                    {/* ═══════════════════════════════════════════════════════════
                        GESTIÓN DE VARIANTES
                    ═══════════════════════════════════════════════════════════ */}
                    {formData.id_producto && <VariantesManager producto={formData} />}

                    {/* Precios + Stock Mínimo */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Costo */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black truncate block">Costo *</label>
                            <div className="relative group">
                                <CircleDollarSign size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-bold text-black focus:outline-none focus:border-brand-cyan transition-all"
                                    placeholder="0.00"
                                    value={formData.costo_compra || ''}
                                    onChange={e => setFormData({ ...formData, costo_compra: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        {/* Push Sport */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors truncate block ${
                                formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra 
                                ? 'text-red-500' 
                                : 'text-brand-cyan'
                            }`}>Precio Base *</label>
                            <div className="relative group">
                                <CircleDollarSign size={14} className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                                    formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra 
                                    ? 'text-red-500' 
                                    : 'text-brand-cyan'
                                }`} />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className={`w-full pl-8 sm:pl-10 pr-7 sm:pr-10 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-1 ${
                                        formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra 
                                        ? 'bg-red-50 border border-red-300 text-red-600 focus:ring-red-500' 
                                        : 'bg-brand-cyan/5 border border-brand-cyan text-brand-cyan focus:ring-brand-cyan'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.precio_pushsport || ''}
                                    onChange={e => setFormData({ ...formData, precio_pushsport: Number(e.target.value) })}
                                />
                                {formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra && (
                                    <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                                )}
                            </div>
                            {formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra && (
                                <p className="text-[8px] font-bold text-red-500 uppercase tracking-wider">Menor al costo</p>
                            )}
                        </div>
                        {/* Público */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors truncate block ${
                                formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport 
                                ? 'text-red-500' 
                                : 'text-black'
                            }`}>Público *</label>
                            <div className="relative group">
                                <CircleDollarSign size={14} className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                                    formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport 
                                    ? 'text-red-500' 
                                    : 'text-neutral-400'
                                }`} />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className={`w-full pl-8 sm:pl-10 pr-7 sm:pr-10 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-1 ${
                                        formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport 
                                        ? 'bg-red-50 border border-red-300 text-red-600 focus:ring-red-500' 
                                        : 'bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 text-black dark:text-white focus:ring-black dark:focus:ring-cyan-400'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.precio_venta_sugerido || ''}
                                    onChange={e => setFormData({ ...formData, precio_venta_sugerido: Number(e.target.value) })}
                                />
                                {formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport && (
                                    <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none animate-pulse" />
                                )}
                            </div>
                            {formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport && (
                                <p className="text-[8px] font-bold text-red-500 uppercase tracking-wider">Pérdida</p>
                            )}
                        </div>
                        {/* Stock Mínimo */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black truncate block">Stock Mín.</label>
                            <div className="relative group">
                                <Settings size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    type="number" min="0"
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-bold text-black focus:outline-none focus:border-brand-cyan transition-all"
                                    placeholder="5"
                                    value={formData.stock_minimo || formData.stock_minimo === 0 ? formData.stock_minimo : ''}
                                    onChange={e => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Central */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Stock Casa Central</label>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Unidades disponibles en depósito PushSport para distribuir a comercios</p>
                        <div className="relative">
                            <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cyan pointer-events-none" />
                            <input
                                type="number" min="0"
                                className="w-full pl-10 pr-4 py-3 bg-cyan-50 border-2 border-brand-cyan/30 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                                placeholder="0"
                                value={formData.stock_central ?? ''}
                                onChange={e => setFormData({ ...formData, stock_central: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Activo toggle */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Estado del Producto</p>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Desactivar oculta el producto del catálogo y del POS</p>
                        </div>
                        <div
                            onClick={() => setFormData({ ...formData, activo: formData.activo === false ? true : false })}
                            className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                                formData.activo === false ? 'bg-neutral-200' : 'bg-brand-cyan'
                            }`}
                        >
                            <div className={`w-5 h-5 bg-white dark:bg-gray-300 rounded-full shadow absolute top-1 transition-all ${
                                formData.activo === false ? 'left-1' : 'left-6'
                            }`} />
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
        
        // Logical validations
        if (form.precio_pushsport < form.costo_compra) {
            return "Advertencia: El precio Push Sport no puede ser menor al costo de compra.";
        }
        if (form.precio_venta_sugerido < form.precio_pushsport) {
            return "Advertencia: El precio público no puede ser menor al precio Push Sport.";
        }

        return null;
    };

    return (
        <GenericABM
            title="Catálogo de Productos"
            description="Administra el catálogo global de artículos. Establece el Precio Público para venta directa y el Precio Push Sport (Base) para calcular la ganancia que retendrá cada franquicia o sede."
            icon={Package}
            service={productosService}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            validate={handleValidate}
            idField="id_producto"
            modalMaxWidth="max-w-4xl"
        />
    );
};

export default Productos;
