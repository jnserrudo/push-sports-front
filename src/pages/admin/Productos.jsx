import React, { useState, useEffect } from 'react';
import { Box, Category, ArchiveBook, Tag, DollarCircle, Setting2, InfoCircle } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { productosService } from '../../services/productosService';

const Productos = () => {
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    useEffect(() => {
        Promise.all([
            productosService.getCategorias(),
            productosService.getMarcas()
        ]).then(([cats, mars]) => {
            setCategorias(cats);
            setMarcas(mars);
        }).catch(console.error);
    }, []);

    const columns = [
        { header: 'Cod. Barras', accessor: 'codigo_barras', render: (row) => <span className="text-[10px] font-mono opacity-60">{row.codigo_barras}</span> },
        { 
            header: 'Producto / Descripción', 
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-neutral-900">{row.nombre}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">{row.descripcion || 'Sin descripción'}</span>
                </div>
            )
        },
        { 
            header: 'Clasificación', 
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{row.marca_nombre || 'Genérico'}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan">{row.categoria_nombre || 'Sin Cat.'}</span>
                </div>
            )
        },
        { 
            header: 'Precios', 
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-neutral-900 text-sm">${row.precio_venta_sugerido?.toLocaleString() || 0}</span>
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Costo: ${row.costo_compra?.toLocaleString() || 0}</span>
                </div>
            )
        },
        { 
            header: 'Stock Global', 
            accessor: 'stock_total',
            render: (row) => {
                const isCritical = (row.stock_total || 0) <= (row.stock_minimo || 5);
                const isEmpty = (row.stock_total || 0) === 0;
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isEmpty ? 'bg-red-500 animate-pulse' : isCritical ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        <span className={`font-bold text-sm ${isEmpty ? 'text-red-500' : isCritical ? 'text-amber-500' : 'text-neutral-900'}`}>
                            {row.stock_total || 0}
                        </span>
                    </div>
                );
            }
        },
    ];

    const renderForm = (formData, setFormData) => {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Nombre del Producto</label>
                        <input 
                            required type="text" 
                            className="input-premium"
                            placeholder="Ej: Proteína Whey Isolated"
                            value={formData.nombre || ''} 
                            onChange={e => setFormData({...formData, nombre: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Código de Barras</label>
                        <input 
                            required type="text" 
                            className="input-premium"
                            placeholder="7791234..."
                            value={formData.codigo_barras || ''} 
                            onChange={e => setFormData({...formData, codigo_barras: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Descripción Breve</label>
                    <textarea 
                        className="input-premium min-h-[100px] resize-none"
                        placeholder="Detalles sobre presentación, sabor o características..."
                        value={formData.descripcion || ''} 
                        onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Categoría</label>
                        <div className="relative">
                            <select 
                                required 
                                className="input-premium appearance-none"
                                value={formData.id_categoria || ''} 
                                onChange={e => setFormData({...formData, id_categoria: parseInt(e.target.value)})}
                            >
                                <option value="">Seleccionar Categoría...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                <Category size={16} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Marca</label>
                        <div className="relative">
                            <select 
                                required 
                                className="input-premium appearance-none"
                                value={formData.id_marca || ''} 
                                onChange={e => setFormData({...formData, id_marca: parseInt(e.target.value)})}
                            >
                                <option value="">Seleccionar Marca...</option>
                                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                <Tag size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Costo ($)</label>
                        <div className="relative">
                            <input 
                                required type="number" step="0.01"
                                className="input-premium pl-10"
                                value={formData.costo_compra || ''} 
                                onChange={e => setFormData({...formData, costo_compra: Number(e.target.value)})} 
                            />
                            <DollarCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-100 ml-1 bg-neutral-900 px-2 rounded-md w-fit">Venta Sugerida ($)</label>
                        <div className="relative">
                            <input 
                                required type="number" step="0.01"
                                className="input-premium pl-10 border-neutral-300"
                                value={formData.precio_venta_sugerido || ''} 
                                onChange={e => setFormData({...formData, precio_venta_sugerido: Number(e.target.value)})} 
                            />
                            <DollarCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-900" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Stock Alarma</label>
                        <div className="relative">
                            <input 
                                required type="number"
                                className="input-premium pl-10"
                                value={formData.stock_minimo || ''} 
                                onChange={e => setFormData({...formData, stock_minimo: Number(e.target.value)})} 
                            />
                            <Setting2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-brand-cyan/5 rounded-[2rem] border border-brand-cyan/10 flex items-start gap-4">
                    <InfoCircle size={20} className="text-brand-cyan mt-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed">
                        Definir un <span className="text-neutral-900">PVP Sugerido</span> ayuda a mantener márgenes coherentes en todas las sucursales. El stock real se gestiona por inventario individual.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <GenericABM 
            title="Suministros y Productos"
            icon={ArchiveBook}
            service={productosService}
            columns={columns}
            formFields={[]} 
            renderForm={renderForm}
            idField="id_producto"
        />
    );
};

export default Productos;
