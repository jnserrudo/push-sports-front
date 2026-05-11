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
    onSaveSuccess = null, // Allows keeping modal open after create
    customActions = null,
    headerActions = null, // Custom actions to show in the header
    onDataLoaded = null, // Callback when data is loaded
    onRefreshReady = null // Callback to provide refresh function to parent
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
            if (onDataLoaded) onDataLoaded(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Proveer función de refresh al padre solo una vez
        if (onRefreshReady) {
            onRefreshReady(loadData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            // EXCEPTION: Keep 'atributos' field as it's needed for product variants (will be JSON stringified)
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([k, v]) =>
                    !k.startsWith('_') &&
                    (v === null || typeof v !== 'object' || Array.isArray(v) || k === 'atributos')
                ).map(([k, v]) => {
                    // Auto-convert numeric strings to Numbers for known numeric fields
                    const isNumericField = /precio|costo|monto|cantidad|stock|porcentaje|valor|id_/.test(k.toLowerCase());
                    if (isNumericField && typeof v === 'string' && v.trim() !== '' && !isNaN(v)) {
                        return [k, Number(v)];
                    }
                    // Handle empty strings for numeric fields as 0
                    if (isNumericField && v === '') {
                        return [k, 0];
                    }
                    return [k, v];
                })
            );

            // Convert atributos to JSON string if it's an object (backend expects JSON string)
            if (payload.atributos && typeof payload.atributos === 'object') {
                payload.atributos = JSON.stringify(payload.atributos);
            }

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
                setIsModalOpen(false);
            } else {
                const newRecord = await service.create(payload);
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
                if (onSaveSuccess) {
                    onSaveSuccess(newRecord);
                    setEditingItem(newRecord);
                    setFormData({ ...formData, ...newRecord });
                } else {
                    setIsModalOpen(false);
                }
            }
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
        <div className="space-y-1.5 md:space-y-3 w-full max-w-[1400px] mx-auto pb-1 md:pb-4 relative animate-in fade-in duration-700">
            {/* Cabecera del ABM - Compacta */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-100 dark:border-gray-700 pb-1.5 gap-2">
                <div className="flex flex-1 min-w-0 pr-0 md:pr-4 items-start md:items-center gap-2 md:gap-2.5">
                    <div className="hidden sm:flex w-7 h-7 md:w-8 md:h-8 bg-white dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 text-brand-cyan dark:text-cyan-400 items-center justify-center rounded-lg shadow-sm flex-shrink-0">
                        {Icon ? <Icon size={14} className="md:w-4 md:h-4" /> : <Box size={14} />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-0">GESTIÓN CENTRAL</span>
                        <h1 className="text-md md:text-lg font-black tracking-tighter m-0 text-black dark:text-white uppercase leading-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-[9px] md:text-[9px] font-bold text-neutral-400 mt-0.5 max-w-2xl leading-relaxed whitespace-normal line-clamp-2 md:line-clamp-none">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 flex-shrink-0 items-center">
                    {headerActions}
                    {headerActions && <div className="hidden md:block h-6 w-px bg-neutral-200 dark:bg-gray-600 mx-0.5"></div>}
                    <button 
                        onClick={loadData}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 text-neutral-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-gray-700 hover:shadow-sm rounded-lg transition-all"
                        title="Actualizar Datos"
                    >
                        <RefreshCw size={14} className={`md:w-4 md:h-4 ${isLoading ? 'animate-spin text-brand-cyan' : ''}`} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] md:hidden">Actualizar</span>
                    </button>
                    <div className="hidden md:block h-6 w-px bg-neutral-200 dark:bg-gray-600 mx-0.5"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.4)] animate-pulse hidden md:block"></div>
                </div>
            </div>
            
            {/* Tabla de Datos */}
            {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-neutral-100 dark:border-gray-700 relative overflow-hidden animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-3">
                        <div className="w-full md:max-w-md h-10 md:h-12 bg-neutral-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="w-28 md:w-40 h-10 md:h-12 bg-neutral-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                    </div>
                    <div className="rounded-lg border border-neutral-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-gray-700 border-b border-neutral-200 dark:border-gray-600">
                                    {[...Array(columns.length + 1)].map((_, i) => (
                                        <th key={i} className="px-3 md:px-4 py-2 md:py-3">
                                            <div className="h-3 bg-neutral-200 dark:bg-gray-600 rounded w-16 animate-pulse" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        {[...Array(columns.length + 1)].map((_, colI) => (
                                            <td key={colI} className="px-3 py-2 md:px-4 md:py-3 relative">
                                                <div className="flex items-center gap-2">
                                                    {colI === 0 && <div className="w-6 h-6 md:w-8 md:h-8 bg-neutral-100 rounded-lg flex-shrink-0 animate-pulse" />}
                                                    <div className="h-2.5 bg-neutral-100 rounded animate-pulse" style={{ width: `${Math.max(30, 80 - (i * colI * 10) % 50)}%` }} />
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
                        customActions={customActions}
                        refresh={loadData}
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
                <div className="py-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            {renderForm ? renderForm(formData, setFormData, loadData) : (
                                formFields.map(field => (
                                    <div key={field.name} className="space-y-1.5">
                                        {field.type === 'checkbox' ? (
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div
                                                    onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                                                    className={`w-8 h-5 rounded-full transition-all relative flex-shrink-0 ${
                                                        formData[field.name] ? 'bg-brand-cyan' : 'bg-neutral-200'
                                                    }`}
                                                >
                                                    <div className={`w-3.5 h-3.5 bg-white dark:bg-gray-300 rounded-full shadow absolute top-0.5 transition-all ${
                                                        formData[field.name] ? 'left-4' : 'left-0.5'
                                                    }`} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600">{field.label}</span>
                                            </label>
                                        ) : (
                                            <>
                                                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 ml-1 block">{field.label}</label>
                                                <input
                                                    required={field.required}
                                                    type={field.type || 'text'}
                                                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 focus:outline-none transition-all text-sm font-bold text-neutral-900 placeholder:text-neutral-400"
                                                    placeholder={field.label.toUpperCase()}
                                                    value={formData[field.name] ?? ''}
                                                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                />
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-neutral-100 dark:border-gray-700 flex flex-col gap-3">
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black text-white px-4 py-3 rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-cyan hover:text-black transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-11"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                                        <span className="font-black tracking-[0.3em] text-sm uppercase text-brand-cyan">Guardando Cambios...</span>
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

                        <div className="bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl p-4 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 dark:text-gray-400 mb-1">Registro a dar de baja</p>
                            <p className="text-sm font-black uppercase tracking-widest text-black dark:text-white">
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
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
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
