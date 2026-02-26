import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from '../store/toastStore';

const Register = () => {
    // ESTADO ACTUALIZADO: Añadido confirmPassword
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '' 
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // VALIDACIÓN DE CONTRASEÑAS
        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden. Verifique e intente nuevamente.');
            return;
        }

        setLoading(true);
        try {
            // Quitamos confirmPassword antes de enviar al backend
            const { confirmPassword, ...dataToSend } = formData;
            await authService.register(dataToSend);
            setSuccess(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 relative font-sans">
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); .font-sport { font-family: 'Oswald', sans-serif; letter-spacing: -0.02em; }`}</style>
                <div className="max-w-md w-full bg-white rounded-xl p-10 text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 border border-neutral-200">
                    <div className="w-16 h-16 bg-black text-brand-cyan rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-3xl font-sport mb-2 text-black uppercase leading-none">Solicitud <br/> Recibida.</h2>
                    <p className="text-neutral-500 font-medium text-sm mb-8 leading-relaxed">
                        Su perfil de operador ha sido enviado.<br/>
                        <span className="text-brand-cyan font-bold uppercase tracking-widest text-[10px] block mt-3 p-2 bg-neutral-50 rounded-md border border-neutral-100">Requiere Autorización Administrativa</span>
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-black text-white py-4 rounded-lg text-[13px] font-sport uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-colors flex items-center justify-center gap-2 group shadow-lg"
                    >
                        VOLVER AL LOGIN <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 relative font-sans overflow-hidden selection:bg-black selection:text-brand-cyan">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); .font-sport { font-family: 'Oswald', sans-serif; letter-spacing: -0.02em; }`}</style>
          
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src="/primera.jpeg" className="w-full h-full object-cover opacity-30 grayscale" alt="Fondo" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
            </div>
          
            <div className="max-w-[1000px] w-full flex flex-col md:flex-row bg-white rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 h-auto">
            
            <div className="hidden md:flex md:w-5/12 bg-black relative flex-col justify-between p-10 overflow-hidden group">
                <img src="/segunda.jpeg" alt="Push" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="relative z-20">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm mb-6">
                        <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>

                <div className="relative z-20">
                    <h2 className="text-5xl font-sport text-white leading-[0.9] uppercase m-0">
                        Nuevo <br />
                        <span className="text-brand-cyan">Ingreso.</span>
                    </h2>
                    <p className="text-neutral-400 font-medium text-sm leading-relaxed mt-4 max-w-[90%]">
                        Incorpórese al personal para la gestión de inventario y caja.
                    </p>
                </div>
            </div>

            <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
                
                <div className="md:hidden flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center p-1.5">
                        <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain invert" />
                    </div>
                    <h2 className="text-3xl uppercase leading-none font-sport m-0 text-black">PushSport</h2>
                </div>

                <div className="mb-6">
                    <h1 className="text-black text-4xl font-sport uppercase m-0 mb-1 leading-none">
                        Registro Staff
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">COMPLETAR FORMULARIO</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Nombre</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" size={16} />
                                <input 
                                    required type="text" name="nombre"
                                    className="w-full pl-9 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    value={formData.nombre} onChange={handleChange}
                                    placeholder="NOMBRE"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Apellido</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" size={16} />
                                <input 
                                    required type="text" name="apellido"
                                    className="w-full pl-9 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    value={formData.apellido} onChange={handleChange}
                                    placeholder="APELLIDO"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Email Profesional</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" size={16} />
                            <input 
                                required type="email" name="email"
                                className="w-full pl-9 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                value={formData.email} onChange={handleChange}
                                placeholder="usuario@pushsport.com"
                            />
                        </div>
                    </div>

                    {/* NUEVO: Contraseña y Confirmar Contraseña en la misma fila para ahorrar espacio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" size={16} />
                                <input 
                                    required type="password" name="password"
                                    className="w-full pl-9 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    value={formData.password} onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Confirmar Clave</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" size={16} />
                                <input 
                                    required type="password" name="confirmPassword"
                                    className="w-full pl-9 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg flex items-center gap-3 border border-neutral-200 mt-2">
                        <ShieldCheck className="text-brand-cyan shrink-0" size={18} />
                        <p className="text-[9px] font-bold text-neutral-500 leading-snug uppercase tracking-widest m-0">
                            Requiere <span className="text-black">Validación de Supervisor</span> para activar permisos.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-3">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-lg text-[12px] font-sport uppercase tracking-widest transition-all ${
                                loading 
                                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300' 
                                : 'bg-black text-white hover:bg-brand-cyan hover:text-black border border-black shadow-md group'
                            }`}
                        >
                            {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                            {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" color="currentColor" />}
                        </button>
                        <Link to="/login" className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mt-2">
                            Volver al Ingreso
                        </Link>
                    </div>
                </form>
            </div>
          </div>
        </div>
    );
};

export default Register;