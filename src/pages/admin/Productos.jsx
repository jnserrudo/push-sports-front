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
    AlertCircle,
    CheckCircle2,
    ImagePlus
} from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { ExportButton } from '../../components/ui/ExportButton';
import { useAuthStore } from '../../store/authStore';
import { productosService } from '../../services/productosService';
import {
    uploadProductImage,
    deleteProductImage,
    parseImagenes,
    serializeImagenes
} from '../../lib/supabaseStorage';
import { toast } from '../../store/toastStore';

// ─── Product Card Preview ──────────────────────────────────────────────────────
const ProductCardPreview = ({ formData, categorias, marcas, isPrivileged }) => {
    const imagenes = (formData._imagenesTemp || []).filter(Boolean);
    const [activeImg, setActiveImg] = useState(0);
    const cat  = categorias.find(c => c.id_categoria === Number(formData.id_categoria));
    const marc = marcas.find(m => m.id_marca === Number(formData.id_marca));

    return (
        <div className="sticky top-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-3 text-center">
                Vista Previa del Producto
            </p>
            <div className="bg-white rounded-2xl border-2 border-neutral-100 overflow-hidden shadow-lg max-w-xs mx-auto">
                {/* Image gallery */}
                <div className="aspect-square bg-neutral-50 relative overflow-hidden">
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
                                                activeImg === i ? 'bg-white scale-125' : 'bg-white/50'
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
                <div className="p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-cyan mb-1">
                        {marc?.nombre_marca || 'Marca'}
                    </p>
                    <h3 className="font-sport text-xl uppercase leading-tight text-black mb-3 min-h-[2.5rem]">
                        {formData.nombre || 'Nombre del Producto'}
                    </h3>
                    {formData.descripcion && (
                        <p className="text-[10px] font-medium text-neutral-400 mb-3 line-clamp-2">
                            {formData.descripcion}
                        </p>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                        <div className="flex flex-col">
                            <span className="font-sport text-2xl text-black leading-none">
                                ${Number(formData.precio_venta_sugerido || 0).toLocaleString()} <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Público</span>
                            </span>
                            {isPrivileged && (
                                <span className="font-sport text-base text-brand-cyan mt-1">
                                    ${Number(formData.precio_pushsport || 0).toLocaleString()} <span className="text-[9px] text-brand-cyan uppercase tracking-widest">Push Sport</span>
                                </span>
                            )}
                        </div>
                        {isPrivileged && (
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-1">Ganancia Sede</span>
                                <span className="font-sport text-lg text-green-500">
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
                            <CheckCircle2 size={14} className="text-brand-cyan bg-white rounded-full" />
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
                JPG · PNG · WEBP — Las imágenes se guardan en Supabase Storage
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
        const trimmed = val.trim().toUpperCase();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
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
        <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus-within:border-brand-cyan transition-all min-h-[42px]">
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
            if (attr.key.trim() && attr.value.length > 0) {
                newObj[attr.key.trim()] = attr.value;
            }
        });
        setFormData(prev => ({ ...prev, atributos: newObj }));
    };

    const addAttribute = (specificKey = '') => {
        const newArray = [...attributesArray, { key: specificKey.toUpperCase(), value: [] }];
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
        <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
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
                            const isAdded = attributesArray.some(a => a.key.toUpperCase() === sug);
                            return (
                                <button
                                    key={sug}
                                    type="button"
                                    onClick={() => !isAdded && addAttribute(sug)}
                                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${
                                        isAdded 
                                            ? 'bg-neutral-100 text-neutral-300 border-neutral-100 cursor-not-allowed shadow-none' 
                                            : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand-cyan hover:text-brand-cyan shadow-sm active:scale-95'
                                    }`}
                                >
                                    + {sug}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="grid gap-3">
                    {attributesArray.length > 0 ? (
                        attributesArray.map((attr, index) => (
                            <div key={index} className="grid grid-cols-[1fr_2fr_40px] gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                <input
                                    type="text"
                                    placeholder="ETIQUETA"
                                    className="px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-black uppercase focus:border-brand-cyan outline-none transition-all shadow-sm"
                                    value={attr.key}
                                    onChange={(e) => handleChange(index, 'key', e.target.value.toUpperCase())}
                                />
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
                        ))
                    ) : (
                        <div className="py-12 border-2 border-dashed border-neutral-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-neutral-300 grayscale opacity-60">
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
                    <img src={imgs[0]} alt={row.nombre} className="w-40 h-40 object-cover rounded-lg border border-neutral-200" />
                ) : (
                    <div className="w-40 h-40 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center">
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
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">
                            {row.descripcion || 'Sin descripción'}
                        </span>
                        {Object.keys(atributos).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(atributos).map(([key, value]) => (
                                    <span key={key} className="text-[8px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-sm font-black uppercase">
                                        {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </span>
                                ))}
                            </div>
                        )}
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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

                {/* ── LEFT: Form fields ── */}
                <div className="space-y-6">

                    {/* Images */}
                    <MultiImagePicker formData={formData} setFormData={setFormData} />

                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Nombre del Producto *</label>
                        <div className="relative group">
                            <Box size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                            <input
                                required type="text"
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
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
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all min-h-[70px] resize-none"
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

                    {/* Precios + Stock Mínimo */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Costo Compra *</label>
                            <div className="relative group">
                                <CircleDollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan transition-all"
                                    placeholder="0.00"
                                    value={formData.costo_compra || ''}
                                    onChange={e => setFormData({ ...formData, costo_compra: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                                    formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra 
                                    ? 'text-red-500' 
                                    : 'text-brand-cyan'
                                }`}>Precio Push Sport *</label>
                            </div>
                            <div className="relative group">
                                <CircleDollarSign size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                                    formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra 
                                    ? 'text-red-500' 
                                    : 'text-brand-cyan'
                                }`} />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className={`w-full pl-10 pr-10 py-3 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-1 ${
                                        formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra 
                                        ? 'bg-red-50 border border-red-300 text-red-600 focus:ring-red-500' 
                                        : 'bg-brand-cyan/5 border border-brand-cyan text-brand-cyan focus:ring-brand-cyan'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.precio_pushsport || ''}
                                    onChange={e => setFormData({ ...formData, precio_pushsport: Number(e.target.value) })}
                                />
                                {formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra && (
                                    <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                                )}
                            </div>
                            {formData.precio_pushsport > 0 && formData.precio_pushsport < formData.costo_compra && (
                                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">Menor al costo</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                                formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport 
                                ? 'text-red-500' 
                                : 'text-black'
                            }`}>Precio Público *</label>
                            <div className="relative group">
                                <CircleDollarSign size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                                    formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport 
                                    ? 'text-red-500' 
                                    : 'text-neutral-400'
                                }`} />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className={`w-full pl-10 pr-10 py-3 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-1 ${
                                        formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport 
                                        ? 'bg-red-50 border border-red-300 text-red-600 focus:ring-red-500' 
                                        : 'bg-white border border-neutral-200 text-black focus:ring-black'
                                    }`}
                                    placeholder="0.00"
                                    value={formData.precio_venta_sugerido || ''}
                                    onChange={e => setFormData({ ...formData, precio_venta_sugerido: Number(e.target.value) })}
                                />
                                {formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport && (
                                    <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none animate-pulse" />
                                )}
                            </div>
                            {formData.precio_venta_sugerido > 0 && formData.precio_venta_sugerido < formData.precio_pushsport && (
                                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">Pérdida esperada</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Stock Mín. (Alerta)</label>
                            <div className="relative group">
                                <Settings size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    type="number" min="0"
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan transition-all"
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
                            <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${
                                formData.activo === false ? 'left-1' : 'left-6'
                            }`} />
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3">
                        <Info size={16} className="text-black mt-0.5 shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                            El <span className="text-brand-cyan">Stock Mínimo</span> se usa solo para alertas. Las imágenes se suben a Supabase Storage y generan una URL permanente. * = obligatorio.
                        </p>
                    </div>
                </div>

                {/* ── RIGHT: Live Preview ── */}
                <ProductCardPreview
                    formData={formData}
                    categorias={categorias}
                    marcas={marcas}
                />
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
            modalMaxWidth="max-w-5xl"
        />
    );
};

export default Productos;