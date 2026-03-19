import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { UserIcon, Mail, Shield, MapPin, Key } from 'lucide-react';
import { motion } from 'framer-motion';

const Perfil = () => {
    const { user, sucursalId } = useAuthStore();
    const [sucursalNombre, setSucursalNombre] = useState(null);

    useEffect(() => {
        if (sucursalId) {
            sucursalesService.getById(sucursalId)
                .then(s => setSucursalNombre(s?.nombre || null))
                .catch(() => setSucursalNombre(null));
        }
    }, [sucursalId]);

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

                <div className="mt-12 text-center px-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Para modificar credenciales o asignar nuevas sucursales contactá al Administrador Principal.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Perfil;
