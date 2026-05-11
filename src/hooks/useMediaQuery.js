import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries
 * @param {string} query - Media query a evaluar
 * @returns {boolean} True si la media query coincide
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Establecer valor inicial
    setMatches(media.matches);

    // Listener para cambios
    const listener = (e) => setMatches(e.matches);
    
    // Agregar listener (compatible con navegadores antiguos)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

// Breakpoints predefinidos
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
