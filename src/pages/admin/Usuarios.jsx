import React, { useState, useEffect } from 'react';
import { People, ShieldSecurity, Shop, ProfileCircle } from 'iconsax-react';
import GenericABM from '../../components/ui/GenericABM';
import { usuariosService as service } from '../../services/genericServices';
import { sucursalesService } from '../../services/sucursalesService';

const Usuarios = () => {
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        sucursalesService.getAll().then(setSucursales).catch(console.error);
    }, []);

    const columns = [
        { header: 'ID', accessor: 'id_usuario', render: (row) => <span className="text-[10px] font-mono opacity-50">{row.id_usuario.split('-')[0]}...</span> },
        { 
            header: 'Operador', 
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-neutral-900">{row.nombre} {row.apellido}</span>
                    <span className="text-[10px] font-mono text-neutral-400 lowercase">{row.email}</span>
                </div>
            )
        },
        { 
            header: 'Rol / Access Level', 
            accessor: 'id_rol',
            render: (row) => {
                const roles = {
                    1: { label: 'SUPER ADMIN', color: 'bg-neutral-900 text-white', icon: ShieldSecurity },
                    2: { label: 'SUPERVISOR', color: 'bg-neutral-100 text-neutral-700', icon: Shop },
                    3: { label: 'VENDEDOR', color: 'bg-brand-cyan/10 text-brand-cyan', icon: ProfileCircle },
                    default: { label: 'USUARIO', color: 'bg-neutral-50 text-neutral-400', icon: ProfileCircle }
                };
                const config = roles[row.id_rol] || roles.default;
                return (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border border-neutral-100 ${config.color}`}>
                        <config.icon size={11} strokeWidth={2.5} />
                        {config.label}
                    </div>
                );
            }
        },
        { 
            header: 'Sucursal Asignada', 
            accessor: 'id_comercio_asignado',
            render: (row) => {
                if (!row.id_comercio_asignado) return (
                    <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                         <span className="text-red-500 font-bold text-[10px] tracking-widest uppercase">Sin Asignar</span>
                    </div>
                );
                const suc = sucursales.find(s => s.id_comercio === row.id_comercio_asignado);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-xs text-neutral-700 uppercase">{suc?.nombre || 'Sede #' + row.id_comercio_asignado.split('-')[0]}</span>
                        <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-widest">Activo</span>
                    </div>
                );
            }
        },
    ];

    const renderForm = (formData, setFormData) => {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Nombre</label>
                        <input 
                            required type="text" 
                            className="input-premium"
                            placeholder="Ingrese nombre"
                            value={formData.nombre || ''} 
                            onChange={e => setFormData({...formData, nombre: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Apellido</label>
                        <input 
                            required type="text" 
                            className="input-premium"
                            placeholder="Ingrese apellido"
                            value={formData.apellido || ''} 
                            onChange={e => setFormData({...formData, apellido: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Administrativo</label>
                    <input 
                        required type="email" 
                        className="input-premium"
                        placeholder="operador@push.com"
                        value={formData.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                </div>

                {!formData.id_usuario && (
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Contraseña Inicial</label>
                        <input 
                            required type="password" 
                            className="input-premium"
                            placeholder="••••••••"
                            value={formData.password || ''} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Rol del Sistema</label>
                        <select 
                            required 
                            className="input-premium appearance-none"
                            value={formData.id_rol || ''} 
                            onChange={e => setFormData({...formData, id_rol: parseInt(e.target.value)})}
                        >
                            <option value="">Seleccionar Rol...</option>
                            <option value={1}>SUPER_ADMIN (CONTROL TOTAL)</option>
                            <option value={2}>SUPERVISOR (GESTIÓN SUCURSAL)</option>
                            <option value={3}>VENDEDOR (PUNTO DE VENTA)</option>
                            <option value={4}>USUARIO (SOLO LECTURA)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Sucursal Asignada</label>
                        <select 
                            className="input-premium appearance-none"
                            value={formData.id_comercio_asignado || ''} 
                            onChange={e => setFormData({...formData, id_comercio_asignado: e.target.value === '' ? null : e.target.value})}
                        >
                            <option value="">SIN ASIGNAR (ACCESO RESTRINGIDO)</option>
                            {sucursales.map(s => (
                                <option key={s.id_comercio} value={s.id_comercio}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="bg-neutral-50 p-6 rounded-3xl border border-dashed border-neutral-200">
                    <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-cyan shadow-sm border border-neutral-100">
                            <ShieldSecurity size={20} variant="Bold" />
                         </div>
                         <p className="text-[11px] font-medium text-neutral-400 leading-relaxed uppercase tracking-widest">
                            Los cambios de permisos impactan en tiempo real <br/> sobre la terminal del operador.
                         </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <GenericABM 
            title="Gestión de Operadores"
            icon={People}
            service={service}
            columns={columns}
            formFields={[]} 
            renderForm={renderForm}
            idField="id_usuario"
        />
    );
};

export default Usuarios;
