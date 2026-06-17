import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Timer, 
  RefreshCw, 
  AlertCircle, 
  Phone, 
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { toast } from '../store/toastStore';
import Turnstile from 'react-turnstile';
import OTPVerification from '../components/auth/OTPVerification';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '' 
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden. Verifique e intente nuevamente.');
            return;
        }

        if (!captchaToken) {
            toast.error('Por favor, completa la verificación de seguridad.');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...dataToSend } = formData;
            await authService.register({ ...dataToSend, captchaToken });

            setSuccess(true);
            toast.success('Solicitud enviada. Verifica tu email.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp) => {
        setIsVerifying(true);
        try {
            await authService.verifyOTP({ email: formData.email, otp });

            toast.success('Cuenta verificada. Espera aprobación administrativa.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al verificar OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await authService.resendOTP(formData.email);
            toast.success('Código reenviado con éxito.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al reenviar código');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4 relative font-sans">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img src="/primera.jpeg" className="w-full h-full object-cover opacity-10 grayscale" alt="Fondo" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
                </div>
                <div className="relative z-10 w-full max-w-md">
                   <OTPVerification 
                    email={formData.email}
                    onVerify={handleVerifyOTP}
                    onResend={handleResendOTP}
                    isLoading={isVerifying}
                   />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 flex items-center justify-center p-4 relative font-sans overflow-hidden selection:bg-black selection:text-brand-cyan">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); .font-sport { font-family: 'Oswald', sans-serif; letter-spacing: -0.02em; }`}</style>
          
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src="/primera.jpeg" className="w-full h-full object-cover opacity-30 grayscale" alt="Fondo" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
            </div>
          
            <div className="max-w-[1000px] w-full flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 h-auto">
            
            <div className="hidden md:flex md:w-5/12 bg-black relative flex-col justify-between p-10 overflow-hidden group">
                <img src="/segunda.jpeg" alt="Push" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="relative z-20">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden shadow-sm mb-6">
                        <img src="/icono_new.jpeg" alt="Logo" className="w-full h-full object-cover scale-110" style={{objectPosition: '50% 60%'}} />
                    </div>
                </div>

                <div className="relative z-20">
                    <h2 className="text-4xl md:text-5xl font-sport text-white leading-[0.9] uppercase m-0 break-words hyphens-auto">
                        Nuevo <br />
                        <span className="text-brand-cyan">Ingreso.</span>
                    </h2>
                    <p className="text-neutral-400 dark:text-gray-400 font-medium text-sm leading-relaxed mt-4 max-w-[90%]">
                        Incorpórese al personal para la gestión de inventario y caja.
                    </p>
                </div>
            </div>

            <div className="w-full md:w-7/12 p-8 md:p-12 bg-white dark:bg-gray-800 flex flex-col justify-center">
                
                <div className="md:hidden flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden">
                        <img src="/icono_new.jpeg" alt="Logo" className="w-full h-full object-cover scale-110 invert" style={{objectPosition: '50% 60%'}} />
                    </div>
                    <h2 className="text-3xl uppercase leading-none font-sport m-0 text-black dark:text-white">PushSport</h2>
                </div>

                <div className="mb-6">
                    <h1 className="text-black dark:text-white text-4xl font-sport uppercase m-0 mb-1 leading-none">
                        Registro Staff
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">COMPLETAR FORMULARIO</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Nombre</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:text-white transition-colors" size={16} />
                                <input 
                                    required type="text" name="nombre"
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 focus:ring-1 focus:ring-black dark:focus:ring-cyan-400 transition-all"
                                    value={formData.nombre} onChange={handleChange}
                                    placeholder="NOMBRE"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Apellido</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:text-white transition-colors" size={16} />
                                <input 
                                    required type="text" name="apellido"
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 focus:ring-1 focus:ring-black dark:focus:ring-cyan-400 transition-all"
                                    value={formData.apellido} onChange={handleChange}
                                    placeholder="APELLIDO"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Nombre de Usuario</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:text-white transition-colors" size={16} />
                            <input 
                                required type="text" name="username"
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white lowercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 focus:ring-1 focus:ring-black dark:focus:ring-cyan-400 transition-all"
                                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                placeholder="USUARIO"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Email Profesional</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:text-white transition-colors" size={16} />
                            <input 
                                required type="email" name="email"
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 focus:ring-1 focus:ring-black dark:focus:ring-cyan-400 transition-all"
                                value={formData.email} onChange={handleChange}
                                placeholder="usuario@pushsport.com"
                            />
                        </div>
                    </div>

                    {/* NUEVO: Contraseña y Confirmar Contraseña en la misma fila para ahorrar espacio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:text-white transition-colors" size={16} />
                                <input 
                                    required type="password" name="password"
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 focus:ring-1 focus:ring-black dark:focus:ring-cyan-400 transition-all"
                                    value={formData.password} onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Confirmar Clave</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:text-white transition-colors" size={16} />
                                <input 
                                    required type="password" name="confirmPassword"
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 focus:ring-1 focus:ring-black dark:focus:ring-cyan-400 transition-all"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg flex items-center gap-3 border border-neutral-200 mt-2">
                        <ShieldCheck className="text-brand-cyan shrink-0" size={18} />
                        <p className="text-[9px] font-bold text-neutral-500 dark:text-gray-400 leading-snug uppercase tracking-widest m-0">
                            Requiere <span className="text-black dark:text-white">Validación de Supervisor</span> para activar permisos.
                        </p>
                    </div>

                    {/* Turnstile Integration */}
                    <div className="flex justify-center py-2 bg-neutral-50/50 rounded-lg border border-neutral-100">
                         <Turnstile 
                            sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                            onVerify={(token) => setCaptchaToken(token)}
                            theme="light"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-3">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-lg text-[12px] font-sport uppercase tracking-widest transition-all ${
                                loading 
                                ? 'bg-neutral-200 text-neutral-500 dark:text-gray-400 cursor-not-allowed border border-neutral-300' 
                                : 'bg-black text-white hover:bg-brand-cyan hover:text-black dark:hover:text-white border border-black shadow-md group'
                            }`}
                        >
                            {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                            {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" color="currentColor" />}
                        </button>
                        <Link to="/login" className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors mt-2">
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