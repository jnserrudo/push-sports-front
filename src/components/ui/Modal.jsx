import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, maxWidth, size = "medium", hideHeader = false }) => {
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

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-5xl'
  };

  const widthClass = maxWidth || sizeClasses[size] || sizeClasses.medium;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
            className={`relative w-full ${widthClass} bg-white dark:bg-gray-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh] md:max-h-[95vh] overflow-hidden border border-neutral-100 dark:border-gray-700`}
          >
            {/* Header - Ultra Compact */}
            {!hideHeader && (
              <div className="flex justify-between items-center px-4 py-2 md:px-5 md:py-3 bg-neutral-50/50 dark:bg-gray-700/50 backdrop-blur-sm flex-shrink-0 border-b border-neutral-100 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-0.5">Push Sport Salta</span>
                  <h3 className="font-bold text-sm md:text-base text-black dark:text-white tracking-tight uppercase font-sport leading-none">{title}</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 md:p-1.5 text-neutral-400 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <XCircle size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            )}

            {/* Scrollable Body - Reduced Padding */}
            <div className={hideHeader ? "overflow-y-auto scrollbar-hide" : "p-3 md:p-4 overflow-y-auto scrollbar-hide"}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
