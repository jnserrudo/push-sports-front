import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Ticket, 
  ChevronRight,
  Store,
  Box,
  Receipt,
  Loader2,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { posService } from '../../services/posService';
import { sucursalesService } from '../../services/sucursalesService';
import { toast } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

const POS = () => {
  const { user, sucursalId } = useAuthStore();
  const isSuperAdmin = user?.id_rol === 1;
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentSucursal, setCurrentSucursal] = useState(null);
  const [sucursalOptions, setSucursalOptions] = useState([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState(null); // for SuperAdmin picker
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load sucursal options for SuperAdmin picker
  useEffect(() => {
    if (isSuperAdmin) {
      sucursalesService.getAll().then(setSucursalOptions).catch(console.error);
    }
  }, [isSuperAdmin]);

  // Cargar inventario real del comercio
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const id = selectedSucursalId || sucursalId || user?.id_comercio_asignado;
        if (id) {
          const [inventario, sucursalData] = await Promise.all([
            posService.getInventarioSucursal(id),
            sucursalesService.getById(id)
          ]);
          setProducts(inventario || []);
          setCurrentSucursal(sucursalData);
        } else {
          setProducts([]);
          setCurrentSucursal(null);
          setIsLoadingProducts(false);
        }
      } catch (error) {
        console.error('Error cargando inventario POS:', error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, [selectedSucursalId, sucursalId, user]);

  // Obtener nombre del producto y precio normalizado
  const getProductNombre = (item) => item.producto?.nombre || 'Producto';
  const getProductPrecio = (item) => Number(item.producto?.precio_venta_sugerido || 0);
  const getProductStock = (item) => item.cantidad_actual ?? 0;
  const getProductId = (item) => item.id_inventario;
  const getProductImg = (item) => item.producto?.imagen_url || null;

  const filteredProducts = products.filter(item =>
    getProductNombre(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    if (getProductStock(item) <= 0) return;
    const id = getProductId(item);
    const existing = cart.find(c => c.id === id);
    const stockMax = getProductStock(item);
    if (existing) {
      if (existing.cantidad >= stockMax) {
        toast.error(`Máximo de stock disponible: ${stockMax} unidades`);
        return;
      }
      setCart(cart.map(c => c.id === id ? { ...c, cantidad: c.cantidad + 1 } : c));
    } else {
      setCart([...cart, { 
        id,
        id_producto: item.id_producto,
        nombre: getProductNombre(item),
        precio: getProductPrecio(item),
        stock: stockMax,
        img: getProductImg(item),
        cantidad: 1
      }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.min(item.stock, Math.max(1, item.cantidad + delta));
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'cart'

  const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleConfirmSale = async () => {
    if (!cart.length) return;
    setIsProcessing(true);
    try {
      const comercioId = sucursalId || user?.id_comercio_asignado;
      const itemsPayload = cart.map(item => ({
        id_producto: item.id_producto,
        cantidadAComprar: item.cantidad,
        precio_venta: item.precio
      }));
      await posService.registrarVenta(comercioId, user?.id_usuario, itemsPayload, total, metodoPago);
      setCart([]);
      setActiveTab('catalog');
      setShowCheckoutModal(false);
      toast.success("Venta procesada exitosamente");
      // Recargar inventario tras la venta para reflejar stock actualizado
      const inventario = await posService.getInventarioSucursal(comercioId);
      setProducts(inventario || []);
    } catch (error) {
      console.error('Error al procesar venta:', error);
      toast.error("Error al procesar la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col xl:flex-row gap-4 md:gap-8 font-sans animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* CATALOG AREA */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white rounded-3xl md:rounded-[2rem] shadow-premium border border-neutral-100 overflow-hidden ${activeTab === 'cart' ? 'hidden xl:flex' : 'flex'}`}>
        <div className="p-4 md:p-8 border-b border-neutral-50 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-950 text-brand-cyan flex items-center justify-center rounded-xl shadow-lg flex-shrink-0">
                    <Box size={20} md:size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tighter m-0 uppercase leading-none text-neutral-950">Catálogo</h2>
                  <p className="text-[9px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Inventario {currentSucursal?.nombre || 'local'}</p>
                </div>
            </div>

            {/* SuperAdmin sucursal picker */}
            {isSuperAdmin && (
                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                    <MapPin size={14} className="text-brand-cyan flex-shrink-0" />
                    <select
                        value={selectedSucursalId || ''}
                        onChange={e => { setCart([]); setSelectedSucursalId(e.target.value || null); }}
                        className="bg-transparent text-black text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none pr-4"
                    >
                        <option value="">SELECCIONAR SEDE...</option>
                        {sucursalOptions.map(s => (
                            <option key={s.id_comercio} value={s.id_comercio}>{s.nombre}</option>
                        ))}
                    </select>
                </div>
            )}
            
            <div className="relative flex-1 w-full md:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="BUSCAR..."
                    className="input-premium-v2 pl-12 py-3 md:pl-16 md:py-5 text-[9px] md:text-xs tracking-[0.2em] uppercase font-black w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          {/* SuperAdmin needs to pick a store first */}
          {isSuperAdmin && !selectedSucursalId ? (
            <div className="flex flex-col items-center justify-center py-24 md:py-40 gap-6 opacity-50">
              <MapPin size={80} strokeWidth={0.5} className="text-brand-cyan" />
              <div className="text-center space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[1em] text-neutral-600">Seleccioná una sede</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Usá el selector de arriba para cargar el inventario</p>
              </div>
            </div>
          ) : isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 gap-6 opacity-60">
                <div className="w-12 h-12 border-4 border-neutral-100 border-t-brand-cyan rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400">Accediendo a la RED...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-40 opacity-20 filter grayscale">
              <Store size={100} strokeWidth={0.5} />
              <p className="text-xs font-black uppercase tracking-[1em] mt-10">Sin Productos</p>
            </div>
          ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pb-20 md:pb-0">
            <AnimatePresence>
            {filteredProducts.map(item => {
              const stock = getProductStock(item);
              const precio = getProductPrecio(item);
              const nombre = getProductNombre(item);
              const img = getProductImg(item);
              return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={stock > 0 ? { scale: 1.02 } : {}}
                whileTap={stock > 0 ? { scale: 0.95 } : {}}
                key={getProductId(item)}
                onClick={() => addToCart(item)}
                className={`group p-3 md:p-4 bg-white rounded-2xl md:rounded-3xl transition-all duration-300 relative cursor-pointer border ${
                  stock > 0 
                  ? 'border-neutral-100 shadow-sm hover:border-brand-cyan/20' 
                  : 'bg-neutral-50/50 opacity-40 grayscale border-transparent cursor-not-allowed'
                }`}
              >
                <div className="aspect-square bg-neutral-50 mb-3 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden relative border border-neutral-50">
                    {img ? (
                      <img src={img} alt={nombre} className="w-full h-full object-cover grayscale brightness-110 group-active:grayscale-0 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-200">
                        <Box size={32} />
                      </div>
                    )}
                    {stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-white font-bold text-[7px] uppercase tracking-[0.3em] border border-white/20 px-3 py-1.5 rounded-full">AGOTADO</span>
                        </div>
                    )}
                </div>
                
                <h3 className="font-bold text-[10px] md:text-sm uppercase tracking-tight mb-1 text-neutral-900 truncate">{nombre}</h3>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center text-neutral-900">
                    <span className="font-black text-lg md:text-2xl tracking-tighter">${precio.toLocaleString()}</span>
                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${stock < 5 ? 'text-brand-cyan' : 'text-neutral-400'}`}>
                        {stock} DISP.
                    </span>
                </div>
              </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
          )}
        </div>
      </div>

      {/* CART AREA */}
      <div className={`w-full xl:w-[420px] flex flex-col bg-white rounded-3xl md:rounded-[2rem] shadow-xl relative border-2 md:border-4 border-neutral-100 overflow-hidden ${activeTab === 'catalog' ? 'hidden xl:flex' : 'flex'}`}>
        <div className="p-4 md:p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
            <div className="flex items-center gap-3 md:gap-4">
                {/* Back button for mobile */}
                <button 
                  onClick={() => setActiveTab('catalog')}
                  className="xl:hidden w-10 h-10 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 active:text-black"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-brand-cyan flex items-center justify-center rounded-xl border-2 border-neutral-100 shadow-sm">
                    <Receipt size={20} md:size={24} />
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tighter m-0 uppercase leading-none text-neutral-900">Ticket</h2>
                    <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Operación Actual</span>
                </div>
            </div>
            <div className="bg-white text-neutral-400 font-bold text-[9px] px-3 md:px-4 py-1.5 rounded-full uppercase tracking-widest border border-neutral-100">
                {cart.length} ITEMS
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-30">
                <Store size={40} className="text-neutral-300" />
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">Seleccioná productos<br/>para iniciar la venta.</p>
            </div>
          ) : (
            <AnimatePresence>
            {cart.map((item, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={item.id} 
                className="p-3 md:p-5 bg-neutral-50/50 rounded-xl md:rounded-2xl border border-neutral-100 flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 md:gap-4">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                            {item.img 
                              ? <img src={item.img} alt={item.nombre} className="w-full h-full object-cover" />
                              : <Box size={16} className="text-neutral-400" />
                            }
                         </div>
                         <div className="flex flex-col min-w-0 max-w-[140px] md:max-w-none">
                            <h4 className="font-bold uppercase text-[9px] md:text-[10px] tracking-tight text-neutral-900 mb-0.5 md:mb-1 truncate">{item.nombre}</h4>
                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">${item.precio.toLocaleString()} c/u</span>
                         </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-neutral-300 hover:text-red-500 active:scale-125 transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-white border border-neutral-100 rounded-lg p-0.5 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-neutral-400 active:text-brand-cyan"><Minus size={14} /></button>
                        <span className="w-6 md:w-8 text-center font-bold text-xs md:text-sm tabular-nums text-neutral-900">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-neutral-400 active:text-brand-cyan"><Plus size={14} /></button>
                    </div>
                    <span className="font-black text-neutral-900 text-base md:text-lg tracking-tighter">${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-6 md:p-8 bg-neutral-50 border-t border-neutral-100 space-y-4 md:space-y-6">
            <div className="space-y-3">
                <div className="flex justify-between text-neutral-400 font-extrabold uppercase text-[10px] md:text-[12px] tracking-[0.2em]">
                    <span>Subtotal Operativo</span>
                    <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-[10px] md:text-[12px] tracking-[0.2em] text-neutral-500">
                    <span>Pago</span>
                    <select
                      value={metodoPago}
                      onChange={e => setMetodoPago(e.target.value)}
                      className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[9px] md:text-[11px] font-black text-black"
                    >
                      <option>Efectivo</option>
                      <option>Tarjeta</option>
                      <option>Transferencia</option>
                    </select>
                </div>
                
                <div className="pt-4 md:pt-8 border-t border-neutral-200 flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] md:text-[13px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-2 md:mb-4">Total Neto</span>
                        <span className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none">${total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleConfirmSale}
                disabled={cart.length === 0 || isProcessing}
                className="w-full btn-cyan h-14 md:h-18 text-[10px] md:text-[11px] flex items-center justify-center gap-3 disabled:opacity-20 transition-all active:scale-95"
            >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : null}
                FINALIZAR VENTA <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {/* MOBILE FLOATING CART BUTTON */}
      {cartItemsCount > 0 && activeTab === 'catalog' && (
        <button 
          onClick={() => setActiveTab('cart')}
          className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-cyan text-black px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,210,255,0.4)] flex items-center gap-4 animate-bounce-slow z-50 animate-in slide-in-from-bottom-5 duration-500"
        >
          <Receipt size={20} />
          <span className="font-black text-xs uppercase tracking-widest">VER TICKET ({cartItemsCount})</span>
          <span className="font-black text-sm ml-2 border-l border-black/20 pl-4">${total.toLocaleString()}</span>
        </button>
      )}
    </div>
  );
};

export default POS;
