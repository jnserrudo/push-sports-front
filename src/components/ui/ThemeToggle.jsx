import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export const ThemeToggle = () => {
    const { isDark, toggle } = useThemeStore();
    
    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
            {isDark ? (
                <Sun size={20} className="text-amber-400" />
            ) : (
                <Moon size={20} className="text-neutral-600" />
            )}
        </button>
    );
};
