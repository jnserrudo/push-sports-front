import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventosService } from '../services/eventosService';
import { authService } from '../services/authService';
import { toast } from '../store/toastStore';
import Turnstile from 'react-turnstile';
import {
    Zap, Gift, CheckCircle2, Mail, Lock, User,
    ArrowRight, Loader2, AlertCircle, ShieldCheck
} from 'lucide-react';

// ── OTP STEP ──────────────────────────────────────────────────────────────
const OTPStep = ({ email, onVerify, isVerifying, onResend }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const refs = Array.from({ length: 6 }, () => React.createRef());

    const handleChange = (i, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        if (val && i < 5) refs[i + 1].current?.focus();
    };

    const handleKey = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) { setOtp(paste.split('')); refs[5].current?.focus(); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onVerify(otp.join(''));
    };

    return (
        <div className="w-full max-w-md mx-auto text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-brand-cyan/20 border-2 border-brand-cyan flex items-center justify-center mx-auto mb-6">
                <Mail size={36} className="text-brand-cyan" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-sport uppercase text-white m-0 leading-tight">
                Verificá tu <span className="text-brand-cyan">Email</span>
            </h2>
            <p className="text-neutral-400 text-sm font-medium mt-3 mb-8 max-w-xs mx-auto leading-relaxed">
                Enviamos un código de 6 dígitos a <strong className="text-white">{email}</strong>. Ingresalo para reclamar tu recompensa.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={refs[i]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKey(i, e)}
                            className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-xl border-2 bg-white/5 text-white transition-all focus:outline-none focus:scale-110 ${
                                digit ? 'border-brand-cyan bg-brand-cyan/10' : 'border-white/20 focus:border-brand-cyan'
                            }`}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={otp.join('').length < 6 || isVerifying}
                    className="w-full py-4 bg-brand-cyan text-black font-sport text-lg uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:-translate-y-0.5"
                >
                    {isVerifying ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {isVerifying ? 'Verificando...' : 'Confirmar Código'}
                </button>
            </form>

            <button onClick={onResend} className="mt-6 text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-brand-cyan transition-colors">
                ¿No llegó? Reenviar código
            </button>
        </div>
    );
};

// ── TICKET (SUCCESS) STEP ──────────────────────────────────────────────────
const TicketStep = ({ nombre, eventoNombre, recompensaTexto }) => (
    <div className="w-full max-w-sm mx-auto text-center animate-in zoom-in-95 duration-500">
        {/* Glow ring */}
        <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            <div className="relative w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={52} className="text-emerald-400" />
            </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400 block mb-3">¡Cuenta verificada!</span>
        <h2 className="text-4xl sm:text-5xl font-sport uppercase text-white m-0 leading-tight break-words hyphens-auto">
            Bienvenido,<br /><span className="text-brand-cyan">{nombre}.</span>
        </h2>

        {/* Ticket Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 justify-center">
                <Gift size={22} className="text-brand-cyan flex-shrink-0" />
                <p className="text-base font-bold text-white leading-snug m-0 text-left">
                    {recompensaTexto || '¡Ya sos parte de PUSH! Mostrá esta pantalla al staff y recibí tu regalo.'}
                </p>
            </div>
            <div className="h-px bg-white/10" />
            <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 block mb-1">Campaña</span>
                <span className="font-sport text-xl text-white uppercase">{eventoNombre}</span>
            </div>
            <div className="h-px bg-white/10" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed">
                Captura una screenshot de esta pantalla para asegurarte.
            </p>
        </div>

        <a 
            href="https://pushsport.com.ar/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 w-full py-4 bg-brand-cyan text-black font-sport text-base uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:-translate-y-0.5"
        >
            <ArrowRight size={20} />
            Ir al Sistema Principal
        </a>

        <p className="mt-6 text-xs font-bold text-neutral-600 uppercase tracking-widest">
            Sos parte del equipo PushSport Salta
        </p>
    </div>
);

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
const EventLanding = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [loadingEvento, setLoadingEvento] = useState(true);
    const [errorEvento, setErrorEvento] = useState(false);

    // Steps: 'form' | 'otp' | 'ticket'
    const [step, setStep] = useState('form');
    const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '' });
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const data = await eventosService.getById(id);
                if (!data.activo) { setErrorEvento(true); }
                else { setEvento(data); }
            } catch {
                setErrorEvento(true);
            } finally {
                setLoadingEvento(false);
            }
        };
        fetchEvento();
    }, [id]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!captchaToken) { toast.error('Completá la verificación de seguridad.'); return; }
        setLoading(true);
        try {
            await authService.register({
                ...formData,
                captchaToken,
                id_evento_origen: id,
                acepta_marketing: true,
            });
            toast.success('¡Código enviado! Revisá tu email.');
            setStep('otp');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al registrarse. Puede que el email ya exista.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp) => {
        setIsVerifying(true);
        try {
            await authService.verifyOTP({ email: formData.email, otp });
            setStep('ticket');
        } catch (err) {
            const msg = err.response?.data?.error || 'Código incorrecto o expirado.';
            // Si ya estaba verificado, mostrar el ticket igual
            if (msg.toLowerCase().includes('ya está verificado')) {
                setStep('ticket');
            } else {
                toast.error(msg);
            }
        } finally {
            setIsVerifying(false);
        }
    };


    const handleResend = async () => {
        try {
            await authService.resendOTP(formData.email);
            toast.success('Código reenviado.');
        } catch {
            toast.error('Error al reenviar el código.');
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-sm font-bold text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all";

    if (loadingEvento) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 size={36} className="text-brand-cyan animate-spin" />
        </div>
    );

    if (errorEvento) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
            <div>
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-sport uppercase text-white m-0">Campaña no disponible</h2>
                <p className="text-neutral-500 font-medium mt-3 mb-6">Este evento no existe o ya finalizó.</p>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/10 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-all">
                    Volver al inicio
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center relative overflow-hidden">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); .font-sport { font-family: 'Oswald', sans-serif; }`}</style>

            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src="/fondo.jpeg" className="w-full h-full object-cover opacity-[0.07] scale-110 blur-sm" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#07070a]/80 to-black" />
                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg px-4 py-12 flex flex-col items-center gap-8">
                {/* Brand */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.25)]">
                        <img src="/icono_new.jpeg" alt="PushSport" className="w-full h-full object-cover scale-110" style={{objectPosition: '50% 60%'}} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-cyan mt-1">— PushSport Salta —</span>
                </div>

                {/* Step: FORM */}
                {step === 'form' && (
                    <div className="w-full text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 mb-6">
                            <Zap size={14} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">{evento.nombre}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-sport uppercase text-white leading-[0.95] m-0 break-words hyphens-auto">
                            Unite al equipo <br /><span className="text-brand-cyan italic">push.</span>
                        </h1>
                        <p className="text-neutral-400 text-sm font-medium mt-4 mb-8 max-w-sm mx-auto leading-relaxed">
                            Creá tu cuenta gratuita, verificá tu email y <strong className="text-white">recibí tu obsequio</strong> hoy mismo.
                        </p>

                        <form onSubmit={handleRegister} className="space-y-3.5 text-left">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                    <input required className={inputClass} placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                </div>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                    <input required className={inputClass} placeholder="Apellido" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                                </div>
                            </div>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                <input required type="email" className={inputClass} placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                <input required type="password" className={inputClass} placeholder="Contraseña (mín. 6 caracteres)" minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>

                            {/* Legal note */}
                            <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <ShieldCheck size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-neutral-500 leading-relaxed m-0 uppercase tracking-wide">
                                    Tu cuenta te permitirá rastrear compras y recibir beneficios exclusivos en el futuro. Podés darte de baja cuando quieras.
                                </p>
                            </div>

                            {/* Turnstile */}
                            <div className="flex justify-center py-1">
                                <Turnstile
                                    sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                    onVerify={token => setCaptchaToken(token)}
                                    theme="dark"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-brand-cyan text-black font-sport text-lg uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                                {loading ? 'Registrando...' : 'Crear cuenta y recibir código'}
                            </button>
                        </form>

                        <p className="text-center mt-5 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                            ¿Ya tenés cuenta?{' '}
                            <span onClick={() => window.location.href = '/#/login'} className="text-brand-cyan cursor-pointer hover:underline">
                                Iniciar sesión
                            </span>
                        </p>
                    </div>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                    <OTPStep
                        email={formData.email}
                        onVerify={handleVerifyOTP}
                        isVerifying={isVerifying}
                        onResend={handleResend}
                    />
                )}

                {/* Step: TICKET */}
                {step === 'ticket' && (
                    <TicketStep
                        nombre={formData.nombre}
                        eventoNombre={evento.nombre}
                        recompensaTexto={evento.recompensa_texto}
                    />
                )}
            </div>
        </div>
    );
};

export default EventLanding;
