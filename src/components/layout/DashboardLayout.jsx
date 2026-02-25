import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Box, 
  Users, 
  MapPin, 
  Truck, 
  Wallet, 
  Ticket, 
  Activity, 
  LogOut, 
  Menu as MenuIcon,
  Bell,
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileTimeout = useRef(null);
  const notificationsTimeout = useRef(null);

  const handleProfileEnter = () => {
    if (profileTimeout.current) clearTimeout(profileTimeout.current);
    setIsProfileOpen(true);
  };

  const handleProfileLeave = () => {
    profileTimeout.current = setTimeout(() => setIsProfileOpen(false), 300);
  };

  const handleNotificationsEnter = () => {
    if (notificationsTimeout.current) clearTimeout(notificationsTimeout.current);
    setIsNotificationsOpen(true);
  };

  const handleNotificationsLeave = () => {
    notificationsTimeout.current = setTimeout(() => setIsNotificationsOpen(false), 300);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Visión General', icon: LayoutDashboard, path: '/dashboard', roles: [1, 2, 3] },
    { label: 'Terminal POS', icon: ShoppingCart, path: '/dashboard/pos', roles: [1, 2, 3] },
    { label: 'Inventario', icon: Box, path: '/dashboard/productos', roles: [1, 2] },
    { label: 'Operadores', icon: Users, path: '/dashboard/usuarios', roles: [1] },
    { label: 'Sucursales', icon: MapPin, path: '/dashboard/sucursales', roles: [1] },
    { label: 'Logística', icon: Truck, path: '/dashboard/envios', roles: [1, 2] },
    { label: 'Caja y Ventas', icon: Wallet, path: '/dashboard/liquidaciones', roles: [1, 2] },
    { label: 'Marketing', icon: Ticket, path: '/dashboard/ofertas', roles: [1] },
    { label: 'Auditoría', icon: Activity, path: '/dashboard/auditoria', roles: [1] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.id_rol));

  return (
    <div className="flex h-screen bg-white text-neutral-900 font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-[110] 
        flex flex-col bg-neutral-50 border-r border-neutral-100 h-full 
        transition-all duration-500 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>
        
        {/* Branding */}
        <div className="p-14 border-b border-neutral-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-white border-2 border-neutral-100 p-5 rounded-[2rem] shadow-sm mb-10 group-hover:scale-110 transition-transform duration-500">
                <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain invert" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter m-0 uppercase text-center leading-none">
               PushSport <br/>
               <span className="text-brand-cyan">Salta</span>
            </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-10">
          <ul className="px-6 space-y-4">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-5 px-6 py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all group ${
                      isActive 
                        ? 'bg-neutral-100 text-brand-cyan shadow-sm border border-neutral-200/50' 
                        : item.path === '/dashboard/usuarios' 
                          ? 'text-neutral-900 bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-soft'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isActive ? 'bg-brand-cyan text-black' : item.path === '/dashboard/usuarios' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-400 group-hover:bg-brand-cyan group-hover:text-black'
                    }`}>
                        <item.icon size={16} />
                    </div>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className="p-8">
            <div className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 border-4 border-neutral-100 shadow-soft">
                <div className="w-14 h-14 rounded-full bg-neutral-100 border-2 border-neutral-200 text-neutral-900 flex items-center justify-center font-black text-xl shadow-inner flex-shrink-0">
                    {user?.id_rol === 1 ? 'A' : user?.id_rol === 2 ? 'G' : 'V'}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-black text-sm uppercase tracking-wider truncate text-neutral-900">{user?.nombre || 'Personal'}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${user?.id_rol === 1 ? 'bg-brand-cyan shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'bg-neutral-300'}`}></div>
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            {user?.id_rol === 1 ? 'ADMIN PRINCIPAL' : 'GESTOR DE COMERCIO'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-white transition-all duration-500">
        
        {/* HEADER */}
        <header className="h-24 bg-white border-b-4 border-neutral-100 flex items-center justify-between px-10 relative z-50 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-4 bg-neutral-900 border-2 border-neutral-900 text-white hover:bg-black hover:scale-110 active:scale-95 rounded-2xl transition-all shadow-xl shadow-neutral-900/10 flex items-center justify-center min-w-[56px] min-h-[56px]"
                title={isSidebarOpen ? "Cerrar Panel" : "Abrir Panel"}
            >
              <MenuIcon size={24} className="text-white" />
            </button>
            <div className="h-10 w-1 bg-neutral-100 mx-4 hidden md:block"></div>
            <span className="text-sm font-black text-neutral-400 uppercase tracking-[0.5em] hidden md:block">SISTEMA DE GESTIÓN // PUSHSPORT</span>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-2xl font-black tracking-tighter text-neutral-900">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">SISTEMA EN VIVO</span>
            </div>
            
            <div className="relative" ref={notificationsRef} onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-md hover:scale-105 active:scale-95 ${isNotificationsOpen ? 'border-brand-cyan bg-white shadow-brand-cyan/20' : 'border-neutral-100 bg-white hover:border-neutral-900'}`}
              >
                  <Bell size={24} className="text-neutral-900" />
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-cyan rounded-full border-2 border-white"></div>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white border-4 border-neutral-100 rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Notificaciones Recientes</span>
                    <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest cursor-pointer hover:underline">Limpiar</span>
                  </div>
                  <div className="space-y-6">
                    {[
                      { type: 'VENTA', msg: 'Nueva venta registrada en Sede Centro', time: 'Hace 2 min', color: 'bg-emerald-500' },
                      { type: 'STOCK', msg: 'Stock bajo: Creatina Ena 300g', time: 'Hace 15 min', color: 'bg-amber-500' },
                      { type: 'ENVIO', msg: 'Envío #281 recibido correctamente', time: 'Hace 1 hora', color: 'bg-brand-cyan' }
                    ].map((n, i) => (
                      <div key={i} className="flex gap-4 p-2 group cursor-pointer">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.color}`}></div>
                        <div>
                            <p className="text-[11px] font-bold text-neutral-900 leading-snug group-hover:text-brand-cyan transition-colors">{n.msg}</p>
                            <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/auditoria'); }}
                    className="w-full mt-10 py-4 border-t-2 border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] hover:text-neutral-900 transition-colors"
                  >
                    Auditar historial completo
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative" ref={profileRef} onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-md hover:scale-105 active:scale-95 ${isProfileOpen ? 'border-brand-cyan bg-white shadow-brand-cyan/20' : 'border-neutral-100 bg-white hover:border-neutral-900'}`}
              >
                  <UserIcon size={24} className="text-neutral-900" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-white border-4 border-neutral-100 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                  <div className="p-8 bg-neutral-50 border-b-2 border-neutral-100">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-neutral-900 font-black text-xl shadow-inner">
                        {user?.id_rol === 1 ? 'A' : user?.id_rol === 2 ? 'G' : 'V'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-sm uppercase tracking-wider truncate text-neutral-900">{user?.nombre}</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            {user?.id_rol === 1 ? 'ADMINISTRADOR CENTRAL' : 'GESTOR DE COMERCIO'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/dashboard/perfil'); }}
                      className="w-full flex items-center gap-5 px-5 py-4 rounded-2xl hover:bg-neutral-50 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-all border border-transparent hover:border-neutral-100"
                    >
                      <UserIcon size={18} /> Ver Perfil
                    </button>
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/dashboard/configuracion'); }}
                      className="w-full flex items-center gap-5 px-5 py-4 rounded-2xl hover:bg-neutral-50 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-all border border-transparent hover:border-neutral-100"
                    >
                      <Activity size={18} /> Ajustes
                    </button>
                    <div className="h-0.5 bg-neutral-100 my-4 mx-4"></div>
                    <button 
                      onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center justify-center gap-5 px-5 py-5 rounded-2xl bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl shadow-red-500/20 active:scale-95"
                    >
                      <LogOut size={18} /> CERRAR SESIÓN SEGURA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-10 md:p-14 bg-neutral-50">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {(isSidebarOpen) && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[105]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
