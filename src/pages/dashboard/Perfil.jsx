import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { UserIcon, Mail, Shield, MapPin, Key, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/api';

const Perfil = () => {
    const { user, sucursalId } = useAuthStore();
    const [sucursalNombre, setSucursalNombre] = useState(null);

    const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' });
    const [showPw, setShowPw] = useState({ actual: false, nueva: false, confirmar: false });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwFeedback, setPwFeedback] = useState(null); // { type: 'ok'|'error', msg }

    useEffect(() => {
        if (sucursalId) {
            sucursalesService.getById(sucursalId)
                .then(s => setSucursalNombre(s?.nombre || null))
                .catch(() => setSucursalNombre(null));
        }
    }, [sucursalId]);

    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        setPwFeedback(null);
        if (pwForm.nueva !== pwForm.confirmar) {
            setPwFeedback({ type: 'error', msg: 'Las contraseñas nuevas no coinciden.' });
            return;
        }
        if (pwForm.nueva.length < 6) {
            setPwFeedback({ type: 'error', msg: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        setPwLoading(true);
        try {
            await api.put('/usuarios/cambiar-password', {
                password_actual: pwForm.actual,
                password_nueva: pwForm.nueva
            });
            setPwFeedback({ type: 'ok', msg: 'Contraseña actualizada correctamente.' });
            setPwForm({ actual: '', nueva: '', confirmar: '' });
        } catch (err) {
            setPwFeedback({ type: 'error', msg: err?.response?.data?.error || 'Error al cambiar contraseña.' });
        } finally {
            setPwLoading(false);
        }
    };

    if (!user) return null;

    const roleName = user.id_rol === 1 ? 'Administrador Principal' : user.id_rol === 2 ? 'Gestor de Sucursal' : 'Vendedor POS';
    const roleColor = user.id_rol === 1 ? 'text-brand-cyan' : user.id_rol === 2 ? 'text-amber-400' : 'text-neutral-500';

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto mt-8 relative"
        >
            <div className="bg-white rounded-[2rem] border-2 border-neutral-100 shadow-sm overflow-hidden pb-10">
                {/* Header Banner */}
                <div className="h-40 md:h-56 bg-black relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-500 via-black to-black"></div>
                    <div className="z-10 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-cyan mb-2 block">
                            CUENTA DE IDENTIDAD
                        </span>
                        <h1 className="text-4xl md:text-5xl font-sport text-white tracking-widest uppercase m-0 leading-none">
                            PUSH<span className="text-brand-cyan">SPORT</span>
                        </h1>
                    </div>
                </div>

                {/* Profile Info Avatar */}
                <div className="flex flex-col items-center -mt-16 md:-mt-20 relative z-20 mb-8 px-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full border-4 border-neutral-100 flex items-center justify-center shadow-xl text-neutral-900 font-black text-5xl md:text-7xl">
                        {user.id_rol === 1 ? 'A' : user.id_rol === 2 ? 'G' : 'V'}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mt-6 tracking-tight uppercase text-center">
                        {user.nombre}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Shield size={16} className={roleColor} />
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${roleColor}`}>
                            {roleName}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-10">
                    <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-transparent hover:border-neutral-200 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail size={16} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Registrado</span>
                        </div>
                        <p className="font-bold text-neutral-900 truncate group-hover:text-brand-cyan transition-colors">
                            {user.email || 'No registrado'}
                        </p>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-transparent hover:border-neutral-200 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin size={16} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Punto Operativo</span>
                        </div>
                        <p className="font-bold text-neutral-900 uppercase">
                            {user.id_rol === 1 ? 'ACCESO GLOBAL MASTER' : sucursalNombre || sucursalId ? (sucursalNombre || `SEDE #${String(sucursalId).split('-')[0]}`) : 'NO ASIGNADA'}
                        </p>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-transparent hover:border-neutral-200 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <Key size={16} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Permisos Activos</span>
                        </div>
                        <p className="font-bold text-neutral-900 text-sm">
                            {user.id_rol === 1 ? 'Lectura, Escritura, Asignaciones, Cajas.' : user.id_rol === 2 ? 'Inventario Local, POS, Operadores Locales.' : 'Terminal POS, Inventario Local.'}
                        </p>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-transparent hover:border-neutral-200 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <UserIcon size={16} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">ID Interno de Sistema</span>
                        </div>
                        <p className="font-bold text-neutral-900 text-xs truncate">
                            {user.id_usuario}
                        </p>
                    </div>
                </div>

                {/* Sección cambio de contraseña */}
                <div className="px-6 md:px-12 mt-10">
                    <div className="border-t-2 border-neutral-100 pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Lock size={16} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Cambiar Contraseña</span>
                        </div>
                        <form onSubmit={handleCambiarPassword} className="space-y-4 max-w-sm">
                            {[['actual', 'Contraseña Actual'], ['nueva', 'Nueva Contraseña'], ['confirmar', 'Confirmar Nueva']].map(([field, label]) => (
                                <div key={field}>
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPw[field] ? 'text' : 'password'}
                                            value={pwForm[field]}
                                            onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 pr-10 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:outline-none focus:border-black transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                                        >
                                            {showPw[field] ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {pwFeedback && (
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold ${
                                    pwFeedback.type === 'ok'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {pwFeedback.type === 'ok'
                                        ? <CheckCircle2 size={13} />
                                        : <AlertCircle size={13} />}
                                    {pwFeedback.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={pwLoading}
                                className="w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                <Lock size={13} />
                                {pwLoading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-10 text-center px-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Para asignar nuevas sucursales o modificar roles contactá al Administrador Principal.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Perfil;
