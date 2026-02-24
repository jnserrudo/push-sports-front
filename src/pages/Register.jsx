import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { TickCircle, UserAdd, ArrowRight, User, Sms, Lock, ShieldSearch, ProfileCircle } from 'iconsax-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register(formData);
            setSuccess(true);
        } catch (error) {
            alert('Error al registrar: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 relative">
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-cyan/5 blur-3xl rounded-full"></div>
              
              <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-16 text-center shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner ring-8 ring-emerald-50/50">
                  <TickCircle size={48} variant="Bold" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">Solicitud Recibida</h2>
                <p className="text-neutral-400 font-medium text-sm mb-12 leading-relaxed">
                  Su perfil de operador ha sido registrado en la base de datos central. <br/>
                  <span className="text-neutral-900 font-bold">Un administrador validará sus credenciales</span> antes de habilitar su acceso a los módulos de inventario y ventas.
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full btn-premium h-14"
                    >
                      VOLVER AL ACCESO
                    </button>
                    <p className="text-[10px] font-bold text-neutral-200 uppercase tracking-[0.5em] pt-10">Push Sport Salta &middot; Operational Hub</p>
                </div>
              </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 relative font-sans overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-brand-cyan/5 blur-3xl rounded-full -translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-5xl w-full flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-neutral-100">
            
            {/* Left Info Panel */}
            <div className="hidden md:flex md:w-5/12 bg-neutral-900 relative flex-col justify-end p-16 overflow-hidden">
                <div className="relative z-20">
                    <div className="w-16 h-1 bg-brand-cyan mb-10 rounded-full opacity-50"></div>
                    <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                        Incorpórese <br />
                        <span className="text-brand-cyan">al Staff.</span>
                    </h2>
                    <p className="text-neutral-400 font-medium text-sm leading-relaxed max-w-[240px]">
                        Escale la gestión de sucursal con nuestra terminal de control unificada para la red Push Sport.
                    </p>
                </div>

                <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none">
                    <img src="/primera.jpeg" alt="Push" className="w-full h-full object-cover grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent"></div>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full md:w-7/12 p-10 md:p-20 bg-white flex flex-col justify-center animate-in slide-in-from-right-10 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4 text-brand-cyan">
                        <UserAdd size={24} variant="Bold" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Registro de Puesto</span>
                    </div>
                    <h1 className="text-neutral-900 font-bold text-4xl tracking-tight">
                        Alta de Operador
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Nombre</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                <input 
                                    required type="text" name="nombre"
                                    className="input-premium pl-12 h-14"
                                    value={formData.nombre} onChange={handleChange}
                                    placeholder="Nombre del usuario"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Apellido</label>
                            <div className="relative group">
                                <ProfileCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                <input 
                                    required type="text" name="apellido"
                                    className="input-premium pl-12 h-14"
                                    value={formData.apellido} onChange={handleChange}
                                    placeholder="Apellido del usuario"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Profesional</label>
                        <div className="relative group">
                            <Sms className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                            <input 
                                required type="email" name="email"
                                className="input-premium pl-12 h-14"
                                value={formData.email} onChange={handleChange}
                                placeholder="usuario@pushsport.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Establecer Clave</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                            <input 
                                required type="password" name="password"
                                className="input-premium pl-12 h-14"
                                value={formData.password} onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-brand-cyan/5 rounded-[2rem] flex items-start gap-4 border border-brand-cyan/10">
                        <ShieldSearch className="text-brand-cyan flex-shrink-0 mt-0.5" size={24} variant="Bold" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed">
                            Su cuenta iniciará en estado <span className="text-neutral-900 uppercase">Bloqueado por defecto</span>. Un administrador nivel central autorizará sus permisos según el rol asignado.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-premium flex items-center justify-center gap-3 group mt-4 h-14"
                    >
                        {loading ? 'REGISTRANDO...' : 'ENVIAR SOLICITUD DE ALTA'}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    
                    <div className="text-center pt-8">
                        <Link to="/login" className="text-[11px] font-bold uppercase tracking-widest text-neutral-300 hover:text-neutral-900 transition-colors">¿Ya posee acceso? Inicie Sesión</Link>
                    </div>
                </form>
            </div>
          </div>
        </div>
    );
};

export default Register;
