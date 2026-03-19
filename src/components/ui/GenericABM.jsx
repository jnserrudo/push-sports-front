import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import { Box, Save, PlusCircle, RefreshCw, XSquare, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

const GenericABM = ({ 
    title,
    description,
    icon: Icon, 
    service,
    columns,
    formFields = [],
    renderForm = null,
    idField = 'id',
    modalMaxWidth = "max-w-md",
    fetchMethod = null,
    validate = null, // Custom validation function returns string/array or null
}) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null); // item to confirm delete
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const result = fetchMethod ? await fetchMethod() : await service.getAll();
            setData(result); // Show ALL records including inactive — admin needs to see them
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
        formFields.forEach(f => {
            if (f.type === 'checkbox') {
                initialForm[f.name] = f.defaultValue !== undefined ? f.defaultValue : true; // checkboxes default to true
            } else {
                initialForm[f.name] = f.defaultValue ?? '';
            }
        });
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
        setDeleteTarget(item); // show confirmation modal
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const itemId = deleteTarget[idField];
        try {
            await service.delete(itemId);
            toast.success("Registro desactivado correctamente");
            setDeleteTarget(null);
            loadData();
        } catch (error) {
            toast.error("Error al desactivar registro");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (validate) {
            const error = validate(formData);
            if (error) {
                toast.error(error, {
                    style: {
                        background: '#000',
                        color: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #DC2626',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em'
                    }
                });
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Strip internal state keys (prefixed with _) AND nested relationship objects
            // This prevents strict backend ORMs like Prisma from crashing with 500 Errors
            // when we send back joined data like 'tipo_comercio: {...}' that we got from a GET request.
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([k, v]) => 
                    !k.startsWith('_') && 
                    (v === null || typeof v !== 'object' || Array.isArray(v)) // Allow nulls, primitive values, and arrays (if needed for M:N relations later), block pure objects.
                )
            );

            if (editingItem) {
                const itemId = editingItem[idField];
                await service.update(itemId, payload);
                toast.success('Registro actualizado exitosamente', {
                    style: {
                        background: '#000',
                        color: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #333',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em'
                    }
                });
            } else {
                await service.create(payload);
                toast.success('Registro creado exitosamente', {
                    style: {
                        background: '#000',
                        color: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #333',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em'
                    }
                });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al guardar el registro', {
                style: {
                    background: '#DC2626',
                    color: '#fff',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '0.1em'
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-3 md:space-y-10 w-full max-w-7xl mx-auto pb-4 md:pb-20 relative animate-in fade-in duration-700">
            {/* Cabecera del ABM */}
            <div className="flex items-center justify-between border-b md:border-b border-neutral-100 pb-2 md:pb-10 text-neutral-900 gap-2 md:gap-6 relative">
                <div className="flex items-center gap-3 md:gap-8">
                    <div className="hidden sm:flex w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-neutral-100 text-brand-cyan items-center justify-center rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex-shrink-0">
                        {Icon ? <Icon size={32} className="md:w-9 md:h-9" /> : <Box size={32} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="hidden md:block text-label-premium text-neutral-500 mb-1">ADMINISTRACIÓN CENTRAL / PUSH</span>
                        <h1 className="text-xl md:text-5xl font-black tracking-[-0.03em] m-0 text-black uppercase leading-none">
                            {title}
                        </h1>
                        {description && (
                            <p className="hidden md:block text-[10px] md:text-xs font-bold text-neutral-400 mt-3 max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <button 
                        onClick={loadData}
                        className="p-1.5 md:p-3 bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:shadow-premium rounded-lg md:rounded-2xl transition-all"
                        title="Actualizar Datos"
                    >
                        <RefreshCw size={16} className={`md:w-[22px] md:h-[22px] ${isLoading ? 'animate-spin text-brand-cyan' : ''}`} strokeWidth={3} />
                    </button>
                    <div className="hidden md:block h-8 w-px bg-neutral-200 mx-1"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-brand-cyan shadow-[0_0_12px_rgba(0,194,255,0.4)] animate-pulse hidden md:block"></div>
                </div>
            </div>
            
            {/* Tabla de Datos */}
            {isLoading ? (
                <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-neutral-100 relative overflow-hidden animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                        <div className="w-full md:max-w-md h-12 md:h-16 bg-neutral-100 rounded-xl md:rounded-2xl animate-pulse" />
                        <div className="w-32 md:w-48 h-12 md:h-16 bg-neutral-100 rounded-xl md:rounded-2xl animate-pulse" />
                    </div>
                    <div className="rounded-xl md:rounded-3xl border border-neutral-200 overflow-hidden bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200">
                                    {[...Array(columns.length + 1)].map((_, i) => (
                                        <th key={i} className="px-4 md:px-8 py-4 md:py-6">
                                            <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        {[...Array(columns.length + 1)].map((_, colI) => (
                                            <td key={colI} className="px-4 py-4 md:px-8 md:py-6 relative">
                                                <div className="flex items-center gap-3">
                                                    {colI === 0 && <div className="w-8 h-8 md:w-10 md:h-10 bg-neutral-100 rounded-xl flex-shrink-0 animate-pulse" />}
                                                    <div className="h-3 bg-neutral-100 rounded animate-pulse" style={{ width: `${Math.max(30, 80 - (i * colI * 10) % 50)}%` }} />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <DataTable 
                        data={data}
                        columns={columns}
                        onAdd={handleAdd}
                        addLabel={`Agregar ${title}`}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        searchPlaceholder={`Buscar en ${title}...`}
                        emptyIcon={Icon}
                        emptyTitle={`Aún no hay ${title}`}
                        emptySubtitle="Comienza agregando el primer registro con el botón crear superior."
                    />
                </motion.div>
            )}

            {/* Modal de Formulario */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Actualizar Registro" : "Nuevo Registro"}
                maxWidth={modalMaxWidth}
            >
                <div className="py-2">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-6">
                            {renderForm ? renderForm(formData, setFormData) : (
                                formFields.map(field => (
                                    <div key={field.name} className="space-y-4">
                                        {field.type === 'checkbox' ? (
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div
                                                    onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                                                    className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${
                                                        formData[field.name] ? 'bg-brand-cyan' : 'bg-neutral-200'
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${
                                                        formData[field.name] ? 'left-5' : 'left-1'
                                                    }`} />
                                                </div>
                                                <span className="text-label-premium">{field.label}</span>
                                            </label>
                                        ) : (
                                            <>
                                                <label className="text-label-premium ml-1 block">{field.label}</label>
                                                <input
                                                    required={field.required}
                                                    type={field.type || 'text'}
                                                    className="input-premium py-8"
                                                    placeholder={field.label.toUpperCase()}
                                                    value={formData[field.name] ?? ''}
                                                    onChange={e => setFormData({ ...formData, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                                                />
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="pt-10 border-t border-neutral-50 flex flex-col gap-4">
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-premium py-4 flex justify-center items-center gap-3 group h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                                        <span className="font-black tracking-[0.3em] text-sm uppercase text-brand-cyan">Procesando...</span>
                                    </>
                                ) : editingItem ? (
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
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
            {deleteTarget && (
                <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Baja">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="space-y-6 p-2"
                    >
                        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-red-700 mb-1">Acción irreversible</p>
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                                    Este registro será desactivado. Podrás reactivarlo editándolo.
                                </p>
                            </div>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-1">Registro a dar de baja</p>
                            <p className="text-sm font-black uppercase tracking-widest text-black">
                                {deleteTarget?.nombre || deleteTarget?.nombre_marca || deleteTarget?.nombre_proveedor || deleteTarget?.codigo || `ID: ${deleteTarget?.[idField]?.toString().split('-')[0]}`}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
                            >
                                <Trash2 size={16} /> Confirmar Baja
                            </button>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                </Modal>
            )}
            </AnimatePresence>
        </div>
    );
};

export default GenericABM;
