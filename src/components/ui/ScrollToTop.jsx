import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 md:bottom-24 left-6 z-40 bg-black text-white p-3 rounded-full shadow-2xl hover:bg-brand-cyan hover:scale-110 transition-all duration-300 group"
      aria-label="Volver arriba"
    >
      <ArrowUp size={20} className="group-hover:animate-bounce" />
    </button>
  );
};

export default ScrollToTop;
