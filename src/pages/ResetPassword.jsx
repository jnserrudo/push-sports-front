import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from '../store/toastStore';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Las contraseñas no coinciden');
        }

        if (formData.password.length < 6) {
            return toast.error('La contraseña debe tener al menos 6 caracteres');
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, formData.password);
            
            toast.success('Contraseña restablecida correctamente');
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al restablecer la contraseña. El link puede haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-sport text-black dark:text-white uppercase mb-2">¡Todo listo!</h2>
                    <p className="text-neutral-500 dark:text-gray-400 text-sm mb-8">
                        Tu contraseña ha sido actualizada. Te redirigiremos al ingreso en unos segundos...
                    </p>
                    <Link to="/login" className="text-brand-cyan font-bold uppercase tracking-widest text-xs hover:underline">
                        Ir al Login ahora
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-gray-800 flex items-center justify-center p-4 relative font-sans overflow-hidden">
             {/* Background */}
             <div className="absolute inset-0 z-0 pointer-events-none">
                <img src="/primera.jpeg" className="w-full h-full object-cover opacity-20 grayscale" alt="Fondo" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
            </div>

            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl relative z-10 overflow-hidden p-8 md:p-10 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-black text-brand-cyan rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl font-sport text-black dark:text-white uppercase mb-1">Nueva Contraseña</h1>
                    <p className="text-neutral-500 dark:text-gray-400 text-sm">Ingresa tu nueva clave de acceso</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nueva Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                            <input 
                                required type="password"
                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-xl text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Confirmar Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                            <input 
                                required type="password"
                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-xl text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-black dark:focus:border-cyan-400 transition-all"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-sport uppercase tracking-[0.2em] text-sm hover:bg-brand-cyan hover:text-black dark:hover:text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Actualizar Contraseña'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-neutral-100 dark:border-gray-800 pt-6">
                    <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={14} /> Volver al Ingreso
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
