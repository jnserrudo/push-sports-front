import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
    CalendarDays,
    Plus,
    Pencil,
    Trash2,
    QrCode,
    Users,
    ToggleLeft,
    ToggleRight,
    X,
    Download,
    CheckCircle2,
    AlertCircle,
    Gift,
    Loader2
} from 'lucide-react';
import { eventosService } from '../../services/eventosService';
import { toast } from '../../store/toastStore';

// --- QR Modal ---
const QRModal = ({ evento, onClose }) => {
    const canvasRef = useRef(null);
    const BASE_URL = 'https://pushsport.com.ar/#/e/';
    const url = `${BASE_URL}${evento.id_evento}`;

    const handleDownload = () => {
        const canvas = document.getElementById('evento-qr-canvas');
        if (!canvas) return;
        
        // Crear canvas temporal de 400x400px para mejor calidad de impresión
        const tempCanvas = document.createElement('canvas');
        const scale = 2; // 200px * 2 = 400px
        tempCanvas.width = 400;
        tempCanvas.height = 400;
        const ctx = tempCanvas.getContext('2d');
        
        // Dibujar el QR escalado
        ctx.drawImage(canvas, 0, 0, 400, 400);
        
        // Descargar la versión de 400px
        const link = document.createElement('a');
        link.download = `QR_${evento.nombre.replace(/\s+/g, '_')}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-black p-6 text-center relative">
                    <button onClick={onClose} className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-700">
                        <X size={16} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-cyan block mb-2">QR Campaña</span>
                    <h3 className="text-white text-2xl font-sport uppercase leading-tight m-0">{evento.nombre}</h3>
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                    {/* QR Code con logo */}
                    <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-neutral-100 dark:border-gray-700">
                        <QRCodeCanvas
                            id="evento-qr-canvas"
                            value={url}
                            size={200}
                            level="H"
                            marginSize={1}
                            imageSettings={{
                                src: '/icono_new.jpeg',
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="text-center w-full">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500 mb-1">URL del evento</p>
                        <p className="text-[10px] font-mono font-bold text-neutral-600 dark:text-gray-300 bg-neutral-50 dark:bg-gray-700 px-3 py-2 rounded-lg break-all">{url}</p>
                    </div>

                    {evento.recompensa_texto && (
                        <div className="w-full flex items-center gap-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl px-4 py-3">
                            <Gift size={18} className="text-brand-cyan flex-shrink-0" />
                            <p className="text-xs font-bold text-neutral-700 dark:text-gray-200 leading-relaxed m-0">{evento.recompensa_texto}</p>
                        </div>
                    )}

                    <button
                        onClick={handleDownload}
                        className="w-full py-3.5 bg-black text-brand-cyan rounded-xl font-sport text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-cyan hover:text-black transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        <Download size={16} />
                        Descargar QR (PNG)
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Form Modal ---
const FormModal = ({ evento, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: evento?.nombre || '',
        recompensa_texto: evento?.recompensa_texto || '',
        fecha_inicio: evento?.fecha_inicio ? evento.fecha_inicio.split('T')[0] : '',
        fecha_fin: evento?.fecha_fin ? evento.fecha_fin.split('T')[0] : '',
        activo: evento?.activo !== undefined ? evento.activo : true,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (evento) {
                await eventosService.update(evento.id_evento, formData);
                toast.success('Evento actualizado correctamente.');
            } else {
                await eventosService.create(formData);
                toast.success('¡Evento creado! Ya podés generar el QR.');
            }
            onSave();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al guardar el evento.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all";

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-sport uppercase m-0 text-black dark:text-white">{evento ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan">{evento ? 'Modificar campaña' : 'Crear campaña de leads'}</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-neutral-100 dark:bg-gray-700 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Nombre del Evento *</label>
                        <input
                            required
                            className={inputClass}
                            placeholder="Ej: Masterclass Salta Abril 2026"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Mensaje de Recompensa</label>
                        <textarea
                            rows={3}
                            className={`${inputClass} resize-none`}
                            placeholder="Ej: ¡Mostrá esta pantalla en el stand y llevate tu obsequio!"
                            value={formData.recompensa_texto}
                            onChange={e => setFormData({ ...formData, recompensa_texto: e.target.value })}
                        />
                        <p className="text-[9px] text-neutral-400 dark:text-gray-500 font-bold uppercase tracking-widest">Este texto verán los usuarios al validar su cuenta.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Fecha Inicio</label>
                            <input type="date" className={inputClass} value={formData.fecha_inicio} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Fecha Fin</label>
                            <input type="date" className={inputClass} value={formData.fecha_fin} onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-gray-700/50 rounded-xl border border-neutral-200 dark:border-gray-600">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white m-0">Estado del Evento</p>
                            <p className="text-[9px] font-bold text-neutral-400 dark:text-gray-500 uppercase m-0">{formData.activo ? 'Activo — Acepta nuevos registros' : 'Desactivado'}</p>
                        </div>
                        <button type="button" onClick={() => setFormData({ ...formData, activo: !formData.activo })} className="transition-all">
                            {formData.activo
                                ? <ToggleRight size={32} className="text-brand-cyan" />
                                : <ToggleLeft size={32} className="text-neutral-300 dark:text-gray-600" />
                            }
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-neutral-200 dark:border-gray-600 rounded-xl text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-gray-400 hover:border-black dark:hover:border-gray-400 hover:text-black dark:hover:text-white transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-black text-white rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-cyan hover:text-black transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                            {loading ? 'Guardando...' : (evento ? 'Guardar Cambios' : 'Crear Evento')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Hub QR Modal ---
const HubQRModal = ({ onClose }) => {
    const BASE_URL = 'https://pushsport.com.ar/#/hub';
    const url = BASE_URL;

    const handleDownload = () => {
        const canvas = document.getElementById('hub-qr-canvas');
        if (!canvas) return;
        
        // Crear canvas temporal de 400x400px para mejor calidad de impresión
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 400;
        const ctx = tempCanvas.getContext('2d');
        
        // Dibujar el QR escalado
        ctx.drawImage(canvas, 0, 0, 400, 400);
        
        // Descargar la versión de 400px
        const link = document.createElement('a');
        link.download = 'QR_Hub_PushSport.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-black p-6 text-center relative">
                    <button onClick={onClose} className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-700">
                        <X size={16} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-cyan block mb-2">QR Hub Social</span>
                    <h3 className="text-white text-2xl font-sport uppercase leading-tight m-0">Enlaces Oficiales</h3>
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                    {/* QR Code con logo */}
                    <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-neutral-100 dark:border-gray-700">
                        <QRCodeCanvas
                            id="hub-qr-canvas"
                            value={url}
                            size={200}
                            level="H"
                            marginSize={1}
                            imageSettings={{
                                src: '/icono_new.jpeg',
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="text-center w-full">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500 mb-1">URL del Hub</p>
                        <p className="text-[10px] font-mono font-bold text-neutral-600 dark:text-gray-300 bg-neutral-50 dark:bg-gray-700 px-3 py-2 rounded-lg break-all">{url}</p>
                    </div>

                    <div className="w-full bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-neutral-700 dark:text-gray-200 leading-relaxed m-0 text-center">
                            QR fijo para acceso al sistema y redes sociales de Push Sport
                        </p>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full py-3.5 bg-black text-brand-cyan rounded-xl font-sport text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-cyan hover:text-black transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        <Download size={16} />
                        Descargar QR (PNG)
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---
const Eventos = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrEvento, setQrEvento] = useState(null);
    const [formEvento, setFormEvento] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showHubQR, setShowHubQR] = useState(false);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const data = await eventosService.getAll();
            setEventos(data);
        } catch {
            toast.error('No se pudieron cargar los eventos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const handleToggle = async (evento) => {
        try {
            await eventosService.update(evento.id_evento, { ...evento, activo: !evento.activo });
            toast.success(`Evento ${!evento.activo ? 'activado' : 'desactivado'}.`);
            cargar();
        } catch {
            toast.error('Error al cambiar el estado.');
        }
    };

    const handleDelete = async (evento) => {
        if (!window.confirm(`¿Eliminar el evento "${evento.nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await eventosService.delete(evento.id_evento);
            toast.success('Evento eliminado.');
            cargar();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar el evento.');
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-black dark:bg-gray-700 flex items-center justify-center shadow-md flex-shrink-0">
                            <CalendarDays size={20} className="text-brand-cyan" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-sport uppercase m-0 leading-none text-black dark:text-white">
                                Eventos & <span className="text-brand-cyan">Campañas</span>
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-gray-500 m-0">Generación de QR y captura de leads por campaña</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setShowHubQR(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-700 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-brand-cyan dark:hover:bg-gray-600 transition-all shadow-md hover:-translate-y-0.5 flex-shrink-0"
                    >
                        <QrCode size={16} />
                        QR Hub Social
                    </button>
                    <button
                        onClick={() => { setFormEvento(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-all shadow-md hover:-translate-y-0.5 flex-shrink-0"
                    >
                        <Plus size={16} />
                        Nueva Campaña
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-neutral-400 dark:text-gray-500">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Cargando campañas...</span>
                    </div>
                ) : eventos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-gray-700 flex items-center justify-center">
                            <CalendarDays size={28} className="text-neutral-300 dark:text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-black dark:text-white m-0">Sin campañas creadas</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500 mt-1">Crea tu primera campaña con QR</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100 dark:border-gray-700">
                                    {['Evento', 'Recompensa', 'Período', 'Leads', 'Estado', 'Acciones'].map(h => (
                                        <th key={h} className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-gray-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-gray-700/50">
                                {eventos.map(ev => (
                                    <tr key={ev.id_evento} className="hover:bg-neutral-50/70 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-sport text-lg uppercase leading-none text-black dark:text-white m-0">{ev.nombre}</p>
                                            <p className="text-[9px] font-black text-neutral-400 dark:text-gray-500 uppercase tracking-widest m-0 mt-1 font-mono">
                                                #{ev.id_evento.split('-')[0].toUpperCase()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            {ev.recompensa_texto ? (
                                                <div className="flex items-start gap-2">
                                                    <Gift size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-neutral-600 dark:text-gray-300 font-medium leading-snug m-0 line-clamp-2">{ev.recompensa_texto}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-neutral-300 dark:text-gray-600 uppercase tracking-widest">Sin mensaje</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-black dark:text-white">{formatDate(ev.fecha_inicio)}</span>
                                                {ev.fecha_fin && <span className="text-[10px] font-bold text-neutral-400 dark:text-gray-500">→ {formatDate(ev.fecha_fin)}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-brand-cyan" />
                                                <span className="font-sport text-xl text-black dark:text-white leading-none">{ev.leads ?? 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggle(ev)} className="flex items-center gap-1.5 transition-all hover:opacity-70">
                                                {ev.activo
                                                    ? <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Activo</span></>
                                                    : <><AlertCircle size={14} className="text-neutral-400" /><span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-gray-500">Inactivo</span></>
                                                }
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setQrEvento(ev)}
                                                    title="Ver QR"
                                                    className="w-8 h-8 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-black flex items-center justify-center transition-all"
                                                >
                                                    <QrCode size={15} />
                                                </button>
                                                <button
                                                    onClick={() => { setFormEvento(ev); setShowForm(true); }}
                                                    title="Editar"
                                                    className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-gray-700 hover:bg-black hover:text-white text-neutral-500 dark:text-gray-400 flex items-center justify-center transition-all"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ev)}
                                                    title="Eliminar"
                                                    className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {qrEvento && <QRModal evento={qrEvento} onClose={() => setQrEvento(null)} />}
            {showHubQR && <HubQRModal onClose={() => setShowHubQR(false)} />}
            {showForm && (
                <FormModal
                    evento={formEvento}
                    onClose={() => { setShowForm(false); setFormEvento(null); }}
                    onSave={cargar}
                />
            )}
        </div>
    );
};

export default Eventos;
