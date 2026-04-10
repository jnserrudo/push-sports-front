import React, { useState, useEffect, useRef } from 'react';
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
  MapPin,
  Clock,
  Play,
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  Zap,
  Printer,
  Package
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuthStore } from '../../store/authStore';
import { posService } from '../../services/posService';
import { sucursalesService } from '../../services/sucursalesService';
import { combosService } from '../../services/combosService';
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
  const [combos, setCombos] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);

  // Descuento por código promo
  const [codigoPromo, setCodigoPromo] = useState('');
  const [descuentoAplicado, setDescuentoAplicado] = useState(null); // { codigo, monto_descuento, tipo_descuento, valor_descuento }
  const [isValidatingCodigo, setIsValidatingCodigo] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Ofertas vigentes
  const [ofertasVigentes, setOfertasVigentes] = useState([]);

  // Último comprobante de venta
  const [lastSale, setLastSale] = useState(null);
  
  // Tab activo en mobile
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'cart'
  
  const searchInputRef = useRef(null);

  // Load Drafts from local storage on mount
  useEffect(() => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem('pos_drafts')) || [];
      setDrafts(savedDrafts);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveDraft = () => {
    if (cart.length === 0) return;
    const newDraft = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      items: cart,
      total: total
    };
    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem('pos_drafts', JSON.stringify(updatedDrafts));
    setCart([]);
    toast.success('Carrito guardado en espera');
  };

  const loadDraft = (draft) => {
    setCart(draft.items);
    const updatedDrafts = drafts.filter(d => d.id !== draft.id);
    setDrafts(updatedDrafts);
    localStorage.setItem('pos_drafts', JSON.stringify(updatedDrafts));
    setShowDrafts(false);
  };

  const deleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('pos_drafts', JSON.stringify(updatedDrafts));
  };

  // ─── KEYBOARD SHORTCUTS ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus Search: Ctrl/Cmd + F
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Finalizar Venta: Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (cart.length > 0 && !isProcessing && activeTab === 'cart' || cart.length > 0 && !isProcessing && window.innerWidth >= 1280) { // Only if cart is visible or desktop
          e.preventDefault();
          handleConfirmSale();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isProcessing, activeTab]);


  // Cargar ofertas vigentes al montar
  useEffect(() => {
    posService.getOfertasVigentes().then(setOfertasVigentes).catch(() => setOfertasVigentes([]));
  }, []);

  // Load sucursal options for SuperAdmin picker
  useEffect(() => {
    if (isSuperAdmin) {
      sucursalesService.getAll().then(setSucursalOptions).catch(console.error);
    }
  }, [isSuperAdmin]);

  // Cargar inventario real del comercio y combos
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const id = selectedSucursalId || sucursalId || user?.id_comercio_asignado;
        if (id) {
          const [inventario, sucursalData, combosData] = await Promise.all([
            posService.getInventarioSucursal(id),
            sucursalesService.getById(id),
            combosService.getAll()
          ]);
          setProducts(inventario || []);
          setCombos(combosData?.filter(c => c.activo) || []);
          setCurrentSucursal(sucursalData);
        } else {
          setProducts([]);
          setCombos([]);
          setCurrentSucursal(null);
          setIsLoadingProducts(false);
        }
      } catch (error) {
        console.error('Error cargando inventario POS:', error);
        setProducts([]);
        setCombos([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, [selectedSucursalId, sucursalId, user]);

  // Obtener nombre del producto y precio normalizado
  const getProductNombre = (item) => item.producto?.nombre || 'Producto';
  const getProductPrecioBase = (item) => Number(item.producto?.precio_venta_sugerido || 0);
  const getProductPrecio = (item) => {
    const base = getProductPrecioBase(item);
    if (ofertasVigentes.length === 0) return base;
    // Aplicar la oferta con mayor descuento vigente (globalizada — aplica a todos los productos)
    const mejorOferta = ofertasVigentes.reduce((max, o) => 
      Number(o.descuento_porcentaje) > Number(max.descuento_porcentaje) ? o : max
    , ofertasVigentes[0]);
    return Math.round(base * (1 - Number(mejorOferta.descuento_porcentaje) / 100));
  };
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

  const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const montoDescuento = descuentoAplicado?.monto_descuento || 0;
  const total = Math.max(0, subtotal - montoDescuento);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleValidarCodigo = async () => {
    if (!codigoPromo.trim()) return;
    setIsValidatingCodigo(true);
    setPromoError('');
    try {
      const result = await posService.validarDescuento(codigoPromo.trim(), subtotal);
      setDescuentoAplicado(result);
      setCodigoPromo('');
      toast.success(`Código "${result.codigo}" aplicado: -$${result.monto_descuento.toLocaleString()}`);
    } catch (err) {
      setPromoError(err?.response?.data?.error || 'Código inválido');
      setDescuentoAplicado(null);
    } finally {
      setIsValidatingCodigo(false);
    }
  };

  const handleRemoveCodigo = () => {
    setDescuentoAplicado(null);
    setCodigoPromo('');
    setPromoError('');
  };

  const generateComprobante = (ventaData) => {
    const doc = new jsPDF({ format: 'a6', orientation: 'portrait' });
    const comercioNombre = currentSucursal?.nombre || 'Sede';
    const fecha = new Date().toLocaleString();

    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 105, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PUSH SPORT', 8, 14);
    doc.setTextColor(0, 210, 255);
    doc.setFontSize(7);
    doc.text('COMPROBANTE DE VENTA', 8, 22);
    doc.setTextColor(180, 180, 180);
    doc.text(comercioNombre.toUpperCase(), 97, 22, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, 8, 38);
    doc.text(`Método de pago: ${metodoPago}`, 8, 44);
    if (ventaData?.id_venta) doc.text(`Ref: #${String(ventaData.ventaCabecera?.id_venta || '').split('-')[0]}`, 8, 50);

    doc.setLineWidth(0.3);
    doc.line(8, 54, 97, 54);

    let y = 62;
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTO', 8, y);
    doc.text('CANT', 72, y, { align: 'right' });
    doc.text('TOTAL', 97, y, { align: 'right' });
    y += 4;
    doc.line(8, y, 97, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    cart.forEach(item => {
      const lineTotal = (item.precio * item.cantidad).toLocaleString();
      doc.text(item.nombre.substring(0, 28), 8, y);
      doc.text(String(item.cantidad), 72, y, { align: 'right' });
      doc.text(`$${lineTotal}`, 97, y, { align: 'right' });
      y += 6;
    });

    doc.line(8, y, 97, y);
    y += 6;

    if (descuentoAplicado) {
      doc.text(`Descuento (${descuentoAplicado.codigo}):`, 8, y);
      doc.text(`-$${montoDescuento.toLocaleString()}`, 97, y, { align: 'right' });
      y += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', 8, y);
    doc.text(`$${total.toLocaleString()}`, 97, y, { align: 'right' });

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por tu compra — Push Sport Salta', 52, 148, { align: 'center' });

    doc.save(`comprobante_${Date.now()}.pdf`);
    toast.success('Comprobante generado');
  };

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
      const ventaResult = await posService.registrarVenta(comercioId, user?.id_usuario, itemsPayload, total, metodoPago);
      setLastSale(ventaResult);
      setCart([]);
      setDescuentoAplicado(null);
      setCodigoPromo('');
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
      <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] shadow-premium border border-neutral-100 dark:border-gray-700 overflow-hidden ${activeTab === 'cart' ? 'hidden xl:flex' : 'flex'}`}>
        <div className="p-4 md:p-8 border-b border-neutral-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
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
                    ref={searchInputRef}
                    type="text" 
                    placeholder="BUSCAR PRODUCTO (CTRL+F)..."
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
                <div className="w-12 h-12 border-4 border-neutral-100 dark:border-gray-700 border-t-brand-cyan rounded-full animate-spin"></div>
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
                className={`group p-3 md:p-4 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl transition-all duration-300 relative cursor-pointer border ${
                  stock > 0 
                  ? 'border-neutral-100 dark:border-gray-700 shadow-sm hover:border-brand-cyan/20' 
                  : 'bg-neutral-50/50 dark:bg-gray-700/50 opacity-40 grayscale border-transparent cursor-not-allowed'
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

          {/* Sección de Combos */}
          {!isLoadingProducts && combos.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Package size={14} className="text-brand-cyan" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                  Combos Especiales
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {combos.map(combo => (
                  <motion.div
                    key={combo.id_combo}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const existingItem = cart.find(c => c.id === combo.id_combo);
                      if (existingItem) {
                        setCart(cart.map(c => 
                          c.id === combo.id_combo 
                            ? { ...c, cantidad: c.cantidad + 1 }
                            : c
                        ));
                      } else {
                        setCart([...cart, { 
                          id: combo.id_combo,
                          nombre: combo.nombre,
                          precio: Number(combo.precio_combo),
                          cantidad: 1,
                          isCombo: true
                        }]);
                      }
                      toast.success(`${combo.nombre} agregado al carrito`);
                    }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl md:rounded-3xl p-3 md:p-4 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Package size={12} className="text-amber-600" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">
                        COMBO
                      </span>
                    </div>
                    <h4 className="font-black text-xs md:text-sm uppercase text-neutral-900 mb-2 line-clamp-2">
                      {combo.nombre}
                    </h4>
                    {combo.descripcion && (
                      <p className="text-[9px] text-neutral-500 mb-2 line-clamp-1">
                        {combo.descripcion}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-neutral-600">$</span>
                      <span className="text-lg md:text-xl font-sport text-neutral-900">
                        {Number(combo.precio_combo).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CART AREA */}
      <div className={`w-full xl:w-[420px] flex flex-col bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] shadow-xl relative border-2 md:border-4 border-neutral-100 dark:border-gray-700 overflow-hidden ${activeTab === 'catalog' ? 'hidden xl:flex' : 'flex'}`}>
        <div className="p-4 md:p-8 border-b border-neutral-100 dark:border-gray-700 flex justify-between items-center bg-neutral-50/30 dark:bg-gray-700/30">
            <div className="flex items-center gap-3 md:gap-4">
                {/* Back button for mobile */}
                <button 
                  onClick={() => setActiveTab('catalog')}
                  className="xl:hidden w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 flex items-center justify-center text-neutral-400 dark:text-gray-400 active:text-black dark:active:text-white"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-700 text-brand-cyan dark:text-cyan-400 flex items-center justify-center rounded-xl border-2 border-neutral-100 dark:border-gray-600 shadow-sm relative group cursor-pointer" onClick={() => setShowDrafts(!showDrafts)}>
                    <Receipt size={20} md:size={24} className="group-hover:opacity-0 transition-opacity absolute" />
                    <Clock size={20} md:size={24} className="opacity-0 group-hover:opacity-100 transition-opacity absolute text-amber-500" />
                    {drafts.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                            {drafts.length}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tighter m-0 uppercase leading-none text-neutral-900">Ticket</h2>
                    <span 
                      onClick={() => setShowDrafts(!showDrafts)}
                      className="text-[9px] md:text-[10px] font-bold text-neutral-400 hover:text-amber-500 uppercase tracking-widest mt-1 block cursor-pointer transition-colors"
                    >
                      {drafts.length > 0 ? `${drafts.length} En Espera` : 'Operación Actual'}
                    </span>
                </div>
            </div>
            <motion.div 
                key={cartItemsCount}
                initial={{ scale: 1.2, backgroundColor: '#00d2ff', color: '#000' }}
                animate={{ scale: 1, backgroundColor: '#ffffff', color: '#a3a3a3' }}
                transition={{ duration: 0.3 }}
                className="font-bold text-[9px] px-3 md:px-4 py-1.5 rounded-full uppercase tracking-widest border border-neutral-100 dark:border-gray-600 dark:text-gray-300"
            >
                {cartItemsCount} ITEMS
            </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 scrollbar-hide">
          {showDrafts ? (
            <div className="space-y-3">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Ventas en Espera</h3>
                 <button onClick={() => setShowDrafts(false)} className="text-neutral-400 hover:text-black"><X size={14} /></button>
               </div>
               {drafts.length === 0 ? (
                 <div className="text-center p-8 opacity-50">
                    <Clock size={32} className="mx-auto text-neutral-300 mb-3" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">No hay ventas pausadas</p>
                 </div>
               ) : (
                 drafts.map((draft) => (
                   <div key={draft.id} className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl flex flex-col gap-3 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Carrito Guardado</p>
                          <p className="text-[8px] font-bold text-amber-600/60 uppercase tracking-widest mt-0.5">
                            {new Date(draft.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {draft.items.length} items
                          </p>
                        </div>
                        <span className="font-black text-amber-700">${draft.total.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => loadDraft(draft)} className="flex-1 bg-amber-500 text-white font-black text-[9px] uppercase tracking-widest py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors">
                           <Play size={12} fill="currentColor" /> Retomar
                         </button>
                         <button onClick={() => deleteDraft(draft.id)} className="px-3 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                           <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          ) : cart.length === 0 ? (
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
                className="p-3 md:p-5 bg-neutral-50/50 dark:bg-gray-700/50 rounded-xl md:rounded-2xl border border-neutral-100 dark:border-gray-600 flex flex-col gap-3 group"
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
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 rounded-lg p-0.5 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-neutral-400 active:text-brand-cyan"><Minus size={14} /></button>
                        <span className="w-6 md:w-8 text-center font-bold text-xs md:text-sm tabular-nums text-neutral-900 dark:text-white">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-neutral-400 active:text-brand-cyan"><Plus size={14} /></button>
                    </div>
                    <span className="font-black text-neutral-900 text-base md:text-lg tracking-tighter">${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-4 md:p-6 bg-neutral-50 dark:bg-gray-700 border-t border-neutral-100 dark:border-gray-700 space-y-3">

            {/* Banner oferta vigente */}
            {ofertasVigentes.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl">
                    <Zap size={12} className="text-brand-cyan shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-black">
                        OFERTA ACTIVA: {ofertasVigentes[0].nombre} &mdash; {ofertasVigentes[0].descuento_porcentaje}% OFF
                    </span>
                </div>
            )}

            {/* Campo código promo */}
            {!descuentoAplicado ? (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="CÓDIGO PROMO..."
                            value={codigoPromo}
                            onChange={e => { setCodigoPromo(e.target.value.toUpperCase()); setPromoError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleValidarCodigo()}
                            className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-600 border border-neutral-200 dark:border-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-cyan-400 transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleValidarCodigo}
                        disabled={!codigoPromo.trim() || isValidatingCodigo || cart.length === 0}
                        className="px-3 py-2.5 bg-black text-white text-[9px] font-black uppercase rounded-xl hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-30 flex items-center gap-1"
                    >
                        {isValidatingCodigo ? <Loader2 size={12} className="animate-spin" /> : 'OK'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-green-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-700">
                            {descuentoAplicado.codigo} &mdash; -{descuentoAplicado.tipo_descuento === 'porcentaje' ? `${descuentoAplicado.valor_descuento}%` : `$${descuentoAplicado.valor_descuento.toLocaleString()}`}
                        </span>
                    </div>
                    <button onClick={handleRemoveCodigo} className="text-neutral-400 hover:text-red-500 transition-colors">
                        <X size={13} />
                    </button>
                </div>
            )}
            {promoError && (
                <div className="flex items-center gap-2 px-3 py-1.5">
                    <AlertCircle size={11} className="text-red-500" />
                    <span className="text-[9px] font-bold text-red-500">{promoError}</span>
                </div>
            )}

            {/* Desglose de totales */}
            <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-neutral-400 font-extrabold uppercase text-[10px] tracking-[0.2em]">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                </div>
                {descuentoAplicado && (
                    <div className="flex justify-between font-bold text-[10px] tracking-[0.1em] text-green-600">
                        <span>Descuento ({descuentoAplicado.codigo})</span>
                        <span>-${montoDescuento.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between items-center font-bold text-[10px] tracking-[0.2em] text-neutral-500">
                    <span>Método de pago</span>
                    <select
                      value={metodoPago}
                      onChange={e => setMetodoPago(e.target.value)}
                      className="bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg px-2 py-1 text-[9px] md:text-[10px] font-black text-black dark:text-white"
                    >
                      <option>Efectivo</option>
                      <option>Tarjeta</option>
                      <option>Transf. Bancaria</option>
                    </select>
                </div>
                <div className="pt-3 border-t border-neutral-200 flex justify-between items-end">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Total</span>
                    <motion.span
                        key={total}
                        initial={{ scale: 1.05, color: '#00d2ff' }}
                        animate={{ scale: 1, color: '#171717' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-3xl md:text-4xl font-black tracking-tighter leading-none"
                    >
                        ${total.toLocaleString()}
                    </motion.span>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
                {cart.length > 0 && (
                    <button
                        onClick={saveDraft}
                        className="flex-shrink-0 bg-neutral-100 text-neutral-500 font-black text-[9px] uppercase tracking-widest px-3 py-3.5 rounded-xl hover:bg-amber-100 hover:text-amber-600 transition-colors flex items-center gap-1.5"
                    >
                        <Clock size={13} />
                    </button>
                )}
                {lastSale && cart.length === 0 && (
                    <button
                        onClick={() => generateComprobante(lastSale)}
                        className="flex-shrink-0 bg-neutral-100 text-neutral-500 font-black text-[9px] uppercase tracking-widest px-3 py-3.5 rounded-xl hover:bg-neutral-200 hover:text-black transition-colors flex items-center gap-1.5"
                        title="Reimprimir último comprobante"
                    >
                        <Printer size={13} />
                    </button>
                )}
                <button
                    onClick={handleConfirmSale}
                    disabled={cart.length === 0 || isProcessing || showDrafts}
                    className="flex-1 btn-cyan h-14 text-[10px] flex items-center justify-center gap-2 disabled:opacity-20 transition-all active:scale-95"
                >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : null}
                    FINALIZAR VENTA <ChevronRight size={16} />
                </button>
            </div>
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
