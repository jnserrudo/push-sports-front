import React from 'react';
import { ArrowRight, Flash, ShieldTick, Star, HambergerMenu, ArrowRight2, Shop, Activity, Headphone } from 'iconsax-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleScrollTo = (id) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-brand-cyan/30 selection:text-black overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="p-6 md:px-12 md:py-8 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-900 text-brand-cyan flex items-center justify-center font-bold text-2xl rounded-2xl shadow-xl">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tighter leading-none flex flex-col">
            <span>PUSH SPORT</span>
            <span className="text-[9px] tracking-[0.5em] text-neutral-300 font-bold mt-1">SALTA CAPITAL</span>
          </h1>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12 font-bold text-[10px] uppercase tracking-[0.3em] text-neutral-400">
          <button onClick={() => handleScrollTo('categorias')} className="hover:text-neutral-900 transition-colors">Productos</button>
          <button onClick={() => handleScrollTo('sucursales')} className="hover:text-neutral-900 transition-colors">Sedas</button>
          <button onClick={() => navigate('/login')} className="hover:text-neutral-900 transition-colors">Ingreso Staff</button>
        </div>

        <div className="flex items-center gap-4">
          <button 
                onClick={() => navigate('/login')}
                className="btn-cyan px-8 py-3.5 text-[10px] shadow-lg shadow-brand-cyan/20"
            >
            ACCEDER
          </button>
          <button className="md:hidden p-3 bg-neutral-50 rounded-2xl">
            <HambergerMenu size={24} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-white overflow-hidden pb-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-50/30 blur-3xl -translate-y-1/2 translate-x-1/4 rounded-full"></div>
        
        <div className="container mx-auto px-6 py-24 lg:py-40 flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="lg:w-1/2 flex flex-col items-start text-left animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-3 bg-neutral-50 px-5 py-2 rounded-full mb-12 border border-neutral-100">
                <div className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.6)] animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 font-mono">2026 / Performance Edition</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-neutral-900 leading-[0.95] mb-10">
              EL PODER DE <br />
              <span className="text-brand-cyan">LA DISCIPLINA.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-400 max-w-lg mb-14 leading-relaxed font-medium">
              Ecosistema unificado de suplementación premium y equipamiento técnico para el ecosistema fitness del norte argentino.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <button 
                  className="btn-premium flex items-center justify-center gap-4 group px-10 h-16"
                  onClick={() => navigate('/login')}
              >
                Inicia tu Proceso <Flash variant="Bold" size={20} className="text-brand-cyan group-hover:scale-125 transition-transform" />
              </button>
              <button 
                  onClick={() => handleScrollTo('sucursales')}
                  className="px-10 h-16 bg-white border border-neutral-100 font-bold rounded-2xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest text-neutral-500 shadow-sm"
                >
                Nuestras Sedes <ArrowRight2 size={18} />
              </button>
            </div>

            <div className="mt-24 flex items-center gap-12 opacity-60">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tighter">15k+</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.4em] text-neutral-300">Usuarios Activos</span>
                </div>
                <div className="h-8 w-px bg-neutral-100"></div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tighter">Salta</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.4em] text-neutral-300">Base Operativa</span>
                </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative group animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
             <div className="absolute -inset-10 bg-brand-cyan/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="relative aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-neutral-100 rotate-2 group-hover:rotate-0 transition-all duration-700">
                <img src="/primera.jpeg" alt="Hero" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-white">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-60 mb-3 block">LANZAMIENTO</span>
                        <h4 className="text-3xl font-bold tracking-tight uppercase">Performance <br/> Elite Series</h4>
                    </div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 hover:bg-brand-cyan hover:text-black transition-all cursor-pointer">
                        <ArrowRight size={24} variant="Bold" />
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* CORE FEATURES */}
      <section className="py-40 bg-neutral-50/50">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: Flash, title: 'Optimización Flash', text: 'Sistemas de entrega inmediata en toda la capital salteña.', color: 'brand-cyan' },
                { icon: ShieldTick, title: 'Seguridad Nutricional', text: 'Trazabilidad completa y certificación oficial de cada lote.', color: 'neutral-900' },
                { icon: Activity, title: 'Asesoría Técnica', text: 'Soporte especializado para maximizar tus objetivos.', color: 'brand-cyan' }
              ].map((item, i) => (
                <div key={i} className="card-premium p-12 group hover:-translate-y-2 transition-all duration-500 bg-white">
                    <div className={`w-16 h-16 bg-neutral-50 text-neutral-900 flex items-center justify-center rounded-2xl mb-10 group-hover:bg-neutral-900 group-hover:text-brand-cyan transition-all shadow-sm`}>
                        <item.icon size={28} variant="Bold" />
                    </div>
                    <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.4em] mb-4 block">PILARES PUSH</span>
                    <h3 className="text-2xl font-bold mb-6 tracking-tight">{item.title}</h3>
                    <p className="text-[13px] text-neutral-400 leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
          </div>
      </section>

      {/* CATEGORIES GRID */}
      <section id="categorias" className="py-40 bg-white">
        <div className="container mx-auto px-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
            <div className="lg:max-w-xl">
                 <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-cyan mb-4 block">PORTFOLIO</span>
                 <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">Equipamiento <br/> de Selección.</h2>
                 <p className="text-neutral-400 font-medium text-lg">Curaduría de productos testeados bajo los más altos estándares de rendimiento.</p>
            </div>
            <button 
                onClick={() => navigate('/login')}
                className="btn-premium px-10 h-14"
            >
                Explorar Catálogo Central
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
                { title: 'Suplementación', img: '/segunda.jpeg', subtitle: 'NUTRICIÓN DE ÉLITE' },
                { title: 'Indumentaria', img: '/icono.jpeg', subtitle: 'DISEÑO PERFORMANCE' },
                { title: 'Accesorios', img: '/primera.jpeg', subtitle: 'HARDWARE FÍSICO' }
            ].map((cat, i) => (
              <div key={i} className="group cursor-pointer relative" onClick={() => navigate('/login')}>
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 border border-neutral-100">
                  <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-12 translate-y-4 group-hover:translate-y-0 transition-transform">
                      <span className="text-brand-cyan font-bold text-[10px] tracking-[0.5em] mb-4 block">{cat.subtitle}</span>
                      <h3 className="font-bold text-4xl text-white uppercase tracking-tighter">{cat.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="sucursales" className="py-40 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent opacity-[0.03]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            
            <div className="space-y-12">
              <div>
                  <span className="text-brand-cyan font-bold text-[10px] uppercase tracking-[0.4em] mb-6 block">EXPANSIÓN</span>
                  <h2 className="text-6xl font-bold tracking-tighter leading-[0.9] mb-12">
                    Nudos de <br/> Operación Salta.
                  </h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {[
                    { name: 'Sede Central Centro', addr: 'Dean Funes 123, Galería Paseo', type: 'Flagship Store' },
                    { name: 'Push Performance Norte', addr: 'Av. Juan B. Justo 4440', type: 'Distribución' },
                    { name: 'Terminal Logística Sur', addr: 'Parque Industrial, Nave 4', type: 'Warehouse' }
                ].map((suc, i) => (
                    <div key={i} className="group p-10 bg-neutral-800/20 border border-neutral-800 hover:border-brand-cyan/40 hover:bg-neutral-800/50 rounded-[2.5rem] transition-all cursor-pointer flex justify-between items-center overflow-hidden relative">
                        <div className="relative z-10">
                            <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest mb-3 block">{suc.type}</span>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors tracking-tight">{suc.name}</h3>
                            <p className="text-neutral-500 font-medium uppercase text-[10px] tracking-[0.2em]">{suc.addr}</p>
                        </div>
                        <div className="w-12 h-12 border border-neutral-700 rounded-full flex items-center justify-center group-hover:bg-brand-cyan group-hover:text-black transition-all relative z-10">
                            <ArrowRight2 size={24} variant="Bold" />
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-brand-cyan/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
              </div>
            </div>

            <div className="relative">
                <div className="aspect-[4/5] relative rounded-[4rem] overflow-hidden shadow-2xl border border-white/5 grayscale hover:grayscale-0 transition-all duration-1000">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] text-center max-w-sm">
                            <h4 className="text-2xl font-bold mb-6 tracking-tight leading-snug">Visualice nuestras sedes interactivas.</h4>
                            <button className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-brand-cyan transition-colors">
                                Desplegar Mapa
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-cyan/20 blur-[100px]"></div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-neutral-900 pt-40 pb-20 border-t border-neutral-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-24 mb-32">
            
            <div className="lg:col-span-2 space-y-12">
               <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-neutral-900 text-brand-cyan flex items-center justify-center font-bold text-3xl rounded-[1.5rem] shadow-xl">P</div>
                <h1 className="font-bold text-4xl tracking-tighter leading-none flex flex-col uppercase">
                    <span>PUSH SPORT</span>
                    <span className="text-[10px] tracking-[0.6em] text-neutral-300 mt-2 font-bold leading-none">OPERATIONS HUB</span>
                </h1>
              </div>
              <p className="text-neutral-400 font-medium max-w-sm text-xl leading-relaxed">
                Referente en la distribución de suplementación de alto nivel y gear deportivo funcional en el NOA.
              </p>
              <div className="flex gap-6 mt-12">
                  {[Shop, Activity, Headphone].map((Icon, i) => (
                      <div key={i} className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 hover:text-brand-cyan hover:bg-neutral-900 transition-all cursor-pointer">
                          <Icon size={20} variant="Bold" />
                      </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-[0.4em] text-[11px] text-neutral-900 mb-12">ECOSISTEMA</h4>
              <ul className="space-y-6 font-bold text-xs text-neutral-400 uppercase tracking-widest leading-none">
                {['Productos', 'Sedes Locales', 'Venta Mayorista', 'Staff Interno'].map(link => (
                    <li key={link}>
                        <a href="#" className="hover:text-brand-cyan hover:translate-x-2 transition-all inline-block">{link}</a>
                    </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-[0.4em] text-[11px] text-neutral-900 mb-12">CORPORATIVO</h4>
              <ul className="space-y-6 font-bold text-xs text-neutral-400 uppercase tracking-widest leading-none">
                {['Términos de Uso', 'Privacidad', 'Logística SSL', 'Copyright 2026'].map(link => (
                    <li key={link}>
                        <a href="#" className="hover:text-brand-cyan hover:translate-x-2 transition-all inline-block">{link}</a>
                    </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center py-12 border-t border-neutral-50 font-bold text-[10px] uppercase tracking-[0.4em] text-neutral-300">
            <p className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.4)]"></div>
                PUSH SPORT SALTA &middot; DESIGNED FOR PERFORMANCE
            </p>
            <div className="flex gap-12 mt-8 md:mt-0">
              <a href="#" className="hover:text-neutral-900 transition-colors">AR$ Pesos Argentinos</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Sistema v4.0</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
