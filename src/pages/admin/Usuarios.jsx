import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Store, UserCircle, User, Mail, Lock, Shield } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { usuariosService as service } from '../../services/genericServices';
import { sucursalesService } from '../../services/sucursalesService';
import PremiumSelect from '../../components/ui/PremiumSelect';

const Usuarios = () => {
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        sucursalesService.getAll().then(setSucursales).catch(console.error);
    }, []);

    const ROLES = {
        1: { label: 'ADMIN. CORE',   color: 'bg-black text-white border-black',             icon: ShieldCheck },
        2: { label: 'SUPERVISOR / GESTOR',   color: 'bg-brand-cyan text-black border-brand-cyan',   icon: Store       },
        3: { label: 'VENDEDOR POS',  color: 'bg-transparent text-black dark:text-white border-black dark:border-white',       icon: UserCircle  },
        4: { label: 'VISOR',         color: 'bg-neutral-100 dark:bg-gray-800 text-neutral-400 dark:text-neutral-300 border-neutral-200 dark:border-gray-700', icon: UserCircle },
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
                    <span className="font-black text-xs md:text-xl text-black dark:text-white uppercase leading-none mb-[2px] md:mb-1">
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
                        <span className="text-black dark:text-white font-bold text-[9px] tracking-widest uppercase">Global (Todas)</span>
                    </div>
                );
                const suc = sucursales.find(s => s.id_comercio === row.id_comercio_asignado);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black dark:text-white uppercase tracking-widest">
                            {suc?.nombre || 'Sede #' + String(row.id_comercio_asignado).split('-')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">Enlace Activo</span>
                    </div>
                );
            }
        },
        {
            header: 'Estado',
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-black tracking-widest uppercase ${
                    row.activo 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${row.activo ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {row.activo ? 'Operativo' : 'Inactivo'}
                </div>
            )
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
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">{label}</label>
                        <div className="relative group">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                            <input
                                required type="text"
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan transition-all"
                                placeholder={placeholder}
                                value={formData[field] || ''}
                                onChange={e => setFormData({ ...formData, [field]: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Email Corporativo</label>
                <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                    <input
                        required type="email"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-gray-200 uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan transition-all"
                        placeholder="OPERADOR@PUSHSPORT.COM"
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    />
                </div>
            </div>

            {/* Solo mostrar contraseña en creación, no en edición */}
            {!formData.id_usuario && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Clave de Acceso Temporal</label>
                    <div className="relative group">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                        <input
                            required type="password"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-1 focus:ring-brand-cyan transition-all"
                            placeholder="••••••••"
                            value={formData.password || ''}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Nivel de Permisos</label>
                    <PremiumSelect
                        icon={Shield}
                        placeholder="SELECCIONAR ROL..."
                        options={[
                            { value: 1, label: 'ADMIN. CORE', subtitle: 'Control total' },
                            { value: 2, label: 'SUPERVISOR / GESTOR', subtitle: 'Inventario, Envios y Caja' },
                            { value: 3, label: 'VENDEDOR POS', subtitle: 'Caja únicamente' },
                            { value: 4, label: 'VISOR', subtitle: 'Solo lectura' }
                        ]}
                        value={formData.id_rol || ''}
                        onChange={val => setFormData({ ...formData, id_rol: parseInt(val) })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Sucursal / Sede Asignada</label>
                    <PremiumSelect
                        icon={Store}
                        placeholder="GLOBAL — Aplica a todas las sedes"
                        options={[
                            { value: '', label: 'GLOBAL', subtitle: 'Todas las sedes' },
                            ...sucursales.map(s => ({ value: s.id_comercio, label: s.nombre }))
                        ]}
                        value={formData.id_comercio_asignado || ''}
                        onChange={val => setFormData({ ...formData, id_comercio_asignado: val === '' ? null : val })}
                    />
                </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-black dark:text-white shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-gray-300">Estado de la cuenta</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                            onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                            className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${
                                formData.activo ? 'bg-brand-cyan shadow-[0_0_10px_rgba(0,194,255,0.3)]' : 'bg-neutral-200 dark:bg-gray-600'
                            }`}
                        >
                            <div className={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow absolute top-1 transition-all ${
                                formData.activo ? 'left-5' : 'left-1'
                            }`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.activo ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formData.activo ? 'Activa' : 'Desactivada'}
                        </span>
                    </label>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-gray-400 leading-relaxed m-0 border-t border-neutral-100 dark:border-gray-600 pt-3">
                    Los permisos impactan en tiempo real. Un <span className="text-brand-cyan">ADMIN. CORE</span> tiene control total sin importar la asignación física.
                </p>
            </div>
        </div>
    );

    return (
        <GenericABM
            title="Gestión de Staff"
            description="Administración de permisos y operadores del sistema. Asigna los roles de seguridad (Admin, Supervisor, POS) y asocia al personal con sus respectivas sedes de trabajo."
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