import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { ArrowRight, Lock, Mail, ShieldCheck, User } from 'lucide-react';

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
            // Pasamos 'email' como el identificador (puede ser email o usuario)
            const data = await authService.login(credentials.email, credentials.password);
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (error) {
            alert('Error al iniciar sesión: ' + (error.response?.data?.message || 'Credenciales inválidas'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-0 md:p-8 relative font-sans overflow-hidden">
            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-cyan/5 to-transparent pointer-events-none"></div>
            
            <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white min-h-[600px] md:h-auto md:min-h-[70vh] md:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] relative z-10 border border-neutral-100/50">
                
                {/* CLEAN BRAND CENTERED LOGIN */}
                <div className="w-full max-w-lg mx-auto p-8 md:p-14 bg-white flex flex-col justify-center animate-in fade-in zoom-in-95 duration-1000">
                    <div className="mb-14 text-center">
                        <div className="inline-block w-24 h-24 bg-white border-2 border-neutral-100 p-4 rounded-[2.5rem] shadow-sm mb-10 mx-auto transition-transform hover:scale-110 duration-500">
                            <img src="/icono.jpeg" alt="PushSport Salta" className="w-full h-full object-contain invert" />
                        </div>
                        <h1 className="text-neutral-900 text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 leading-none">
                            PushSport.<br/>
                            <span className="text-brand-cyan">Salta</span>
                        </h1>
                        <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.5em] mt-6">
                            SISTEMA DE GESTIÓN CENTRAL
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 ml-1">Email o Usuario</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                                <input 
                                    required name="email" type="text"
                                    className="w-full pl-14 pr-6 py-4 bg-neutral-50 border-2 border-transparent rounded-2xl text-lg font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-brand-cyan/20 focus:bg-white transition-all shadow-sm"
                                    placeholder="USUARIO"
                                    value={credentials.email} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                             <label className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                                <input 
                                    required name="password" type="password"
                                    className="w-full pl-14 pr-6 py-4 bg-neutral-50 border-2 border-transparent rounded-2xl text-lg font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-brand-cyan/20 focus:bg-white transition-all shadow-sm"
                                    placeholder="••••••••"
                                    value={credentials.password} onChange={handleChange}
                                />
                            </div>
                            <div className="flex justify-end pr-2 pt-1">
                                <a href="#" className="text-xs font-black text-brand-cyan uppercase tracking-widest hover:underline decoration-2 underline-offset-8">¿Olvidaste tu contraseña?</a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 pt-10">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full h-20 flex items-center justify-center gap-6 group transition-all rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-lg ${
                                    loading 
                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                                    : 'bg-brand-cyan text-white hover:brightness-110 hover:shadow-cyan-500/20 active:scale-[0.98]'
                                }`}
                            >
                                {loading ? 'VERIFICANDO...' : 'ENTRAR AL SISTEMA'}
                                {!loading && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                            </button>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link to="/" className="text-xs font-black uppercase tracking-widest text-neutral-300 hover:text-black transition-colors underline decoration-2 underline-offset-8">Volver al Sitio</Link>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-neutral-200"></div>
                                <Link to="/register" className="h-14 px-10 flex items-center justify-center border-2 border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-white transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                    Solicitar Acceso
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Subtle Watermark */}
            <div className="absolute bottom-10 right-10 opacity-[0.02] pointer-events-none select-none">
                <span className="text-[120px] font-bold tracking-tighter text-neutral-100 uppercase">Push</span>
            </div>
        </div>
    );
};

export default Login;
