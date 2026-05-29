import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailX, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import publicService from '../../services/publicService';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('idle'); // idle | loading | success | error | no_token
  const [message, setMessage] = useState('');

  // Si viene con token en la URL, disparar automáticamente
  useEffect(() => {
    if (!token) {
      setStatus('no_token');
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setStatus('loading');
    try {
      const res = await publicService.unsubscribe(token);
      setMessage(res.message || 'Te has desuscrito correctamente.');
      setStatus('success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Ocurrió un error al procesar tu solicitud.';
      setMessage(msg);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-2xl font-black uppercase tracking-tight font-sport text-black dark:text-white">
            PUSH<span className="text-brand-cyan">SPORT</span>
          </span>
        </div>

        {/* Estado: sin token */}
        {status === 'no_token' && (
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8">
            <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-xl font-black text-black dark:text-white mb-3">Enlace inválido</h1>
            <p className="text-sm text-neutral-500 dark:text-gray-400 mb-6">
              El enlace de desuscripción no es válido o ha sido usado incorrectamente. 
              Si querés dejar de recibir correos, hacé clic en el enlace que te enviamos por email.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-cyan hover:opacity-70 transition-opacity no-underline"
            >
              <ArrowLeft size={13} /> Volver al inicio
            </Link>
          </div>
        )}

        {/* Estado: listo para confirmar */}
        {status === 'idle' && token && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xl shadow-black/5">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <MailX size={28} className="text-neutral-500 dark:text-gray-400" />
            </div>
            <h1 className="text-2xl font-black text-black dark:text-white mb-3 font-sport">
              ¿Dejar de recibir<br />comunicaciones?
            </h1>
            <p className="text-sm text-neutral-500 dark:text-gray-400 leading-relaxed mb-8">
              Si confirmás, ya no recibirás emails con ofertas, novedades o promociones de Push Sport.
              <br /><br />
              <span className="text-[11px] text-neutral-400 dark:text-gray-500">
                Tus datos permanecen en nuestra plataforma y podés volver a suscribirte cuando quieras.
              </span>
            </p>

            <button
              onClick={handleUnsubscribe}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm active:scale-95"
            >
              Sí, quiero desuscribirme
            </button>

            <Link
              to="/"
              className="mt-4 block text-xs font-bold text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider no-underline"
            >
              Cancelar y volver
            </Link>
          </div>
        )}

        {/* Estado: cargando */}
        {status === 'loading' && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8">
            <Loader2 size={40} className="text-brand-cyan mx-auto mb-4 animate-spin" />
            <p className="text-sm font-bold text-neutral-500 dark:text-gray-400">Procesando tu solicitud...</p>
          </div>
        )}

        {/* Estado: éxito */}
        {status === 'success' && (
          <div className="bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-8 shadow-xl shadow-emerald-500/5">
            <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-5" />
            <h2 className="text-xl font-black text-black dark:text-white mb-3">
              Solicitud procesada
            </h2>
            <p className="text-sm text-neutral-500 dark:text-gray-400 leading-relaxed mb-6">
              {message}
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 mb-6">
              <p className="text-[11px] text-neutral-400 dark:text-gray-500 leading-relaxed">
                Si en el futuro querés volver a recibir nuestras comunicaciones, contactanos directamente o activá la opción desde tu perfil.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-cyan hover:opacity-70 transition-opacity no-underline"
            >
              <ArrowLeft size={13} /> Volver al inicio
            </Link>
          </div>
        )}

        {/* Estado: error */}
        {status === 'error' && (
          <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900 rounded-2xl p-8 shadow-xl shadow-red-500/5">
            <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-black dark:text-white mb-3">
              No pudimos procesar tu solicitud
            </h2>
            <p className="text-sm text-neutral-500 dark:text-gray-400 leading-relaxed mb-6">
              {message}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUnsubscribe}
                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-all active:scale-95"
              >
                Reintentar
              </button>
              <Link
                to="/"
                className="block text-xs font-bold text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider no-underline text-center"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
