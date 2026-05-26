import React, { useState } from 'react';

const TeamMemberCard = ({ 
  name, 
  role, 
  frontImage, 
  backImage, 
  sportDescription,
  isPremiumMode = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isPremiumMode) {
    // Modo normal: tarjeta estática sin flip
    return (
      <div className="relative overflow-hidden rounded-3xl aspect-[3/4] bg-gray-800">
        {/* Imagen con efecto hover */}
        <img 
          src={frontImage} 
          alt={name} 
          className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal group-hover:scale-110 transition-all duration-500"
        />
        
        {/* Degradado para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Información del miembro */}
        <div className="absolute bottom-0 left-0 p-6">
          <h4 className="text-white text-2xl font-black uppercase leading-tight mb-1">
            {name}
          </h4>
          <span className="text-brand-cyan text-xs font-bold uppercase tracking-widest">
            {role}
          </span>
        </div>
      </div>
    );
  }

  // Modo premium: tarjeta con flip 3D
  const handleCardClick = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full h-full perspective-1000 group" onClick={handleCardClick}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : 'lg:group-hover:rotate-y-180'
        }`}
      >
        
        {/* Cara Frontal - Versión Formal */}
        <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden bg-gray-800">
          {/* Imagen a color sin efectos de blanco y negro */}
          <img 
            src={frontImage} 
            alt={`${name} - Formal`} 
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          
          {/* Degradado para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          
          {/* Información del miembro */}
          <div className="absolute bottom-0 left-0 p-6">
            <h4 className="text-white text-2xl font-black uppercase leading-tight mb-1">
              {name}
            </h4>
            <span className="text-brand-cyan text-xs font-bold uppercase tracking-widest">
              {role}
            </span>
          </div>
        </div>

        {/* Cara Trasera - Versión Deportiva Premium Deluxe */}
        <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden rotate-y-180">
          {/* Fondo con imagen a color completa */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/20"></div>
          </div>
          
          {/* Borde animado simple */}
          <div className="absolute inset-0 rounded-3xl border-2 border-brand-cyan animate-pulse"></div>
          
          {/* Contenido premium */}
          <div className="relative z-10 h-full flex flex-col justify-between p-6 text-center">
            {/* Título premium con sombra brillante */}
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase leading-tight mb-2 drop-shadow-2xl">
                {name}
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-brand-cyan via-purple-500 to-pink-500 mx-auto mb-2 animate-pulse"></div>
              <p className="text-white text-xs font-bold uppercase tracking-widest drop-shadow-lg bg-black/50 rounded px-2 py-1">
                {role}
              </p>
            </div>
            
            {/* Descripción deportiva */}
            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-white text-sm md:text-base font-medium leading-relaxed drop-shadow-lg max-w-xs bg-black/30 rounded p-2">
                {sportDescription}
              </p>
            </div>
            
            {/* Efectos de brillo adicionales */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-brand-cyan rounded-full blur-lg opacity-70 animate-pulse"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-purple-500 rounded-full blur-lg opacity-70 animate-pulse"></div>
            <div className="absolute top-1/2 right-2 w-4 h-4 bg-pink-500 rounded-full blur-md opacity-60 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
