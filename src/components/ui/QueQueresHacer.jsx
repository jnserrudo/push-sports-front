import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShoppingBag, CreditCard, HelpCircle } from 'lucide-react';

const ACTIONS = [
  {
    to: '/dashboard/envios',
    icon: Truck,
    title: 'Dejarle mercadería a una sucursal',
    desc: 'Menú Envíos → Cargar Mercadería. Esto sí mueve el stock.',
  },
  {
    to: '/dashboard/ventas',
    icon: ShoppingBag,
    title: 'Vender a un cliente final',
    desc: 'Registrar Ventas cobra precio Público. No sirve para cargar stock.',
  },
  {
    to: '/dashboard/liquidaciones',
    icon: CreditCard,
    title: 'Cobrarle a la sucursal',
    desc: 'Liquidaciones: lo que te pagan es el precio Push, no el Público.',
  },
];

const QueQueresHacer = ({ compact = false }) => (
  <div
    className={`rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 ${
      compact ? 'p-2.5' : 'p-3 md:p-4'
    }`}
  >
    <div className="flex items-center gap-2 mb-2">
      <HelpCircle size={compact ? 12 : 14} className="text-brand-cyan shrink-0" />
      <p className={`font-black uppercase tracking-widest text-neutral-900 dark:text-white m-0 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        ¿Qué querés hacer?
      </p>
    </div>
    <div className={`grid grid-cols-1 ${compact ? 'gap-1.5' : 'sm:grid-cols-3 gap-2'}`}>
      {ACTIONS.map(({ to, icon: Icon, title, desc }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-start gap-2 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-2 hover:border-brand-cyan transition-colors"
        >
          <Icon size={14} className="text-brand-cyan shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-tight text-neutral-900 dark:text-white m-0 group-hover:text-brand-cyan">
              {title}
            </p>
            <p className="text-[9px] font-bold text-neutral-500 dark:text-gray-400 leading-snug m-0 mt-0.5">
              {desc}
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default QueQueresHacer;
