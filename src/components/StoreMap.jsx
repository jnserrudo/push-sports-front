// StoreMap.jsx — usa mapcn (MapLibre GL, sin API key)
// Instalación: npx shadcn@latest add https://mapcn.vercel.app/maps/map.json

import React, { useEffect, useRef } from 'react';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
  useMap,
} from '@/components/ui/map';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';

const stores = [
  { id: 0, name: 'SEDE CENTRAL', lat: -24.7892, lng: -65.4106, address: 'Av. Belgrano 450',          city: 'Salta Capital',  phone: '+54 387 421-XXXX', hours: '09:00 — 21:00', days: 'Lunes a Sábado' },
  { id: 1, name: 'PUSH NORTE',   lat: -24.7436, lng: -65.4012, address: 'Av. Reyes Católicos 1200', city: 'Valle Escondido', phone: '+54 387 439-XXXX', hours: '08:00 — 22:00', days: 'Lunes a Sábado' },
  { id: 2, name: 'SEDE SUR',     lat: -24.8405, lng: -65.4298, address: 'Ruta 51 km 2',             city: 'Limache',         phone: '+54 387 424-XXXX', hours: '09:00 — 20:00', days: 'Lunes a Sábado' },
  { id: 3, name: 'PUSH OESTE',   lat: -24.7820, lng: -65.4550, address: 'Av. Savio 400',            city: 'Gral. Güemes',    phone: '+54 387 432-XXXX', hours: '07:00 — 23:00', days: 'Todos los días' },
  { id: 4, name: 'SEDE ESTE',    lat: -24.7950, lng: -65.3750, address: 'Av. Italia 120',           city: 'Autódromo',       phone: '+54 387 416-XXXX', hours: '09:00 — 13:00 / 17:00 — 21:00', days: 'Lunes a Viernes' },
];

// Vuela al marcador activo cuando cambia la prop activeLocation
const MapFlyController = ({ activeLocation }) => {
  const { map, isLoaded } = useMap();
  const prev = useRef(activeLocation);

  useEffect(() => {
    if (!isLoaded || !map) return;
    if (prev.current === activeLocation) return;
    prev.current = activeLocation;
    const store = stores[activeLocation];
    if (!store) return;
    map.flyTo({ center: [store.lng, store.lat], zoom: 15, duration: 1200, essential: true });
  }, [activeLocation, map, isLoaded]);

  return null;
};

const StoreMap = ({ activeLocation = 0 }) => {
  const activeStore = stores[activeLocation] ?? stores[0];

  // Link de Google Maps con la dirección de la sede activa
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeStore.address}, ${activeStore.city}, Salta`)}`;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">

      {/* ── Panel izquierdo: info de la sede activa ── */}
      <div className="lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-white flex flex-col justify-between p-8 border-r border-neutral-100">

        {/* Encabezado */}
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.3em] block mb-2">
              SELECCIONADO
            </span>
            <h2 className="font-sport text-3xl xl:text-4xl text-black uppercase leading-tight tracking-tight m-0">
              {activeStore.name}
            </h2>
          </div>

          {/* Divider */}
          <div className="w-12 h-[2px] bg-brand-cyan rounded-full"></div>

          {/* Detalles */}
          <div className="space-y-6">

            {/* Dirección */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors duration-300">
                <MapPin size={18} className="text-brand-cyan group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Ubicación</span>
                <p className="text-base font-bold text-black leading-tight m-0">{activeStore.address}</p>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 m-0">{activeStore.city}</p>
              </div>
            </div>

            {/* Horario */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors duration-300">
                <Clock size={18} className="text-brand-cyan group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Horario</span>
                <p className="text-base font-bold text-black leading-tight m-0">{activeStore.hours}</p>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 m-0">{activeStore.days}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors duration-300">
                <Phone size={18} className="text-brand-cyan group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Teléfono</span>
                <p className="text-base font-bold text-black leading-tight m-0">{activeStore.phone}</p>
              </div>
            </div>

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
          <MapFlyController activeLocation={activeLocation} />
          <MapControls showZoom showCompass />

          {stores.map((store) => {
            const isActive = store.id === activeLocation;
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
                    <div className="bg-white px-4 py-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-brand-cyan mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 leading-tight m-0">{store.address}</p>
                          <p className="text-[11px] text-neutral-400 uppercase tracking-wider m-0">{store.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-brand-cyan flex-shrink-0" />
                        <p className="text-sm font-semibold text-neutral-700 m-0">{store.hours}</p>
                      </div>
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