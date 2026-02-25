import React, { useState } from 'react';
import { 
  Map, 
  MapMarker, 
  MarkerContent, 
  MarkerPopup,
  MapControls
} from '@/components/ui/map';
import { Location, Timer1, Call, DirectRight } from 'iconsax-react';

const StoreMap = () => {
    const stores = [
        { 
            id: 1, 
            name: 'SEDE CENTRAL', 
            lat: -24.7892, 
            lng: -65.4106, 
            address: 'Av. Belgrano 450', 
            city: 'Salta Capital', 
            phone: '+54 387 421-XXXX' 
        },
        { 
            id: 2, 
            name: 'PUSH NORTE', 
            lat: -24.7436, 
            lng: -65.4012, 
            address: 'Av. Reyes Católicos 1200', 
            city: 'Valle Escondido', 
            phone: '+54 387 439-XXXX' 
        },
        { 
            id: 3, 
            name: 'SEDE SUR', 
            lat: -24.8405, 
            lng: -65.4298, 
            address: 'Ruta 51 km 2', 
            city: 'Limache', 
            phone: '+54 387 424-XXXX' 
        }
    ];

    const [activeStore, setActiveStore] = useState(stores[0]);
    const [viewport, setViewport] = useState({
        center: [stores[0].lng, stores[0].lat],
        zoom: 13
    });

    const handleStoreSelect = (store) => {
        setActiveStore(store);
        setViewport({
            center: [store.lng, store.lat],
            zoom: 15
        });
    };

    return (
        <div className="w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-neutral-100 flex flex-col lg:flex-row h-[800px] lg:h-[650px]">
            {/* Map Visual Area */}
            <div className="lg:w-2/3 relative h-1/2 lg:h-full">
                <Map
                    viewport={viewport}
                    onViewportChange={setViewport}
                    className="w-full h-full"
                    theme="light"
                >
                    <MapControls showZoom showLocate showFullscreen />
                    
                    {stores.map(store => (
                        <MapMarker 
                            key={store.id} 
                            longitude={store.lng} 
                            latitude={store.lat}
                            onClick={() => handleStoreSelect(store)}
                        >
                            <MarkerContent>
                                <div className={`p-2 rounded-full border-4 shadow-xl transition-all duration-500 ${activeStore.id === store.id ? 'bg-brand-cyan border-white scale-125' : 'bg-white border-brand-cyan/20 opacity-70 hover:opacity-100'}`}>
                                    <Location size={24} variant="Bold" className={activeStore.id === store.id ? "text-white" : "text-brand-cyan"} />
                                </div>
                            </MarkerContent>
                            
                            <MarkerPopup className="!p-0 !bg-white !rounded-2xl !border-none !shadow-2xl overflow-hidden min-w-[200px]">
                                <div className="p-4 bg-neutral-900 text-white">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">{store.id === 2 ? 'Push Norte' : 'Store Central'}</span>
                                    <h4 className="text-sm font-black uppercase mt-1">{store.name}</h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    <p className="text-xs font-bold text-neutral-600">{store.address}</p>
                                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">{store.city}</p>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    ))}
                </Map>

                <div className="absolute top-10 left-10 pointer-events-none">
                    <span className="text-xs font-black text-brand-cyan uppercase tracking-[0.5em] mb-2 block bg-white/80 backdrop-blur px-3 py-1 rounded-full w-fit">Interactivo</span>
                    <h3 className="text-neutral-900 text-4xl font-black tracking-tighter drop-shadow-sm uppercase">Localizador.</h3>
                </div>
            </div>

            {/* Info Panel */}
            <div className="lg:w-1/3 bg-white p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-100">
                <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
                    <div>
                        <span className="text-xs font-black text-brand-cyan uppercase tracking-[0.4em] mb-4 block">SELECCIONADO</span>
                        <h2 className="text-4xl font-black text-neutral-900 leading-tight uppercase tracking-tighter">
                            {activeStore.name}
                        </h2>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-6 group cursor-pointer" onClick={() => handleStoreSelect(activeStore)}>
                            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-brand-cyan shrink-0 transition-all group-hover:bg-brand-cyan group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-cyan/30">
                                <Location size={28} variant="Bold" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Ubicación</h4>
                                <p className="text-xl font-black text-neutral-900 leading-tight">{activeStore.address}</p>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">{activeStore.city}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-brand-cyan shrink-0">
                                <Timer1 size={28} variant="Bold" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Atención</h4>
                                <p className="text-xl font-black text-neutral-900">09:00 — 21:00</p>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Lunes a Sábado</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-brand-cyan shrink-0">
                                <Call size={28} variant="Bold" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Teléfono</h4>
                                <p className="text-xl font-black text-neutral-900">{activeStore.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10">
                    <button className="btn-cyan w-full flex items-center justify-center gap-4 group !py-6 !text-sm">
                        CÓMO LLEGAR <DirectRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreMap;
