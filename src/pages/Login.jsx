import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            alert('Error al iniciar sesión: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 relative font-sans overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-cyan/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-neutral-200/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-neutral-100">
                
                {/* Branding Panel */}
                <div className="hidden md:flex md:w-5/12 bg-neutral-900 relative flex-col justify-between p-12 overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-brand-cyan text-black flex items-center justify-center font-bold text-2xl rounded-xl shadow-lg mb-10">
                            P
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                            Gestión <br />
                            <span className="text-brand-cyan">Profesional.</span>
                        </h2>
                        <p className="text-neutral-400 font-medium text-sm leading-relaxed max-w-[200px]">
                            Accede a la plataforma de inventario y terminal de ventas de Push Sport Salta.
                        </p>
                    </div>
                    
                    <div className="relative z-10 pt-10 border-t border-white/10">
                        <div className="flex items-center gap-3 text-white/50 mb-4">
                            <Shield size={18} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Acceso Seguro SSL</span>
                        </div>
                    </div>

                    {/* Subtle Background Image Mask */}
                    <div className="absolute inset-0 opacity-20 group overflow-hidden pointer-events-none">
                        <img src="/segunda.jpeg" alt="Push" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent"></div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-7/12 p-10 md:p-20 bg-white flex flex-col justify-center">
                    <div className="mb-12">
                         <h1 className="text-neutral-900 font-bold text-4xl tracking-tight mb-4 text-center md:text-left">
                             ¡Hola! De nuevo.
                         </h1>
                         <p className="text-neutral-500 font-medium text-center md:text-left">Ingresa tus credenciales para continuar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email / Usuario</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-premium pl-12"
                                    placeholder="ejemplo@push.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Contraseña</label>
                                <button type="button" className="text-[10px] font-bold text-neutral-300 hover:text-brand-cyan transition-colors">¿Olvidaste tu clave?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-premium pl-12"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-premium py-4 flex items-center justify-center gap-3 group mt-4 h-14"
                        >
                            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 text-center pt-8 border-t border-neutral-50">
                        <p className="text-sm text-neutral-400 font-medium mb-4">¿No tienes acceso al sistema?</p>
                        <Link to="/register" className="text-sm font-bold text-neutral-900 hover:text-brand-cyan transition-colors underline decoration-brand-cyan/30 decoration-2 underline-offset-8">Solicitar Registro de Operador</Link>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-10 text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">
                Push Sport Salta &copy; 2026
            </div>
        </div>
    );
};

export default Login;
