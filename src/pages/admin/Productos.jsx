import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Package, Tag, Layout, CircleDollarSign,
    Settings, Info, AlignLeft, Truck, ImagePlus,
    X, Loader2, CheckCircle2, ChevronRight
} from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { productosService } from '../../services/productosService';
import {
    uploadProductImage,
    deleteProductImage,
    parseImagenes,
    serializeImagenes
} from '../../lib/supabaseStorage';

// ─── Product Card Preview ──────────────────────────────────────────────────────
const ProductCardPreview = ({ formData, categorias, marcas }) => {
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
                        <span className="font-sport text-2xl text-black">
                            ${Number(formData.precio_venta_sugerido || 0).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            <span>VER MÁS</span>
                            <ChevronRight size={12} />
                        </div>
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
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen debe pesar menos de 5MB');
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
            alert(`Error al subir imagen: ${err.message}`);
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
            <div className="grid grid-cols-3 gap-3">
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

// ─── Main Productos Component ─────────────────────────────────────────────────
const Productos = () => {
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
                    <img src={imgs[0]} alt={row.nombre} className="w-10 h-10 object-cover rounded-lg border border-neutral-200" />
                ) : (
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center">
                        <Box size={16} className="text-neutral-300" />
                    </div>
                );
            }
        },
        {
            header: 'Especificación',
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">
                        {row.descripcion || 'Sin descripción'}
                    </span>
                </div>
            )
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
                        ${Number(row.precio_venta_sugerido || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                        Costo: ${Number(row.costo_compra || 0).toLocaleString()}
                    </span>
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
                            <img key={i} src={url} alt="" className="w-7 h-7 object-cover rounded-md border border-neutral-200" />
                        ))}
                        {imgs.length === 0 && <span className="text-[9px] text-neutral-400 uppercase font-bold">—</span>}
                    </div>
                );
            }
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
                                placeholder="Sabor, gramaje, características..."
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
                                    onChange={e => setFormData({ ...formData, id_categoria: parseInt(e.target.value) })}
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

                    {/* Precios + Stock Mínimo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">Venta Sugerida *</label>
                            <div className="relative group">
                                <CircleDollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cyan pointer-events-none" />
                                <input
                                    required type="number" step="0.01" min="0"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-brand-cyan rounded-lg text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
                                    placeholder="0.00"
                                    value={formData.precio_venta_sugerido || ''}
                                    onChange={e => setFormData({ ...formData, precio_venta_sugerido: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Stock Mín. (Alerta)</label>
                            <div className="relative group">
                                <Settings size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                <input
                                    type="number" min="0"
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan transition-all"
                                    placeholder="5"
                                    value={formData.stock_minimo ?? ''}
                                    onChange={e => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                                />
                            </div>
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

    return (
        <GenericABM
            title="Catálogo Master"
            icon={Package}
            service={productosService}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            idField="id_producto"
        />
    );
};

export default Productos;