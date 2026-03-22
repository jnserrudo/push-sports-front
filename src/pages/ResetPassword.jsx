import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        nueva_password: '',
        confirmar_password: ''
    });
    const [showPassword, setShowPassword] = useState({
        nueva: false,
        confirmar: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        if (formData.nueva_password !== formData.confirmar_password) {
            setFeedback({ type: 'error', message: 'Las contraseñas no coinciden' });
            return;
        }

        if (formData.nueva_password.length < 6) {
            setFeedback({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/reset-password', {
                token,
                nueva_password: formData.nueva_password
            });
            
            setFeedback({ 
                type: 'success', 
                message: 'Contraseña actualizada correctamente. Redirigiendo al login...' 
            });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setFeedback({ 
                type: 'error', 
                message: error.response?.data?.error || 'Error al resetear contraseña'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-sport uppercase text-black mb-2">
                            Nueva <span className="text-brand-cyan">Contraseña</span>
                        </h1>
                        <p className="text-sm text-neutral-600">
                            Ingresa tu nueva contraseña
                        </p>
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                            feedback.type === 'success' 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            {feedback.type === 'success' ? (
                                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                            )}
                            <p className={`text-sm font-medium ${
                                feedback.type === 'success' ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {feedback.message}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type={showPassword.nueva ? 'text' : 'password'}
                                    value={formData.nueva_password}
                                    onChange={(e) => setFormData({...formData, nueva_password: e.target.value})}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-12 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, nueva: !showPassword.nueva})}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                                >
                                    {showPassword.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type={showPassword.confirmar ? 'text' : 'password'}
                                    value={formData.confirmar_password}
                                    onChange={(e) => setFormData({...formData, confirmar_password: e.target.value})}
                                    required
                                    placeholder="Repite la contraseña"
                                    className="w-full pl-12 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, confirmar: !showPassword.confirmar})}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                                >
                                    {showPassword.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || feedback?.type === 'success'}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>

                    {/* Back to login */}
                    <div className="mt-6 text-center">
                        <Link 
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors font-medium"
                        >
                            <ArrowLeft size={16} />
                            Volver al login
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest">
                        PUSH SPORT © 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
