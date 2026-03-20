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
  ClipboardList,
  Package,
  Component,
  Tag
} from 'lucide-react';
import { X } from 'lucide-react'; // Explicit import to bypass HMR cache issues
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate, useLocation, Link, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/api';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileTimeout = useRef(null);
  const notificationsTimeout = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.leido).length;

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
    loadNotifications();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user?.id_usuario]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Visión General',    icon: LayoutDashboard, path: '/dashboard',                roles: [1, 2, 3] },
    { label: 'Terminal POS',      icon: ShoppingCart,    path: '/dashboard/pos',            roles: [1, 2, 3] },
    { label: 'Catálogo Base',     icon: Package,         path: '/dashboard/productos',      roles: [1] },
    { label: 'Categorías',        icon: Component,       path: '/dashboard/categorias',     roles: [1] },
    { label: 'Marcas',            icon: Tag,             path: '/dashboard/marcas',         roles: [1] },
    { label: 'Stock por Sede',    icon: Box,             path: '/dashboard/inventario',     roles: [1, 2, 3] },
    { label: 'Operadores',        icon: Users,           path: '/dashboard/usuarios',       roles: [1] },
    { label: 'Sucursales',        icon: MapPin,          path: '/dashboard/sucursales',     roles: [1] },
    { label: 'Tipos de Sede',     icon: Wallet,          path: '/dashboard/tipos-comercio', roles: [1] },
    { label: 'Ingresar Stock',    icon: Truck,           path: '/dashboard/envios',         roles: [1] },
    { label: 'Movimientos',       icon: Activity,        path: '/dashboard/movimientos',    roles: [1, 2] },
    { label: 'Reportería',        icon: ClipboardList,   path: '/dashboard/reporteria',     roles: [1] },
    { label: 'Devoluciones',      icon: RotateCcw,       path: '/dashboard/devoluciones',   roles: [1, 2, 3] },
    { label: 'Liquidaciones',     icon: CreditCard,      path: '/dashboard/liquidaciones',  roles: [1, 2] },
    { label: 'Descuentos',        icon: Ticket,          path: '/dashboard/descuentos',     roles: [1] },
    { label: 'Combos',            icon: Package,         path: '/dashboard/combos',         roles: [1] },
    { label: 'Ofertas',           icon: Ticket,          path: '/dashboard/ofertas',        roles: [1] },
    { label: 'Proveedores',       icon: Truck,           path: '/dashboard/proveedores',    roles: [1] },
    { label: 'Auditoría',         icon: Activity,        path: '/dashboard/auditoria',      roles: [1] },
  ];

  const getRoleBranding = (roleId) => {
    switch(roleId) {
        case 1: return { short: 'AD', name: 'ADMINISTRADOR', dot: 'bg-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.6)]', ring: 'ring-brand-cyan/20 ring-2', bg: 'bg-brand-cyan', text: 'text-black' };
        case 2: return { short: 'SU', name: 'SUPERVISOR', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]', ring: 'ring-amber-400/20 ring-2', bg: 'bg-amber-400', text: 'text-black' };
        default: return { short: 'VD', name: 'VENDEDOR', dot: 'bg-neutral-400', ring: 'border-neutral-200 border-2', bg: 'bg-neutral-800', text: 'text-white' };
    }
  };
  const roleBranding = getRoleBranding(user?.id_rol);

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.id_rol));

  // Autorización estricta por ruta temporal
  const currentPath = location.pathname;
  const currentMenuItem = menuItems.find(item => 
    item.path === '/dashboard' ? currentPath === '/dashboard' : currentPath.startsWith(item.path)
  );
  
  // Si la ruta está en el menú y el usuario no tiene rol, se bloquea.
  const isAuthorized = currentMenuItem ? currentMenuItem.roles.includes(user?.id_rol) : true;

  // Guardia de seguridad maestro: Si no hay usuario (ej. después de Cerrar Sesión), abortar render y salir.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
                    PUSH<span className="text-brand-cyan">SPORT</span>
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
                    className={`flex items-center gap-4 md:gap-5 px-4 md:px-6 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all group ${
                      isActive 
                        ? 'bg-neutral-900 text-brand-cyan shadow-md border-b-2 border-brand-cyan' 
                        : item.path === '/dashboard/usuarios' 
                          ? 'text-neutral-900 bg-brand-cyan/10 border border-brand-cyan/20 hover:bg-brand-cyan hover:text-black'
                          : 'text-neutral-700 hover:text-black hover:bg-neutral-100 hover:shadow-sm'
                    } ${!isSidebarOpen && 'md:justify-center md:px-0'}`}
                  >
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${
                        isActive ? 'text-brand-cyan' : item.path === '/dashboard/usuarios' ? 'bg-neutral-900 text-white shadow-lg group-hover:bg-black group-hover:text-brand-cyan' : 'bg-neutral-200 text-neutral-600 group-hover:bg-black group-hover:text-white'
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
            <div className={`bg-white rounded-2xl md:rounded-[2.5rem] flex items-center border-[3px] border-neutral-50 shadow-sm transition-all duration-500 overflow-hidden relative ${isSidebarOpen ? 'p-4 md:p-6 gap-4 md:gap-6' : 'p-2 md:p-2 justify-center'}`}>
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${roleBranding.bg}`} />
                <div className={`flex items-center justify-center font-black tracking-widest flex-shrink-0 transition-all duration-500 ${roleBranding.bg} ${roleBranding.text} ${isSidebarOpen ? 'w-10 h-10 md:w-14 md:h-14 text-[10px] md:text-sm rounded-xl md:rounded-2xl' : 'w-10 h-10 text-[10px] rounded-xl'}`}>
                    {roleBranding.short}
                </div>
                <div className={`flex flex-col min-w-0 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 h-0 hidden md:block'}`}>
                    <span className="font-black text-[10px] md:text-xs tracking-widest text-neutral-900 truncate uppercase">
                        {user?.nombre || 'PERSONAL'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${roleBranding.dot}`}></div>
                        <span className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            {roleBranding.name}
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
                    relative flex items-center justify-center
                    w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-300 border
                    ${isSidebarOpen 
                        ? 'bg-white border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50 shadow-sm' 
                        : 'bg-black border-black text-brand-cyan shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    }
                `}
                title={isSidebarOpen ? "Cerrar Panel" : "Abrir Panel"}
            >
              <div className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isSidebarOpen ? <ChevronLeft size={20} strokeWidth={2.5} /> : <MenuIcon size={20} strokeWidth={2.5} />}
              </div>
              
              {/* Subtle indicator dot */}
              {!isSidebarOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-cyan rounded-full border-2 border-black animate-pulse" />
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
                    <div className="absolute right-[-60px] sm:right-0 mt-4 w-[90vw] sm:w-80 md:w-96 lg:w-[28rem] max-w-lg bg-white border-2 md:border-4 border-neutral-100 rounded-3xl md:rounded-[2.5rem] shadow-2xl p-5 md:p-8 animate-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                      <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-neutral-100 pb-4">
                        <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-neutral-400">Notificaciones</span>
                        <span onClick={handleClearNotifications} className="text-[10px] md:text-[11px] font-black text-brand-cyan uppercase tracking-widest cursor-pointer hover:underline">Limpiar Todas</span>
                      </div>
                      <div className="space-y-2 md:space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {loadingNotifs ? (
                          <p className="text-[11px] md:text-xs font-black uppercase tracking-widest text-neutral-400 text-center py-8">Cargando...</p>
                        ) : notifications.length === 0 ? (
                          <p className="text-[11px] md:text-xs font-black uppercase tracking-widest text-neutral-400 text-center py-8">Sin notificaciones de sistema</p>
                        ) : notifications.slice(0, 5).map((n, i) => (
                          <div key={n.id_notificacion || i} className={`flex gap-3 md:gap-4 p-3 md:p-4 group cursor-pointer rounded-xl transition-all ${!n.leido ? 'bg-brand-cyan/5 border border-brand-cyan/20' : 'hover:bg-neutral-50 border border-transparent'}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${n.tipo === 'VENTA' ? 'bg-emerald-500' : n.tipo === 'STOCK' ? 'bg-amber-500' : 'bg-brand-cyan'}`} />
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-bold text-neutral-900 leading-snug group-hover:text-brand-cyan transition-colors">{n.titulo}</p>
                                <p className="text-[10px] md:text-xs font-medium text-neutral-500 leading-relaxed mt-1">{n.mensaje}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/auditoria'); }}
                        className="w-full mt-4 md:mt-8 py-4 border-t-2 border-neutral-50 text-xs md:text-sm font-black text-neutral-400 uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-neutral-900 transition-colors bg-neutral-50/50 hover:bg-neutral-100 rounded-xl"
                      >
                        Auditar historial completo
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
              <div className="absolute right-0 mt-4 w-64 md:w-72 bg-white border-2 border-neutral-100 rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                <div className="p-6 md:p-8 bg-neutral-50/50 border-b border-neutral-100 relative overflow-hidden">
                  {/* Subtle role background blur */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 ${roleBranding.bg}`} />
                  <div className="flex items-center gap-4 md:gap-5 relative z-10">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black tracking-widest text-sm md:text-[15px] shadow-sm ${roleBranding.bg} ${roleBranding.text} ${roleBranding.ring}`}>
                      {roleBranding.short}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-xs md:text-sm uppercase tracking-wider truncate text-neutral-900">{user?.nombre}</span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] truncate mt-1 ${
                          user?.id_rol === 1 ? 'text-brand-cyan' : user?.id_rol === 2 ? 'text-amber-500' : 'text-neutral-500'
                      }`}>
                          {roleBranding.name}
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-14 bg-neutral-50 custom-scrollbar relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-4">
                {isAuthorized ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <Outlet />
                    </motion.div>
                  </AnimatePresence>
                ) : <Navigate to="/dashboard" replace />}
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
