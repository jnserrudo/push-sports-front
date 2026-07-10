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
  Tag,
  CalendarDays,
  AlertTriangle,
  Eye,
  Clock,
  MessageSquare,
  X,
  Shield,
  UserCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate, useLocation, Link, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import NotificationBadge from '../admin/NotificationBadge';
import ImpersonationSelector from '../admin/ImpersonationSelector';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { formatearTipoNotificacion, getColorTipoNotificacion } from '../../utils/notificationFormatter';
import { impersonationService } from '../../services/impersonationService';

const DashboardLayout = () => {
  const { user, logout, isImpersonating, impersonatedUser, realUser, stopImpersonation } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [isModalNotificacionOpen, setIsModalNotificacionOpen] = useState(false);
  const [notificationView, setNotificationView] = useState('current'); // 'current' o 'real'
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileTimeout = useRef(null);
  const notificationsTimeout = useRef(null);
  const mainContentRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.leido).length;

  // Resetea el scroll al cambiar de ruta
  useEffect(() => {
    if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  const loadNotifications = async (viewAs = notificationView) => {
    if (!user?.id_usuario) return;
    setLoadingNotifs(true);
    try {
      // Si hay impersonación, agregar parámetro view_as
      const params = isImpersonating && viewAs ? `?view_as=${viewAs}` : '';
      const res = await api.get(`/notificaciones/usuario/${user.id_usuario}${params}`);
      console.log('Notificaciones recibidas:', res.data);
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

  const handleStopImpersonation = async () => {
    try {
      const response = await impersonationService.stopImpersonation();
      stopImpersonation(response.user, response.token);
      toast.success('Impersonación detenida');
    } catch (error) {
      console.error('Error al detener impersonación:', error);
      toast.error('Error al detener impersonación');
    }
  };

  const menuItems = [
    { label: 'Visión General',    icon: LayoutDashboard, path: '/dashboard',                roles: [1, 2, 3] },
    { label: 'Registrar Ventas',  icon: ShoppingCart,    path: '/dashboard/ventas',            roles: [1, 2, 3] },
    { label: 'Productos',         icon: Package,         path: '/dashboard/productos',      roles: [1] },
    { label: 'Categorías',        icon: Component,       path: '/dashboard/categorias',     roles: [1] },
    { label: 'Marcas',            icon: Tag,             path: '/dashboard/marcas',         roles: [1] },
    { label: 'Códigos Prod.',     icon: Tag,             path: '/dashboard/codigos-producto', roles: [1] },
    { label: 'Inventario',        icon: Box,             path: '/dashboard/inventario',     roles: [1, 2, 3] },
    { label: 'Usuarios',          icon: Users,           path: '/dashboard/usuarios',       roles: [1] },
    { label: 'Sucursales',        icon: MapPin,          path: '/dashboard/sucursales',     roles: [1] },
    { label: 'Tipos de Sede',     icon: Wallet,          path: '/dashboard/tipos-comercio', roles: [1] },
    { label: 'Envíos a Sucursales',icon: Truck,          path: '/dashboard/envios',         roles: [1] },
    { label: 'Movimientos de Stock',icon: Activity,     path: '/dashboard/movimientos',    roles: [1, 2] },
    { label: 'Reportería',        icon: ClipboardList,   path: '/dashboard/reporteria',     roles: [1] },
    { label: 'Devoluciones',      icon: RotateCcw,       path: '/dashboard/devoluciones',   roles: [1, 2, 3] },
    { label: 'Consultas Web',    icon: MessageSquare,    path: '/dashboard/consultas',      roles: [1, 2, 3] },
    { label: 'Rectificaciones',   icon: AlertTriangle,   path: '/dashboard/rectificaciones',roles: [1, 2, 3] },
    { label: 'Liquidaciones',     icon: CreditCard,      path: '/dashboard/liquidaciones',  roles: [1, 2] },
    { label: 'Descuentos',        icon: Ticket,          path: '/dashboard/descuentos',     roles: [1] },
    { label: 'Eventos & Campañas',icon: CalendarDays,    path: '/dashboard/eventos',        roles: [1] },
    { label: 'Combos',            icon: Package,         path: '/dashboard/combos',         roles: [1] },
    { label: 'Ofertas',           icon: Ticket,          path: '/dashboard/ofertas',        roles: [1] },
    { label: 'Proveedores',       icon: Truck,          path: '/dashboard/proveedores',    roles: [1] },
    { label: 'Auditoría',         icon: Activity,        path: '/dashboard/auditoria',      roles: [1] },
  ];

  const getRoleBranding = (roleId) => {
    switch(roleId) {
        case 1: return { short: 'AD', name: 'ADMINISTRADOR', dot: 'bg-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.6)]', ring: 'ring-brand-cyan/20 ring-2', bg: 'bg-brand-cyan', text: 'text-black' };
        case 2: return { short: 'SU', name: 'SUPERVISOR', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]', ring: 'ring-amber-400/20 ring-2', bg: 'bg-amber-400', text: 'text-black' };
        case 3: return { short: 'VD', name: 'VENDEDOR', dot: 'bg-neutral-400', ring: 'border-neutral-200 border-2', bg: 'bg-neutral-800', text: 'text-white' };
        case 4: return { short: 'CL', name: 'CLIENTE', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]', ring: 'ring-green-500/20 ring-2', bg: 'bg-green-500', text: 'text-white' };
        default: return { short: '??', name: 'DESCONOCIDO', dot: 'bg-red-500', ring: 'border-red-200 border-2', bg: 'bg-neutral-800', text: 'text-white' };
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

  // Guardia B2C: Si el usuario es un cliente (rol 4), sacarlo del framework admin y mandarlo al portal.
  if (user.id_rol === 4) {
    return <Navigate to="/shop" replace />;
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

            <div className={`bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 rounded-full shadow-sm transition-all duration-500 mb-1 flex items-center justify-center overflow-hidden
                ${isSidebarOpen ? 'w-8 h-8 md:w-10 md:h-10' : 'w-7 h-7'}
            `}>
                <img src="/icono_new.jpeg" alt="Push Sport" className="w-full h-full object-cover scale-110" style={{objectPosition: '50% 60%'}} />
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
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`flex items-center rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all group ${
                      isActive 
                        ? 'bg-neutral-900 dark:bg-cyan-600 text-brand-cyan dark:text-white shadow-md border-b-2 border-brand-cyan dark:border-cyan-400' 
                        : 'text-neutral-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-700 hover:shadow-sm'
                    } ${
                      isSidebarOpen 
                        ? 'gap-2 md:gap-3 px-2.5 md:px-3 py-1.5 md:py-2' 
                        : 'justify-center px-1.5 py-1.5 md:px-2 md:py-2'
                    }`}
                  >
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                        isActive ? 'text-brand-cyan dark:text-white' : 'bg-neutral-200 dark:bg-gray-600 text-neutral-600 dark:text-gray-300 group-hover:bg-black dark:group-hover:bg-gray-500 group-hover:text-white'
                    }`}>
                        <item.icon size={12} className="md:w-3.5 md:h-3.5" />
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
            {/* Selector de impersonación - solo visible para admin cuando no está impersonando */}
            {user?.id_rol === 1 && !isImpersonating && (
              <div className="block lg:hidden">
                <ImpersonationSelector />
              </div>
            )}

            <div className="hidden sm:flex flex-col items-end">
                <span className="text-lg md:text-xl font-black tracking-tighter text-neutral-900 dark:text-white leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
{/*                 <span className="text-[7px] md:text-[8px] font-black text-brand-cyan dark:text-cyan-400 uppercase tracking-[0.3em]">EN VIVO</span>
 */}            </div>
            
            {/* Selector de impersonación - versión desktop */}
            {user?.id_rol === 1 && !isImpersonating && (
              <div className="hidden lg:block">
                <ImpersonationSelector />
              </div>
            )}
            
            <div className="flex items-center gap-2">
                <ThemeToggle />
                
                <div className="relative" ref={notificationsRef} onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                  <button 
                    onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); if (!isNotificationsOpen) loadNotifications(); }}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center border transition-all shadow-sm hover:scale-105 active:scale-95 ${isNotificationsOpen ? 'border-brand-cyan dark:border-cyan-400 bg-white dark:bg-gray-700' : 'border-neutral-100 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-neutral-900 dark:hover:border-gray-500'}`}
                  >
                      <Bell size={16} className="text-neutral-900 dark:text-gray-100" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-[-60px] sm:right-0 mt-3 w-[90vw] sm:w-80 md:w-96 max-w-md bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[70]" onMouseEnter={handleNotificationsEnter} onMouseLeave={handleNotificationsLeave}>
                      <div className="bg-neutral-50 dark:bg-gray-900 px-4 py-3 border-b border-neutral-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black uppercase tracking-wide text-neutral-700 dark:text-neutral-200">Notificaciones</span>
                          <button onClick={handleClearNotifications} className="text-[10px] font-bold text-brand-cyan dark:text-cyan-400 uppercase tracking-wide hover:underline">
                            Limpiar
                          </button>
                        </div>
                        {isImpersonating && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setNotificationView('current'); loadNotifications('current'); }}
                              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wide transition-all ${
                                notificationView === 'current'
                                  ? 'bg-neutral-900 dark:bg-cyan-600 text-brand-cyan dark:text-white'
                                  : 'bg-white dark:bg-gray-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-gray-700 border border-neutral-200 dark:border-gray-600'
                              }`}
                            >
                              <UserCircle2 size={11} />
                              <span className="truncate">{impersonatedUser?.nombre}</span>
                            </button>
                            <button
                              onClick={() => { setNotificationView('real'); loadNotifications('real'); }}
                              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wide transition-all ${
                                notificationView === 'real'
                                  ? 'bg-neutral-900 dark:bg-cyan-600 text-brand-cyan dark:text-white'
                                  : 'bg-white dark:bg-gray-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-gray-700 border border-neutral-200 dark:border-gray-600'
                              }`}
                            >
                              <Shield size={11} />
                              <span>Admin</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3 space-y-2 max-h-[60vh] overflow-y-auto">
                        {loadingNotifs ? (
                          <p className="text-xs font-bold text-neutral-400 dark:text-gray-400 text-center py-8">Cargando...</p>
                        ) : notifications.length === 0 ? (
                          <p className="text-xs font-bold text-neutral-400 dark:text-gray-400 text-center py-8">Sin notificaciones</p>
                        ) : notifications.slice(0, 5).map((n, i) => {
                          
                          const formatearFechaNotificacion = (fecha) => {
                            // Validar fecha
                            if (!fecha) return 'Fecha desconocida';
                            
                            const ahora = new Date();
                            const fechaNotif = new Date(fecha);
                            
                            // Verificar si la fecha es válida
                            if (isNaN(fechaNotif.getTime())) return 'Fecha inválida';
                            
                            const diffMs = ahora - fechaNotif;
                            const diffMins = Math.floor(Math.abs(diffMs) / 60000);
                            const diffHours = Math.floor(diffMins / 60);
                            const diffDays = Math.floor(diffHours / 24);

                            // Si la diferencia es negativa, la fecha es futura
                            if (diffMs < 0) return fechaNotif.toLocaleDateString('es-AR');

                            if (diffMins < 1) return 'Ahora';
                            if (diffMins < 60) return `Hace ${diffMins} min`;
                            if (diffHours < 24) return `Hace ${diffHours} h`;
                            if (diffDays < 7) return `Hace ${diffDays} d`;
                            
                            return fechaNotif.toLocaleDateString('es-AR');
                          };

                          const formatearHoraNotificacion = (fecha) => {
                            // Validar fecha
                            if (!fecha) return '--:--';
                            
                            const fechaNotif = new Date(fecha);
                            
                            // Verificar si la fecha es válida
                            if (isNaN(fechaNotif.getTime())) {
                              return '--:--';
                            }
                            
                            const ahora = new Date();
                            const diffMs = ahora - fechaNotif;
                            const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

                            // Si es hoy, mostrar hora
                            if (diffDays < 1) {
                              return fechaNotif.toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                            }
                            
                            // Si es esta semana, mostrar día y hora
                            if (diffDays < 7) {
                              const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                              return `${dias[fechaNotif.getDay()]} ${fechaNotif.toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}`;
                            }
                            
                            // Si es más antiguo, mostrar fecha completa
                            return fechaNotif.toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            });
                          };

                          // Encontrar el campo de fecha correcto - usar fecha_envio que es el campo real de la BD
                          const fechaNotificacion = n.fecha_envio || n.fecha_creacion || n.created_at || n.fecha || n.createdAt || new Date().toISOString();

                          const handleMarcarComoLeida = async (idNotificacion) => {
                            try {
                              await api.put(`/notificaciones/${idNotificacion}/leido`);
                              
                              // Actualizar estado local inmediatamente
                              setNotifications(prev => prev.map(n => 
                                n.id_notificacion === idNotificacion ? { ...n, leido: true } : n
                              ));
                              
                              toast.success('Notificación marcada como leída');
                            } catch (error) {
                              console.error('Error al marcar como leída:', error);
                              toast.error('Error al marcar como leída');
                            }
                          };

                          const handleVerDetalle = (notificacion) => {
                            // Cerrar el dropdown de notificaciones
                            setIsNotificationsOpen(false);
                            
                            // Abrir modal con detalles
                            setSelectedNotificacion(notificacion);
                            setIsModalNotificacionOpen(true);
                            
                            // Marcar como leída si no lo está
                            if (!notificacion.leido) {
                              handleMarcarComoLeida(notificacion.id_notificacion);
                            }
                          };

                          return (
                            <div 
                              key={n.id_notificacion || i} 
                              className={`flex gap-3 md:gap-4 p-3 md:p-4 group rounded-xl transition-all cursor-pointer ${!n.leido ? 'bg-brand-cyan/5 dark:bg-cyan-900/20 border border-brand-cyan/20 dark:border-cyan-700/30' : 'hover:bg-neutral-50 dark:hover:bg-gray-700 border border-transparent'}`}
                              onClick={() => handleVerDetalle(n)}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${n.tipo === 'VENTA' ? 'bg-emerald-500' : n.tipo === 'STOCK' ? 'bg-amber-500' : 'bg-brand-cyan'}`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs md:text-sm font-bold text-neutral-900 dark:text-gray-100 leading-snug group-hover:text-brand-cyan dark:group-hover:text-cyan-400 transition-colors">{n.titulo}</p>
                                  <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                    <span>{formatearFechaNotificacion(fechaNotificacion)}</span>
                                    <span>•</span>
                                    <span>{formatearHoraNotificacion(fechaNotificacion)}</span>
                                  </div>
                                </div>
                                <p className="text-[10px] md:text-xs font-medium text-neutral-500 dark:text-gray-400 leading-relaxed mt-1">{n.mensaje}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!n.leida && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Evitar que se dispare el click del padre
                                      handleMarcarComoLeida(n.id_notificacion);
                                    }}
                                    className="p-1 text-gray-400 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded transition-colors"
                                    title="Marcar como leída"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
                
                {/* NotificationBadge para consultas web - Temporalmente deshabilitado */}
                {/* <NotificationBadge /> */}
                
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

        {/* BANNER DE IMPERSONACIÓN - COMPACTO Y SIEMPRE VISIBLE */}
        {isImpersonating && impersonatedUser && realUser && (
          <div className="sticky top-0 z-[65] bg-gradient-to-r from-neutral-900 via-neutral-800 to-black dark:from-cyan-600 dark:via-cyan-500 dark:to-cyan-600 border-b-2 border-neutral-700 dark:border-cyan-400 shadow-lg">
            <div className="px-3 md:px-4 py-1.5 md:py-2">
              <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
                {/* Indicador de impersonación */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 bg-brand-cyan/20 dark:bg-white/20 backdrop-blur-sm px-2 py-1 rounded border border-brand-cyan/40 dark:border-white/30 flex-shrink-0">
                    <AlertTriangle className="text-brand-cyan dark:text-white" size={14} strokeWidth={2.5} />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wide text-brand-cyan dark:text-white">
                      MODO IMPERSONACIÓN
                    </span>
                  </div>
                  
                  {/* Información del usuario */}
                  <div className="flex items-center gap-1.5 md:gap-2 text-brand-cyan dark:text-white min-w-0">
                    <UserCircle2 size={14} strokeWidth={2.5} className="flex-shrink-0" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wide truncate">
                      {impersonatedUser.nombre} {impersonatedUser.apellido}
                    </span>
                    
                    <div className="hidden sm:block h-3 w-px bg-brand-cyan/30 dark:bg-white/30"></div>
                    
                    <span className="hidden sm:inline text-[10px] md:text-xs font-bold uppercase tracking-wide">
                      {impersonatedUser.id_rol === 2 ? 'SUPERVISOR' : impersonatedUser.id_rol === 3 ? 'VENDEDOR' : 'USUARIO'}
                    </span>

                    {impersonatedUser.comercio_asignado && (
                      <>
                        <div className="hidden md:block h-3 w-px bg-brand-cyan/30 dark:bg-white/30"></div>
                        <div className="hidden md:flex items-center gap-1">
                          <MapPin size={12} strokeWidth={2.5} />
                          <span className="text-[10px] font-bold uppercase tracking-wide truncate">
                            {impersonatedUser.comercio_asignado.nombre}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Botón para salir */}
                <button
                  onClick={handleStopImpersonation}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-[10px] md:text-xs uppercase tracking-wide rounded shadow-md hover:shadow-lg transition-all border border-red-700 flex-shrink-0"
                >
                  <X size={14} strokeWidth={2.5} />
                  <span className="hidden sm:inline">SALIR</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main 
            ref={mainContentRef}
            className="flex-1 overflow-y-auto p-1.5 sm:p-2 md:p-3 lg:p-4 bg-neutral-50 dark:bg-gray-900 custom-scrollbar relative overflow-x-hidden"
        >
            <div className="max-w-[1400px] mx-auto space-y-3">
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

      {/* Modal de Detalles de Notificación */}
      {isModalNotificacionOpen && selectedNotificacion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-200 dark:border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${selectedNotificacion.tipo === 'VENTA' ? 'bg-emerald-500' : selectedNotificacion.tipo === 'STOCK' ? 'bg-amber-500' : 'bg-brand-cyan'}`} />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {selectedNotificacion.titulo}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalNotificacionOpen(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-neutral-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Fecha y Hora */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock size={16} />
                <span>
                  {new Date(selectedNotificacion.fecha_envio || selectedNotificacion.fecha_creacion || selectedNotificacion.created_at).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
                </span>
              </div>

              {/* Mensaje */}
              <div className="bg-neutral-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-neutral-900 dark:text-gray-100">
                  {selectedNotificacion.mensaje}
                </p>
              </div>

              {/* Tipo de Notificación */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorTipoNotificacion(selectedNotificacion.tipo)}`}>
                  {formatearTipoNotificacion(selectedNotificacion.tipo)}
                </span>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedNotificacion.leido 
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' 
                    : 'bg-brand-cyan/10 text-brand-cyan dark:bg-brand-cyan/20 dark:text-cyan-400'
                }`}>
                  {selectedNotificacion.leido ? 'Leída' : 'No leída'}
                </span>
              </div>

              {/* Información Adicional según tipo */}
              {selectedNotificacion.tipo === 'CONSULTA_WEB' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Información de la Consulta</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Esta notificación corresponde a una consulta web recibida. Puedes gestionarla desde la sección de consultas.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200 dark:border-gray-700 flex flex-col gap-3">
              {/* Botón Ver Consulta para notificaciones de consulta web */}
              {selectedNotificacion.tipo === 'CONSULTA_WEB' && (
                <button
                  onClick={() => {
                    // Extraer ID de consulta del mensaje o usar un campo específico
                    // Por ahora, redirigir a la lista de consultas
                    navigate('/dashboard/consultas');
                    setIsModalNotificacionOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Ver Consulta
                </button>
              )}
              
              <div className="flex gap-3">
                {!selectedNotificacion.leido && (
                  <button
                    onClick={() => {
                      handleMarcarComoLeida(selectedNotificacion.id_notificacion);
                      setSelectedNotificacion(prev => ({ ...prev, leido: true }));
                    }}
                    className="flex-1 px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
                  >
                    Marcar como leída
                  </button>
                )}
                <button
                  onClick={() => setIsModalNotificacionOpen(false)}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-gray-700 text-neutral-700 dark:text-gray-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
