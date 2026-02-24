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
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-neutral-900 text-brand-cyan flex items-center justify-center rounded-[1.5rem] shadow-xl">
                        {Icon ? <Icon size={28} variant="Bold" /> : <Box size={28} variant="Bold" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">ADMINISTRACIÓN DE DATOS</span>
                        <h2 className="text-4xl font-bold tracking-tight mt-2">
                            {title}
                        </h2>
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
                <div className="h-96 flex flex-col items-center justify-center space-y-6 bg-white/50 rounded-[2.5rem] border border-neutral-50 shadow-sm">
                    <div className="w-12 h-12 border-4 border-neutral-100 border-t-brand-cyan rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">Vinculando con el Servidor...</p>
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
                                    <div key={field.name} className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">{field.label}</label>
                                        <input 
                                            required={field.required}
                                            type={field.type || "text"} 
                                            className="input-premium"
                                            placeholder={`Ingrese ${field.label.toLowerCase()}`}
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
                                        <Save2 size={20} variant="Bold" />
                                        <span className="font-bold tracking-widest text-[11px] uppercase">Guardar Cambios</span>
                                    </>
                                ) : (
                                    <>
                                        <AddCircle size={20} variant="Bold" />
                                        <span className="font-bold tracking-widest text-[11px] uppercase">Confirmar Registro</span>
                                    </>
                                )}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300 hover:text-neutral-900 transition-colors py-2 flex items-center justify-center gap-2"
                            >
                                <CloseSquare size={16} />
                                Cancelar Operación
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default GenericABM;
