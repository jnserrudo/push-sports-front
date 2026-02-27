import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Store, Info, MapPin, Layout, Landmark } from 'lucide-react';
import GenericABM from '../../components/ui/GenericABM';
import { sucursalesService as service } from '../../services/sucursalesService';
import { uploadProductImage, deleteProductImage } from '../../lib/supabaseStorage';

const MapPicker = ({ lat, lng, onLocationSelect }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    
    // Posición inicial: Salta, Argentina si no hay datos
    const defaultCoords = [-65.4117, -24.7859]; 
    const initialCoords = (lat && lng) ? [parseFloat(lng), parseFloat(lat)] : defaultCoords;

    useEffect(() => {
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://demotiles.maplibre.org/style.json', // Estilo simple por defecto
            center: initialCoords,
            zoom: 12
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        marker.current = new maplibregl.Marker({
            draggable: true,
            color: "#00E5FF"
        })
        .setLngLat(initialCoords)
        .addTo(map.current);

        marker.current.on('dragend', () => {
            const lngLat = marker.current.getLngLat();
            onLocationSelect(lngLat.lat, lngLat.lng);
        });

        map.current.on('click', (e) => {
            marker.current.setLngLat(e.lngLat);
            onLocationSelect(e.lngLat.lat, e.lngLat.lng);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Actualizar marcador si cambian las coordenadas externamente (por ejemplo al editar)
    useEffect(() => {
        if (marker.current && lat && lng) {
            const currentPos = marker.current.getLngLat();
            if (currentPos.lat !== parseFloat(lat) || currentPos.lng !== parseFloat(lng)) {
                marker.current.setLngLat([parseFloat(lng), parseFloat(lat)]);
                map.current?.flyTo({ center: [parseFloat(lng), parseFloat(lat)], zoom: 15 });
            }
        }
    }, [lat, lng]);

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Ubicación Geográfica (Pin)</label>
            <div 
                ref={mapContainer} 
                className="w-full h-64 rounded-xl border-2 border-neutral-100 overflow-hidden shadow-inner bg-neutral-50"
            />
            <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                    <span className="text-[8px] font-black uppercase text-neutral-400">Latitud</span>
                    <div className="px-3 py-2 bg-neutral-100 rounded-lg text-[10px] font-mono font-bold text-black border border-neutral-200 text-center">
                        {lat || '-24.7859...'}
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                    <span className="text-[8px] font-black uppercase text-neutral-400">Longitud</span>
                    <div className="px-3 py-2 bg-neutral-100 rounded-lg text-[10px] font-mono font-bold text-black border border-neutral-200 text-center">
                        {lng || '-65.4117...'}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Image picker helper ──────────────────────────────────────────────────────
const ImagePicker = ({ value, onChange, label = "Imagen de la Sede" }) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen debe pesar menos de 2MB');
            return;
        }
        
        setUploading(true);
        try {
            // Reusing uploadProductImage (uses 'productos' bucket)
            // Ideally should be a 'comercios' bucket, but using existing one for now
            const url = await uploadProductImage(file);
            onChange(url);
        } catch (error) {
            console.error(error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                {label}
            </label>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all group overflow-hidden
                    ${value ? 'border-brand-cyan bg-brand-cyan/5' : 'border-neutral-200 bg-neutral-50 hover:border-brand-cyan hover:bg-brand-cyan/5'}`}
            >
                {uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm z-10">
                        <div className="w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">Subiendo...</span>
                    </div>
                ) : value ? (
                    <>
                        <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="text-white flex flex-col items-center gap-1">
                               <Landmark size={24} />
                               <span className="text-[9px] font-black uppercase tracking-widest text-center">Click para cambiar</span>
                           </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                            className="absolute top-2 right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-20"
                        >
                            <X size={12} />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400 group-hover:text-brand-cyan transition-colors">
                        <Landmark size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Subir foto de la sede</span>
                        <span className="text-[9px] font-bold text-neutral-300">Formato JPG, PNG (máx. 2MB)</span>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
        </div>
    );
};

const Sucursales = () => {
    const [tiposComercio, setTiposComercio] = useState([]);

    useEffect(() => {
        service.getTiposComercio().then(setTiposComercio).catch(console.error);
    }, []);

    const columns = [
        {
            header: 'Visual',
            accessor: 'imagen_url',
            render: (row) => (
                <div className="w-12 h-12 rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center">
                    {row.imagen_url ? (
                        <img src={row.imagen_url} alt={row.nombre} className="w-full h-full object-cover" />
                    ) : (
                        <Store size={18} className="text-neutral-300" />
                    )}
                </div>
            )
        },
        {
            header: 'Punto de Venta',
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black uppercase tracking-widest">{row.nombre}</span>
                    <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-brand-cyan" />
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{row.direccion}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Categorización',
            accessor: 'id_tipo_comercio',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">
                        {row.tipo_comercio?.nombre || 'General'}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{row.tipo_comercio?.descripcion || 'Sin descripción'}</span>
                </div>
            )
        },
        {
            header: 'Caja Fuerte',
            accessor: 'saldo_acumulado_mili',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-sport text-2xl text-black">
                        ${Number(row.saldo_acumulado_mili || 0).toLocaleString()}
                    </span>
                </div>
            )
        },
        {
            header: 'Ubicación',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-neutral-400 uppercase">Lat: {parseFloat(row.latitud || 0).toFixed(4)}</span>
                        <span className="text-[8px] font-black text-neutral-400 uppercase">Lng: {parseFloat(row.longitud || 0).toFixed(4)}</span>
                    </div>
                    {row.latitud && row.longitud && (
                        <a 
                            href={`https://www.google.com/maps?q=${row.latitud},${row.longitud}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 bg-neutral-100 rounded-lg hover:bg-brand-cyan hover:text-white transition-all text-neutral-400"
                        >
                            <Navigation size={12} />
                        </a>
                    )}
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: 'activo',
            render: (row) => (
                <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    row.activo
                        ? 'bg-transparent text-black border-black'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                }`}>
                    {row.activo ? 'Operativa' : 'Cesada'}
                </div>
            )
        },
    ];

    const renderForm = (formData, setFormData) => (
        <div className="space-y-6">
            
            <ImagePicker 
                value={formData.imagen_url || ''} 
                onChange={(url) => setFormData({ ...formData, imagen_url: url })}
            />

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Nombre de la Sede *</label>
                <div className="relative group">
                    <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                    <input
                        required type="text"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                        placeholder="EJ: SUCURSAL CENTRO"
                        value={formData.nombre || ''}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Dirección *</label>
                    <div className="relative group">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-cyan transition-colors pointer-events-none" />
                        <input
                            required type="text"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase placeholder:text-neutral-400 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                            placeholder="EJ: AV. BELGRANO 1234"
                            value={formData.direccion || ''}
                            onChange={e => setFormData({ ...formData, direccion: e.target.value.toUpperCase() })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Tipo de Negocio *</label>
                    <div className="relative group">
                        <Layout size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <select
                            required
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black uppercase focus:outline-none focus:border-brand-cyan transition-all appearance-none"
                            value={formData.id_tipo_comercio || ''}
                            onChange={e => setFormData({ ...formData, id_tipo_comercio: parseInt(e.target.value) })}
                        >
                            <option value="">SELECCIONAR TIPO...</option>
                            {tiposComercio.map(t => (
                                <option key={t.id_tipo_comercio} value={t.id_tipo_comercio}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Caja Inicial ($) *</label>
                    <div className="relative group">
                        <Landmark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                            required type="number" step="0.01" min="0"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-brand-cyan transition-all"
                            placeholder="0.00"
                            value={formData.saldo_acumulado_mili || ''}
                            onChange={e => setFormData({ ...formData, saldo_acumulado_mili: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
                {/* Latitud y longitud se manejan vía el MapPicker */}
            </div>

            <MapPicker 
                lat={formData.latitud} 
                lng={formData.longitud} 
                onLocationSelect={(lat, lng) => setFormData({ ...formData, latitud: lat, longitud: lng })}
            />

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3">
                <Info size={16} className="text-black mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 leading-relaxed m-0">
                    Haga click en el mapa o arrastre el marcador para definir la <span className="text-brand-cyan">ubicación exacta</span> del comercio. La latitud y longitud se guardarán automáticamente.
                </p>
            </div>
        </div>
    );

    return (
        <GenericABM
            title="Sedes y Sucursales"
            icon={Store}
            service={service}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            idField="id_comercio"
        />
    );
};

export default Sucursales;