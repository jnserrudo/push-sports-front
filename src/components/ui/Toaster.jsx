import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toaster = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-center gap-4 px-6 py-5 rounded-2xl shadow-2xl border-2 transition-all duration-500 animate-in slide-in-from-right-10
            ${t.type === 'success' ? 'bg-white border-brand-cyan/20 text-neutral-900' : ''}
            ${t.type === 'error' ? 'bg-white border-red-100 text-neutral-900' : ''}
            ${t.type === 'info' ? 'bg-neutral-900 border-neutral-800 text-white' : ''}
          `}
        >
          <div className={`
             w-10 h-10 rounded-xl flex items-center justify-center shrink-0
             ${t.type === 'success' ? 'bg-brand-cyan/10 text-brand-cyan' : ''}
             ${t.type === 'error' ? 'bg-red-50 text-red-500' : ''}
             ${t.type === 'info' ? 'bg-white/10 text-white' : ''}
          `}>
             {t.type === 'success' && <CheckCircle2 size={20} />}
             {t.type === 'error' && <AlertCircle size={20} />}
             {t.type === 'info' && <Info size={20} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
              {t.message}
            </p>
          </div>

          <button 
            onClick={() => removeToast(t.id)}
            className="p-1 text-neutral-300 hover:text-neutral-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
