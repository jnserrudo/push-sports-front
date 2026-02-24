import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { CheckCircle2, UserPlus, ArrowRight, User, Mail, Lock } from 'lucide-react';

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
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-cyan/5 blur-3xl rounded-full"></div>
              
              <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-12 text-center shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-brand-cyan/10 text-brand-cyan rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">Solicitud Exitosa</h2>
                <p className="text-neutral-500 font-medium text-sm mb-12 leading-relaxed">
                  Tu perfil de operador ha sido registrado. Un administrador central validará tu cuenta antes de habilitar los módulos de venta.
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full btn-premium h-14"
                    >
                      Ir al Login
                    </button>
                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-10">Push Sport Salta • Gestión Interna</p>
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
                    <div className="w-12 h-1 bg-brand-cyan mb-8 rounded-full"></div>
                    <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                        Únete al <br />
                        <span className="text-brand-cyan">Equipo.</span>
                    </h2>
                    <p className="text-neutral-400 font-medium text-sm leading-relaxed max-w-[240px]">
                        Comienza a gestionar el inventario y las ventas de la red Push Sport Salta con nuestra plataforma unificada.
                    </p>
                </div>

                <div className="absolute inset-0 opacity-10 group overflow-hidden pointer-events-none">
                    <img src="/primera.jpeg" alt="Push" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent"></div>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full md:w-7/12 p-10 md:p-20 bg-white flex flex-col justify-center">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4 text-brand-cyan">
                        <UserPlus size={20} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Portal de Registro</span>
                    </div>
                    <h1 className="text-neutral-900 font-bold text-4xl tracking-tight">
                        Nuevo Operador
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
                                    className="input-premium pl-12"
                                    value={formData.nombre} onChange={handleChange}
                                    placeholder="Nombre"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Apellido</label>
                            <input 
                                required type="text" name="apellido"
                                className="input-premium"
                                value={formData.apellido} onChange={handleChange}
                                placeholder="Apellido"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Administrativo</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                            <input 
                                required type="email" name="email"
                                className="input-premium pl-12"
                                value={formData.email} onChange={handleChange}
                                placeholder="usuario@push.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                            <input 
                                required type="password" name="password"
                                className="input-premium pl-12"
                                value={formData.password} onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-neutral-50 rounded-2xl flex items-start gap-4 border border-neutral-100 italic">
                        <CheckCircle2 className="text-brand-cyan flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">
                            Al registrarte, tu cuenta entrará en una <span className="text-neutral-900 font-bold">fase de revisión</span>. El administrador de la sucursal habilitará tus permisos en las próximas 24hs.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-premium py-4 flex items-center justify-center gap-3 group mt-4 h-14"
                    >
                        {loading ? 'Procesando...' : 'Crear Cuenta'}
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    
                    <div className="text-center pt-8">
                        <Link to="/login" className="text-sm font-bold text-neutral-400 hover:text-brand-cyan transition-colors">¿Ya tienes cuenta? Inicia sesión</Link>
                    </div>
                </form>
            </div>
          </div>
        </div>
    );
};

export default Register;
