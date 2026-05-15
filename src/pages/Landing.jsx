import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  MapPin as Location,
  Clock as Timer1,
  Instagram,
  Facebook,
  Send as DirectRight,
  XCircle as CloseCircle,
  CheckCircle2 as TickCircle,
  Zap as Flash,
  Menu,
  Map as Map1
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StoreMap from '../components/StoreMap'; 
import { sucursalesService } from '../services/sucursalesService';
import ProductGrid from '../components/catalog/ProductGrid';
import ProductQuickView from '../components/catalog/ProductQuickView';
import CartButton from '../components/cart/CartButton';
import TeamMemberCard from '../components/ui/TeamMemberCard';
import CartDrawer from '../components/cart/CartDrawer';
import BottomNav from '../components/ui/BottomNav';
import ScrollToTop from '../components/ui/ScrollToTop';
import PromoBanner from '../components/ui/PromoBanner';
import WhatsAppButton from '../components/shared/WhatsAppButton';

const PreviewModal = ({ category, isOpen, onClose }) => {
  if (!isOpen) return null;

  const content = {
    suplementacion: {
      title: 'Suplementación de Élite',
      subtitle: 'RENDIMIENTO ASEGURADO',
      items: [
        { name: 'Pure Whey Isolate', desc: 'Proteína de rápida absorción.' },
        { name: 'Creatine Monohydrate', desc: 'Pureza farmacéutica 99.9%.' },
        { name: 'Nitro Blast Pre-Workout', desc: 'Enfoque y bombeo extremo.' }
      ],
      img: '/segunda.jpeg'
    },
    indumentaria: {
      title: 'Indumentaria Team',
      subtitle: 'TECNOLOGÍA TEXTIL',
      items: [
        { name: 'Oversized Training Tee', desc: 'Algodón premium respirable.' },
        { name: 'Compression Shorts', desc: 'Soporte muscular avanzado.' },
        { name: 'Push Performance Hoodie', desc: 'Diseño térmico ergonómico.' }
      ],
      img: '/primera.jpeg'
    },
    accesorios: {
      title: 'Accesorios Pro',
      subtitle: 'EQUIPAMIENTO CORE',
      items: [
        { name: 'Elite Lifting Belt', desc: 'Cuero genuino reforzado.' },
        { name: 'Push Shaker 700ml', desc: 'Antiderrames y libre de BPA.' },
        { name: 'Heavy Duty Straps', desc: 'Agarre superior en remos.' }
      ],
      img: '/primera.jpeg'
    }
  };

  const data = content[category] || content.suplementacion;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto custom-scrollbar rounded-2xl shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[500px] animate-in zoom-in-95 duration-300">
        
        {/* Imagen Modal */}
        <div className="md:w-1/2 relative bg-black hidden md:block group overflow-hidden">
          <img src={data.img} className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700" alt={data.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <span className="text-xs font-bold text-brand-cyan tracking-widest uppercase mb-2 block">{data.subtitle}</span>
            <h2 className="text-white text-4xl uppercase leading-none m-0 font-sport">{data.title}</h2>
          </div>
        </div>
        
        {/* Contenido Modal */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 bg-white flex flex-col justify-between relative">
          <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-neutral-400 hover:text-black transition-colors p-2 bg-neutral-100 rounded-full hover:bg-neutral-200">
            <CloseCircle size={24} className="sm:w-7 sm:h-7" variant="Broken" />
          </button>
          
          <div className="md:hidden mb-6 mt-6 sm:mt-2 pr-10">
            <span className="text-[10px] sm:text-xs font-bold text-brand-cyan tracking-widest uppercase mb-1 sm:mb-2 block">{data.subtitle}</span>
            <h2 className="text-2xl sm:text-3xl uppercase leading-tight m-0 font-sport text-black break-words hyphens-auto">{data.title}</h2>
          </div>
          
          <div className="mt-4 md:mt-0 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-neutral-400 border-b border-neutral-100 pb-3">Novedades de Temporada</h4>
            <div className="space-y-6">
              {data.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="mt-1 text-neutral-300 group-hover:text-brand-cyan transition-colors">
                    <TickCircle size={24} variant="Bold" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg text-black uppercase tracking-tight m-0 group-hover:text-brand-cyan transition-colors font-sport">{item.name}</h5>
                    <p className="text-sm text-neutral-500 font-medium mt-1 m-0 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-neutral-100">
             <Link to="/login" onClick={onClose} className="w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-widest hover:bg-brand-cyan hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
               ACCESO STAFF <DirectRight size={20} color="white" variant="Bold" />
             </Link>
             <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest text-center mt-4 m-0">Inicie sesión para ver disponibilidad</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preview, setPreview] = useState({ isOpen: false, category: '' });
  const [activeLocation, setActiveLocation] = useState(0);
  const [activeAthlete, setActiveAthlete] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [locations, setLocations] = useState([
    { nombre: 'Cargando Sedes...', dir: 'Aguarde un momento', h: '-' }
  ]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await sucursalesService.getPublic();
        if (data && data.length > 0) {
            setLocations(data.map(c => ({
                nombre: c.nombre,
                dir: c.direccion || 'Ubicación a confirmar',
                h: '09:00 - 21:00' // Horario genérico (modelo no tiene campo horario)
            })));
        } else {
            setLocations([{ nombre: 'Plataforma en Mantenimiento', dir: 'No hay sedes activadas temporalmente.', h: '-' }]);
        }
      } catch (error) {
        setLocations([{ nombre: 'Error de Conexión', dir: 'Reconfigure backend.', h: '-' }]);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openPreview = (category) => setPreview({ isOpen: true, category });
  const closePreview = () => setPreview({ isOpen: false, category: '' });
  
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <div className="bg-white text-neutral-900 font-sans antialiased overflow-x-hidden selection:bg-brand-cyan selection:text-white">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
        .font-sport { font-family: 'Oswald', sans-serif; letter-spacing: -0.01em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <PreviewModal isOpen={preview.isOpen} category={preview.category} onClose={closePreview} />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-lg border-b border-neutral-200 py-4 shadow-sm' : 'bg-gradient-to-b from-black/80 to-transparent py-6'}`}>
        <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-md group-hover:scale-110 transition-transform duration-300">
              <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`text-2xl uppercase m-0 font-sport tracking-wide ${isScrolled ? 'text-black' : 'text-white'}`}>
              PushSport <span className="text-brand-cyan">Salta</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Inicio', 'Productos', 'Sedes', 'Nosotros'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className={`text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 ${isScrolled ? 'text-neutral-500 hover:text-brand-cyan' : 'text-white/80 hover:text-brand-cyan'}`}>
                {item}
              </a>
            ))}
            <Link to="/login" className="ml-4 px-6 py-2.5 bg-brand-cyan text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Acceso Staff
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-all ${isScrolled ? 'text-black' : 'text-white hover:text-brand-cyan'}`}
          >
            {isMobileMenuOpen ? <CloseCircle size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden fixed inset-0 z-[150] bg-white transition-all duration-500 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            <div className="p-8 min-h-full flex flex-col justify-between pt-24 pb-12">
                <div className="space-y-6 mb-12">
                    {['Inicio', 'Productos', 'Sedes', 'Nosotros'].map((item, idx) => (
                        <a 
                            key={item} 
                            href={`#${item.toLowerCase()}`} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-3xl sm:text-4xl font-sport uppercase text-black tracking-tight border-b border-neutral-100 pb-2"
                            style={{ transitionDelay: `${idx * 100}ms` }}
                        >
                            {item}.
                        </a>
                    ))}
                </div>
                
                <div className="space-y-6 mt-auto">
                    <Link 
                        to="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 sm:py-6 bg-brand-cyan text-white rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-cyan/20 active:scale-95 transition-all"
                    >
                        ACCESO STAFF <ArrowRight size={20} />
                    </Link>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center">Gestión Central PushSport Salta</p>
                </div>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="inicio" className="relative flex items-center bg-black min-h-screen pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img src="/fondo.jpeg" className="w-full h-full object-cover opacity-50 scale-100 rotate-6 origin-center scale-x-[-1] translate-x-[30%]" alt="Hero PushSport" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-2xl space-y-6">
            
            <div className="inline-flex items-center gap-2 py-1.5 px-4 border border-brand-cyan/30 bg-brand-cyan/10 rounded-full backdrop-blur-md mb-4">
                <Flash size={16} className="text-brand-cyan" variant="Bold"/>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan m-0">Estándar Salta 2026</span>
            </div>

            <h1 className="text-6xl md:text-8xl text-white uppercase leading-[0.9] m-0 font-sport tracking-tight">
                TU LÍMITE ES <br />
                <span className="text-brand-cyan italic">SOLO EL INICIO.</span>
            </h1>
            
            <p className="text-neutral-300 text-lg md:text-xl font-medium leading-relaxed max-w-lg m-0">
                Suplementación de élite y equipamiento profesional. Elevamos el estándar del rendimiento deportivo en la región.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button onClick={() => openPreview('suplementacion')} className="px-8 py-4 bg-brand-cyan text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1">
                  EXPLORAR CATÁLOGO
                </button>
                <a href="#sedes" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1">
                  NUESTRAS SEDES
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER PROMOCIONAL */}
      <PromoBanner />

      {/* CATEGORÍAS — FIX: header alineado correctamente, párrafo bien posicionado */}
      <section id="categorias" className="py-24 container mx-auto px-6 max-w-7xl">
        
        {/* FIX: Se separaron título y subtítulo en un bloque propio arriba, sin items-end que causaba descuadre */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="uppercase text-4xl md:text-6xl text-black m-0 leading-none font-sport tracking-tight">
                Categorías <span className="text-brand-cyan italic">Premium.</span>
              </h2>
              <div className="w-16 h-2 bg-brand-cyan mt-4 rounded-full"></div>
            </div>
            {/* FIX: El párrafo ahora está alineado al baseline del título en desktop, y debajo en mobile */}
            <p className="text-neutral-500 md:max-w-xs text-sm font-medium md:text-right leading-relaxed">
              Selecciona una categoría para explorar nuestra tecnología en rendimiento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Tarjeta Principal */}
            <div 
              onClick={() => openPreview('suplementacion')}
              className="group relative h-[450px] lg:h-[600px] rounded-3xl overflow-hidden cursor-pointer bg-black shadow-xl hover:shadow-2xl transition-all duration-500"
            >
                <img src="/segunda.jpeg" className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000" alt="Suplementos" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                <div className="absolute bottom-10 left-10 right-10">
                    <span className="inline-block bg-brand-cyan text-black px-2 py-1 md:px-3 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3 md:mb-4 shadow-lg">Rendimiento Máximo</span>
                    <h3 className="text-white uppercase text-4xl md:text-5xl m-0 mb-2 md:mb-3 font-sport tracking-tight break-words hyphens-auto">Suplementación</h3>
                    <p className="text-neutral-300 text-sm md:text-base font-medium max-w-md m-0">Proteínas, creatinas y pre-entrenos de grado profesional. Diseñados para resultados reales.</p>
                </div>
            </div>
            
            {/* Tarjetas Secundarias */}
            <div className="flex flex-col gap-8">
                
                <div 
                  onClick={() => openPreview('indumentaria')}
                  className="bg-neutral-900 rounded-3xl p-10 flex-1 flex flex-col justify-end group cursor-pointer relative overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-cyan/10 rounded-full blur-3xl group-hover:bg-brand-cyan/20 transition-colors"></div>
                    
                    <div className="relative z-10">
                        <h3 className="uppercase text-3xl md:text-4xl m-0 text-white mb-2 md:mb-3 font-sport group-hover:text-brand-cyan transition-colors tracking-tight break-words hyphens-auto">Indumentaria Team</h3>
                        <p className="text-neutral-400 font-medium text-xs md:text-sm m-0 mb-4 md:mb-6 max-w-sm">
                          Equipamiento técnico diseñado para resistir las rutinas más intensas y regular la temperatura.
                        </p>
                        <button className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-bold uppercase tracking-widest text-white group-hover:text-brand-cyan transition-colors w-fit bg-white/5 px-3 py-2 md:px-4 md:py-2 rounded-lg">
                            VER COLECCIÓN <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>
                        </button>
                    </div>
                </div>

                <div 
                  onClick={() => openPreview('accesorios')}
                  className="bg-neutral-900 rounded-3xl p-10 flex-1 flex flex-col justify-end group cursor-pointer relative overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-cyan/10 rounded-full blur-3xl group-hover:bg-brand-cyan/20 transition-colors"></div>

                    <div className="relative z-10">
                        <h3 className="uppercase text-3xl md:text-4xl m-0 text-white mb-2 md:mb-3 font-sport group-hover:text-brand-cyan transition-colors tracking-tight break-words hyphens-auto">Accesorios Pro</h3>
                        <p className="text-neutral-400 font-medium text-xs md:text-sm m-0 mb-4 md:mb-6 max-w-sm">
                          Shakers premium, cinturones de levantamiento y straps para optimizar cada movimiento.
                        </p>
                        <button className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-bold uppercase tracking-widest text-white group-hover:text-brand-cyan transition-colors w-fit bg-white/5 px-3 py-2 md:px-4 md:py-2 rounded-lg">
                            VER MÁS <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* CATÁLOGO DE PRODUCTOS */}
      <ProductGrid onQuickView={handleQuickView} />

      {/* SEDES — FIX: altura flexible, sin mix-blend-multiply en el mapa, z-index del overlay corregido */}
      <section id="sedes" className="py-24 bg-neutral-50 border-y border-neutral-200">
        <div className="container mx-auto px-6 max-w-7xl">
            
            <div className="mb-12">
                <h2 className="uppercase text-4xl md:text-6xl text-black m-0 leading-none font-sport tracking-tight">
                    Encuentra tu <br/> <span className="text-brand-cyan italic">Sede PushSport.</span>
                </h2>
                <div className="w-16 h-2 bg-brand-cyan mt-4 rounded-full mb-4"></div>
                <p className="text-neutral-500 text-base font-medium max-w-md">
                  Selecciona una sucursal en la lista para verla en el mapa y conocer sus horarios de atención.
                </p>
            </div>

            {/* FIX: El grid ahora no tiene altura fija en el padre — cada columna gestiona la suya */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Columna Izquierda: Lista de Sedes */}
                {/* FIX: altura fija sólo en lg, en mobile se expande naturalmente */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[550px] lg:max-h-[600px]">
                    {locations.map((sede, idx) => (
                        <div 
                            key={sede.nombre} 
                            onClick={() => setActiveLocation(idx)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex-shrink-0 ${
                              activeLocation === idx 
                                ? 'border-brand-cyan bg-white shadow-lg' 
                                : 'border-neutral-200 bg-white shadow-sm hover:border-brand-cyan/40 hover:shadow-md'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                                  activeLocation === idx ? 'bg-brand-cyan text-black' : 'bg-neutral-100 text-neutral-500'
                                }`}>
                                    TIENDA OFICIAL
                                </span>
                                {activeLocation === idx && <Map1 size={20} className="text-brand-cyan" variant="Bold"/>}
                            </div>
                            
                            <h3 className={`mb-4 uppercase text-2xl font-sport tracking-tight m-0 ${
                              activeLocation === idx ? 'text-brand-cyan' : 'text-black'
                            }`}>
                                {sede.nombre}
                            </h3>
                            
                            <div className="space-y-2 pt-4 border-t border-neutral-100">
                                <div className="flex items-start gap-3 text-neutral-600 font-medium text-sm">
                                    <Location size={18} className={`mt-0.5 flex-shrink-0 ${activeLocation === idx ? 'text-brand-cyan' : 'text-neutral-400'}`} variant="Bold" />
                                    <span className="leading-snug">{sede.dir}</span>
                                </div>
                                <div className="flex items-start gap-3 text-neutral-600 font-medium text-sm">
                                    <Timer1 size={18} className={`mt-0.5 flex-shrink-0 ${activeLocation === idx ? 'text-brand-cyan' : 'text-neutral-400'}`} variant="Bold" />
                                    <span className="leading-snug">{sede.h}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Columna Derecha: Mapa */}
                {/* FIX: altura fija propia, sin mix-blend-multiply, z-index y overflow limpios */}
                <div className="lg:col-span-7 h-[400px] lg:h-[600px] rounded-3xl overflow-hidden border-2 border-neutral-200 bg-neutral-200 shadow-md relative">
                    
                    {/* Overlay info sede activa — FIX: z-index explícito y fondo sólido */}
                    <div className="absolute top-5 left-5 z-20 bg-white px-4 py-3 rounded-xl shadow-lg border border-neutral-100 pointer-events-none">
                        <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase block mb-1">Visualizando</span>
                        <span className="text-black font-sport text-xl uppercase leading-none block">{locations[activeLocation]?.nombre || 'Sede'}</span>
                        <span className="text-neutral-500 text-xs font-medium block mt-1">{locations[activeLocation]?.dir || 'Dirección'}</span>
                    </div>
                    
                    {/* FIX: Sin mix-blend-multiply, el mapa se renderiza limpio */}
                    <div className="w-full h-full">
                        <StoreMap activeLocation={activeLocation} /> 
                    </div>
                </div>
                
            </div>
        </div>
      </section>

      {/* NOSOTROS SECTION */}
      <section id="nosotros" className="py-16 md:py-24 bg-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className="space-y-6 md:space-y-8">
                      <div className="inline-flex items-center gap-2 py-1.5 px-4 border border-white/10 bg-white/5 rounded-full mb-2">
                          <Flash size={16} className="text-brand-cyan" variant="Bold"/>
                          <span className="text-xs font-bold uppercase tracking-widest text-white m-0">Nuestra Filosofía</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl lg:text-7xl text-white uppercase leading-[0.9] m-0 font-sport tracking-tight">
                          NO VENDEMOS <br/> <span className="text-brand-cyan italic">SUPLEMENTOS.</span>
                      </h2>
                      <div className="w-16 md:w-20 h-2 bg-brand-cyan rounded-full"></div>
                      <p className="text-neutral-400 text-base md:text-lg leading-relaxed font-medium">
                          PushSport nació con una única misión: elevar el estándar del rendimiento atlético en Salta. No somos solo una tienda, somos el motor detrás de cada récord personal, cada repetición extra y cada meta alcanzada.
                      </p>
                      <p className="text-neutral-400 text-base md:text-lg leading-relaxed font-medium hidden md:block">
                          Trabajamos directamente con laboratorios de élite para garantizar que cada producto en nuestras estanterías cumpla con las exigencias del deporte profesional. Si no lo usaríamos nosotros, no te lo vendemos.
                      </p>
                      <div className="flex gap-8 md:gap-12 pt-6 border-t border-white/10">
                          <div>
                              <h4 className="text-3xl md:text-4xl font-sport text-white mb-1">
                                  {locations.filter(l => !['Cargando Sedes...', 'Plataforma en Mantenimiento', 'Error de Conexión'].includes(l.nombre)).length || 0}
                              </h4>
                              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-cyan">Sedes Activas</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="relative mt-8 lg:mt-0">
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan to-transparent opacity-20 rounded-[2rem] blur-xl"></div>
                      <img src="/fondo.jpeg" alt="Filosofía PushSport" className="relative z-10 w-full h-[300px] md:h-[500px] lg:h-[600px] object-cover rounded-[2rem] border border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute bottom-6 -left-6 md:bottom-10 md:-left-10 bg-white p-4 md:p-6 rounded-2xl shadow-2xl z-20 border border-neutral-100 hidden sm:block">
                          <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center">
                                  <TickCircle size={24} className="text-brand-cyan" variant="Bold" />
                              </div>
                              <div>
                                  <h5 className="font-sport uppercase text-xl md:text-2xl text-black m-0 leading-none">Calidad Elite</h5>
                                  <span className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest">Garantía PushSport</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* EVENTOS SECTION (BENTO GRID) */}
      <section id="eventos" className="py-24 bg-neutral-100 relative">
          <div className="container mx-auto px-6 max-w-7xl">
              <div className="text-center mb-16">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-cyan mb-2 md:mb-4 block">Evento Destacado</span>
                  <h2 className="uppercase text-5xl md:text-7xl lg:text-8xl text-black m-0 leading-[0.9] font-sport tracking-tight">
                      UN DESAFÍO CON <br/><span className="text-brand-cyan italic">PROPÓSITO.</span>
                  </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px] md:auto-rows-[280px]">
                  
                  {/* Bloque Principal (Texto + Imagen) */}
                  <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-black rounded-[2rem] p-8 md:p-10 relative overflow-hidden group border border-neutral-800 shadow-2xl">
                      <img src="/eventos/lh1.jpeg" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105" alt="Corremos" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      <div className="relative z-10 h-full flex flex-col justify-end">
                          <span className="text-brand-cyan font-bold uppercase tracking-widest text-[10px] md:text-xs mb-3 block">Por qué corremos</span>
                          <h3 className="text-white font-sport text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.9] mb-4">No es solo una carrera</h3>
                          <p className="text-neutral-300 font-medium text-sm md:text-base max-w-md">
                             Este evento busca reunir donantes de sangre. Es una iniciativa para activar a la comunidad alrededor del deporte, la solidaridad y la salud.
                          </p>
                      </div>
                  </div>

                  {/* 80 Donantes */}
                  <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col justify-between group overflow-hidden relative border border-neutral-200">
                      <div className="absolute -right-6 -top-6 w-24 h-24 md:w-32 md:h-32 bg-brand-cyan/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                      <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Objetivo</span>
                      <div className="relative z-10">
                         <h4 className="text-black font-sport text-7xl md:text-8xl leading-none tracking-tighter">80</h4>
                         <span className="text-black font-bold uppercase tracking-widest text-[10px] md:text-sm block mt-2">Donantes</span>
                      </div>
                  </div>

                  {/* 240 Vidas */}
                  <div className="md:col-span-1 lg:col-span-1 bg-brand-cyan rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -left-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                      <span className="text-black/60 font-bold uppercase tracking-widest text-[10px] relative z-10">Impacto</span>
                      <div className="relative z-10">
                         <h4 className="text-black font-sport text-7xl md:text-8xl leading-none tracking-tighter">240</h4>
                         <span className="text-black font-bold uppercase tracking-widest text-[10px] md:text-sm block mt-2">Vidas Salvadas</span>
                      </div>
                      <p className="text-black/70 text-[10px] md:text-xs mt-4 font-medium relative z-10 leading-relaxed">Cada donante puede salvar hasta 3 vidas.</p>
                  </div>

                  {/* 1 Comunidad - Foto */}
                  <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-black rounded-[2rem] relative overflow-hidden group shadow-xl">
                       <img src="/eventos/lh2.jpeg" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" alt="Comunidad" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                       <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                           <h4 className="text-white font-sport text-5xl md:text-6xl leading-none mb-1 md:mb-2">1</h4>
                           <span className="text-brand-cyan font-bold uppercase tracking-widest text-[10px] md:text-sm block">Comunidad en Movimiento</span>
                       </div>
                  </div>

                  {/* CTA Instagram */}
                  <a href="https://www.instagram.com/push_sportsalta?igsh=MWhwejA1dmIyZ2YzOQ==" target="_blank" rel="noopener noreferrer" className="md:col-span-1 lg:col-span-2 row-span-1 bg-black rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col items-center justify-center group hover:-translate-y-2 transition-all duration-500 border border-neutral-800 hover:border-brand-cyan relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       <Instagram size={40} className="text-brand-cyan mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-500 relative z-10 md:w-12 md:h-12" />
                       <span className="text-white font-bold uppercase tracking-widest text-[10px] md:text-sm text-center relative z-10">Ver Cobertura Oficial</span>
                  </a>
              </div>
          </div>
      </section>

      {/* EQUIPO PUSHSPORT SECTION (DEPORTIVO OSCURO / ALTO RENDIMIENTO) */}
      <section id="team" className="py-24 md:py-32 bg-gray-900 relative overflow-hidden">
          {/* Elemento decorativo de fondo */}
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="text-center mb-16">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-cyan mb-2 md:mb-4 block">Nuestro Equipo</span>
                  <h2 className="uppercase text-5xl md:text-7xl lg:text-8xl text-white m-0 leading-none font-black tracking-tight italic">
                      EQUIPO PUSH<span className="text-brand-cyan">SPORT.</span>
                  </h2>
              </div>

              {/* Grid de Miembros del Equipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                      { 
                        name: 'Milagros Burgos', 
                        role: 'Fundadora & CEO, Mama, intento de atleta, repartidora, preventista, cajera, administradora', 
                        frontImage: '/fondo.jpeg',
                        backImage: '/fondo.jpeg',
                        isPremiumMode: false 
                      },
                      { 
                        name: 'Nahuel Serrudo', 
                        role: 'Atleta / Coordinador Técnico', 
                        frontImage: '/nahuel_push.jpeg',
                        backImage: '/nahuel_tria.jpg',
                        sportDescription: '',
                        isPremiumMode: true 
                      },
                      /*{ 
                        name: 'Tomás Ruiz', 
                        role: 'Asesor Técnico', 
                        frontImage: '/segunda.jpeg',
                        backImage: '/segunda.jpeg',
                        isPremiumMode: false 
                      },
                      { 
                        name: 'Sofía Díaz', 
                        role: 'Nutrición Deportiva', 
                        frontImage: '/eventos/lh1.jpeg',
                        backImage: '/eventos/lh1.jpeg',
                        isPremiumMode: false 
                      }, */
                  ].map((miembro, i) => (
                      <TeamMemberCard
                          key={i}
                          name={miembro.name}
                          role={miembro.role}
                          frontImage={miembro.frontImage}
                          backImage={miembro.backImage}
                          sportDescription={miembro.sportDescription}
                          isPremiumMode={miembro.isPremiumMode}
                      />
                  ))}
              </div>
          </div>
      </section>

      {/* GALERÍA SECTION */}
      <section id="galeria" className="py-0 bg-black relative w-full overflow-hidden">
          <div className="py-16 md:py-24 text-center">
              <h2 className="uppercase text-4xl md:text-6xl lg:text-7xl text-white m-0 leading-none font-sport tracking-tight">
                  VIVIENDO <span className="text-brand-cyan italic">PUSH.</span>
              </h2>
              <div className="w-16 md:w-20 h-2 bg-brand-cyan mx-auto mt-4 md:mt-6 rounded-full"></div>
              <p className="text-neutral-400 mt-4 md:mt-6 font-medium text-sm md:text-lg max-w-xl mx-auto px-6">La exigencia no se cuenta, se demuestra. Sumate a la comunidad.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2 px-1 md:px-2 pb-1 md:pb-2 auto-rows-[120px] md:auto-rows-[180px]">
              <div className="col-span-2 row-span-2 overflow-hidden relative group">
                  <img src="/eventos/lh2.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
              </div>
              <div className="overflow-hidden relative group">
                  <img src="/primera.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
              </div>
              <div className="overflow-hidden relative group row-span-2">
                  <img src="/eventos/lh4.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="col-span-2 md:col-span-1 overflow-hidden relative group">
                  <img src="/fondo.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
              </div>
              <div className="col-span-2 overflow-hidden relative group">
                  <img src="/eventos/lh1.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="overflow-hidden relative group">
                  <img src="/segunda.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
              </div>
              <div className="col-span-2 md:col-span-1 lg:col-span-2 overflow-hidden relative group">
                  <img src="/eventos/lh3.jpeg" alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
              </div>
          </div>

          <div className="py-16 md:py-24 text-center bg-gradient-to-t from-black via-black/80 to-transparent absolute bottom-0 left-0 w-full flex items-end justify-center pointer-events-none">
              <a href="https://www.instagram.com/push_sportsalta?igsh=MWhwejA1dmIyZ2YzOQ==" target="_blank" rel="noopener noreferrer" className="pointer-events-auto inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-10 md:py-5 bg-brand-cyan text-black rounded-xl font-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-white hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                  <Instagram size={20} className="md:w-6 md:h-6" /> SEGUINOS EN INSTAGRAM
              </a>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-20 pb-28 md:pb-10 border-t border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                
                {/* Branding Left */}
                <div className="md:col-span-4">
                    <div className="flex items-center gap-3 cursor-pointer mb-6" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl rounded-lg font-sport shadow-md">
                            P
                        </div>
                        <span className="text-3xl uppercase m-0 font-sport tracking-tight">PushSport</span>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm m-0 mb-6 leading-relaxed max-w-xs">
                        Líderes en suplementación y rendimiento en Salta. Calidad garantizada para atletas exigentes.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-black hover:bg-brand-cyan hover:text-white hover:-translate-y-1 transition-all duration-300">
                            <Instagram size={20} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-black hover:bg-brand-cyan hover:text-white hover:-translate-y-1 transition-all duration-300">
                            <Facebook size={20} />
                        </a>
                    </div>
                </div>

                {/* Links Nav */}
                <div className="md:col-span-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-6 border-b-2 border-brand-cyan inline-block pb-2">Empresa</h4>
                    <ul className="space-y-4 m-0 p-0 list-none">
                        {['Nuestra Historia', 'Team Atletas', 'Contacto Directo'].map(l => (
                            <li key={l}><a href="#" className="text-sm text-neutral-500 font-medium hover:text-brand-cyan transition-colors flex items-center gap-2"><ArrowRight size={12}/> {l}</a></li>
                        ))}
                    </ul>
                </div>
                
                <div className="md:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-6 border-b-2 border-brand-cyan inline-block pb-2">Productos</h4>
                    <ul className="space-y-4 m-0 p-0 list-none">
                        {['Suplementos', 'Indumentaria', 'Accesorios Pro'].map(l => (
                            <li key={l}><a href="#productos" className="text-sm text-neutral-500 font-medium hover:text-brand-cyan transition-colors flex items-center gap-2"><ArrowRight size={12}/> {l}</a></li>
                        ))}
                    </ul>
                </div>
                
                {/* Newsletter Form */}
                <div className="md:col-span-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-6 border-b-2 border-brand-cyan inline-block pb-2">Novedades</h4>
                    <p className="text-xs text-neutral-500 mb-4">Suscríbete para recibir lanzamientos y ofertas exclusivas.</p>
                    <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl p-1 focus-within:border-brand-cyan focus-within:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all">
                        <input type="email" placeholder="Ingresa tu email..." className="flex-1 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none text-black placeholder:text-neutral-400 min-w-0" />
                        <button className="flex-shrink-0 px-4 py-3 bg-black rounded-lg hover:bg-brand-cyan transition-colors flex items-center justify-center shadow-md">
                            <DirectRight size={18} color="white" variant="Bold" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest m-0">&copy; 2026 PUSHSPORT SALTA &middot; SISTEMA CENTRAL</span>
                <div className="flex gap-6">
                    <a href="#" className="text-xs font-bold text-neutral-400 uppercase tracking-widest hover:text-brand-cyan transition-colors">Privacidad</a>
                    <a href="#" className="text-xs font-bold text-neutral-400 uppercase tracking-widest hover:text-brand-cyan transition-colors">Términos Legales</a>
                </div>
            </div>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Botón flotante del carrito */}
      <CartButton />

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Drawer del carrito */}
      <CartDrawer />

      {/* Quick View Modal */}
      <ProductQuickView
        producto={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={closeQuickView}
        onQuickView={handleQuickView}
      />
    </div>
  );
};

export default Landing;