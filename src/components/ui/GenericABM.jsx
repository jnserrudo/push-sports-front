import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import { Box, Save2, AddCircle, Trash, Refresh2, DirectRight, CloseSquare } from 'iconsax-react';

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
        const formToEdit = {};
        formFields.forEach(f => formToEdit[f.name] = item[f.name] !== undefined ? item[f.name] : '');
        setFormData(formToEdit);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if(window.confirm(`¿Seguro que deseas desactivar este registro?`)) {
            const itemId = item[idField];
            await service.delete(itemId);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                const itemId = editingItem[idField];
                await service.update(itemId, formData);
            } else {
                await service.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error al procesar la solicitud");
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 relative animate-in fade-in duration-700">
            {/* Cabecera del ABM */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-neutral-100 pb-10 text-neutral-900 gap-6 relative">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white border-2 border-neutral-100 text-brand-cyan flex items-center justify-center rounded-[2rem] shadow-sm">
                        {Icon ? <Icon size={36} variant="Bold" /> : <Box size={36} variant="Bold" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">ADMINISTRACIÓN CENTRAL / PUSH</span>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-3 text-neutral-900 uppercase">
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
                        <Refresh2 size={22} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <div className="h-10 w-px bg-neutral-100 mx-2"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-cyan shadow-[0_0_12px_rgba(0,194,255,0.4)] animate-pulse"></div>
                </div>
            </div>
            
            {/* Tabla de Datos */}
            {isLoading && data.length === 0 ? (
                <div className="h-[30rem] flex flex-col items-center justify-center space-y-8 bg-neutral-50/50 rounded-[3rem] border-4 border-dashed border-neutral-100 shadow-sm">
                    <div className="w-20 h-20 border-8 border-neutral-200 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-sm font-black uppercase tracking-[0.5em] text-brand-cyan animate-pulse">Sincronizando con la red central...</p>
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
                                        <label className="text-base font-black uppercase tracking-[0.3em] text-neutral-400 ml-1">{field.label}</label>
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
                                        <Save2 size={24} variant="Bold" />
                                        <span className="font-black tracking-[0.3em] text-sm uppercase">Guardar Cambios</span>
                                    </>
                                ) : (
                                    <>
                                        <AddCircle size={24} variant="Bold" />
                                        <span className="font-black tracking-[0.3em] text-sm uppercase">Confirmar Registro</span>
                                    </>
                                )}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full text-xs font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-red-500 transition-all py-4 flex items-center justify-center gap-3"
                            >
                                <CloseSquare size={20} />
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
