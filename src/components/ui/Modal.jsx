import React, { useEffect } from 'react';
import { CloseCircle } from 'iconsax-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-neutral-100 animate-in zoom-in-95 fade-in duration-300`}>
        
        {/* Header - High End Design */}
        <div className="flex justify-between items-center p-8 bg-neutral-50/50 backdrop-blur-sm flex-shrink-0 border-b border-neutral-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 mb-1">Push System</span>
            <h3 className="font-bold text-xl text-neutral-900 tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-2xl transition-all"
          >
            <CloseCircle size={28} variant="Bold" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-10 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
