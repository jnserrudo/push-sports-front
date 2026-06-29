import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Package,
  ShoppingBag,
  Info,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  CreditCard,
  DollarSign,
  Landmark,
  XCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuthStore } from '../../store/authStore';
import { posService } from '../../services/posService';
import { sucursalesService } from '../../services/sucursalesService';
import { combosService } from '../../services/combosService';
import { toast } from '../../store/toastStore';

import { parseImagenes } from '../../lib/supabaseStorage';
import PremiumSelect from '../../components/ui/PremiumSelect';
import Modal from '../../components/ui/Modal';

const POS = () => {
  const { user, sucursalId } = useAuthStore();
  const isSuperAdmin = user?.id_rol === 1;
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentSucursal, setCurrentSucursal] = useState(null);
  const [sucursalOptions, setSucursalOptions] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
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
  
  // Modal de selección de variantes
  const [showVariantesModal, setShowVariantesModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Modal informativo de estados de ventas
  const [showSalesInfoModal, setShowSalesInfoModal] = useState(false);

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
      setLoadingSucursales(true);
      sucursalesService.getAll()
        .then(setSucursalOptions)
        .catch(console.error)
        .finally(() => setLoadingSucursales(false));
    }
  }, [isSuperAdmin]);

  // Cargar inventario real del comercio y combos
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const id = selectedSucursalId || sucursalId || user?.id_comercio_asignado;
        if (id && id !== 'undefined' && id !== undefined) {
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
  const getProductImg = (item) => {
    const images = parseImagenes(item.producto?.imagen_url);
    return images.length > 0 ? images[0] : null;
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products.slice(0, 80); // Mostrar solo una parte inicial si no hay búsqueda para fluidez
    
    return products
      .filter(item => getProductNombre(item).toLowerCase().includes(term))
      .slice(0, 100); // Límite de seguridad para el DOM
  }, [products, searchTerm]);

  // Manejar clic en producto - muestra variantes si las tiene
  const handleProductClick = (item) => {
    const stock = getProductStock(item);
    if (stock <= 0) return;
    
    // Si el producto está configurado para usar variantes, SIEMPRE abrir el modal
    if (item.producto?.usa_variantes || item.usa_desglose_variantes || (item.variantes && item.variantes.length > 0)) {
      setSelectedProduct(item);
      setShowVariantesModal(true);
      return;
    }
    
    // Si no tiene variantes, agregar directamente
    addToCart(item);
  };

  // Agregar variante específica al carrito
  const addVarianteToCart = (item, variante) => {
    const id = `${item.id_inventario}-${variante.id_variante}`;
    const stockMax = variante.cantidad_actual || 0;
    const precio = getProductPrecio(item);
    let atributos = variante.variante?.atributos_valores || {};
    if (typeof atributos === 'string') {
      try { atributos = JSON.parse(atributos); } catch {}
    }
    const atributosString = Object.values(atributos).join(' ');
    const fallbackName = atributosString ? `Variante ${atributosString}` : `Variante ${variante.id_variante.slice(0, 8)}`;
    const nombreVariante = variante.variante?.sku_variante || fallbackName;
    
    const existing = cart.find(c => c.id === id);
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
        id_variante: variante.id_variante,
        nombre: `${getProductNombre(item)} - ${nombreVariante}`,
        precio,
        precio_base: getProductPrecioBase(item),
        precio_push: Number(item.producto?.precio_pushsport || 0),
        stock: stockMax,
        img: getProductImg(item),
        cantidad: 1
      }]);
    }
    toast.success(`${getProductNombre(item)} (${nombreVariante}) agregado al carrito`);
    setShowVariantesModal(false);
    setSelectedProduct(null);
  };

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
        precio_base: getProductPrecioBase(item),
        precio_push: Number(item.producto?.precio_pushsport || 0),
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
    const comercioNombre = currentSucursal?.nombre || ventaData?.ventaCabecera?.comercio?.nombre || 'Sede';
    const fecha = ventaData?.ventaCabecera?.fecha_venta
      ? new Date(ventaData.ventaCabecera.fecha_venta).toLocaleString()
      : new Date().toLocaleString();
    const metodoPagoDoc = ventaData?.ventaCabecera?.metodo_pago || metodoPago;
    const refId = ventaData?.ventaCabecera?.id_venta || ventaData?.id_venta || '';
    const totalVenta = Number(ventaData?.ventaCabecera?.total_venta ?? total ?? 0);

    // Normalizar detalles: si la venta ya fue guardada, usar detalles; si no, usar el carrito actual
    const detalles = ventaData?.detalles?.length
      ? ventaData.detalles.map(d => ({
          nombre: d.producto?.nombre || d.nombre || 'Producto',
          cantidad: Number(d.cantidad || 1),
          precio: Number(d.precio_unitario || d.precio_venta || 0),
          precioPublico: Number(d.producto?.precio_venta_sugerido || 0),
          precioPush: Number(d.producto?.precio_pushsport || 0)
        }))
      : cart.map(item => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          precioPublico: item.precio_base || 0,
          precioPush: item.precio_push || 0
        }));

    const descuentoMonto = ventaData?.ventaCabecera?.descuento_aplicado
      ? Number(ventaData.ventaCabecera.descuento_aplicado)
      : montoDescuento;

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
    doc.text(`Método de pago: ${metodoPagoDoc}`, 8, 44);
    if (refId) doc.text(`Ref: #${String(refId).split('-')[0]}`, 8, 50);

    doc.setLineWidth(0.3);
    doc.line(8, 54, 97, 54);

    let y = 62;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('PRODUCTO', 8, y);
    doc.text('CANT', 35, y, { align: 'right' });
    doc.text('PÚBLICO', 45, y, { align: 'right' });
    doc.text('PUSH', 58, y, { align: 'right' });
    doc.text('GANANCIA', 70, y, { align: 'right' });
    doc.text('COBRADO', 82, y, { align: 'right' });
    doc.text('TOTAL', 97, y, { align: 'right' });
    y += 4;
    doc.line(8, y, 97, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    detalles.forEach(item => {
      const lineTotal = item.precio * item.cantidad;
      const ganancia = item.precioPublico - item.precioPush;
      
      doc.text(item.nombre.substring(0, 20), 8, y);
      doc.text(String(item.cantidad), 35, y, { align: 'right' });
      doc.text(`$${item.precioPublico.toLocaleString()}`, 45, y, { align: 'right' });
      doc.text(`$${item.precioPush.toLocaleString()}`, 58, y, { align: 'right' });
      
      // Ganancia en verde
      if (ganancia > 0) {
        doc.setTextColor(0, 150, 0);
        doc.text(`+$${ganancia.toLocaleString()}`, 70, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text('$0', 70, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(`$${item.precio.toLocaleString()}`, 82, y, { align: 'right' });
      doc.text(`$${lineTotal.toLocaleString()}`, 97, y, { align: 'right' });
      y += 5;
    });

    doc.setFontSize(7);
    doc.line(8, y, 97, y);
    y += 6;

    if (descuentoMonto > 0) {
      const codigoDesc = ventaData?.ventaCabecera?.codigo_descuento || descuentoAplicado?.codigo || 'Descuento';
      doc.text(`Descuento (${codigoDesc}):`, 8, y);
      doc.text(`-$${descuentoMonto.toLocaleString()}`, 97, y, { align: 'right' });
      y += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', 8, y);
    doc.text(`$${totalVenta.toLocaleString()}`, 97, y, { align: 'right' });

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
      const comercioId = selectedSucursalId || sucursalId || user?.id_comercio_asignado;
      const itemsPayload = cart.map(item => ({
        id_producto: item.id_producto,
        id_variante: item.id_variante, // Soportar variantes
        cantidadAComprar: item.cantidad,
        precio_venta: item.precio,
        precio_push: item.precio_push || 0,
        precio_base: item.precio_base || 0
      }));
      const ventaResult = await posService.registrarVenta(comercioId, user?.id_usuario, itemsPayload, total, metodoPago);
      setLastSale(ventaResult);
      generateComprobante(ventaResult);
      setCart([]);
      setDescuentoAplicado(null);
      setCodigoPromo('');
      setActiveTab('catalog');
      toast.success("Venta procesada exitosamente");
      // Recargar inventario tras la venta para reflejar stock actualizado
      const inventario = await posService.getInventarioSucursal(comercioId);
      setProducts(inventario || []);
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      const msg = error.response?.data?.error || "Error al procesar la venta";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex font-sans animate-in fade-in duration-700 relative overflow-hidden w-full">
      
      {/* CATALOG AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] shadow-premium border border-neutral-100 dark:border-gray-700 overflow-hidden h-full">
        <div className="p-3 md:p-4 border-b border-neutral-50 dark:border-gray-700 flex flex-col lg:flex-row justify-between items-center gap-3 md:gap-4 flex-wrap">
            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto flex-1">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-neutral-950 text-brand-cyan flex items-center justify-center rounded-lg shadow-lg flex-shrink-0">
                    <Box size={16} md:size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base md:text-lg font-black tracking-tighter m-0 uppercase leading-none text-neutral-950">Registrar Ventas - {currentSucursal?.nombre || 'Seleccioná sede'}</h2>
                </div>
                <button
                    onClick={() => setShowSalesInfoModal(true)}
                    className="p-2 rounded-lg bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300 hover:bg-black hover:text-white transition-colors flex-shrink-0"
                    title="¿Cómo funcionan los estados de una venta?"
                >
                    <HelpCircle size={16} />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full lg:w-auto">
                {/* SuperAdmin sucursal picker */}
                {isSuperAdmin && (
                    <div className="w-full sm:w-64">
                        <PremiumSelect
                            icon={MapPin}
                            placeholder="SELECCIONAR SEDE..."
                            isLoading={loadingSucursales}
                            options={sucursalOptions.map(s => ({ value: s.id_comercio, label: s.nombre }))}
                            value={selectedSucursalId || ''}
                            onChange={val => { setCart([]); setSelectedSucursalId(val || null); }}
                            className="!py-1"
                        />
                    </div>
                )}

                <div className="relative flex-1 w-full sm:w-56 group min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-gray-500 group-focus-within:text-brand-cyan dark:group-focus-within:text-cyan-400 transition-colors" size={14} />
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="BUSCAR..."
                        className="input-premium-v2 pl-9 py-2 md:pl-10 md:py-2.5 text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-black w-full text-ellipsis"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button
                    onClick={() => setActiveTab('cart')}
                    disabled={isProcessing}
                    className="relative bg-black text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold uppercase tracking-widest text-[9px] md:text-[10px] flex items-center gap-1.5 md:gap-2 hover:bg-brand-cyan hover:text-black transition-all shadow-premium active:scale-95 w-full sm:w-auto justify-center flex-shrink-0 disabled:opacity-50"
                >
                    <ShoppingBag size={14} />
                    Ver Carrito
                    {cart.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-brand-cyan text-black w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black shadow-md border-2 border-neutral-800">
                            {cart.reduce((s,i)=>s+i.cantidad,0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Instructional Guide - contextual help */}
            {(() => {
                let stepNum = '';
                let stepMsg = '';
                let stepIcon = null;

                if (isSuperAdmin && !selectedSucursalId) {
                    stepNum = 'Paso 1';
                    stepMsg = 'Seleccioná una sede';
                    stepIcon = <MapPin size={12} className="text-brand-cyan shrink-0" />;
                } else if (cart.length === 0 && activeTab === 'catalog') {
                    stepNum = 'Paso 2';
                    stepMsg = 'Tocá un producto para agregar al carrito';
                    stepIcon = <Package size={12} className="text-brand-cyan shrink-0" />;
                } else if (cart.length > 0 && activeTab === 'catalog') {
                    stepNum = 'Paso 3';
                    stepMsg = `${cart.reduce((s,i)=>s+i.cantidad,0)} ítems. Presioná Checkout para finalizar.`;
                    stepIcon = <ShoppingBag size={12} className="text-brand-cyan shrink-0" />;
                } else if (activeTab === 'cart' && !isProcessing) {
                    stepNum = 'Paso 4';
                    stepMsg = 'Revisá, elegí método de pago y finaliza';
                    stepIcon = <Receipt size={12} className="text-brand-cyan shrink-0" />;
                } else if (isProcessing) {
                    stepNum = 'Procesando';
                    stepMsg = 'Guardando venta...';
                    stepIcon = <Loader2 size={12} className="text-brand-cyan shrink-0 animate-spin" />;
                }

                return stepMsg ? (
                    <div className="mx-3 md:mx-4 mb-2 flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-gray-700/40 border border-neutral-200/70 dark:border-gray-600 rounded-lg">
                        {stepIcon}
                        <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 dark:text-gray-300 leading-relaxed m-0">
                            <span className="font-black text-black dark:text-white mr-1">{stepNum}:</span>{stepMsg}
                        </p>
                    </div>
                ) : null;
            })()}

            {/* System impact warning card */}
            {(!isSuperAdmin || selectedSucursalId) && (
              <div className="mx-3 md:mx-4 mb-2 flex items-start gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                <AlertCircle size={12} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[8px] md:text-[9px] text-blue-700 dark:text-blue-300 font-bold leading-relaxed m-0">
                  La venta resta stock de esta sede y suma el monto a liquidaciones. Si una variante figura como AGOTADO, es porque no tiene stock en esta sucursal. Para agregar stock, usa la seccion Envíos a Sucursales.
                </p>
              </div>
            )}
        </div>

        <div className="flex-1 p-2 md:p-3 overflow-y-auto scrollbar-hide">
          {/* SuperAdmin needs to pick a store first */}
          {isSuperAdmin && !selectedSucursalId ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 gap-4 opacity-50">
              <MapPin size={60} strokeWidth={0.5} className="text-brand-cyan" />
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[1em] text-neutral-600 dark:text-gray-300">Seleccioná una sede</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500">Cargar el inventario</p>
              </div>
            </div>
          ) : isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 gap-4 opacity-60">
                <div className="w-10 h-10 border-4 border-neutral-100 dark:border-gray-700 border-t-brand-cyan rounded-full animate-spin"></div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-400 dark:text-gray-500">Accediendo a la RED...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-32 opacity-20 filter grayscale">
              <Store size={80} strokeWidth={0.5} />
              <p className="text-xs font-black uppercase tracking-[1em] mt-8">Sin Productos</p>
            </div>
          ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 pb-20 md:pb-0">
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
                whileHover={stock > 0 ? { scale: 1.01 } : {}}
                whileTap={stock > 0 ? { scale: 0.98 } : {}}
                key={getProductId(item)}
                onClick={() => handleProductClick(item)}
                className={`group p-2 md:p-3 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl transition-all duration-300 relative cursor-pointer border ${
                  stock > 0 
                  ? 'border-neutral-100 dark:border-gray-700 shadow-sm hover:border-brand-cyan/20' 
                  : 'bg-neutral-50/50 dark:bg-gray-700/50 opacity-40 grayscale border-transparent cursor-not-allowed'
                }`}
              >
                <div className="aspect-square bg-neutral-50 mb-2 md:mb-3 rounded-lg md:rounded-xl overflow-hidden relative border border-neutral-50">
                    {img ? (
                      <img src={img} alt={nombre} className="w-full h-full object-cover transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-200">
                        <Box size={24} />
                      </div>
                    )}
                    {stock <= 0 ? (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-white font-bold text-[6px] uppercase tracking-[0.2em] border border-white/20 px-2 py-1 rounded-full">AGOTADO</span>
                        </div>
                    ) : (item.producto?.usa_variantes || item.usa_desglose_variantes || (item.variantes && item.variantes.length > 0)) ? (
                        <div className="absolute top-1 right-1 bg-black/80 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm border border-white/10 flex items-center gap-1 pointer-events-none">
                            <span>Elegir Variante</span>
                        </div>
                    ) : null}
                </div>
                
                <h3 className="font-bold text-[9px] md:text-xs uppercase tracking-tight mb-0.5 text-neutral-900 dark:text-gray-100 truncate">{nombre}</h3>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center text-neutral-900 dark:text-gray-100">
                    <span className="font-black text-base md:text-lg tracking-tighter">${precio.toLocaleString()}</span>
                    <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest ${stock < 5 ? 'text-brand-cyan dark:text-cyan-400' : 'text-neutral-400 dark:text-gray-500'}`}>
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
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-gray-500">
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
                          precio_base: Number(combo.precio_combo),
                          precio_push: 0,
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
                    <h4 className="font-black text-xs md:text-sm uppercase text-neutral-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {combo.nombre}
                    </h4>
                    {combo.descripcion && (
                      <p className="text-[9px] text-neutral-500 dark:text-gray-400 mb-2 line-clamp-1">
                        {combo.descripcion}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-neutral-600 dark:text-gray-300">$</span>
                      <span className="text-lg md:text-xl font-sport text-neutral-900 dark:text-gray-100">
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

      {/* CART AREA (DRAWER) */}
      <AnimatePresence>
      {activeTab === 'cart' && (
      <>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={() => setActiveTab('catalog')}
           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        />
        <motion.div 
           initial={{ x: '100%' }}
           animate={{ x: 0 }}
           exit={{ x: '100%' }}
           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
           className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[420px] pb-10 flex flex-col bg-white dark:bg-gray-800 shadow-2xl z-[101] border-l border-neutral-200 dark:border-gray-700 overflow-hidden"
        >
        <div className="p-4 md:p-5 border-b border-neutral-100 dark:border-gray-700 flex justify-between items-center bg-neutral-50/30 dark:bg-gray-700/30">
            <div className="flex items-center gap-3 md:gap-4">
                {/* Close Drawer Button */}
                <button 
                  onClick={() => setActiveTab('catalog')}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 flex items-center justify-center text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={20} />
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
                        <h2 className="text-lg md:text-xl font-black tracking-tighter m-0 uppercase leading-none text-neutral-900 dark:text-gray-100">Ticket</h2>
                        <span className="text-[10px] md:text-[11px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 block">
                            Terminal de venta rápida. Agregá productos y finalizá cobros en segundos.
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
        
        {/* Step 4 Guide inside Drawer */}
        {!showDrafts && activeTab === 'cart' && !isProcessing && (
            <div className="mx-4 md:mx-5 mt-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-neutral-50 dark:bg-gray-700/40 border border-neutral-200/70 dark:border-gray-600 rounded-xl shadow-sm">
                <Receipt size={13} className="text-brand-cyan shrink-0" />
                <p className="text-[9px] md:text-[10px] font-bold text-neutral-500 dark:text-gray-300 leading-relaxed m-0">
                    <span className="font-black text-black dark:text-white mr-1">Paso 4:</span>Revisá los ítems, aplicá un código promo si tenés, elegí el método de pago y presioná "Finalizar Venta".
                </p>
            </div>
        )}
        {isProcessing && (
            <div className="mx-4 md:mx-5 mt-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-neutral-50 dark:bg-gray-700/40 border border-neutral-200/70 dark:border-gray-600 rounded-xl shadow-sm">
                <Loader2 size={13} className="text-brand-cyan shrink-0 animate-spin" />
                <p className="text-[9px] md:text-[10px] font-bold text-neutral-500 dark:text-gray-300 leading-relaxed m-0">
                    <span className="font-black text-black dark:text-white mr-1">Procesando:</span>Guardando la venta, no cierres la pantalla...
                </p>
            </div>
        )}

        {/* System impact explanation in Drawer */}
        {!showDrafts && activeTab === 'cart' && !isProcessing && (
            <div className="mx-4 md:mx-5 mt-2 flex items-start gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl">
                <AlertCircle size={14} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-blue-700 dark:text-blue-300 font-bold leading-relaxed m-0 uppercase tracking-wide">
                    IMPACTO EN EL SISTEMA: Esta venta <span className="underline">restará stock automáticamente</span> en la base de datos de esta sede y <span className="underline">sumará saldo pendiente</span> en <strong className="font-black text-blue-900 dark:text-blue-100">Liquidaciones</strong>.
                </p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 scrollbar-hide">
          {showDrafts ? (
            <div className="space-y-3">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-gray-500">Ventas en Espera</h3>
                 <button onClick={() => setShowDrafts(false)} className="text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white"><X size={14} /></button>
               </div>
               {drafts.length === 0 ? (
                 <div className="text-center p-8 opacity-50">
                    <Clock size={32} className="mx-auto text-neutral-300 dark:text-gray-500 mb-3" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-gray-500">No hay ventas pausadas</p>
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
                <Store size={40} className="text-neutral-300 dark:text-gray-500" />
                <p className="text-[9px] text-neutral-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Seleccioná productos<br/>para iniciar la venta.</p>
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
                className="p-1.5 md:p-2 bg-neutral-50/50 dark:bg-gray-700/50 rounded-lg md:rounded-xl border border-neutral-100 dark:border-gray-600 flex flex-col gap-1 group"
              >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 md:gap-3">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                            {item.img 
                              ? <img src={item.img} alt={item.nombre} className="w-full h-full object-cover" />
                              : <Box size={14} className="text-neutral-400 dark:text-gray-500" />
                            }
                         </div>
                         <div className="flex flex-col min-w-0 max-w-[140px] md:max-w-none">
                            <h4 className="font-bold uppercase text-[9px] md:text-[10px] tracking-tight text-neutral-900 dark:text-gray-100 mb-0.5 md:mb-1 truncate">{item.nombre}</h4>
                            <span className="text-[8px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest">${item.precio.toLocaleString()} c/u</span>
                         </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-neutral-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 active:scale-125 transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 rounded-lg p-0.5 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-neutral-400 dark:text-gray-500 active:text-brand-cyan dark:active:text-cyan-400"><Minus size={12} /></button>
                        <span className="w-5 md:w-7 text-center font-bold text-xs md:text-sm tabular-nums text-neutral-900 dark:text-white">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-neutral-400 dark:text-gray-500 active:text-brand-cyan dark:active:text-cyan-400"><Plus size={12} /></button>
                    </div>
                    <span className="font-black text-neutral-900 dark:text-gray-100 text-sm md:text-base tracking-tighter">${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-1.5 md:p-2 bg-neutral-50 dark:bg-gray-700 border-t border-neutral-100 dark:border-gray-700 space-y-1">

            {/* Banner oferta vigente */}
            {ofertasVigentes.length > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-1 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg">
                    <Zap size={8} className="text-brand-cyan shrink-0" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-black">
                        OFERTA ACTIVA: {ofertasVigentes[0].nombre} &mdash; {ofertasVigentes[0].descuento_porcentaje}% OFF
                    </span>
                </div>
            )}

            {/* Campo código promo */}
            {!descuentoAplicado ? (
                <div className="flex gap-1">
                    <div className="relative flex-1">
                        <Tag size={7} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="CÓDIGO PROMO..."
                            value={codigoPromo}
                            onChange={e => { setCodigoPromo(e.target.value.toUpperCase()); setPromoError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleValidarCodigo()}
                            className="w-full pl-5 pr-1 py-0.5 bg-white dark:bg-gray-600 border border-neutral-200 dark:border-gray-500 rounded-lg text-[7px] font-black uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-cyan-400 transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleValidarCodigo}
                        disabled={!codigoPromo.trim() || isValidatingCodigo || cart.length === 0}
                        className="px-1 py-0.5 bg-black text-white text-[7px] font-black uppercase rounded-lg hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-30 flex items-center gap-0.5"
                    >
                        {isValidatingCodigo ? <Loader2 size={7} className="animate-spin" /> : 'OK'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between px-1.5 py-0.5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-1">
                        <CheckCircle2 size={8} className="text-green-600" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-green-700">
                            {descuentoAplicado.codigo} &mdash; -{descuentoAplicado.tipo_descuento === 'porcentaje' ? `${descuentoAplicado.valor_descuento}%` : `$${descuentoAplicado.valor_descuento.toLocaleString()}`}
                        </span>
                    </div>
                    <button onClick={handleRemoveCodigo} className="text-neutral-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <X size={8} />
                    </button>
                </div>
            )}
            {promoError && (
                <div className="flex items-center gap-1.5 px-2 py-1">
                    <AlertCircle size={10} className="text-red-500" />
                    <span className="text-[8px] font-bold text-red-500">{promoError}</span>
                </div>
            )}

            {/* Desglose de totales */}
            <div className="space-y-0.5 pt-0">
                <div className="flex justify-between text-neutral-400 dark:text-gray-500 font-extrabold uppercase text-[7px] tracking-[0.12em]">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                </div>
                {descuentoAplicado && (
                    <div className="flex justify-between font-bold text-[7px] tracking-[0.08em] text-green-600">
                        <span>Descuento ({descuentoAplicado.codigo})</span>
                        <span>-${montoDescuento.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between items-center font-bold text-[8px] tracking-[0.12em] text-neutral-500 dark:text-gray-400">
                    <span>Método de pago</span>
                    <div className="w-36">
                        <PremiumSelect
                            searchable={false}
                            compact
                            options={[
                                { value: 'Efectivo', label: 'Efectivo', icon: DollarSign },
                                { value: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
                                { value: 'Transf. Bancaria', label: 'Transf. Bancaria', icon: Landmark }
                            ]}
                            value={metodoPago}
                            onChange={val => setMetodoPago(val)}
                        />
                    </div>
                </div>
                <div className="pt-1.5 border-t border-neutral-200 flex justify-between items-end">
                    <span className="text-[7px] font-black text-neutral-400 dark:text-gray-500 uppercase tracking-[0.15em]">Total</span>
                    <motion.span
                        key={total}
                        initial={{ scale: 1.05, color: '#00d2ff' }}
                        animate={{ scale: 1, color: '#171717' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-base md:text-lg font-black tracking-tighter leading-none"
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
                        disabled={isProcessing}
                        className="flex-shrink-0 bg-neutral-100 dark:bg-gray-700 text-neutral-500 dark:text-gray-400 font-black text-[8px] uppercase tracking-widest px-1.5 py-1.5 rounded-xl hover:bg-amber-100 dark:hover:bg-gray-600 hover:text-amber-600 dark:hover:text-white transition-colors flex items-center gap-0.5 disabled:opacity-20"
                    >
                        <Clock size={10} />
                    </button>
                )}
                {lastSale && cart.length === 0 && (
                    <button
                        onClick={() => generateComprobante(lastSale)}
                        className="flex-shrink-0 bg-neutral-100 dark:bg-gray-700 text-neutral-500 dark:text-gray-400 font-black text-[8px] uppercase tracking-widest px-1.5 py-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors flex items-center gap-0.5"
                        title="Reimprimir último comprobante"
                    >
                        <Printer size={10} />
                    </button>
                )}
                <button
                    onClick={handleConfirmSale}
                    disabled={cart.length === 0 || isProcessing || showDrafts}
                    className="flex-1 btn-cyan h-9 text-[9px] flex items-center justify-center gap-1 disabled:opacity-20 transition-all active:scale-95"
                >
                    {isProcessing ? <Loader2 size={12} className="animate-spin" /> : null}
                    FINALIZAR VENTA <ChevronRight size={12} />
                </button>
            </div>
        </div>
        </motion.div>
      </>
      )}
      </AnimatePresence>

      {/* MODAL DE SELECCIÓN DE VARIANTES */}
      {showVariantesModal && selectedProduct && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVariantesModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                  Seleccionar Variante
                </h3>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                  {getProductNombre(selectedProduct)}
                </p>
              </div>
              <button
                onClick={() => setShowVariantesModal(false)}
                className="text-neutral-400 dark:text-gray-400 hover:text-neutral-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Guía de stock para el usuario */}
            {(() => {
              const variantes = selectedProduct.producto?.variantes || selectedProduct.variantes || [];
              const variantesConStock = variantes.filter(v => {
                const isFromProduct = !v.variante;
                const varDef = isFromProduct ? v : v.variante;
                const idVar = isFromProduct ? v.id_variante : v.id_variante;
                const localStockItem = selectedProduct.variantes?.find(sv => sv.id_variante === idVar);
                return (localStockItem?.cantidad_actual || 0) > 0;
              });

              if (variantesConStock.length === 0) {
                return (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500 dark:text-red-400" />
                      <p className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Todas las variantes están agotadas
                      </p>
                    </div>
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                      Este producto tiene variantes (talla, color, etc.) pero ninguna tiene stock asignado. Flujo para habilitarlo: 1) Panel de administración → Inventario, 2) Buscar el producto, 3) Seleccionar la sucursal, 4) Para cada variante, ingresar la cantidad de stock disponible. Sin stock asignado, el sistema no permite vender.
                    </p>
                  </div>
                );
              } else if (variantesConStock.length < variantes.length) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" />
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        Solo {variantesConStock.length} de {variantes.length} variantes con stock
                      </p>
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 leading-relaxed">
                      Seleccioná una variante que muestre stock disponible para agregarla al carrito.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {(selectedProduct.producto?.variantes || selectedProduct.variantes || [])
                .map(v => {
                  // Si no tiene la propiedad 'variante', viene de producto.variantes
                  const isFromProduct = !v.variante;
                  const varDef = isFromProduct ? v : v.variante;
                  const idVar = isFromProduct ? v.id_variante : v.id_variante;

                  const localStockItem = selectedProduct.variantes?.find(sv => sv.id_variante === idVar);
                  const stockVar = localStockItem?.cantidad_actual || 0;

                  // Intentar parsear atributos si por alguna razón vienen como string
                  let atributos = varDef?.atributos_valores || {};
                  if (typeof atributos === 'string') {
                    try { atributos = JSON.parse(atributos); } catch(e) {}
                  }

                  // Mostrar solo los valores de los atributos, sin las claves
                  const formatAtributos = () => {
                     const values = Object.values(atributos);
                     if (values.length === 0) return 'Sin atributos definidos';
                     return values.join(' - ');
                  };

                  return (
                    <button
                      key={idVar}
                      onClick={() => stockVar > 0 ? addVarianteToCart(selectedProduct, { ...localStockItem, id_variante: idVar, variante: varDef }) : null}
                      disabled={stockVar <= 0}
                      className={`w-full p-3 md:p-4 rounded-xl border transition-all text-left flex items-center justify-between
                        ${stockVar > 0
                          ? 'bg-neutral-50 dark:bg-gray-700 hover:bg-brand-cyan/10 dark:hover:bg-brand-cyan/20 border-neutral-100 dark:border-gray-600 hover:border-brand-cyan/30'
                          : 'bg-neutral-50/50 dark:bg-gray-800/50 border-transparent opacity-50 cursor-not-allowed grayscale'}`}
                    >
                      <div>
                        <p className="font-bold text-sm text-neutral-900 dark:text-gray-100">
                          {formatAtributos()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-neutral-900 dark:text-gray-100">
                          ${getProductPrecio(selectedProduct).toLocaleString()}
                        </p>
                        <p className={`text-xs font-bold ${stockVar < 5 && stockVar > 0 ? 'text-brand-cyan dark:text-cyan-400' : 'text-neutral-400 dark:text-gray-400'}`}>
                          {stockVar > 0 ? `${stockVar} DISP.` : 'AGOTADO'}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
            
            <button
              onClick={() => setShowVariantesModal(false)}
              className="w-full mt-4 py-3 bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300 font-bold text-xs uppercase rounded-xl hover:bg-neutral-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* MODAL INFORMATIVO: ESTADOS DE VENTAS */}
      <Modal isOpen={showSalesInfoModal} onClose={() => setShowSalesInfoModal(false)} title="¿Cómo funcionan las ventas?">
        <div className="p-2 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Diagrama de transiciones */}
          <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl border border-neutral-200 dark:border-gray-600">
            <p className="text-[10px] font-black uppercase text-neutral-500 mb-3">Estados de una venta</p>
            <div className="flex flex-col gap-2 text-[10px] sm:text-xs font-bold">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">ACTIVA</span>
                <ArrowRight size={14} className="text-neutral-400" />
                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded">LIQUIDADA</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">ACTIVA</span>
                <ArrowRight size={14} className="text-neutral-400" />
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">RECTIFICADA</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">ACTIVA</span>
                <ArrowRight size={14} className="text-neutral-400" />
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded">ANULADA</span>
              </div>
            </div>
          </div>

          {/* Explicación de cada estado */}
          <div className="space-y-2">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs font-black text-green-800 dark:text-green-300 uppercase">ACTIVA</span>
              </div>
              <p className="text-[10px] text-green-700 dark:text-green-300 leading-relaxed">
                Venta normal recién creada. Puede liquidarse o rectificarse. Mientras esté activa, su monto suma al saldo a liquidar de la sucursal.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw size={14} className="text-amber-600" />
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase">RECTIFICADA</span>
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                La venta fue reemplazada por una nueva. El stock y el saldo se ajustan. Se conserva el historial completo con la venta original y la nueva.
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <XCircle size={14} className="text-red-600" />
                <span className="text-xs font-black text-red-800 dark:text-red-300 uppercase">ANULADA</span>
              </div>
              <p className="text-[10px] text-red-700 dark:text-red-300 leading-relaxed">
                Venta cancelada sin crear una nueva. El stock se devuelve y el saldo se descuenta. Queda registrado el motivo.
              </p>
            </div>

            <div className="p-3 bg-neutral-100 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={14} className="text-neutral-600 dark:text-gray-300" />
                <span className="text-xs font-black text-neutral-800 dark:text-gray-200 uppercase">LIQUIDADA</span>
              </div>
              <p className="text-[10px] text-neutral-700 dark:text-gray-300 leading-relaxed">
                Venta incluida en una liquidación. Ya no se puede rectificar ni anular, porque el cierre de caja ya fue confirmado.
              </p>
            </div>
          </div>

          {/* Explicación de rectificaciones y liquidaciones */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
            <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase mb-2 flex items-center gap-2">
              <Info size={14} /> ¿Qué es una rectificación?
            </p>
            <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed mb-2">
              Es una corrección de una venta activa. Por ejemplo, si te equivocaste en el precio, la cantidad o el producto, podés anular la venta original y generar una nueva corregida. Solo los usuarios con rol Admin pueden hacerlo.
            </p>
            <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
              <strong>Las liquidaciones</strong> son el cierre de caja: agrupan las ventas activas seleccionadas, generan el recibo y reinician el saldo de la sucursal. Antes de liquidar, el sistema te permite elegir cuáles ventas incluir; las que no incluyas quedan activas para rectificar después.
            </p>
          </div>
        </div>
      </Modal>

      {/* MOBILE FLOATING CART BUTTON */}
      {cartItemsCount > 0 && activeTab === 'catalog' && (
        <button 
          onClick={() => setActiveTab('cart')}
          className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-cyan text-black px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,210,255,0.4)] flex items-center gap-4 animate-bounce-slow z-40 animate-in slide-in-from-bottom-5 duration-500"
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
