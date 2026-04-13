import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, ShieldCheck, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OTPVerification = ({ email, onVerify, onResend, isLoading, initialTimer = 60 }) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(initialTimer);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(data)) return;

    const digits = data.split('');
    setOtp(digits);
    inputsRef.current[5].focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    await onResend();
    setTimeLeft(initialTimer);
    setCanResend(false);
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-cyan/10 blur-[100px] pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-cyan/20">
            <ShieldCheck className="text-brand-cyan" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verificación de Seguridad</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Hemos enviado un código de 6 dígitos a <br/>
            <span className="text-white font-bold">{email}</span>
          </p>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputsRef.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-16 md:w-14 md:h-20 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl md:text-3xl font-black text-brand-cyan focus:border-brand-cyan/50 focus:bg-brand-cyan/5 outline-none transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={() => onVerify(otp.join(''))}
            disabled={!isComplete || isLoading}
            className="w-full h-16 bg-brand-cyan hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-brand-cyan text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Verificar Cuenta'}
          </button>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              {timeLeft > 0 ? (
                <>
                  <Timer size={14} className="text-brand-cyan" />
                  <span className="text-neutral-500">Reenviar en</span>
                  <span className="text-brand-cyan">{timeLeft}s</span>
                </>
              ) : (
                <button 
                  onClick={handleResend}
                  className="text-brand-cyan hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Reenviar Código
                </button>
              )}
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Volver al Registro
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OTPVerification;
