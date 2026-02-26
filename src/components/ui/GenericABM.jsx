import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import { Box, Save, PlusCircle, RefreshCw, XSquare } from 'lucide-react';
import { toast } from '../../store/toastStore';

const GenericABM = ({ title, icon: Icon, service, columns, formFields, renderForm, idField = 'id' }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const loadData = async () => {
        setIsLoading(true);
        try {
            const result = await service.getAll();
            const activeItems = result.filter(item => item.activo !== false);
            setData(activeItems);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        const initialForm = {};
        formFields.forEach(f => initialForm[f.name] = f.defaultValue || '');
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        if (formFields.length > 0) {
            // Standard mode: only map declared formFields
            const formToEdit = {};
            formFields.forEach(f => formToEdit[f.name] = item[f.name] !== undefined ? item[f.name] : '');
            setFormData(formToEdit);
        } else {
            // renderForm mode: pass the entire item so custom forms can pre-populate
            setFormData({ ...item });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if(window.confirm(`¿Seguro que deseas desactivar este registro?`)) {
            const itemId = item[idField];
            try {
                await service.delete(itemId);
                toast.success("Registro desactivado correctamente");
                loadData();
            } catch (error) {
                toast.error("Error al desactivar registro");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Strip internal state keys (prefixed with _) before sending to API
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([k]) => !k.startsWith('_'))
            );
            if (editingItem) {
                const itemId = editingItem[idField];
                await service.update(itemId, payload);
            } else {
                await service.create(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la solicitud");
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 relative animate-in fade-in duration-700">
            {/* Cabecera del ABM */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-neutral-100 pb-10 text-neutral-900 gap-6 relative">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white border-2 border-neutral-100 text-brand-cyan flex items-center justify-center rounded-[2rem] shadow-sm">
                        {Icon ? <Icon size={36} /> : <Box size={36} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-label-premium">ADMINISTRACIÓN CENTRAL / PUSH</span>
                        <h1 className="text-3xl md:text-5xl font-black tracking-[-0.03em] mt-3 text-neutral-900 uppercase">
                            {title}
                        </h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={loadData}
                        className="p-3 bg-white border border-neutral-100 text-neutral-400 hover:text-neutral-900 hover:shadow-premium rounded-2xl transition-all"
                        title="Actualizar Datos"
                    >
                        <RefreshCw size={22} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <div className="h-10 w-px bg-neutral-100 mx-2"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-cyan shadow-[0_0_12px_rgba(0,194,255,0.4)] animate-pulse"></div>
                </div>
            </div>
            
            {/* Tabla de Datos */}
            {isLoading ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between px-4">
                        <div className="w-48 h-8 bg-neutral-100 rounded-lg animate-pulse" />
                        <div className="w-32 h-8 bg-neutral-100 rounded-lg animate-pulse" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3 border border-neutral-100 rounded-2xl bg-white">
                            <div className="w-8 h-8 bg-neutral-100 rounded-lg animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-neutral-100 rounded animate-pulse" style={{ width: `${52 + (i * 9) % 35}%` }} />
                                <div className="h-2.5 bg-neutral-50 rounded animate-pulse w-1/3" />
                            </div>
                            <div className="w-16 h-6 bg-neutral-100 rounded-lg animate-pulse" />
                        </div>
                    ))}
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-brand-cyan animate-pulse pt-2">
                        Sincronizando datos...
                    </p>
                </div>
            ) : (
                <DataTable 
                    data={data}
                    columns={columns}
                    onAdd={handleAdd}
                    addLabel={`Agregar ${title}`}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchPlaceholder={`Buscar en ${title}...`}
                />
            )}

            {/* Modal de Formulario */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Actualizar Registro" : "Nuevo Registro"}
            >
                <div className="py-2">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-6">
                            {renderForm ? renderForm(formData, setFormData) : (
                                formFields.map(field => (
                                    <div key={field.name} className="space-y-4">
                                        <label className="text-label-premium ml-1 block">{field.label}</label>
                                        <input 
                                            required={field.required}
                                            type={field.type || "text"} 
                                            className="input-premium py-8"
                                            placeholder={field.label.toUpperCase()}
                                            value={formData[field.name] || ''}
                                            onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="pt-10 border-t border-neutral-50 flex flex-col gap-4">
                            <button 
                                type="submit"
                                className="w-full btn-premium py-4 flex justify-center items-center gap-3 group h-14"
                            >
                                {editingItem ? (
                                    <>
                                        <Save size={24} />
                                        <span className="font-black tracking-[0.3em] text-sm uppercase">Guardar Cambios</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={24} />
                                        <span className="font-black tracking-[0.3em] text-sm uppercase">Confirmar Registro</span>
                                    </>
                                )}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full text-xs font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-red-500 transition-all py-4 flex items-center justify-center gap-3"
                            >
                                <XSquare size={20} />
                                DESCARTAR CAMBIOS
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default GenericABM;
