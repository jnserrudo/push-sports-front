import React, { useState, useEffect, useRef } from 'react';
import { Box } from 'lucide-react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Cargar 50px antes de entrar en viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder mientras carga */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          {placeholder || <Box size={32} className="text-neutral-300 dark:text-gray-500" />}
        </div>
      )}

      {/* Imagen de error */}
      {error && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-gray-700 flex flex-col items-center justify-center gap-2">
          <Box size={32} className="text-neutral-300 dark:text-gray-500" />
          <span className="text-xs text-neutral-400 dark:text-gray-500 font-bold uppercase tracking-widest">
            Sin Imagen
          </span>
        </div>
      )}

      {/* Imagen real */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
