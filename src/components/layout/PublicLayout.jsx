import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, MapPin, Search, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuthStore } from '../../store/authStore';

const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navLinks = [
    { path: '/shop', label: 'Catálogo' },
    { path: '/shop/sucursales', label: 'Sucursales' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-black dark:text-white transition-colors">
      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 no-underline group">
              <span className="text-xl font-black tracking-tight uppercase text-black dark:text-white group-hover:text-brand-cyan transition-colors font-sport">
                PUSH<span className="text-brand-cyan">SPORT</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest no-underline transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-brand-cyan/10 text-brand-cyan'
                      : 'text-neutral-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="hidden md:flex items-center gap-4 ml-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                      <User size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-gray-300">
                      Hola, {user.nombre}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={12} /> Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-black uppercase tracking-widest no-underline hover:bg-brand-cyan hover:text-black transition-all duration-200 shadow-sm"
                >
                  Iniciar Sesión
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0d] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider no-underline transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-cyan/10 text-brand-cyan'
                      : 'text-neutral-600 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-gray-400 uppercase tracking-widest">Conectado como</p>
                      <p className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">{user.nombre} {user.apellido}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg text-sm font-bold uppercase tracking-wider mt-2 transition-colors"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold uppercase tracking-wider no-underline text-center mt-2"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-tight text-neutral-400 dark:text-gray-500 font-sport">
              PUSH<span className="text-brand-cyan">SPORT</span>
            </span>
            <span className="text-xs text-neutral-400 dark:text-gray-500">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs font-bold text-neutral-400 dark:text-gray-500 hover:text-brand-cyan transition-colors uppercase tracking-wider no-underline">
              Inicio
            </Link>
            <Link to="/shop" className="text-xs font-bold text-neutral-400 dark:text-gray-500 hover:text-brand-cyan transition-colors uppercase tracking-wider no-underline">
              Tienda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
