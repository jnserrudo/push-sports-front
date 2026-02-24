import React, { useState, useEffect } from 'react';
import { TruckFast, Box, House, AddCircle, InfoCircle, DirectRight } from 'iconsax-react';
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
    };

    const columns = [
        { header: 'ID Envío', accessor: 'id', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id.split('-')[0]}...</span> },
        { 
            header: 'Fecha de Operación', 
            accessor: 'fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-neutral-900">{new Date(row.fecha).toLocaleDateString()}</span>
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Registrado</span>
                </div>
            )
        },
        { 
            header: 'Sede Destino', 
            accessor: 'sucursal_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.4)]"></div>
                    <span className="font-bold text-sm text-neutral-800 uppercase tracking-tight">{row.sucursal_nombre}</span>
                </div>
            )
        },
        { 
            header: 'Producto Trasladado', 
            accessor: 'producto_nombre',
            render: (row) => <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">{row.producto_nombre}</span>
        },
        { 
            header: 'Volumen', 
            accessor: 'cantidad',
            render: (row) => (
                <div className="inline-flex px-3 py-1 bg-neutral-900 text-white rounded-xl font-bold text-[10px] tracking-widest">
                    {row.cantidad} UNID.
                </div>
            )
        },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-100 pb-10 gap-6">
                 <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">LOGÍSTICA INTERNA</span>
                    <h2 className="text-4xl font-bold tracking-tight mt-2 text-neutral-900">
                        Transferencia de Stock
                    </h2>
                 </div>
                 
                 <button 
                    onClick={handleAdd}
                    className="btn-cyan px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-brand-cyan/20"
                 >
                    <AddCircle size={18} variant="Bold" /> Registrar Envío
                 </button>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="w-12 h-12 border-4 border-neutral-100 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">Sincronizando Historial...</p>
                </div>
            ) : (
                <div className="card-premium overflow-hidden">
                    <DataTable 
                        data={envios}
                        columns={columns}
                        searchPlaceholder="Filtrar por sede, producto o ID..."
                        variant="minimal"
                    />
                </div>
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Nueva Orden de Traslado"
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-1">
                    <div className="p-6 bg-brand-cyan/5 rounded-[2rem] border border-brand-cyan/10 flex items-start gap-4">
                        <InfoCircle size={20} className="text-brand-cyan mt-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed">
                            Al confirmar, el stock se incrementará automáticamente en la <span className="text-neutral-900">Sede Destino</span>. Esta operación es irreversible y queda auditada.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Sede de Destino</label>
                            <div className="relative">
                                <select 
                                    required
                                    className="input-premium appearance-none"
                                    value={formData.sucursal_id}
                                    onChange={e => setFormData({...formData, sucursal_id: e.target.value})}
                                >
                                    <option value="">Seleccione destino empresarial...</option>
                                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                    <House size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Producto a Cargar</label>
                            <div className="relative">
                                <select 
                                    required
                                    className="input-premium appearance-none"
                                    value={formData.producto_id}
                                    onChange={e => setFormData({...formData, producto_id: e.target.value})}
                                >
                                    <option value="">Seleccione ítem del catálogo...</option>
                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                    <Box size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Cantidad de Unidades</label>
                            <input 
                                required type="number" min="1"
                                className="input-premium"
                                placeholder="0"
                                value={formData.cantidad}
                                onChange={e => setFormData({...formData, cantidad: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full btn-cyan py-5 text-[10px] font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-3"
                    >
                        <TruckFast size={20} variant="Bold" /> PROCESAR ORDEN DE ENVÍO
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full text-[10px] font-bold uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors py-2"
                    >
                        CANCELAR OPERACIÓN
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Envios;
