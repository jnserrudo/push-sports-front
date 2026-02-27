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
  ChevronLeft,
  RotateCcw,
  CreditCard,
  ClipboardList
} from 'lucide-react';
import { X } from 'lucide-react'; // Explicit import to bypass HMR cache issues

import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/api';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileTimeout = useRef(null);
  const notificationsTimeout = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const unreadCount = notifications.filter(n => !n.leido).length;

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

  const loadNotifications = async () => {
    if (!user?.id_usuario) return;
    setLoadingNotifs(true);
    try {
      const res = await api.get(`/notificaciones/usuario/${user.id_usuario}`);
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleClearNotifications = async () => {
    try {
      // Marcar todas como leídas
      await api.patch('/notificaciones/leer-todas');
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
    } catch {
      // Si el endpoint no existe aún, simplemente las oculta localmente
      setNotifications([]);
    }
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
    { label: 'Visión General',  icon: LayoutDashboard, path: '/dashboard',              roles: [1, 2, 3] },
    { label: 'Terminal POS',    icon: ShoppingCart,    path: '/dashboard/pos',          roles: [1, 2, 3] },
    { label: 'Inventario',      icon: Box,             path: '/dashboard/productos',    roles: [1, 2, 3] },
    { label: 'Operadores',      icon: Users,           path: '/dashboard/usuarios',     roles: [1] },
    { label: 'Sucursales',      icon: MapPin,          path: '/dashboard/sucursales',   roles: [1] },
    { label: 'Traslados Stock', icon: Truck,           path: '/dashboard/envios',       roles: [1, 2] },
    { label: 'Movimientos',     icon: Activity,        path: '/dashboard/movimientos',  roles: [1, 2] },
    { label: 'Devoluciones',    icon: RotateCcw,       path: '/dashboard/devoluciones', roles: [1, 2, 3] },
    { label: 'Caja y Ventas',   icon: CreditCard,      path: '/dashboard/liquidaciones',roles: [1, 2] },
    { label: 'Marketing',       icon: Ticket,          path: '/dashboard/ofertas',      roles: [1] },
    { label: 'Auditoría',       icon: ClipboardList,   path: '/dashboard/auditoria',   roles: [1] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.id_rol));

  return (
    <div className="flex h-screen bg-white text-neutral-900 font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-[110] 
        flex flex-col bg-neutral-50 border-r border-neutral-100 h-full 
        transition-all duration-500 ease-in-out overflow-hidden
        ${isSidebarOpen 
          ? 'w-[85vw] md:w-80 translate-x-0 md:translate-x-0' 
          : 'w-0 -translate-x-full md:w-20 md:translate-x-0 md:static'
        }
      `}>
        
        {/* Branding */}
        <div className={`p-6 border-b border-neutral-100 flex flex-col items-center relative transition-all duration-500 ${isSidebarOpen ? 'md:p-14' : 'md:p-4'}`}>
            {/* Mobile Close Button - Elite Refinement */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-brand-cyan hover:scale-110 active:scale-95 transition-all z-20"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            <div className={`bg-white border-2 border-neutral-100 rounded-xl shadow-sm transition-all duration-500 mb-4
                ${isSidebarOpen ? 'w-12 h-12 md:w-24 md:h-24 p-2 md:p-5 md:rounded-[2rem] md:mb-10' : 'w-12 h-12 p-2 md:rounded-2xl'}
            `}>
                <img src="/icono.jpeg" alt="Push Sport" className="w-full h-full object-contain" />
            </div>

            <div className={`text-center transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 m-0'}`}>
                <h1 className="text-lg md:text-3xl font-black tracking-tight leading-none text-neutral-950 uppercase m-0">
                    PUSHS<span className="text-brand-cyan">PORT</span>
                </h1>
                <div className="text-xs md:text-xl font-black text-brand-cyan uppercase tracking-[0.1em] md:tracking-[0.2em] mt-0.5 leading-none">
                    SALTA
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 md:py-10">
          <ul className="px-4 md:px-6 space-y-2 md:space-y-4">
            {filteredMenu.map((item) => {
              const isActive = item.path === '/dashboard'
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`flex items-center gap-4 md:gap-5 px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all group ${
                      isActive 
                        ? 'bg-neutral-100 text-brand-cyan shadow-sm border border-neutral-200/50' 
                        : item.path === '/dashboard/usuarios' 
                          ? 'text-neutral-900 bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-soft'
                    } ${!isSidebarOpen && 'md:justify-center md:px-0'}`}
                  >
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${
                        isActive ? 'bg-brand-cyan text-black' : item.path === '/dashboard/usuarios' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-400 group-hover:bg-brand-cyan group-hover:text-black'
                    }`}>
                        <item.icon size={14} md:size={16} />
                    </div>
                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden md:block'}`}>
                        {item.label}
                    </span>
                    <span className="md:hidden">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className={`transition-all duration-500 ${isSidebarOpen ? 'p-4 md:p-8' : 'p-4 md:p-2'}`}>
            <div className={`bg-white rounded-2xl md:rounded-[2.5rem] flex items-center border-2 md:border-4 border-neutral-100 shadow-soft transition-all duration-500 ${isSidebarOpen ? 'p-4 md:p-6 gap-4 md:gap-6' : 'p-2 md:p-2 justify-center'}`}>
                <div className={`rounded-xl bg-neutral-950 text-white flex items-center justify-center font-sport shadow-inner flex-shrink-0 transition-all duration-500 ${isSidebarOpen ? 'w-10 h-10 md:w-14 md:h-14 text-sm md:text-xl' : 'w-10 h-10 text-sm'}`}>
                    {user?.id_rol === 1 ? 'A' : user?.id_rol === 2 ? 'G' : 'V'}
                </div>
                <div className={`flex flex-col min-w-0 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 h-0 hidden md:block'}`}>
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-neutral-900 truncate">
                        {user?.nombre || 'PERSONAL'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${user?.id_rol === 1 ? 'bg-brand-cyan shadow-[0_0_8px_rgba(0,210,255,0.8)]' : 'bg-neutral-300'}`}></div>
                        <span className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            {user?.id_rol === 1 ? 'ADMIN PRINCIPAL' : 'GESTOR'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-white transition-all duration-500">
        
        {/* HEADER */}
        <header className="h-16 md:h-24 bg-white border-b-2 md:border-b-4 border-neutral-100 flex items-center justify-between px-3 md:px-10 relative z-50 shadow-sm">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Architectural Toggle Button */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`
                    group relative p-2 md:p-3.5 
                    rounded-lg md:rounded-2xl border-2 transition-all duration-300
                    flex items-center justify-center min-w-[40px] min-h-[40px] md:min-w-[52px] md:min-h-[52px]
                    ${isSidebarOpen 
                        ? 'bg-neutral-50 border-neutral-100 text-neutral-400 hover:text-neutral-900 hover:border-neutral-200' 
                        : 'bg-white border-brand-cyan/20 text-brand-cyan shadow-[0_4px_12px_-4px_rgba(0,210,255,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(0,210,255,0.5)] hover:bg-neutral-50 hover:border-brand-cyan'
                    }
                `}
                title={isSidebarOpen ? "Cerrar Panel" : "Abrir Panel"}
            >
              <div className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isSidebarOpen ? <ChevronLeft size={20} md:size={22} strokeWidth={2.5} /> : <MenuIcon size={20} md:size={22} strokeWidth={2.5} />}
              </div>
              
              {/* Subtle indicator dot */}
              {!isSidebarOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-cyan rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
            <div className="h-8 md:h-10 w-px bg-neutral-100 mx-2 md:mx-4 hidden sm:block"></div>
            <span className="text-[10px] md:text-sm font-black text-neutral-400 uppercase tracking-[0.3em] md:tracking-[0.5em] hidden lg:block">SISTEMA DE GESTIÓN // PUSHSPORT</span>
          </div>

          <div className="flex items-center gap-4 md:gap-10">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-neutral-900 leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[8px] md:text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em] mt-1">SISTEMA EN VIVO</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
                <div className="relative" ref={notificationsRef} onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                  <button 
                    onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); if (!isNotificationsOpen) loadNotifications(); }}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm hover:scale-105 active:scale-95 ${isNotificationsOpen ? 'border-brand-cyan bg-white' : 'border-neutral-100 bg-white hover:border-neutral-900'}`}
                  >
                      <Bell size={18} md:size={24} className="text-neutral-900" />
                      {unreadCount > 0 && (
                        <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-brand-cyan rounded-full border-2 border-white" />
                      )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white border-4 border-neutral-100 rounded-3xl md:rounded-[2.5rem] shadow-2xl p-6 md:p-8 animate-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                      <div className="flex justify-between items-center mb-6 md:mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Notificaciones</span>
                        <span onClick={handleClearNotifications} className="text-[9px] font-black text-brand-cyan uppercase tracking-widest cursor-pointer hover:underline">Limpiar</span>
                      </div>
                      <div className="space-y-4 md:space-y-6">
                        {loadingNotifs ? (
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center py-4">Cargando...</p>
                        ) : notifications.length === 0 ? (
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center py-4">Sin notificaciones</p>
                        ) : notifications.slice(0, 5).map((n, i) => (
                          <div key={n.id_notificacion || i} className={`flex gap-3 md:gap-4 p-2 group cursor-pointer rounded-lg ${!n.leido ? 'bg-brand-cyan/5' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.tipo === 'VENTA' ? 'bg-emerald-500' : n.tipo === 'STOCK' ? 'bg-amber-500' : 'bg-brand-cyan'}`} />
                            <div>
                                <p className="text-[10px] md:text-[11px] font-bold text-neutral-900 leading-snug group-hover:text-brand-cyan transition-colors">{n.titulo}</p>
                                <p className="text-[9px] font-medium text-neutral-500 leading-snug">{n.mensaje}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/auditoria'); }}
                        className="w-full mt-6 md:mt-10 py-4 border-t-2 border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] hover:text-neutral-900 transition-colors"
                      >
                        Auditar historial
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative" ref={profileRef} onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm hover:scale-105 active:scale-95 ${isProfileOpen ? 'border-brand-cyan bg-white' : 'border-neutral-100 bg-white hover:border-neutral-900'}`}
                  >
                      <UserIcon size={18} md:size={24} className="text-neutral-900" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-4 w-64 md:w-72 bg-white border-4 border-neutral-100 rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                      <div className="p-6 md:p-8 bg-neutral-50 border-b-2 border-neutral-100">
                        <div className="flex items-center gap-4 md:gap-5">
                          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-neutral-900 font-black text-sm md:text-xl shadow-inner">
                            {user?.id_rol === 1 ? 'A' : user?.id_rol === 2 ? 'G' : 'V'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-xs md:text-sm uppercase tracking-wider truncate text-neutral-900">{user?.nombre}</span>
                            <span className="text-[8px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest truncate">
                                {user?.id_rol === 1 ? 'ADMIN' : 'GESTOR'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-6 space-y-1 md:space-y-2">
                        <button 
                          onClick={() => { setIsProfileOpen(false); navigate('/dashboard/perfil'); }}
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-neutral-50 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-all border border-transparent"
                        >
                          <UserIcon size={16} /> Perfil
                        </button>
                        <div className="h-px bg-neutral-100 my-2 mx-2"></div>
                        <button 
                          onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center justify-center gap-4 px-4 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg active:scale-95"
                        >
                          <LogOut size={16} /> CERRAR SESIÓN
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-0 md:p-10 lg:p-14 bg-neutral-50 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-4">
                <Outlet />
            </div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[105]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
