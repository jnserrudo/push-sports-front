import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldSecurity, ArrowRight, Sms, Lock } from 'iconsax-react';

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
            
            <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-neutral-100">
                
                {/* Branding Panel */}
                <div className="hidden md:flex md:w-5/12 bg-neutral-900 relative flex-col justify-between p-12 overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-brand-cyan text-neutral-900 flex items-center justify-center font-bold text-2xl rounded-2xl shadow-xl mb-10">
                            P
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                            Gestión <br />
                            <span className="text-brand-cyan">Empresarial.</span>
                        </h2>
                        <p className="text-neutral-400 font-medium text-sm leading-relaxed max-w-[200px]">
                            Acceda al ecosistema centralizado de inventario y facturación de Push Sport.
                        </p>
                    </div>
                    
                    <div className="relative z-10 pt-10 border-t border-white/10">
                        <div className="flex items-center gap-3 text-white/50 mb-4">
                            <ShieldSecurity size={20} variant="Bold" className="text-brand-cyan" />
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Conexión Encriptada</span>
                        </div>
                    </div>

                    {/* Subtle Background Image Mask */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <img src="/segunda.jpeg" alt="Push" className="w-full h-full object-cover grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent"></div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-7/12 p-10 md:p-20 bg-white flex flex-col justify-center animate-in slide-in-from-right-10 duration-700">
                    <div className="mb-12">
                         <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 block mb-2">BIENVENIDO</span>
                         <h1 className="text-neutral-900 font-bold text-4xl tracking-tight mb-4">
                             Acceso Staff.
                         </h1>
                         <p className="text-neutral-400 font-medium">Ingrese sus credenciales corporativas.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Registrado</label>
                            <div className="relative group">
                                <Sms className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-premium pl-14 h-14"
                                    placeholder="usuario@pushsport.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Clave de Acceso</label>
                                <button type="button" className="text-[10px] font-bold text-neutral-300 hover:text-brand-cyan transition-colors">¿Olvidó su clave?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-premium pl-14 h-14"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-premium flex items-center justify-center gap-3 group mt-6 h-14"
                        >
                            {loading ? 'AUTORIZANDO...' : 'ENTRAR AL PANEL'}
                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 text-center pt-8 border-t border-neutral-50">
                        <p className="text-sm text-neutral-400 font-medium mb-4">¿No posee una cuenta?</p>
                        <Link to="/register" className="text-sm font-bold text-neutral-900 hover:text-brand-cyan transition-colors underline decoration-brand-cyan/20 decoration-4 underline-offset-8">Solicitar registro de vendedor</Link>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-10 text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">
                Push Sport Salta &middot; Terminal de Control &copy; 2026
            </div>
        </div>
    );
};

export default Login;
