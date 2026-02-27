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
  Map as Map1
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StoreMap from '../components/StoreMap'; 

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
      
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[500px] animate-in zoom-in-95 duration-300">
        
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
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-between relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors p-2 bg-neutral-100 rounded-full hover:bg-neutral-200">
            <CloseCircle size={28} variant="Broken" />
          </button>
          
          <div className="md:hidden mb-6 mt-2">
            <span className="text-xs font-bold text-brand-cyan tracking-widest uppercase mb-2 block">{data.subtitle}</span>
            <h2 className="text-3xl uppercase leading-none m-0 font-sport text-black">{data.title}</h2>
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

  const locations = [
    { nombre: 'Sede Central (Centro)', dir: 'Av. Belgrano 450, Salta Capital', h: '09:00 - 21:00' },
    { nombre: 'Push Norte (Valle)', dir: 'Av. Reyes Católicos 1200', h: '08:00 - 22:00' },
    { nombre: 'Sede Sur (Limache)', dir: 'Ruta 51 km 2', h: '09:00 - 20:00' },
    { nombre: 'Push Oeste (G. Bourg)', dir: 'Av. Savio 400', h: '07:00 - 23:00' },
    { nombre: 'Sede Este (Autódromo)', dir: 'Av. Italia 120', h: '09:00 - 13:00 / 17:00 - 21:00' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openPreview = (category) => setPreview({ isOpen: true, category });
  const closePreview = () => setPreview({ isOpen: false, category: '' });

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
            {isMobileMenuOpen ? <CloseCircle size={32} variant="Bold" /> : <Map1 size={32} variant="Bold" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden fixed inset-0 z-[150] bg-white transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            <div className="p-8 h-full flex flex-col justify-between">
                <div className="space-y-12 mt-10">
                    {['Inicio', 'Productos', 'Sedes', 'Nosotros'].map((item, idx) => (
                        <a 
                            key={item} 
                            href={`#${item.toLowerCase()}`} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-5xl font-sport uppercase text-black tracking-tight"
                            style={{ transitionDelay: `${idx * 100}ms` }}
                        >
                            {item}.
                        </a>
                    ))}
                </div>
                
                <div className="space-y-6">
                    <Link 
                        to="/login" 
                        className="w-full py-6 bg-brand-cyan text-white rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-cyan/20"
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
            <img src="/primera.jpeg" className="w-full h-full object-cover opacity-50 scale-105" alt="Hero PushSport" />
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

      {/* CATEGORÍAS — FIX: header alineado correctamente, párrafo bien posicionado */}
      <section id="productos" className="py-24 container mx-auto px-6 max-w-7xl">
        
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
                    <span className="inline-block bg-brand-cyan text-black px-3 py-1.5 rounded-md text-xs font-bold tracking-widest uppercase mb-4 shadow-lg">Rendimiento Máximo</span>
                    <h3 className="text-white uppercase text-5xl m-0 mb-3 font-sport tracking-tight">Suplementación</h3>
                    <p className="text-neutral-300 text-base font-medium max-w-md m-0">Proteínas, creatinas y pre-entrenos de grado profesional. Diseñados para resultados reales.</p>
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
                        <h3 className="uppercase text-4xl m-0 text-white mb-3 font-sport group-hover:text-brand-cyan transition-colors tracking-tight">Indumentaria Team</h3>
                        <p className="text-neutral-400 font-medium text-sm m-0 mb-6 max-w-sm">
                          Equipamiento técnico diseñado para resistir las rutinas más intensas y regular la temperatura.
                        </p>
                        <button className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white group-hover:text-brand-cyan transition-colors w-fit bg-white/5 px-4 py-2 rounded-lg">
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
                        <h3 className="uppercase text-4xl m-0 text-white mb-3 font-sport group-hover:text-brand-cyan transition-colors tracking-tight">Accesorios Pro</h3>
                        <p className="text-neutral-400 font-medium text-sm m-0 mb-6 max-w-sm">
                          Shakers premium, cinturones de levantamiento y straps para optimizar cada movimiento.
                        </p>
                        <button className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white group-hover:text-brand-cyan transition-colors w-fit bg-white/5 px-4 py-2 rounded-lg">
                            VER MÁS <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </section>

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
                        <span className="text-black font-sport text-xl uppercase leading-none block">{locations[activeLocation].nombre}</span>
                        <span className="text-neutral-500 text-xs font-medium block mt-1">{locations[activeLocation].dir}</span>
                    </div>
                    
                    {/* FIX: Sin mix-blend-multiply, el mapa se renderiza limpio */}
                    <div className="w-full h-full">
                        <StoreMap activeLocation={activeLocation} /> 
                    </div>
                </div>
                
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-20 pb-10 border-t border-neutral-100">
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
    </div>
  );
};

export default Landing;