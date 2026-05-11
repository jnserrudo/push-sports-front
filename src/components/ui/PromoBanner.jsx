import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Truck, Shield, Headphones, Gift } from 'lucide-react';

const PromoBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      icon: Truck,
      title: 'Envío Gratis',
      description: 'En compras superiores a $50,000',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Gift,
      title: 'Nuevos Productos',
      description: 'Cada semana productos exclusivos',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Headphones,
      title: 'Asesoramiento',
      description: 'Personalizado por expertos',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Calidad Garantizada',
      description: 'Productos certificados y originales',
      color: 'from-red-500 to-red-600'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative bg-gradient-to-r from-neutral-900 to-black py-8 md:py-12 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="relative">
          {/* Banners */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner, index) => {
                const Icon = banner.icon;
                return (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className={`bg-gradient-to-r ${banner.color} rounded-2xl p-6 md:p-8 flex items-center justify-center gap-6 text-white`}>
                      <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <Icon size={32} className="md:w-10 md:h-10" />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-sport uppercase mb-1">
                          {banner.title}
                        </h3>
                        <p className="text-sm md:text-base text-white/90">
                          {banner.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controles de navegación - Desktop */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'bg-brand-cyan w-8' 
                    : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
