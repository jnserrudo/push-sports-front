import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, ShoppingCart, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const BottomNav = () => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const [activeSection, setActiveSection] = useState('inicio');
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['inicio', 'productos', 'sedes'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const navItems = [
    { id: 'inicio', icon: Home, label: 'Inicio' },
    { id: 'productos', icon: ShoppingBag, label: 'Productos' },
    { id: 'carrito', icon: ShoppingCart, label: 'Carrito', badge: totalItems },
    { id: 'sedes', icon: MapPin, label: 'Sedes' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700 shadow-2xl">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isCart = item.id === 'carrito';

          return (
            <button
              key={item.id}
              onClick={() => isCart ? handleCartClick() : scrollToSection(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive 
                  ? 'text-brand-cyan' 
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'scale-110' : ''} />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isActive ? 'text-brand-cyan' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-cyan rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
