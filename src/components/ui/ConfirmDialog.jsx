import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = '¿Estás seguro?',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger' // danger, warning, info
}) => {
    const colors = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        info: 'bg-blue-600 hover:bg-blue-700'
    };

    const iconColors = {
        danger: 'text-red-500',
        warning: 'text-amber-500',
        info: 'text-blue-500'
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className={`${iconColors[variant]} shrink-0`} size={24} />
                <p className="text-sm text-neutral-700">{message}</p>
            </div>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`px-4 py-2 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider ${colors[variant]}`}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};
