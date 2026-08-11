// StoreMap.jsx — usa mapcn (MapLibre GL, sin API key)
// Instalación: npx shadcn@latest add https://mapcn.vercel.app/maps/map.json

import React, { useEffect, useRef, useMemo } from 'react';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
  useMap,
} from '@/components/ui/map';
import { MapPin, Clock, Navigation } from 'lucide-react';

// Coordenadas por defecto (Salta Capital) para el centro del mapa si no hay sedes con coords
const DEFAULT_CENTER = [-65.4106, -24.7892];

// Normaliza las locations que vienen de la BD al formato que usa el mapa
const normalizeStores = (locations = []) => {
  return locations
    .map((loc, idx) => ({
      id: loc.id ?? idx,
      name: loc.nombre || 'Sede',
      lat: typeof loc.lat === 'number' ? loc.lat : (loc.lat ? parseFloat(loc.lat) : null),
      lng: typeof loc.lng === 'number' ? loc.lng : (loc.lng ? parseFloat(loc.lng) : null),
      address: loc.dir || 'Ubicación a confirmar',
      hours: loc.h || null,
    }))
    .filter(s => s.lat !== null && s.lng !== null && !isNaN(s.lat) && !isNaN(s.lng));
};

// Vuela al marcador activo cuando cambia la prop activeLocation
const MapFlyController = ({ activeLocation, stores }) => {
  const { map, isLoaded } = useMap();
  const prev = useRef(activeLocation);

  useEffect(() => {
    if (!isLoaded || !map) return;
    if (prev.current === activeLocation) return;
    prev.current = activeLocation;
    const store = stores[activeLocation];
    if (!store) return;
    map.flyTo({ center: [store.lng, store.lat], zoom: 15, duration: 1200, essential: true });
  }, [activeLocation, map, isLoaded, stores]);

  return null;
};

const StoreMap = ({ locations = [], activeLocation = 0 }) => {
  const stores = useMemo(() => normalizeStores(locations), [locations]);
  const activeStore = stores[activeLocation] ?? stores[0];

  // Si no hay sedes con coordenadas, mostramos un estado vacío
  if (!activeStore) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-gray-800">
        <div className="text-center space-y-2 p-6">
          <MapPin size={32} className="mx-auto text-neutral-300 dark:text-gray-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500 m-0">
            Sin sedes con ubicación cargada
          </p>
        </div>
      </div>
    );
  }

  // Link de Google Maps con la dirección de la sede activa
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeStore.address}, Salta`)}`;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">

      {/* ── Panel izquierdo: info de la sede activa ── */}
      <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-white dark:bg-gray-900 flex flex-col justify-between p-6 lg:p-8 border-b lg:border-r border-neutral-100 dark:border-gray-800 order-2 lg:order-1">

        {/* Encabezado */}
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.3em] block mb-2">
              SELECCIONADO
            </span>
            <h2 className="font-sport text-3xl xl:text-4xl text-black dark:text-white uppercase leading-tight tracking-tight m-0">
              {activeStore.name}
            </h2>
          </div>

          {/* Divider */}
          <div className="w-12 h-[2px] bg-brand-cyan rounded-full"></div>

          {/* Detalles */}
          <div className="space-y-6">

            {/* Dirección */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors duration-300">
                <MapPin size={18} className="text-brand-cyan group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Ubicación</span>
                <p className="text-base font-bold text-black dark:text-white leading-tight m-0">{activeStore.address}</p>
              </div>
            </div>

            {/* Horario (solo si existe) */}
            {activeStore.hours && (
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors duration-300">
                  <Clock size={18} className="text-brand-cyan group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Horario</span>
                  <p className="text-base font-bold text-black dark:text-white leading-tight m-0">{activeStore.hours}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Botón Cómo llegar */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 w-full bg-black text-white rounded-xl py-4 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest hover:bg-brand-cyan transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg no-underline"
        >
          <Navigation size={16} />
          CÓMO LLEGAR
        </a>
      </div>

      {/* ── Panel derecho: mapa ── */}
      <div className="flex-1 relative min-h-[300px]">
        <Map
          center={[activeStore.lng, activeStore.lat]}
          zoom={13}
          className="w-full h-full"
        >
          <MapFlyController activeLocation={activeLocation} stores={stores} />
          <MapControls showZoom showCompass />

          {stores.map((store) => {
            const isActive = store.id === activeStore.id;
            return (
              <MapMarker key={store.id} longitude={store.lng} latitude={store.lat}>
                <MarkerContent>
                  <div className={`
                    flex items-center justify-center rounded-full border-[3px] shadow-xl
                    transition-all duration-300 cursor-pointer
                    ${isActive
                      ? 'w-11 h-11 bg-brand-cyan border-white scale-110 shadow-[0_0_20px_rgba(0,229,255,0.5)]'
                      : 'w-9 h-9 bg-white border-brand-cyan opacity-75 hover:opacity-100 hover:scale-105'
                    }
                  `}>
                    <MapPin size={isActive ? 20 : 16} className={isActive ? 'text-white' : 'text-brand-cyan'} />
                  </div>
                </MarkerContent>

                <MarkerPopup>
                  <div className="min-w-[200px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-100">
                    <div className="bg-neutral-900 px-4 py-3">
                      <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-[0.2em] block mb-1">TIENDA OFICIAL</span>
                      <span className="text-white font-sport text-lg uppercase leading-tight block">{store.name}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-brand-cyan mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-semibold text-neutral-800 dark:text-white leading-tight m-0">{store.address}</p>
                      </div>
                      {store.hours && (
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-brand-cyan flex-shrink-0" />
                          <p className="text-sm font-semibold text-neutral-700 dark:text-gray-300 m-0">{store.hours}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}
        </Map>
      </div>

    </div>
  );
};

export default StoreMap;
