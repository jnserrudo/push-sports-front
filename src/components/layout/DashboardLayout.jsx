import React, { useState, useEffect } from 'react';
import { 
  LogoutCurve, 
  HambergerMenu, 
  SearchNormal1, 
  CloseCircle,
  Category,
  Notification,
  User,
  Setting2,
  TableDocument,
  TruckFast,
  Shop,
  EmptyWallet,
  Building,
  Activity,
  Box,
  TicketDiscount,
  SecurityUser,
  ArrowRight
} from 'iconsax-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Visión General', icon: Category, path: '/dashboard', roles: [1, 2, 3] },
    { label: 'Terminal POS', icon: Shop, path: '/pos', roles: [1, 2, 3] },
    { label: 'Inventario', icon: Box, path: '/admin/productos', roles: [1, 2] },
    { label: 'Operadores', icon: SecurityUser, path: '/admin/usuarios', roles: [1] },
    { label: 'Sucursales', icon: Building, path: '/admin/sucursales', roles: [1] },
    { label: 'Logística', icon: TruckFast, path: '/admin/movimientos', roles: [1, 2] },
    { label: 'Caja y Ventas', icon: EmptyWallet, path: '/admin/ventas', roles: [1, 2] },
    { label: 'Marketing', icon: TicketDiscount, path: '/admin/promociones', roles: [1] },
    { label: 'Auditoría', icon: Activity, path: '/admin/logs', roles: [1] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.id_rol));

  return (
    <div className="flex h-screen bg-neutral-50/50 text-neutral-900 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-50 flex flex-col w-72 bg-white border-r border-neutral-100 h-full flex-shrink-0 transition-transform duration-300 ease-in-out`}>
        
        {/* Branding Section */}
        <div className="p-8 pb-10 border-b border-neutral-50">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl rounded-xl shadow-lg">
                    P
                </div>
                <div>
                   <h1 className="font-bold text-lg tracking-tight leading-none uppercase">
                       PUSH SPORT
                   </h1>
                   <span className="text-[9px] tracking-[0.4em] text-neutral-400 font-bold mt-1.5 block">MANAGEMENT HUB</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8">
          <div className="px-8 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">Navegación</span>
          </div>
          <ul className="px-4 space-y-1.5">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all group ${
                      isActive 
                        ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' 
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <item.icon 
                        variant={isActive ? "Bold" : "Linear"} 
                        size={20} 
                        className={`transition-colors ${isActive ? 'text-brand-cyan' : 'group-hover:text-neutral-900'}`}
                    />
                    {item.label}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-brand-cyan rounded-full"></div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Card */}
        <div className="p-6">
            <div className="bg-neutral-50 p-4 rounded-2xl flex items-center gap-4 border border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-brand-cyan font-bold shadow-sm">
                    {user?.nombre?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-[11px] uppercase tracking-tight truncate">{user?.nombre || 'Operador'}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        {user?.id_rol === 1 ? 'Super Admin' : user?.id_rol === 2 ? 'Encargado' : 'Vendedor'}
                    </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                  title="Cerrar Sesión"
                >
                    <LogoutCurve size={20} />
                </button>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between px-8 relative z-20">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-all"
            >
              <HambergerMenu size={20} />
            </button>
            
            <div className="hidden lg:flex items-center gap-6 ml-6">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Estado</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="font-bold text-[10px] uppercase tracking-widest">Sistema Online</span>
                    </div>
                </div>
                <div className="h-8 w-px bg-neutral-100"></div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Terminal</span>
                    <span className="font-bold text-[10px] uppercase tracking-widest">POS_PRIMARY_V1</span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">Hora Local</span>
                <span className="font-bold text-[10px] uppercase tracking-widest">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            
            <div className="flex items-center gap-3">
                <button className="p-2.5 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-all relative">
                    <Notification size={18} />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-cyan rounded-full border-2 border-neutral-50"></div>
                </button>
                <div className="h-6 w-px bg-neutral-100 mx-1"></div>
                <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-full transition-all group">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center">
                        <User size={14} className="text-brand-cyan" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
                </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-neutral-50/30 p-6 md:p-10 relative">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
            
            {/* Branding Watermark */}
            <div className="fixed bottom-10 right-10 opacity-[0.03] pointer-events-none select-none hidden xl:block">
                <h2 className="text-[120px] font-bold tracking-tighter leading-none text-black">PUSH</h2>
            </div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(true)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
