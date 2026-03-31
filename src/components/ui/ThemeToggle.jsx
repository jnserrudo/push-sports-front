import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export const ThemeToggle = () => {
    const { isDark, toggle } = useThemeStore();
    
    const handleToggle = () => {
        console.log('Toggle clicked, current isDark:', isDark);
        toggle();
        console.log('After toggle, isDark should be:', !isDark);
    };
    
    return (
        <button
            onClick={handleToggle}
            className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm hover:scale-105 active:scale-95 border-neutral-100 bg-white hover:border-neutral-900"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {isDark ? (
                <Sun size={18} className="text-amber-500 md:w-6 md:h-6" />
            ) : (
                <Moon size={18} className="text-neutral-900 md:w-6 md:h-6" />
            )}
        </button>
    );
};
