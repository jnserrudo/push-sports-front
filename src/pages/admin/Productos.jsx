import React, { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { productosService } from '../../services/productosService';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo_barras: '',
        id_categoria: '',
        id_marca: '',
        id_proveedor: '',
        costo_compra: 0,
        precio_venta_sugerido: 0,
        stock_minimo: 0 // Will map differently if inventory abstraction stays
    });

    const loadData = async () => {
        setIsLoading(true);
        const [prodData, catData, marData] = await Promise.all([
            productosService.getAll(),
            productosService.getCategorias(),
            productosService.getMarcas()
        ]);
        setProductos(prodData);
        setCategorias(catData);
        setMarcas(marData);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({ 
            nombre: '', 
            descripcion: '',
            codigo_barras: '',
            id_categoria: categorias[0]?.id || '', 
            id_marca: marcas[0]?.id || '',
            id_proveedor: '', 
            costo_compra: 0,
            precio_venta_sugerido: 0,
            stock_minimo: 5
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            codigo_barras: item.codigo_barras || '',
            id_categoria: item.id_categoria,
            id_marca: item.id_marca,
            id_proveedor: item.id_proveedor || '',
            costo_compra: item.costo_compra || 0,
            precio_venta_sugerido: item.precio_venta_sugerido || 0,
            stock_minimo: item.stock_minimo || 0
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if(window.confirm(`¿Seguro que deseas desactivar el producto ${item.nombre}?`)) {
            await productosService.delete(item.id_producto);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            id_categoria: Number(formData.id_categoria),
            id_marca: Number(formData.id_marca),
            costo_compra: Number(formData.costo_compra),
            precio_venta_sugerido: Number(formData.precio_venta_sugerido),
            stock_minimo: Number(formData.stock_minimo)
        };

        if (editingItem) {
            await productosService.update(editingItem.id_producto, dataToSave);
        } else {
            await productosService.create(dataToSave);
        }
        setIsModalOpen(false);
        loadData();
    };

    const columns = [
        { header: 'Código', accessor: 'codigo_barras' },
        { 
            header: 'Producto', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold">{row.nombre}</span>
        },
        { header: 'Marca', accessor: 'marca_nombre' },
        { header: 'Categoría', accessor: 'categoria_nombre' },
        { 
            header: 'Precio Venta', 
            accessor: 'precio_venta_sugerido',
            render: (row) => `$${row.precio_venta_sugerido?.toLocaleString() || 0}`
        },
        { 
            header: 'Stock Total', 
            accessor: 'stock_total',
            render: (row) => (
                <span className={`font-bold ${row.stock_total === 0 ? 'text-red-500' : row.stock_total <= row.stock_minimo ? 'text-yellow-600' : 'text-black'}`}>
                    {row.stock_total || 0} {row.stock_total === 0 && '(Agotado)'} {row.stock_total > 0 && row.stock_total <= row.stock_minimo && '(¡Bajo!)'}
                </span>
            )
        },
        { 
            header: 'Estado', 
            accessor: 'activo',
            render: (row) => (
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${row.activo ? 'bg-black' : 'bg-neutral-400'}`}>
                    {row.activo ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4">
                <Box size={32} />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    Catálogo de Productos
                </h2>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12 font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
                    CARGANDO DATOS...
                </div>
            ) : (
                <DataTable 
                    data={productos}
                    columns={columns}
                    onAdd={handleAdd}
                    addLabel="Nuevo Producto"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchPlaceholder="Buscar por código, nombre, marca..."
                />
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Editar Producto" : "Nuevo Producto"}
                maxWidth="max-w-3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Nombre del Producto</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.nombre}
                                onChange={e => setFormData({...formData, nombre: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Código de Barras</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.codigo_barras}
                                onChange={e => setFormData({...formData, codigo_barras: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider">Descripción Detallada</label>
                         <textarea 
                             className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm h-20 resize-none"
                             value={formData.descripcion}
                             onChange={e => setFormData({...formData, descripcion: e.target.value})}
                         />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Categoría</label>
                            <select 
                                required
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.id_categoria}
                                onChange={e => setFormData({...formData, id_categoria: e.target.value})}
                            >
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Marca</label>
                            <select 
                                required
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.id_marca}
                                onChange={e => setFormData({...formData, id_marca: e.target.value})}
                            >
                                <option value="">Seleccionar...</option>
                                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Precio Costo ($)</label>
                            <input 
                                required
                                type="number" 
                                min="0" step="0.01"
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.costo_compra}
                                onChange={e => setFormData({...formData, costo_compra: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Precio Venta ($)</label>
                            <input 
                                required
                                type="number" 
                                min="0" step="0.01"
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.precio_venta_sugerido}
                                onChange={e => setFormData({...formData, precio_venta_sugerido: e.target.value})}
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Stock Mínimo</label>
                            <input 
                                required
                                type="number" 
                                min="0"
                                className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                value={formData.stock_minimo}
                                onChange={e => setFormData({...formData, stock_minimo: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 mt-6 hover:bg-neutral-800 transition-colors border-2 border-black"
                    >
                        {editingItem ? "Guardar Cambios" : "Crear Producto"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Productos;
