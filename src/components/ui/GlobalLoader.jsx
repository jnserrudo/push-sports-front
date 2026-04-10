import React from 'react';
import { Loader2 } from 'lucide-react';
import { create } from 'zustand';

export const useLoaderStore = create((set) => ({
    isLoading: false,
    message: '',
    show: (message = 'Cargando...') => set({ isLoading: true, message }),
    hide: () => set({ isLoading: false, message: '' })
}));

export const GlobalLoader = () => {
    const { isLoading, message } = useLoaderStore();
    
    if (!isLoading) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                <Loader2 size={48} className="animate-spin text-brand-cyan" />
                <p className="text-sm font-bold text-neutral-700 dark:text-gray-300">{message}</p>
            </div>
        </div>
    );
};
