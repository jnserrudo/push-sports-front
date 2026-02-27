import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { ArrowRight, Lock, Mail, Home, Loader2 } from 'lucide-react';
import { toast } from '../store/toastStore';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authService.login(credentials.email, credentials.password);
            login(data.user, data.token);
            toast.success('¡Bienvenido de nuevo!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al iniciar sesión. Verifique sus datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 relative font-sans overflow-hidden selection:bg-black selection:text-brand-cyan">
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
                .font-sport { font-family: 'Oswald', sans-serif; letter-spacing: -0.02em; }
            `}</style>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src="/primera.jpeg" className="w-full h-full object-cover opacity-30 grayscale" alt="Fondo" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
            </div>
            
            <div className="w-full max-w-[900px] flex flex-col md:flex-row bg-white rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 h-auto">
                
                {/* Visual (Desktop) */}
                <div className="hidden md:flex md:w-5/12 bg-black relative p-10 flex-col justify-between group overflow-hidden">
                    <img src="/segunda.jpeg" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Visual" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm mb-6">
                            <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em] mb-2 block">SISTEMA CENTRAL</span>
                        <h2 className="text-white text-5xl uppercase leading-[0.9] font-sport m-0">
                            Acceso <br/> <span className="text-brand-cyan">Operativo.</span>
                        </h2>
                    </div>
                </div>

                {/* Formulario */}
                <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
                    
                    <div className="md:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center p-1.5">
                            <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain invert" />
                        </div>
                        <h2 className="text-3xl uppercase leading-none font-sport m-0 text-black">PushSport</h2>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-black text-4xl font-sport uppercase m-0 mb-1 leading-none">
                            Iniciar Sesión
                        </h1>
                        <p className="text-neutral-500 font-medium text-sm m-0">
                            Ingrese sus credenciales corporativas.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.1em] text-black">Email o Usuario</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                <input 
                                    required name="email" type="text"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="usuario@pushsport.com"
                                    value={credentials.email} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.1em] text-black">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                <input 
                                    required name="password" type="password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-neutral-200 rounded-lg text-sm font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="••••••••"
                                    value={credentials.password} onChange={handleChange}
                                />
                            </div>
                            {/* ENLACE "OLVIDÉ MI CONTRASEÑA" CORREGIDO (Debajo del input, a la derecha) */}
                            <div className="flex justify-end pt-1">
                                <a href="#" className="text-[11px] font-bold text-neutral-500 hover:text-brand-cyan underline underline-offset-4 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            {/* Botón Principal */}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-4 flex items-center justify-center gap-2 rounded-lg text-[13px] font-sport uppercase tracking-[0.1em] transition-all ${
                                    loading 
                                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                                    : 'bg-black text-white hover:bg-brand-cyan hover:text-black shadow-lg group'
                                }`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    'INGRESAR AL SISTEMA'
                                )}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" color="currentColor" />}
                            </button>
                            
                            {/* BOTONES SECUNDARIOS CLAROS Y VISIBLES (Grid) */}
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Link to="/" className="flex items-center justify-center gap-2 py-3 border-2 border-neutral-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:border-black hover:text-black transition-colors bg-neutral-50 hover:bg-white">
                                    <Home size={14} /> Inicio
                                </Link>
                                <Link to="/register" className="flex items-center justify-center gap-2 py-3 border-2 border-neutral-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:border-brand-cyan hover:text-brand-cyan transition-colors bg-neutral-50 hover:bg-white">
                                    Crear Cuenta
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;