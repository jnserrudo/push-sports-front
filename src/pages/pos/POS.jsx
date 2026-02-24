import React, { useState } from 'react';
import { 
  SearchNormal1, 
  Trash, 
  Add, 
  Minus, 
  TicketDiscount, 
  DirectRight,
  Shop,
  Box,
  CloseCircle,
  TickCircle,
  Danger,
  FilterSearch,
  Receipt2
} from 'iconsax-react';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Mock de productos para la demo
  const products = [
    { id: '1', nombre: 'Proteína Whey Gold 2kg', precio: 45000, stock: 12, img: '/segunda.jpeg', cat: 'Suplementos' },
    { id: '2', nombre: 'Creatina Monohidrato 300g', precio: 22000, stock: 5, img: '/icono.jpeg', cat: 'Suplementos' },
    { id: '3', nombre: 'Remera Push Performance', precio: 15000, stock: 20, img: '/primera.jpeg', cat: 'Indumentaria' },
    { id: '4', nombre: 'Pre-Entreno Nitro Blast', precio: 18000, stock: 0, img: '/segunda.jpeg', cat: 'Suplementos' },
    { id: '5', nombre: 'Shaker Pro Cyan', precio: 5000, stock: 50, img: '/icono.jpeg', cat: 'Accesorios' },
    { id: '6', nombre: 'Cinto Powerlifting L', precio: 32000, stock: 3, img: '/primera.jpeg', cat: 'Accesorios' },
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

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

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
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-8 font-sans">
      
      {/* INVENTARIO / IZQUIERDA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl shadow-premium overflow-hidden border border-neutral-100">
        {/* Cabecera Inventario */}
        <div className="p-8 border-b border-neutral-50 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-center gap-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-900 text-brand-cyan flex items-center justify-center rounded-xl shadow-lg">
                    <Box size={22} variant="Bold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Catálogo de Productos</h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 mt-1">Inventario Sincronizado</p>
                </div>
            </div>
            
            <div className="relative flex-1 max-w-md group">
                <SearchNormal1 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o SKU..."
                    className="input-premium pl-12 py-3 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`group p-4 rounded-2xl transition-all duration-300 relative cursor-pointer border ${
                  product.stock > 0 
                  ? 'bg-white border-neutral-100 shadow-sm hover:shadow-premium hover:-translate-y-1 hover:border-brand-cyan/20' 
                  : 'bg-neutral-50/50 opacity-60 grayscale border-transparent cursor-not-allowed'
                }`}
              >
                <div className="aspect-square bg-neutral-100 mb-4 rounded-xl overflow-hidden relative border border-neutral-50">
                    <img src={product.img} alt={product.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                            <span className="text-white font-bold text-[9px] uppercase tracking-widest border border-white/30 px-3 py-1.5 rounded-full">Sin Stock</span>
                        </div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-100">
                        {product.cat}
                    </div>
                </div>
                
                <h3 className="font-bold text-xs uppercase tracking-tight mb-2 text-neutral-900 truncate">{product.nombre}</h3>
                <div className="flex justify-between items-end">
                    <span className="font-bold text-base text-neutral-900">${product.precio.toLocaleString()}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${product.stock < 5 ? 'text-red-500' : 'text-neutral-400'}`}>
                        Cant: {product.stock}
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARRITO / DERECHA */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white rounded-3xl shadow-premium relative border border-neutral-100 overflow-hidden">
        
        {/* Header Carrito */}
        <div className="p-8 border-b border-neutral-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-cyan/10 text-brand-cyan flex items-center justify-center rounded-xl">
                    <Shop size={20} variant="Bold" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Comprobante</h2>
            </div>
            <div className="bg-neutral-50 text-neutral-400 font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-widest border border-neutral-100">
                Items: {cart.length}
            </div>
        </div>

        {/* Lista items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-200">
                    <Receipt2 size={40} variant="Bulk" />
                </div>
                <div>
                     <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-neutral-400">Carrito Vacío</p>
                     <p className="text-[10px] text-neutral-300 mt-2 font-medium">Selecciona productos del catálogo para facturar.</p>
                </div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 flex flex-col gap-4 group hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200">
                            <img src={item.img} alt={item.nombre} className="w-full h-full object-cover" />
                         </div>
                         <h4 className="font-bold uppercase text-[10px] tracking-tight text-neutral-700 max-w-[150px] truncate">{item.nombre}</h4>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash size={16} />
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-brand-cyan hover:bg-neutral-50 rounded-md"><Minus size={14} /></button>
                        <span className="w-8 text-center font-bold text-xs">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-brand-cyan hover:bg-neutral-50 rounded-md"><Add size={14} /></button>
                    </div>
                    <span className="font-bold text-neutral-900 text-sm">${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totales */}
        <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 space-y-6">
            <div className="space-y-3">
                <div className="flex justify-between text-neutral-400 font-bold uppercase text-[10px] tracking-widest">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-brand-cyan font-bold text-[10px] tracking-widest">
                    <div className="flex items-center gap-2">
                        <TicketDiscount size={16} />
                        <span>Descuento</span>
                    </div>
                    <button className="px-3 py-1 bg-white border border-neutral-200 rounded-lg hover:border-brand-cyan transition-colors">Añadir</button>
                </div>
                <div className="pt-6 mt-6 border-t border-neutral-100 flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Total a Pagar</span>
                        <span className="text-3xl font-bold text-neutral-900 tracking-tight">${total.toLocaleString()}</span>
                    </div>
                    <div className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">AR$ PESOS</div>
                </div>
            </div>

            <button 
                onClick={() => setShowCheckoutModal(true)}
                disabled={cart.length === 0}
                className="w-full btn-premium py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale group h-14"
            >
                Confirmar Venta
                <DirectRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md" onClick={() => setShowCheckoutModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-neutral-100 animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
                    <TickCircle size={40} variant="Bold" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">¿Finalizar Venta?</h3>
                <p className="text-neutral-500 font-medium text-sm mb-12">Se generará el comprobante electrónico e impactará en el inventario actual.</p>
                
                <div className="bg-neutral-50 rounded-[2rem] p-8 mb-10 border border-neutral-100">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Total Facturado</span>
                        <span className="text-3xl font-bold text-neutral-900">${total.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-neutral-200/50 mb-6"></div>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                            <span>Método de Pago</span>
                            <span className="text-neutral-900">Efectivo / Transf.</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => {
                            setCart([]);
                            setShowCheckoutModal(false);
                            alert('Operación procesada correctamente');
                        }}
                        className="w-full btn-premium py-4 h-14"
                    >
                        Procesar Operación
                    </button>
                    <button onClick={() => setShowCheckoutModal(false)} className="text-xs font-bold uppercase tracking-widest text-neutral-300 hover:text-neutral-900 transition-colors">Volver a revisión</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
