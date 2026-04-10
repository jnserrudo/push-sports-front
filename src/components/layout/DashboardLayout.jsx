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
import { ThemeToggle } from '../ui/ThemeToggle';
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
    <div className="flex h-screen bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-[110] 
        flex flex-col bg-neutral-50 dark:bg-gray-800 border-r border-neutral-100 dark:border-gray-700 h-full 
        transition-all duration-500 ease-in-out overflow-hidden
        ${isSidebarOpen 
          ? 'w-[85vw] md:w-80 translate-x-0 md:translate-x-0' 
          : 'w-0 -translate-x-full md:w-20 md:translate-x-0 md:static'
        }
      `}>
        
        {/* Branding - Ultra Compacto */}
        <div className={`border-b border-neutral-100 dark:border-gray-700 flex flex-col items-center relative transition-all duration-500 ${isSidebarOpen ? 'p-2 md:p-3' : 'p-1.5 md:p-2'}`}>
            {/* Mobile Close Button - Elite Refinement */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-1 right-1 w-5 h-5 rounded-full bg-neutral-100 dark:bg-gray-700 flex items-center justify-center text-neutral-400 dark:text-gray-300 hover:text-brand-cyan dark:hover:text-cyan-400 hover:scale-110 active:scale-95 transition-all z-20"
            >
              <X size={12} strokeWidth={2.5} />
            </button>

            <div className={`bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 rounded-lg shadow-sm transition-all duration-500 mb-1
                ${isSidebarOpen ? 'w-8 h-8 md:w-10 md:h-10 p-1 md:p-2 md:rounded-xl md:mb-1' : 'w-7 h-7 p-1 md:rounded-lg'}
            `}>
                <img src="/icono.jpeg" alt="Push Sport" className="w-full h-full object-contain" />
            </div>

            <div className={`text-center transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 m-0'}`}>
                <h1 className="text-xs md:text-base font-black tracking-tight leading-none text-neutral-950 dark:text-white uppercase m-0">
                    PUSH<span className="text-brand-cyan dark:text-cyan-400">SPORT</span>
                </h1>
                <div className="text-[8px] md:text-xs font-black text-brand-cyan dark:text-cyan-400 uppercase tracking-[0.1em] md:tracking-[0.15em] mt-0 leading-none">
                    SALTA
                </div>
            </div>
        </div>

        {/* Navigation - Ultra Compacto */}
        <nav className="flex-1 overflow-y-auto py-1 md:py-2">
          <ul className={`space-y-0.5 md:space-y-1 ${isSidebarOpen ? 'px-2 md:px-3' : 'px-1.5 md:px-2'}`}>
            {filteredMenu.map((item) => {
              const isActive = item.path === '/dashboard'
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`flex items-center rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all group ${
                      isActive 
                        ? 'bg-neutral-900 dark:bg-cyan-600 text-brand-cyan dark:text-white shadow-md border-b-2 border-brand-cyan dark:border-cyan-400' 
                        : item.path === '/dashboard/usuarios' 
                          ? 'text-neutral-900 dark:text-gray-200 bg-brand-cyan/10 dark:bg-cyan-900/20 border border-brand-cyan/20 dark:border-cyan-700/30 hover:bg-brand-cyan dark:hover:bg-cyan-700 hover:text-black dark:hover:text-white'
                          : 'text-neutral-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 hover:shadow-sm'
                    } ${
                      isSidebarOpen 
                        ? 'gap-2 md:gap-3 px-2.5 md:px-3 py-1.5 md:py-2' 
                        : 'justify-center px-1.5 py-1.5 md:px-2 md:py-2'
                    }`}
                  >
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                        isActive ? 'text-brand-cyan dark:text-white' : item.path === '/dashboard/usuarios' ? 'bg-neutral-900 dark:bg-gray-700 text-white shadow-lg group-hover:bg-black dark:group-hover:bg-gray-600 group-hover:text-brand-cyan dark:group-hover:text-cyan-400' : 'bg-neutral-200 dark:bg-gray-600 text-neutral-600 dark:text-gray-300 group-hover:bg-black dark:group-hover:bg-gray-500 group-hover:text-white'
                    }`}>
                        <item.icon size={12} md:size={14} />
                    </div>
                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-[9px] md:text-[10px] ${isSidebarOpen ? 'w-auto opacity-100' : 'md:w-0 md:opacity-0'}`}>
                        {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer - Ultra Compacto */}
        <div className={`transition-all duration-500 ${isSidebarOpen ? 'p-2 md:p-3' : 'p-1.5 md:p-2'}`}>
            <div className={`bg-white dark:bg-gray-700 rounded-lg md:rounded-xl flex items-center border border-neutral-100 dark:border-gray-600 shadow-sm transition-all duration-500 overflow-hidden relative ${isSidebarOpen ? 'p-1.5 md:p-2 gap-2 md:gap-2' : 'p-1 md:p-1.5 justify-center'}`}>
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${roleBranding.bg}`} />
                <div className={`flex items-center justify-center font-black tracking-widest flex-shrink-0 transition-all duration-500 ${roleBranding.bg} ${roleBranding.text} ${isSidebarOpen ? 'w-6 h-6 md:w-7 md:h-7 text-[8px] md:text-[9px] rounded-md' : 'w-6 h-6 text-[8px] rounded-md'}`}>
                    {roleBranding.short}
                </div>
                <div className={`flex flex-col min-w-0 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 h-0'}`}>
                    <span className="font-black text-[8px] md:text-[9px] tracking-widest text-neutral-900 dark:text-white truncate uppercase">
                        {user?.nombre || 'PERSONAL'}
                    </span>
                    <div className="flex items-center gap-1 mt-0">
                        <div className={`w-1 h-1 rounded-full ${roleBranding.dot}`}></div>
                        <span className="text-[7px] font-black text-neutral-400 dark:text-gray-400 uppercase tracking-[0.1em]">
                            {roleBranding.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-white dark:bg-gray-900 transition-all duration-500">
        
        {/* HEADER */}
        <header className="h-12 md:h-16 bg-white dark:bg-gray-800 border-b border-neutral-100 dark:border-gray-700 flex items-center justify-between px-3 md:px-6 relative z-50 shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Architectural Toggle Button */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`
                    relative flex items-center justify-center
                    w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-300 border
                    ${isSidebarOpen 
                        ? 'bg-white dark:bg-gray-700 border-neutral-200 dark:border-gray-600 text-neutral-500 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-gray-600' 
                        : 'bg-black dark:bg-cyan-600 border-black dark:border-cyan-600 text-brand-cyan dark:text-white hover:shadow-md'
                    }
                `}
                title={isSidebarOpen ? "Cerrar Panel" : "Abrir Panel"}
            >
              <div className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isSidebarOpen ? <ChevronLeft size={18} strokeWidth={2.5} /> : <MenuIcon size={18} strokeWidth={2.5} />}
              </div>
              
              {/* Subtle indicator dot */}
              {!isSidebarOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-cyan rounded-full border border-black animate-pulse" />
              )}
            </button>
            <div className="h-6 md:h-8 w-px bg-neutral-100 dark:bg-gray-700 mx-1 md:mx-2 hidden sm:block"></div>
            <span className="text-[9px] md:text-xs font-black text-neutral-400 dark:text-gray-400 uppercase tracking-[0.2em] hidden lg:block">SISTEMA DE GESTIÓN</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-lg md:text-xl font-black tracking-tighter text-neutral-900 dark:text-white leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[7px] md:text-[8px] font-black text-brand-cyan dark:text-cyan-400 uppercase tracking-[0.3em]">EN VIVO</span>
            </div>
            
            <div className="flex items-center gap-2">
                <ThemeToggle />
                
                <div className="relative" ref={notificationsRef} onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                  <button 
                    onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); if (!isNotificationsOpen) loadNotifications(); }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border transition-all shadow-sm hover:scale-105 active:scale-95 ${isNotificationsOpen ? 'border-brand-cyan dark:border-cyan-400 bg-white dark:bg-gray-700' : 'border-neutral-100 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-neutral-900 dark:hover:border-gray-500'}`}
                  >
                      <Bell size={16} md:size={18} className="text-neutral-900 dark:text-gray-100" />
                      {unreadCount > 0 && (
                        <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-brand-cyan dark:bg-cyan-400 rounded-full border-2 border-white dark:border-gray-700" />
                      )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-[-60px] sm:right-0 mt-4 w-[90vw] sm:w-80 md:w-96 lg:w-[28rem] max-w-lg bg-white dark:bg-gray-800 border-2 md:border-4 border-neutral-100 dark:border-gray-700 rounded-3xl md:rounded-[2.5rem] shadow-2xl p-5 md:p-8 animate-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                      <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-neutral-100 dark:border-gray-700 pb-4">
                        <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-gray-400">Notificaciones</span>
                        <span onClick={handleClearNotifications} className="text-[10px] md:text-[11px] font-black text-brand-cyan dark:text-cyan-400 uppercase tracking-widest cursor-pointer hover:underline">Limpiar Todas</span>
                      </div>
                      <div className="space-y-2 md:space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {loadingNotifs ? (
                          <p className="text-[11px] md:text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-gray-400 text-center py-8">Cargando...</p>
                        ) : notifications.length === 0 ? (
                          <p className="text-[11px] md:text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-gray-400 text-center py-8">Sin notificaciones de sistema</p>
                        ) : notifications.slice(0, 5).map((n, i) => (
                          <div key={n.id_notificacion || i} className={`flex gap-3 md:gap-4 p-3 md:p-4 group cursor-pointer rounded-xl transition-all ${!n.leido ? 'bg-brand-cyan/5 dark:bg-cyan-900/20 border border-brand-cyan/20 dark:border-cyan-700/30' : 'hover:bg-neutral-50 dark:hover:bg-gray-700 border border-transparent'}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${n.tipo === 'VENTA' ? 'bg-emerald-500' : n.tipo === 'STOCK' ? 'bg-amber-500' : 'bg-brand-cyan'}`} />
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-bold text-neutral-900 dark:text-gray-100 leading-snug group-hover:text-brand-cyan dark:group-hover:text-cyan-400 transition-colors">{n.titulo}</p>
                                <p className="text-[10px] md:text-xs font-medium text-neutral-500 dark:text-gray-400 leading-relaxed mt-1">{n.mensaje}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/auditoria'); }}
                        className="w-full mt-4 md:mt-8 py-4 border-t-2 border-neutral-50 dark:border-gray-700 text-xs md:text-sm font-black text-neutral-400 dark:text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-neutral-900 dark:hover:text-white transition-colors bg-neutral-50/50 dark:bg-gray-700/50 hover:bg-neutral-100 dark:hover:bg-gray-600 rounded-xl"
                      >
                        Auditar historial completo
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative" ref={profileRef} onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm hover:scale-105 active:scale-95 ${isProfileOpen ? 'border-brand-cyan dark:border-cyan-400 bg-white dark:bg-gray-700' : 'border-neutral-100 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-neutral-900 dark:hover:border-gray-500'}`}
                  >
                      <UserIcon size={18} md:size={24} className="text-neutral-900 dark:text-gray-100" />
                  </button>

                  {isProfileOpen && (
              <div className="absolute right-0 mt-4 w-64 md:w-72 bg-white dark:bg-gray-800 border-2 border-neutral-100 dark:border-gray-700 rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100]" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                <div className="p-6 md:p-8 bg-neutral-50/50 dark:bg-gray-700/50 border-b border-neutral-100 dark:border-gray-700 relative overflow-hidden">
                  {/* Subtle role background blur */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 ${roleBranding.bg}`} />
                  <div className="flex items-center gap-4 md:gap-5 relative z-10">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black tracking-widest text-sm md:text-[15px] shadow-sm ${roleBranding.bg} ${roleBranding.text} ${roleBranding.ring}`}>
                      {roleBranding.short}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-xs md:text-sm uppercase tracking-wider truncate text-neutral-900 dark:text-white">{user?.nombre}</span>
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
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-all border border-transparent"
                        >
                          <UserIcon size={16} /> Perfil
                        </button>
                        <div className="h-px bg-neutral-100 dark:bg-gray-700 my-2 mx-2"></div>
                        <button 
                          onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center justify-center gap-4 px-4 py-4 rounded-xl bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg active:scale-95"
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-14 bg-neutral-50 dark:bg-gray-900 custom-scrollbar relative overflow-x-hidden">
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
