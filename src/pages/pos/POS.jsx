import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Ticket, 
  ChevronRight,
  Store,
  Box,
  Receipt
} from 'lucide-react';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const products = [
    { id: '1', nombre: 'Proteína Whey Gold 2kg', precio: 45000, stock: 12, img: '/primera.jpeg', cat: 'SUPLEMENTOS' },
    { id: '2', nombre: 'Creatina Monohidrato 300g', precio: 22000, stock: 5, img: '/segunda.jpeg', cat: 'RENDIMIENTO' },
    { id: '3', nombre: 'Remera Push Performance', precio: 15000, stock: 20, img: '/primera.jpeg', cat: 'INDUMENTARIA' },
    { id: '4', nombre: 'Pre-Entreno Nitro Blast', precio: 18000, stock: 0, img: '/segunda.jpeg', cat: 'ENFOQUE' },
    { id: '5', nombre: 'Shaker Pro Cyan', precio: 5000, stock: 50, img: '/primera.jpeg', cat: 'ACCESORIOS' },
  ];

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div className="h-full flex flex-col xl:flex-row gap-8 font-sans animate-in fade-in duration-700">
      
      {/* CATALOG AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[2rem] shadow-premium border border-neutral-100 overflow-hidden">
        <div className="p-8 border-b border-neutral-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-50 border-2 border-brand-cyan/20 text-brand-cyan flex items-center justify-center rounded-xl shadow-sm flex-shrink-0">
                    <Box size={24} variant="Bold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight m-0 uppercase leading-none text-neutral-900">Catálogo</h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-300 mt-2">Inventario Regional</p>
                </div>
            </div>
            
            <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={24} />
                <input 
                    type="text" 
                    placeholder="BUSCAR PRODUCTO..."
                    className="input-premium pl-14 py-4 text-[10px] tracking-widest h-16"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`group p-4 bg-white rounded-3xl transition-all duration-300 relative cursor-pointer border ${
                  product.stock > 0 
                  ? 'border-neutral-100 shadow-sm hover:shadow-premium-hover hover:border-brand-cyan/20' 
                  : 'bg-neutral-50/50 opacity-40 grayscale border-transparent cursor-not-allowed'
                }`}
              >
                <div className="aspect-square bg-neutral-100 mb-6 rounded-2xl overflow-hidden relative border border-neutral-50">
                    <img src={product.img} alt={product.nombre} className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-white font-bold text-[8px] uppercase tracking-[0.4em] border border-white/20 px-4 py-2 rounded-full">AGOTADO</span>
                        </div>
                    )}
                </div>
                
                <h3 className="font-bold text-[11px] uppercase tracking-tight mb-2 text-neutral-900 truncate">{product.nombre}</h3>
                <div className="flex justify-between items-center text-neutral-900">
                    <span className="font-bold text-xl tracking-tighter">${product.precio.toLocaleString()}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${product.stock < 5 ? 'text-brand-cyan' : 'text-neutral-300'}`}>
                        STK: {product.stock}
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CART AREA */}
      <div className="w-full xl:w-[420px] flex flex-col bg-white rounded-[2rem] shadow-xl relative border-4 border-neutral-100 overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-brand-cyan flex items-center justify-center rounded-xl border-2 border-neutral-100 shadow-sm">
                    <Receipt size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight m-0 uppercase leading-none text-neutral-900">Factura</h2>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 mt-2">Venta en Curso</span>
                </div>
            </div>
            <div className="bg-white text-neutral-400 font-bold text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest border border-neutral-100">
                ART: {cart.length.toString().padStart(2, '0')}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6 opacity-30">
                <Store size={48} className="text-neutral-300" />
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">Sincronice productos <br/> para iniciar.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-5 bg-neutral-50/50 rounded-2xl border border-neutral-100 flex flex-col gap-4 group transition-all duration-300 hover:shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200">
                            <img src={item.img} alt={item.nombre} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex flex-col">
                            <h4 className="font-bold uppercase text-[10px] tracking-tight text-neutral-900 mb-1">{item.nombre}</h4>
                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">${item.precio.toLocaleString()}</span>
                         </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-white border border-neutral-100 rounded-xl p-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-brand-cyan transition-all"><Minus size={16} /></button>
                        <span className="w-8 text-center font-bold text-sm tabular-nums text-neutral-900">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-brand-cyan transition-all"><Plus size={16} /></button>
                    </div>
                    <span className="font-black text-neutral-900 text-lg tracking-tighter">${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-neutral-50 border-t border-neutral-100 space-y-6">
            <div className="space-y-4">
                <div className="flex justify-between text-neutral-400 font-bold uppercase text-[9px] tracking-widest">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-brand-cyan font-bold text-[9px] tracking-widest">
                    <span>Ajuste Descuento</span>
                    <button className="px-4 py-1.5 bg-brand-cyan text-white rounded-lg hover:brightness-110 transition-all font-bold text-[8px] uppercase shadow-sm">AÑADIR</button>
                </div>
                
                <div className="pt-6 border-t border-neutral-200 flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Operativo</span>
                        <span className="text-4xl font-black text-neutral-900 tracking-tighter leading-none">${total.toLocaleString()}</span>
                    </div>
                    <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">AR$ PESOS</span>
                </div>
            </div>

            <button 
                onClick={() => setShowCheckoutModal(true)}
                disabled={cart.length === 0}
                className="w-full btn-cyan h-18 text-[11px] flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale transition-all"
            >
                FINALIZAR OPERACIÓN <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
