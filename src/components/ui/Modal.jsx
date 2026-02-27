import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Soft Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh] md:max-h-[95vh] overflow-hidden border border-neutral-100`}
          >
            {/* Header - High End Design */}
            <div className="flex justify-between items-center p-6 md:p-10 bg-neutral-50/50 backdrop-blur-sm flex-shrink-0 border-b border-neutral-100">
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-1">Push System</span>
                <h3 className="font-bold text-lg md:text-3xl text-black tracking-tight uppercase font-sport leading-none">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all"
              >
                <XCircle size={24} className="md:w-8 md:h-8" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 md:p-10 overflow-y-auto scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
