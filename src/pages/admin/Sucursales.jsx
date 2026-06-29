import React, { useState, useEffect, useRef } from 'react';
import { Store, Info, MapPin, Layout, Landmark, X, Navigation } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls, useMap } from '../../components/ui/map';
import { toast } from '../../store/toastStore';
import GenericABM from '../../components/ui/GenericABM';
import { sucursalesService as service } from '../../services/sucursalesService';
import { uploadProductImage, deleteProductImage } from '../../lib/supabaseStorage';
import PremiumSelect from '../../components/ui/PremiumSelect';

const MapClickCapture = ({ onLocationSelect }) => {
    const { map, isLoaded } = useMap();
    useEffect(() => {
        if (!isLoaded || !map) return;
        const handleClick = (e) => {
            onLocationSelect(e.lngLat.lat, e.lngLat.lng);
        };
        map.on('click', handleClick);
        return () => map.off('click', handleClick);
    }, [map, isLoaded, onLocationSelect]);
    return null;
};

const MapPicker = ({ lat, lng, onLocationSelect }) => {
    // Posición inicial: Salta, Argentina si no hay datos
    const defaultCoords = [-65.4117, -24.7859]; 
    const currentLng = parseFloat(lng) || defaultCoords[0];
    const currentLat = parseFloat(lat) || defaultCoords[1];
    const initialCoords = (lat && lng) ? [parseFloat(lng), parseFloat(lat)] : defaultCoords;

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-black dark:text-white">Ubicación Geográfica</label>
            <div className="w-full h-48 md:h-64 rounded-xl border-2 border-neutral-100 dark:border-gray-700 overflow-hidden shadow-inner bg-neutral-50 dark:bg-gray-800 relative pointer-events-auto">
                <Map
                    center={initialCoords}
                    zoom={13}
                    className="w-full h-full"
                >
                    <MapControls showZoom showCompass />
                    <MapClickCapture onLocationSelect={onLocationSelect} />
                    <MapMarker 
                        longitude={currentLng} 
                        latitude={currentLat}
                        draggable
                        onDragEnd={(e) => onLocationSelect(e.lat, e.lng)}
                    >
                        <MarkerContent>
                            <div className="w-8 h-8 bg-brand-cyan rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                                <MapPin size={16} className="text-white" />
                            </div>
                        </MarkerContent>
                    </MapMarker>
                </Map>
            </div>
        </div>
    );
};

// ── Image picker helper ──────────────────────────────────────────────────────
const ImagePicker = ({ value, onChange, label = "Imagen de la Sede" }) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validación estricta de tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Formato no soportado. Por favor, selecciona una imagen JPG, PNG o WEBP válida.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('La imagen debe pesar menos de 10MB');
            return;
        }
        
        // Crear preview local
        const tempUrl = URL.createObjectURL(file);
        setPreviewUrl(tempUrl);
        setUploading(true);
        
        try {
            // Reusing uploadProductImage (uses 'productos' bucket)
            // Ideally should be a 'comercios' bucket, but using existing one for now
            const url = await uploadProductImage(file);
            onChange(url);
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión al subir imagen');
        } finally {
            setUploading(false);
            setPreviewUrl(null);
            URL.revokeObjectURL(tempUrl);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">
                {label}
            </label>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative w-full h-40 md:h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all group overflow-hidden
                    ${value ? 'border-brand-cyan bg-brand-cyan/5' : 'border-neutral-200 dark:border-gray-600 bg-neutral-50 dark:bg-gray-700 hover:border-brand-cyan hover:bg-brand-cyan/5'}`}
            >
                {uploading ? (
                    <>
                        {previewUrl && (
                            <img src={previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-50 grayscale" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
                            <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-brand-cyan">Subiendo...</span>
                        </div>
                    </>
                ) : value ? (
                    <>
                        <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="text-white flex flex-col items-center gap-1">
                               <Landmark size={18} />
                               <span className="text-[8px] font-black uppercase tracking-wider text-center">Click para cambiar</span>
                           </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-20"
                        >
                            <X size={10} />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-400 dark:text-gray-500 group-hover:text-brand-cyan dark:group-hover:text-cyan-400 transition-colors">
                        <Landmark size={24} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Subir foto de la sede</span>
                        <span className="text-[8px] font-bold text-neutral-300 dark:text-gray-500">JPG, PNG (máx. 10MB)</span>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFile}
            />
        </div>
    );
};

const Sucursales = () => {
    const [tiposComercio, setTiposComercio] = useState([]);
    const [loadingTipos, setLoadingTipos] = useState(false);

    useEffect(() => {
        setLoadingTipos(true);
        service.getTiposComercio()
            .then(setTiposComercio)
            .catch(console.error)
            .finally(() => setLoadingTipos(false));
    }, []);

    const columns = [
        {
            header: 'Visual',
            accessor: 'imagen_url',
            render: (row) => (
                <div className="w-12 h-12 rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                    {row.imagen_url ? (
                        <img src={row.imagen_url} alt={row.nombre} className="w-full h-full object-cover" />
                    ) : (
                        <Store size={18} className="text-neutral-300 dark:text-gray-500" />
                    )}
                </div>
            )
        },
        {
            header: 'Punto de Venta',
            accessor: 'nombre',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-black dark:text-white uppercase tracking-widest">{row.nombre}</span>
                    <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-brand-cyan" />
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest">{row.direccion}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Categorización',
            accessor: 'id_tipo_comercio',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {row.tipo_comercio?.nombre || 'General'}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest">{row.tipo_comercio?.descripcion || 'Sin descripción'}</span>
                </div>
            )
        },
        {
            header: 'Caja Fuerte',
            accessor: 'saldo_acumulado_mili',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-sport text-2xl text-black dark:text-white">
                        ${Number(row.saldo_acumulado_mili || 0).toLocaleString()}
                    </span>
                </div>
            )
        },
        {
            header: 'Ubicación',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.latitud && row.longitud ? (
                        <a 
                            href={`https://www.google.com/maps?q=${row.latitud},${row.longitud}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-cyan/10 rounded-lg hover:bg-brand-cyan hover:text-white transition-all text-brand-cyan group"
                            title={`Lat: ${row.latitud}, Lng: ${row.longitud}`}
                        >
                            <Navigation size={12} className="group-hover:animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Abrir Mapa</span>
                        </a>
                    ) : (
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest bg-neutral-100 dark:bg-gray-800 px-2 py-1 rounded-md">Sin Mapear</span>
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
                        ? 'bg-transparent text-black dark:text-white border-black dark:border-white'
                        : 'bg-neutral-100 dark:bg-gray-800 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-gray-700'
                }`}>
                    {row.activo ? 'Operativa' : 'Cesada'}
                </div>
            )
        },
    ];

    const renderForm = (formData, setFormData) => (
        <div className="space-y-4 md:space-y-5 px-1 md:px-3"> 
            
            <ImagePicker 
                value={formData.imagen_url || ''} 
                onChange={(url) => setFormData(prev => ({ ...prev, imagen_url: url }))}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-black dark:text-white">Nombre de la Sede *</label>
                    <div className="relative group">
                        <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500 group-focus-within:text-brand-cyan dark:group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                        <input
                            required type="text"
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-2 focus:ring-brand-cyan/20 dark:focus:ring-cyan-400/20 transition-all"
                            placeholder="EJ: SUCURSAL CENTRO"
                            value={formData.nombre || ''}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-black dark:text-white">Tipo de Negocio *</label>
                    <PremiumSelect
                        icon={Layout}
                        placeholder="SELECCIONAR TIPO..."
                        isLoading={loadingTipos}
                        options={(Array.isArray(tiposComercio) ? tiposComercio : []).map(t => ({
                            value: t.id_tipo_comercio,
                            label: t.nombre,
                            subtitle: t.descripcion
                        }))}
                        value={formData.id_tipo_comercio || ''}
                        onChange={val => setFormData({ ...formData, id_tipo_comercio: parseInt(val) })}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-black dark:text-white">Dirección de la Sede *</label>
                <div className="relative group">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500 group-focus-within:text-brand-cyan dark:group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                        required type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm font-bold text-black dark:text-white uppercase placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-2 focus:ring-brand-cyan/20 dark:focus:ring-cyan-400/20 transition-all"
                        placeholder="EJ: AV. BELGRANO 1234, SALTA CAPITAL"
                        value={formData.direccion || ''}
                        onChange={e => setFormData({ ...formData, direccion: e.target.value.toUpperCase() })}
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="p-3 md:p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl flex items-start gap-3 shadow-sm mb-4">
                    <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                        <Info size={16} className="text-brand-cyan" />
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-neutral-700 dark:text-gray-300 leading-relaxed m-0">
                        Click en el mapa o arrastre el marcador para definir la <span className="text-brand-cyan">ubicación</span>.
                    </p>
                </div>

                <MapPicker 
                    lat={formData.latitud} 
                    lng={formData.longitud} 
                    onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }))}
                />
            </div>

            <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 rounded-xl cursor-pointer group hover:border-brand-cyan transition-all">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black dark:text-white">Estado Operativo</span>
                        <span className="text-[9px] text-neutral-400 dark:text-gray-500 font-bold tracking-wider mt-0.5">Visible y recibe operaciones</span>
                    </div>
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            setFormData(prev => ({ ...prev, activo: prev.activo === false ? true : false }));
                        }}
                        className={`w-10 h-6 rounded-full transition-all relative shadow-inner flex-shrink-0 ${
                            formData.activo !== false ? 'bg-brand-cyan' : 'bg-neutral-200 dark:bg-gray-600'
                        }`}
                    >
                        <div className={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-md absolute top-1 transition-all ${
                            formData.activo !== false ? 'left-5' : 'left-1'
                        }`} />
                    </div>
                </label>
            </div>
        </div>
    );

    return (
        <GenericABM
            title="Sedes y Sucursales"
            description="Registro y mapeo de los puntos de venta. Controla la ubicación física, el estado operativo y las categorizaciones de cada sucursal de la red Push Sport."
            icon={Store}
            service={service}
            columns={columns}
            formFields={[]}
            renderForm={renderForm}
            idField="id_comercio"
            modalMaxWidth="max-w-xl md:max-w-4xl"
        />
    );
};

export default Sucursales;