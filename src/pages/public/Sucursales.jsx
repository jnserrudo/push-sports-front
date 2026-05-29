import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Store, ImageOff } from 'lucide-react';
import publicService from '../../services/publicService';

const SucursalCard = ({ sucursal }) => {
  const tieneUbicacion = sucursal.latitud && sucursal.longitud;
  const mapsUrl = tieneUbicacion
    ? `https://www.google.com/maps?q=${sucursal.latitud},${sucursal.longitud}`
    : sucursal.direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sucursal.direccion)}`
    : null;

  return (
    <div className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-brand-cyan hover:shadow-xl hover:shadow-brand-cyan/5 transition-all duration-300">
      {/* Imagen o placeholder */}
      <div className="relative h-44 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {sucursal.imagen_url ? (
          <img
            src={sucursal.imagen_url}
            alt={sucursal.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Store size={40} className="text-neutral-300 dark:text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500">Sin imagen</span>
          </div>
        )}
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Nombre sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wide leading-tight drop-shadow">
            {sucursal.nombre}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Dirección */}
        <div className="flex items-start gap-2.5">
          <MapPin size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-neutral-600 dark:text-gray-400 leading-relaxed">
            {sucursal.direccion || 'Dirección no disponible'}
          </p>
        </div>

        {/* Botón ver en mapa */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-brand-cyan/30 text-brand-cyan text-xs font-black uppercase tracking-wider hover:bg-brand-cyan hover:text-black transition-all duration-200 no-underline group/btn"
          >
            <Navigation size={13} className="group-hover/btn:rotate-12 transition-transform" />
            Ver en Mapa
          </a>
        )}
      </div>
    </div>
  );
};

const Sucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    publicService.getSucursales()
      .then(setSucursales)
      .catch(() => setError('No se pudieron cargar las sucursales.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-gray-500">Cargando sucursales...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <Store size={48} className="text-neutral-300 dark:text-gray-500" />
      <p className="text-sm font-bold text-neutral-500 dark:text-gray-400">{error}</p>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan mb-2">Dónde encontrarnos</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black dark:text-white leading-none mb-3 font-sport">
          Nuestras <span className="text-brand-cyan">Sucursales</span>
        </h1>
        <p className="text-neutral-500 dark:text-gray-400 text-sm max-w-xl">
          Encontrá tu sucursal más cercana y visitanos. Nuestros equipos están listos para asesorarte.
        </p>
      </div>

      {/* Banner de sucursales count */}
      <div className="flex items-center gap-3 mb-8 p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
          <Store size={18} className="text-brand-cyan" />
        </div>
        <div>
          <p className="text-sm font-black text-black dark:text-white">
            {sucursales.length} punto{sucursales.length !== 1 ? 's' : ''} de venta
          </p>
          <p className="text-xs text-neutral-500 dark:text-gray-400">Hacé clic en "Ver en Mapa" para obtener las indicaciones</p>
        </div>
      </div>

      {/* Grid de sucursales */}
      {sucursales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Store size={40} className="text-neutral-300 dark:text-gray-500 mb-4" />
          <p className="text-sm font-bold text-neutral-500 dark:text-gray-400">No hay sucursales activas por el momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sucursales.map(s => (
            <SucursalCard key={s.id_comercio} sucursal={s} />
          ))}
        </div>
      )}
    </>
  );
};

export default Sucursales;
