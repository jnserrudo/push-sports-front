import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);
        setIsLoading(true);

        try {
            const data = await authService.forgotPassword(email);
            setFeedback({ 
                type: 'success', 
                message: data.message || 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
            });
            setEmail('');
        } catch (error) {
            setFeedback({ 
                type: 'error', 
                message: error.response?.data?.error || 'Error al procesar solicitud'
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
                            Recuperar <span className="text-brand-cyan">Contraseña</span>
                        </h1>
                        <p className="text-sm text-neutral-600">
                            Ingresa tu email y te enviaremos instrucciones
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
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
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

export default ForgotPassword;
