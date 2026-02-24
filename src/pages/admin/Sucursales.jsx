import React, { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { sucursalesService } from '../../services/sucursalesService';

const Sucursales = () => {
    const [sucursales, setSucursales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        id_tipo_comercio: 1, // Defaulting to simple type
        saldo_acumulado_mili: 0
    });

    const loadData = async () => {
        setIsLoading(true);
        const data = await sucursalesService.getAll();
        setSucursales(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({ nombre: '', direccion: '', telefono: '', id_tipo_comercio: 1, saldo_acumulado_mili: 0 });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            nombre: item.nombre,
            direccion: item.direccion,
            telefono: item.telefono || '',
            id_tipo_comercio: item.id_tipo_comercio || 1,
            saldo_acumulado_mili: item.saldo_acumulado_mili || 0
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if(window.confirm(`¿Seguro que deseas desactivar la sucursal ${item.nombre}?`)) {
            await sucursalesService.delete(item.id_comercio);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingItem) {
            await sucursalesService.update(editingItem.id_comercio, formData);
        } else {
            await sucursalesService.create(formData);
        }
        setIsModalOpen(false);
        loadData();
    };

    const columns = [
        { header: 'ID', accessor: 'id_comercio' },
        { 
            header: 'Nombre', 
            accessor: 'nombre',
            render: (row) => <span className="font-bold">{row.nombre}</span>
        },
        { header: 'Dirección', accessor: 'direccion' },
        { header: 'Teléfono', accessor: 'telefono' },
        { 
            header: 'Saldo Mili ($)', 
            accessor: 'saldo_acumulado_mili',
            render: (row) => `$${row.saldo_acumulado_mili?.toLocaleString() || 0}`
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
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4">
                <Store size={32} />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    Gestión de Sucursales
                </h2>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12 font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
                    CARGANDO DATOS...
                </div>
            ) : (
                <DataTable 
                    data={sucursales}
                    columns={columns}
                    onAdd={handleAdd}
                    addLabel="Nueva Sucursal"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchPlaceholder="Buscar por nombre, dirección..."
                />
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Editar Sucursal" : "Nueva Sucursal"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Nombre del Local</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.nombre}
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Dirección</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.direccion}
                            onChange={e => setFormData({...formData, direccion: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Teléfono de Contacto</label>
                        <input 
                            type="text" 
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.telefono}
                            onChange={e => setFormData({...formData, telefono: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider">Saldo Acumulado Inicial ($)</label>
                        <input 
                            required
                            type="number" 
                            min="0"
                            className="w-full border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                            value={formData.saldo_acumulado_mili}
                            onChange={e => setFormData({...formData, saldo_acumulado_mili: Number(e.target.value)})}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-black text-white font-bold uppercase tracking-widest py-3 mt-4 hover:bg-neutral-800 transition-colors border-2 border-black"
                    >
                        {editingItem ? "Guardar Cambios" : "Crear Sucursal"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Sucursales;
