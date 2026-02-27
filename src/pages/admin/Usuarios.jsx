import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Store, UserCircle, User, Mail, Lock, Shield } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { usuariosService as service } from '../../services/genericServices';
import { sucursalesService } from '../../services/sucursalesService';

const Usuarios = () => {
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        sucursalesService.getAll().then(setSucursales).catch(console.error);
    }, []);

    const ROLES = {
        1: { label: 'ADMIN. CORE',   color: 'bg-black text-white border-black',             icon: ShieldCheck },
        2: { label: 'GESTOR SEDE',   color: 'bg-brand-cyan text-black border-brand-cyan',   icon: Store       },
        3: { label: 'VENDEDOR POS',  color: 'bg-transparent text-black border-black',       icon: UserCircle  },
        4: { label: 'VISOR',         color: 'bg-neutral-100 text-neutral-400 border-neutral-200', icon: UserCircle },
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id_usuario',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    #{String(row.id_usuario).split('-')[0]}
                </span>
            )
        },
        {
            header: 'Credencial Operador',
            accessor: 'nombre',
            render: (row) => (
                 <div className="flex flex-col">
                    <span className="font-black text-xs md:text-xl text-black uppercase leading-none mb-[2px] md:mb-1">
                        {row.nombre} {row.apellido}
                    </span>
                    <span className="text-[8px] md:text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">{row.email}</span>
                </div>
            )
        },
        {
            header: 'Nivel de Acceso',
            accessor: 'id_rol',
            render: (row) => {
                const cfg = ROLES[row.id_rol] || ROLES[4];
                return (
                    <div className={`inline-flex items-center gap-1 md:gap-2 px-1 md:px-2.5 py-0.5 md:py-1 text-[7px] md:text-[10px] font-black uppercase tracking-widest rounded-sm border-2 ${cfg.color} leading-none`}>
                        <cfg.icon className="w-2 h-2 md:w-3 md:h-3" strokeWidth={3} />
                        {cfg.label}
                    </div>
                );
            }
        },
        {
            header: 'Terminal Asignada',
            accessor: 'id_comercio_asignado',
            render: (row) => {
                if (!row.id_comercio_asignado) return (
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                        <span className="text-black font-bold text-[9px] tracking-widest uppercase">Global (Todas)</span>
                    </div>
                );
                const suc = sucursales.find(s => s.id_comercio === row.id_comercio_asignado);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black uppercase tracking-widest">
                            {suc?.nombre || 'Sede #' + String(row.id_comercio_asignado).split('-')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">Enlace Activo</span>
                    </div>
                );
            }
        },
    ];

    const renderForm = (formData, setFormData) => (
        <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { field: 'nombre',   label: 'Nombre',   placeholder: 'NOMBRE'   },
                    { field: 'apellido', label: 'Apellido', placeholder: 'APELLIDO' },
                    { field: 'username', label: 'Usuario',  placeholder: 'NICKNAME' },
                ].map(({ field, label, placeholder }) => (
                    <div key={field} className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">{label}</label>
                        <div className="relative group">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                            <input
                                required type="text"
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                                placeholder={placeholder}
                                value={formData[field] || ''}
                                onChange={e => setFormData({ ...formData, [field]: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Email Corporativo</label>
                <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                    <input
                        required type="email"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                        placeholder="OPERADOR@PUSHSPORT.COM"
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    />
                </div>
            </div>

            {/* Solo mostrar contraseña en creación, no en edición */}
            {!formData.id_usuario && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Clave de Acceso Temporal</label>
                    <div className="relative group">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                        <input
                            required type="password"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                            placeholder="••••••••"
                            value={formData.password || ''}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Nivel de Permisos</label>
                    <div className="relative group">
                        <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                        <select
                            required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-black uppercase focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all appearance-none"
                            value={formData.id_rol || ''}
                            onChange={e => setFormData({ ...formData, id_rol: parseInt(e.target.value) })}
                        >
                            <option value="">SELECCIONAR ROL...</option>
                            <option value={1}>ADMIN. CORE — Control total</option>
                            <option value={2}>GESTOR SEDE — Inventario y Caja</option>
                            <option value={3}>VENDEDOR POS — Caja únicamente</option>
                            <option value={4}>VISOR — Solo lectura</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Asignación Física</label>
                    <div className="relative group">
                        <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-black uppercase focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all appearance-none"
                            value={formData.id_comercio_asignado || ''}
                            onChange={e => setFormData({ ...formData, id_comercio_asignado: e.target.value === '' ? null : e.target.value })}
                        >
                            <option value="">GLOBAL — Aplica a todas las sedes</option>
                            {sucursales.map(s => (
                                <option key={s.id_comercio} value={s.id_comercio}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3">
                <ShieldCheck size={16} className="text-black mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                    Los permisos impactan en tiempo real. Un <span className="text-brand-cyan">ADMIN. CORE</span> tiene control total sin importar la asignación física.
                </p>
            </div>
        </div>
    );

    return (
        <GenericABM
            title="Gestión de Staff"
            icon={Users}
            service={service}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            idField="id_usuario"
        />
    );
};

export default Usuarios;