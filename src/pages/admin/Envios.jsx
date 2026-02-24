import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { enviosService } from '../../services/enviosService';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';

const Envios = () => {
    const [envios, setEnvios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [productos, setProductos] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        sucursal_id: '',
        producto_id: '',
        cantidad: 1
    });

    const loadData = async () => {
        setIsLoading(true);
        const [envData, sucData, prodData] = await Promise.all([
            enviosService.getAll(),
            sucursalesService.getAll(),
            productosService.getAll()
        ]);
        setEnvios(envData);
        setSucursales(sucData.filter(s => s.activo));
        setProductos(prodData.filter(p => p.activo));
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setFormData({ 
            sucursal_id: sucursales[0]?.id || '',
            producto_id: productos[0]?.id || '',
            cantidad: 1
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await enviosService.crearEnvio(
            formData.sucursal_id, 
            formData.producto_id, 
            formData.cantidad,
            sucursales,
            productos
        );
        setIsModalOpen(false);
        loadData();
        alert("Mercadería enviada correctamente.");
    };

    const columns = [
        { header: 'ID Envío', accessor: 'id' },
        { 
            header: 'Fecha', 
            accessor: 'fecha',
            render: (row) => new Date(row.fecha).toLocaleDateString()
        },
        { 
            header: 'Destino', 
            accessor: 'sucursal_nombre',
            render: (row) => <span className="font-bold">{row.sucursal_nombre}</span>
        },
        { header: 'Producto', accessor: 'producto_nombre' },
        { 
            header: 'Cantidad Enviada', 
            accessor: 'cantidad',
            render: (row) => <span className="font-mono bg-black text-white px-2 py-1">{row.cantidad}</span>
        },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-black">
                <Truck size={32} />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    Envíos de Mercadería
                </h2>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12 font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
                    CARGANDO HISTORIAL...
                </div>
            ) : (
                <DataTable 
                    data={envios}
                    columns={columns}
                    onAdd={handleAdd}
                    addLabel="Registrar Envío"
                    searchPlaceholder="Buscar envío por sucursal o producto..."
                />
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Nuevo Envío a Sucursal"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-xs uppercase font-bold text-neutral-500 pb-2 border-b-2 border-dashed border-neutral-300">
                        Al confirmar, se incrementará el stock del producto seleccionado en la sucursal de destino.
                    </p>
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Sucursal Destino</label>
                        <select 
                            required
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.sucursal_id}
                            onChange={e => setFormData({...formData, sucursal_id: e.target.value})}
                        >
                            <option value="">Seleccione destino...</option>
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Producto</label>
                        <select 
                            required
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.producto_id}
                            onChange={e => setFormData({...formData, producto_id: e.target.value})}
                        >
                            <option value="">Seleccione producto...</option>
                            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Cantidad a Enviar</label>
                        <input 
                            required
                            type="number" 
                            min="1"
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.cantidad}
                            onChange={e => setFormData({...formData, cantidad: Number(e.target.value)})}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-black text-white font-black uppercase tracking-widest py-4 mt-6 hover:bg-neutral-800 transition-colors border-2 border-black flex justify-center items-center gap-2"
                    >
                        <Truck size={18} /> Confirmar Envío
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Envios;
