import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Box, Home, PlusCircle, Info, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { enviosService } from '../../services/enviosService';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';

const Envios = () => {
    const [envios, setEnvios]         = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [productos, setProductos]   = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'ok'|'error', msg: string }

    const [formData, setFormData] = useState({
        sucursal_id: '',
        producto_id: '',
        cantidad: 1,
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [envData, sucData, prodData] = await Promise.all([
                enviosService.getAll(),
                sucursalesService.getAll(),
                productosService.getAll(),
            ]);
            setEnvios(envData);
            setSucursales(sucData.filter(s => s.activo));
            setProductos(prodData.filter(p => p.activo));
        } catch (err) {
            console.error('Error cargando envíos:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAdd = () => {
        setFormData({
            sucursal_id: sucursales[0]?.id || '',
            producto_id: productos[0]?.id  || '',
            cantidad: 1,
        });
        setFeedback(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);
        try {
            await enviosService.crearEnvio(
                formData.sucursal_id,
                formData.producto_id,
                formData.cantidad,
                sucursales,
                productos,
            );
            setFeedback({ type: 'ok', msg: 'Orden procesada correctamente.' });
            setTimeout(() => {
                setIsModalOpen(false);
                setFeedback(null);
                loadData();
            }, 1200);
        } catch (err) {
            setFeedback({ type: 'error', msg: err?.message || 'Error al procesar la orden.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            header: 'ID Envío',
            accessor: 'id',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Fecha',
            accessor: 'fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black uppercase tracking-widest">
                        {row.fecha ? new Date(row.fecha).toLocaleDateString() : '—'}
                    </span>
                    <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">Registrado</span>
                </div>
            )
        },
        {
            header: 'Destino',
            accessor: 'sucursal_nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                    <span className="font-bold text-sm text-black uppercase tracking-widest">{row.sucursal_nombre || '—'}</span>
                </div>
            )
        },
        {
            header: 'Producto',
            accessor: 'producto_nombre',
            render: (row) => (
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest leading-snug">
                    {row.producto_nombre || '—'}
                </span>
            )
        },
        {
            header: 'Volumen',
            accessor: 'cantidad',
            render: (row) => (
                <div className="inline-flex items-baseline gap-1 px-3 py-1.5 bg-black text-white rounded-lg font-sport text-lg leading-none tracking-widest">
                    {row.cantidad}
                    <span className="text-[10px] font-sans font-bold ml-1 mb-0.5">UN.</span>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-6">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500 mb-2 block">LOGÍSTICA INTERNA</span>
                    <h2 className="text-4xl md:text-5xl uppercase leading-none m-0 font-sport text-black">
                        Transferencia de <span className="text-brand-cyan">Stock.</span>
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium mt-2 m-0">{envios.length} movimientos registrados</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-neutral-100 text-black hover:bg-neutral-200 transition-colors px-4 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex-1 md:flex-none bg-brand-cyan text-black hover:bg-black hover:text-white transition-colors px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-md"
                    >
                        <PlusCircle size={16} /> REGISTRAR ENVÍO
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Sincronizando Historial...</p>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                    <DataTable
                        data={envios}
                        columns={columns}
                        searchPlaceholder="Filtrar por sede o producto..."
                        variant="minimal"
                    />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title="Nueva Orden de Traslado"
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2">

                    {/* Feedback banner */}
                    {feedback && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
                            feedback.type === 'ok'
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            {feedback.type === 'ok'
                                ? <CheckCircle2 size={16} />
                                : <AlertCircle size={16} />
                            }
                            {feedback.msg}
                        </div>
                    )}

                    <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-4">
                        <Info size={18} className="text-brand-cyan shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                            Al confirmar, el stock se incrementará en la <span className="text-black font-black">Sede Destino</span>. Operación irreversible.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Sede de Destino</label>
                            <div className="relative group">
                                <Home size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                <select
                                    required
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all appearance-none disabled:opacity-60"
                                    value={formData.sucursal_id}
                                    onChange={e => setFormData({ ...formData, sucursal_id: e.target.value })}
                                >
                                    <option value="">Seleccione destino...</option>
                                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Producto a Transferir</label>
                            <div className="relative group">
                                <Box size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                <select
                                    required
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all appearance-none disabled:opacity-60"
                                    value={formData.producto_id}
                                    onChange={e => setFormData({ ...formData, producto_id: e.target.value })}
                                >
                                    <option value="">Seleccione ítem...</option>
                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Cantidad de Unidades</label>
                            <div className="relative group">
                                <Check size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                                <input
                                    required type="number" min="1"
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all disabled:opacity-60"
                                    placeholder="0"
                                    value={formData.cantidad}
                                    onChange={e => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-4 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-60"
                        >
                            {isSubmitting
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> PROCESANDO...</>
                                : <><Truck size={16} /> PROCESAR ORDEN</>
                            }
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setIsModalOpen(false)}
                            className="w-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors py-3 disabled:opacity-40"
                        >
                            CANCELAR
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Envios;