import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Shop, 
  Box, 
  People, 
  Timer1, 
  Location,
  Instagram,
  Facebook,
  DirectRight,
  CloseCircle,
  TickCircle,
  Flash
} from 'iconsax-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row h-[600px] md:h-auto animate-in zoom-in-95 duration-500">
        <div className="md:w-1/2 relative bg-neutral-900 overflow-hidden">
          <img src={data.img} className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000" alt="Preview" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10">
            <span className="text-[10px] font-bold text-brand-cyan tracking-[0.5em] uppercase mb-2 block">{data.subtitle}</span>
            <h2 className="text-white text-3xl uppercase tracking-tight">{data.title}</h2>
          </div>
        </div>
        <div className="md:w-1/2 p-10 md:p-14 bg-white flex flex-col justify-center">
          <button onClick={onClose} className="absolute top-8 right-8 text-neutral-300 hover:text-black transition-colors">
            <CloseCircle size={32} />
          </button>
          
          <div className="mb-10">
            <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.4em] mb-4">Novedades de Temporada</h4>
            <div className="space-y-6">
              {data.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="mt-1 p-1 bg-brand-cyan/10 rounded-lg text-brand-cyan group-hover:bg-brand-cyan group-hover:text-white transition-all">
                    <TickCircle size={18} variant="Bold" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-neutral-900 group-hover:text-brand-cyan transition-colors uppercase tracking-tight">{item.name}</h5>
                    <p className="text-xs text-neutral-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-50 flex flex-col gap-4">
             <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center">Inicie sesión para ver precios y disponibilidad local</p>
             <Link to="/login" onClick={onClose} className="btn-premium w-full flex items-center justify-center gap-3">
               ACCESO STAFF <DirectRight size={18} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [preview, setPreview] = useState({ isOpen: false, category: '' });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
        const carousel = document.getElementById('sedes-carousel');
        if (carousel) {
            if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 10) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: 400, behavior: 'smooth' });
            }
        }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openPreview = (category) => setPreview({ isOpen: true, category });
  const closePreview = () => setPreview({ isOpen: false, category: '' });

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-brand-cyan/30">
      
      <PreviewModal 
        isOpen={preview.isOpen} 
        category={preview.category} 
        onClose={closePreview} 
      />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-100 py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-14 h-14 bg-white border-2 border-neutral-100 rounded-2xl flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform">
        <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain invert" />
      </div>
            <span className="text-xl font-bold tracking-tight uppercase">PushSport <span className="text-brand-cyan">Salta</span></span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Inicio', 'Productos', 'Sedes', 'Nosotros'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors">{item}</a>
            ))}
            <Link to="/login" className="btn-premium px-8 py-4 text-xs font-bold uppercase">Acceso Staff</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="/primera.jpeg" 
                className="w-full h-full object-cover opacity-50 scale-105" 
                alt="PushSport Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-4 py-2 px-5 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-cyan">Estándar Salta 2026</span>
            </div>

            <h1 className="text-white">
                TU LÍMITE ES <br />
                <span className="text-brand-cyan italic">SOLO EL INICIO.</span>
            </h1>
            
            <p className="text-neutral-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                Suplementación de élite y equipamiento profesional. Elevamos el estándar del rendimiento deportivo en el norte argentino.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
                <button onClick={() => openPreview('suplementacion')} className="btn-cyan px-10 py-6">EXPLORAR CATÁLOGO</button>
                <a href="#sedes" className="px-10 py-6 border border-white/20 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center">NUESTRAS SEDES</a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="productos" className="section-spacing container mx-auto px-6">
        <div className="max-w-2xl mb-20 space-y-6">
            <h2 className="uppercase">Categorías <span className="text-brand-cyan italic">Premium.</span></h2>
            <div className="w-20 h-1.5 bg-brand-cyan rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div 
              onClick={() => openPreview('suplementacion')}
              className="group relative h-[600px] rounded-[3rem] overflow-hidden shadow-soft border border-neutral-100 cursor-pointer"
            >
                <img src="/segunda.jpeg" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt="Suplementos" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                    <span className="text-brand-cyan font-bold tracking-[0.4em] text-xs uppercase underline underline-offset-8 decoration-brand-cyan/30">Rendimiento Máximo</span>
                    <h3 className="text-white uppercase m-0 text-3xl">Suplementación</h3>
                    <p className="text-neutral-300 text-base font-medium">Proteínas, creatinas y pre-entrenos de grado profesional.</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-10">
                <div 
                  onClick={() => openPreview('indumentaria')}
                  className="card-premium flex-1 flex flex-col justify-between group cursor-pointer"
                >
                    <div className="space-y-6">
                        <div className="w-14 h-14 bg-neutral-900 text-brand-cyan flex items-center justify-center rounded-2xl group-hover:bg-brand-cyan group-hover:text-white transition-all">
                            <Shop size={28} variant="Bold" />
                        </div>
                        <h3 className="uppercase text-2xl">Indumentaria Team</h3>
                        <p className="text-neutral-500 font-medium text-sm">Equipamiento técnico diseñado para resistir las rutinas más intensas.</p>
                    </div>
                    <button className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest group-hover:text-brand-cyan transition-colors">
                        Ver Colección <ArrowRight size={20} />
                    </button>
                </div>
                <div 
                  onClick={() => openPreview('accesorios')}
                  className="card-premium flex-1 flex flex-col justify-between group cursor-pointer"
                >
                    <div className="space-y-6">
                        <div className="w-14 h-14 bg-neutral-900 text-brand-cyan flex items-center justify-center rounded-2xl group-hover:bg-brand-cyan group-hover:text-white transition-all">
                            <Box size={28} variant="Bold" />
                        </div>
                        <h3 className="uppercase text-2xl">Accesorios Pro</h3>
                        <p className="text-neutral-500 font-medium text-sm">Shakers, cintos y straps para optimizar cada movimiento.</p>
                    </div>
                    <button className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest group-hover:text-brand-cyan transition-colors">
                        Ver Más <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* SEDES */}
      <section id="sedes" className="bg-neutral-50 py-32 overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
                <div className="space-y-6">
                    <h2 className="uppercase">Presencia en <br/> <span className="text-brand-cyan italic">Salta Capital.</span></h2>
                    <p className="text-neutral-500 font-medium text-lg max-w-lg">Puntos estratégicos de distribución y asesoramiento profesional para nuestra comunidad.</p>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-300 border border-neutral-200">
                        <Timer1 size={24} />
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-300 border border-neutral-200">
                        <Location size={24} />
                    </div>
                </div>
            </div>

            {/* SEDES CAROUSEL SECTION */}
            <div className="relative group mb-20 overflow-hidden px-4 md:px-0">
                <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 scroll-smooth" id="sedes-carousel">
                    {[
                        { nombre: 'Sede Central (Centro)', dir: 'Av. Belgrano 450', h: '09:00 - 21:00' },
                        { nombre: 'Push Norte (Valle)', dir: 'Av. Reyes Católicos 1200', h: '08:00 - 22:00' },
                        { nombre: 'Sede Sur (Limache)', dir: 'Ruta 51 km 2', h: '09:00 - 20:00' },
                        { nombre: 'Push Oeste (Grand Bourg)', dir: 'Av. Savio 400', h: '07:00 - 23:00' },
                        { nombre: 'Sede Este (Autódromo)', dir: 'Av. Italia 120', h: '09:00 - 13:00, 17:00 - 21:00' },
                    ].map(sede => (
                        <div key= {sede.nombre} className="min-w-[300px] md:min-w-[400px] snap-center">
                            <div className="card-premium border-none bg-white p-12 hover:-translate-y-2 transition-transform duration-500 shadow-soft relative overflow-hidden group/card h-full">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-cyan opacity-20 group-hover/card:opacity-100 transition-opacity"></div>
                                <span className="text-sm font-black text-brand-cyan uppercase tracking-[0.5em] mb-6 block">TIENDA OFICIAL</span>
                                <h3 className="mb-6 uppercase text-3xl truncate leading-tight font-black">{sede.nombre}</h3>
                                <div className="space-y-4 pt-6 border-t border-neutral-50">
                                    <div className="flex items-center gap-4 text-neutral-500 font-bold text-sm">
                                        <Location size={22} className="text-neutral-300" />
                                        {sede.dir}
                                    </div>
                                    <div className="flex items-center gap-4 text-neutral-500 font-bold text-sm">
                                        <Timer1 size={22} className="text-neutral-300" />
                                        {sede.h}
                                    </div>
                                </div>
                                <button className="mt-8 text-[10px] font-black text-brand-cyan uppercase tracking-widest flex items-center gap-2 group-hover/card:translate-x-1 transition-transform">
                                    VER EN MAPA <DirectRight size={14} variant="Bold" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Carousel Controls */}
                <div className="flex justify-center gap-4 mt-4">
                    <button 
                        onClick={() => document.getElementById('sedes-carousel').scrollBy({ left: -400, behavior: 'smooth' })}
                        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-brand-cyan transition-colors"
                    >
                        <ArrowRight className="rotate-180" size={24} />
                    </button>
                    <button 
                        onClick={() => document.getElementById('sedes-carousel').scrollBy({ left: 400, behavior: 'smooth' })}
                        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-brand-cyan transition-colors"
                    >
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>

            {/* INTERACTIVE MAP INTEGRATION */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="mb-12">
                    <span className="text-sm font-black text-brand-cyan uppercase tracking-[0.5em] mb-4 block">UBICACIONES</span>
                    <h2 className="text-5xl font-black text-neutral-900 leading-tight uppercase tracking-tighter">
                        Explora Nuestras <br /> Ubicaciones.
                    </h2>
                </div>
                <StoreMap />
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-neutral-100 pt-32 pb-16">
        <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between gap-20 mb-24">
                <div className="space-y-10 max-w-sm">
                    <div className="flex items-center gap-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-12 h-12 bg-white border-2 border-neutral-100 text-brand-cyan flex items-center justify-center font-bold text-xl rounded-xl cursor-not-allowed shadow-sm">
                            P
                        </div>
                        <span className="text-xl font-bold tracking-tight uppercase cursor-pointer">PushSport</span>
                    </div>
                    <p className="text-neutral-400 font-medium leading-relaxed">
                        Líderes en suplementación y rendimiento deportivo en Salta. Calidad garantizada para atletas de élite.
                    </p>
                    <div className="flex flex-col gap-6">
                        <span className="text-sm font-black uppercase tracking-[0.5em] text-neutral-400">REDES SOCIALES</span>
                        <div className="flex gap-4">
                            <a href="#" className="btn-social group">
                                <Instagram size={28} variant="Bold" className="transition-transform group-hover:scale-110" />
                            </a>
                            <a href="#" className="btn-social group">
                                <Facebook size={28} variant="Bold" className="transition-transform group-hover:scale-110" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32">
                    <div className="space-y-8">
                        <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-900 border-b border-neutral-100 pb-4">Empresa</h4>
                        <ul className="space-y-5">
                            {['Historia', 'Atletas', 'Contacto'].map(l => (
                                <li key={l}><a href="#" className="text-sm text-neutral-400 font-semibold hover:text-black transition-colors tracking-tight">{l}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-8">
                        <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-900 border-b border-neutral-100 pb-4">Productos</h4>
                        <ul className="space-y-5">
                            {['Suplementos', 'Indumentaria', 'Accesorios'].map(l => (
                                <li key={l}><a key={l} href="#productos" className="text-sm text-neutral-400 font-semibold hover:text-black transition-colors tracking-tight">{l}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-8 col-span-2 md:col-span-1">
                        <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-900 border-b border-neutral-100 pb-4">Novedades</h4>
                        <div className="relative group">
                            <input type="email" placeholder="SU EMAIL AQUÍ" className="w-full bg-neutral-50 border border-neutral-100 px-6 py-5 rounded-xl text-xs font-bold tracking-[0.1em] focus:ring-4 focus:ring-brand-cyan/10 focus:bg-white outline-none transition-all" />
                            <button className="absolute right-2 top-2 p-3 bg-black text-brand-cyan rounded-lg hover:bg-neutral-800 transition-all shadow-lg active:scale-95"><DirectRight size={22} variant="Bold" /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-neutral-50 flex flex-col md:flex-row justify-between items-center gap-8">
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.6em]">&copy; 2026 PUSHSPORT SALTA &middot; SISTEMA CENTRAL</span>
                <div className="flex gap-10">
                    <a href="#" className="text-[9px] font-bold text-neutral-300 uppercase underline tracking-widest hover:text-brand-cyan">Privacidad</a>
                    <a href="#" className="text-[9px] font-bold text-neutral-300 uppercase underline tracking-widest hover:text-brand-cyan">Términos</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
