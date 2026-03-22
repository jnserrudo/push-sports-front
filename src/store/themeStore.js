import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,
            toggle: () => set((state) => {
                const newIsDark = !state.isDark;
                document.documentElement.classList.toggle('dark', newIsDark);
                return { isDark: newIsDark };
            }),
            setDark: (isDark) => set(() => {
                document.documentElement.classList.toggle('dark', isDark);
                return { isDark };
            })
        }),
        { name: 'theme-storage' }
    )
);

// Inicializar tema al cargar
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
        try {
            const { state } = JSON.parse(stored);
            if (state?.isDark) {
                document.documentElement.classList.add('dark');
            }
        } catch (e) {
            console.error('Error loading theme:', e);
        }
    }
}
