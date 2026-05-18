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
            className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center border transition-all shadow-sm hover:scale-105 active:scale-95 border-neutral-100 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-neutral-900 dark:hover:border-gray-500"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {isDark ? (
                <Sun size={16} className="text-amber-500 dark:text-amber-400" />
            ) : (
                <Moon size={16} className="text-neutral-900 dark:text-gray-100" />
            )}
        </button>
    );
};
