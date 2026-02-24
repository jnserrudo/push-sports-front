import React from 'react';
import { ArrowRight, Zap, Shield, Star, Menu, ChevronRight } from 'lucide-react';
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
      <nav className="border-b border-neutral-100 p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl rounded-xl shadow-premium">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tight leading-none flex flex-col">
            <span>PUSH SPORT</span>
            <span className="text-[9px] tracking-[0.4em] text-neutral-400 font-bold mt-1">SALTA CAPITAL</span>
          </h1>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-xs uppercase tracking-widest text-neutral-500">
          <button onClick={() => handleScrollTo('categorias')} className="hover:text-brand-cyan transition-colors">Productos</button>
          <button onClick={() => handleScrollTo('sucursales')} className="hover:text-brand-cyan transition-colors">Sucursales</button>
          <button onClick={() => navigate('/login')} className="hover:text-brand-cyan transition-colors">Sistema</button>
        </div>

        <div className="flex items-center gap-4">
          <button 
                onClick={() => navigate('/login')}
                className="btn-cyan px-6 py-2.5 text-xs"
            >
            Ingresar
          </button>
          <button className="md:hidden p-2 hover:bg-neutral-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-white overflow-hidden pb-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-50/50 -skew-x-12 transform origin-top translate-x-1/4"></div>
        
        <div className="container mx-auto px-6 py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="lg:w-1/2 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 bg-neutral-100 px-4 py-1.5 rounded-full mb-10">
                <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Salta Capital / Sede Central</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-neutral-900 leading-[1.1] mb-8">
              EL PODER DE <br />
              <span className="text-brand-cyan">TUS RESULTADOS.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-500 max-w-xl mb-12 leading-relaxed">
              Suplementación premium e indumentaria de alto rendimiento diseñada para atletas que buscan la excelencia en cada entrenamiento.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <button 
                  className="btn-premium flex items-center justify-center gap-3 group"
                  onClick={() => navigate('/login')}
              >
                Ver Catálogo <Zap fill="currentColor" size={18} className="text-brand-cyan" />
              </button>
              <button 
                  onClick={() => handleScrollTo('sucursales')}
                  className="px-8 py-3.5 bg-white border border-neutral-200 font-bold rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                >
                Nuestras Sedes <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-20 flex items-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold">10k+</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Atletas</span>
                </div>
                <div className="h-10 w-px bg-neutral-200"></div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold">15+</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Marcas</span>
                </div>
                <div className="h-10 w-px bg-neutral-200"></div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold">24h</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Entrega</span>
                </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative group">
             <div className="absolute -inset-4 bg-brand-cyan/10 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-neutral-100">
                <img src="/primera.jpeg" alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-white">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-2">Nueva Colección</p>
                        <h4 className="text-2xl font-bold uppercase tracking-tight">Performance Elite</h4>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <ArrowRight size={20} />
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* CORE FEATURES */}
      <section className="py-32 bg-neutral-50/50">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Zap, title: 'Envíos Rápidos', text: 'Entregas en el día dentro de Salta Capital.' },
                { icon: Shield, title: 'Calidad Asegurada', text: 'Productos 100% originales con garantía oficial.' },
                { icon: Star, title: 'Asesoramiento', text: 'Expertos listos para ayudarte en tu compra.' }
              ].map((item, i) => (
                <div key={i} className="card-premium p-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-neutral-100 text-brand-cyan flex items-center justify-center rounded-2xl mb-8 group-hover:bg-brand-cyan group-hover:text-white transition-all">
                        <item.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
          </div>
      </section>

      {/* CATEGORIES GRID */}
      <section id="categorias" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div>
                 <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Nuestras Categorías</h2>
                 <p className="text-neutral-500 font-medium">Equipamiento diseñado para sobrepasar límites.</p>
            </div>
            <button 
                onClick={() => navigate('/login')}
                className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-brand-cyan transition-colors flex items-center gap-3"
            >
                Explorar Todo <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: 'Suplementos', img: '/segunda.jpeg', subtitle: 'Nutrición Premium' },
                { title: 'Indumentaria', img: '/icono.jpeg', subtitle: 'Performance Gear' },
                { title: 'Accesorios', img: '/primera.jpeg', subtitle: 'Equipamiento' }
            ].map((cat, i) => (
              <div key={i} className="group cursor-pointer" onClick={() => navigate('/login')}>
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-neutral-100">
                  <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-10">
                      <p className="text-brand-cyan font-bold text-[10px] tracking-[0.4em] mb-3 uppercase">{cat.subtitle}</p>
                      <h3 className="font-bold text-3xl text-white uppercase tracking-tight">{cat.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="sucursales" className="py-32 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-neutral-900 to-transparent"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            <div>
              <div className="inline-flex bg-brand-cyan/20 px-4 py-1.5 rounded-full mb-8">
                  <span className="text-brand-cyan font-bold text-[10px] uppercase tracking-widest">Encuéntranos</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-16 leading-tight">
                Estamos cerca <br/> de tu entrenamiento.
              </h2>
              <div className="space-y-6">
                {[
                    { name: 'Push Centro', addr: 'Dean Funes 123, Local 4' },
                    { name: 'Push Norte', addr: 'Av. Bicentenario 444' },
                    { name: 'Push Sur', addr: 'Av. Ex Combatientes 999' }
                ].map((suc, i) => (
                    <div key={i} className="group p-8 border border-neutral-800 hover:border-brand-cyan/50 hover:bg-neutral-800/50 rounded-2xl transition-all cursor-pointer flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-brand-cyan transition-colors">{suc.name}</h3>
                            <p className="text-neutral-500 font-medium uppercase text-xs tracking-widest">{suc.addr}</p>
                        </div>
                        <div className="w-10 h-10 border border-neutral-700 rounded-xl flex items-center justify-center group-hover:bg-brand-cyan group-hover:text-black transition-all">
                            <ArrowRight size={18} />
                        </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="aspect-video relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-cyan/10">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] flex items-center justify-center">
                    <button className="px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full shadow-2xl hover:scale-105 transition-transform">
                        Ver Mapa Interactivo
                    </button>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-neutral-900 pt-32 pb-16 border-t border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-24">
            
            <div className="lg:col-span-2">
               <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-bold text-2xl rounded-2xl shadow-premium">P</div>
                <h1 className="font-bold text-4xl tracking-tight leading-none flex flex-col uppercase">
                    <span>PUSH SPORT</span>
                    <span className="text-[10px] tracking-[0.6em] text-neutral-400 mt-2 font-bold">SALTA CAPITAL</span>
                </h1>
              </div>
              <p className="text-neutral-400 font-medium max-w-md text-lg leading-relaxed">
                Llevando el rendimiento al siguiente nivel. Suplementación y gear profesional para atletas exigentes.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] text-neutral-400 mb-10">Shop</h4>
              <ul className="space-y-4 font-bold text-sm text-neutral-600">
                {['Proteínas', 'Creatinas', 'Indumentaria', 'Accesorios'].map(link => (
                    <li key={link}>
                        <a href="#" className="hover:text-brand-cyan transition-colors">{link}</a>
                    </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] text-neutral-400 mb-10">Contacto</h4>
              <ul className="space-y-4 font-bold text-sm text-neutral-600">
                {['Instagram', 'WhatsApp', 'Ubicación Central', 'Atención'].map(link => (
                    <li key={link}>
                        <a href="#" className="hover:text-brand-cyan transition-colors">{link}</a>
                    </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center py-10 border-t border-neutral-50 font-bold text-[10px] uppercase tracking-widest text-neutral-300">
            <p>&copy; 2026 PUSH SPORT SALTA • MODERN RETAIL</p>
            <div className="flex gap-10 mt-6 md:mt-0">
              <a href="#" className="hover:text-neutral-500 transition-colors">Legales</a>
              <a href="#" className="hover:text-neutral-500 transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
