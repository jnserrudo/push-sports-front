import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  Search, 
  Store, 
  Download, 
  Package,
  Plus,
  Eye,
  EyeOff,
  Loader2,
  ListPlus,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { productosService } from '../../services/productosService';
import { sucursalesService } from '../../services/sucursalesService';
import { inventarioService } from '../../services/inventarioService';
import ReportPDF from '../../components/reports/ReportPDF';
import ShopReportPDF from '../../components/reports/ShopReportPDF';
import { 
  parseImagenes,
  prefetchProductImages
} from '../../lib/supabaseStorage';
import Toaster from '../../components/ui/Toaster';

const Reporteria = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopSearchTerm, setShopSearchTerm] = useState('');

  // Image prefetch map: { id_producto: base64string | null }
  const [imageMap, setImageMap] = useState({});
  const [prefetchingImages, setPrefetchingImages] = useState(false);

  // Shop Mode — step wizard
  // step 1 = choose sucursal, step 2 = build report
  const [shopStep, setShopStep] = useState(1);
  const [sucursal, setSucursal] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSearch, setSucursalSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingProduct, setAddingProduct] = useState(null); // id_producto being loaded

  // Toggles
  const [showPushPriceGlobal, setShowPushPriceGlobal] = useState(false);
  const [showPushPriceShop, setShowPushPriceShop] = useState(false);

  const [toaster, setToaster] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, sucData] = await Promise.all([
        productosService.getAll(),
        sucursalesService.getAll()
      ]);
      const prods = prodData || [];
      setProducts(prods);
      setSucursales(sucData || []);
      // Pre-fetch all images as base64 so PDFs can embed them
      setPrefetchingImages(true);
      const map = await prefetchProductImages(prods);
      setImageMap(map);
      setPrefetchingImages(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setToaster({ type: 'error', message: 'Tu sesión ha expirado' });
      } else {
        setToaster({ type: 'error', message: 'Error al sincronizar datos' });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.marca?.nombre_marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShopProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
    p.marca?.nombre_marca?.toLowerCase().includes(shopSearchTerm.toLowerCase())
  );

  const filteredSucursales = sucursales.filter(s =>
    s.nombre?.toLowerCase().includes(sucursalSearch.toLowerCase())
  );

  const handlePriceChange = (id, field, value) => {
    setProducts(prev => prev.map(p =>
      p.id_producto === id ? { ...p, [field]: Number(value) } : p
    ));
  };

  const handleSelectSucursal = (s) => {
    setSucursal(s);
    setSelectedItems([]);
    setShopStep(2);
    setSucursalSearch('');
  };

  const handleAddProduct = useCallback(async (p) => {
    if (selectedItems.find(item => item.producto.id_producto === p.id_producto)) {
      setToaster({ type: 'error', message: 'Este producto ya está en el listado' });
      return;
    }
    setAddingProduct(p.id_producto);
    try {
      const inv = await inventarioService.getBySucursal(sucursal.id_comercio);
      const stockItem = inv.find(i => i.id_producto === p.id_producto);
      const stockComercio = stockItem ? stockItem.cantidad_actual : 0;
      const stockCentral = p.stock_central ?? 0;
      setSelectedItems(prev => [
        ...prev,
        {
          producto: p,
          stockAnterior: stockComercio,
          stockCentral,
          cantidadDejada: 0,
          precio_venta_sugerido: p.precio_venta_sugerido,
          precio_pushsport: p.precio_pushsport
        }
      ]);
    } catch (error) {
      console.error(error);
      setToaster({ type: 'error', message: 'Error al obtener stock' });
    } finally {
      setAddingProduct(null);
    }
  }, [sucursal, selectedItems]);

  const removeItemFromReport = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      {toaster && <Toaster type={toaster.type} message={toaster.message} onClose={() => setToaster(null)} />}
      
      <AnimatePresence>
        {loading && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center"
            >
                <Loader2 className="w-12 h-12 text-brand-cyan animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-900">Sincronizando datos...</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
        <div className="flex items-center gap-4 md:gap-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl border-4 border-white shrink-0">
                <ClipboardList className="text-brand-cyan w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-black text-brand-cyan uppercase tracking-[0.4em] leading-none">Push Sport</span>
                <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter mt-1 leading-none uppercase">Reportería</h1>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1 hidden md:block">
                  Generá reportes de precios y visitas a comercios
                </p>
            </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 p-1.5 rounded-2xl w-full md:w-auto gap-1">
            <button 
                onClick={() => setActiveTab('global')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 md:px-8 py-3 md:py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'global' ? 'bg-white text-black shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
                <Download size={13} />
                Lista de Precios
            </button>
            <button 
                onClick={() => setActiveTab('shop')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 md:px-8 py-3 md:py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'bg-white text-black shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
                <Store size={13} />
                Visita a Comercio
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'global' ? (
          <motion.div
            key="global"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Context banner */}
            <div className="bg-neutral-900 rounded-2xl px-4 md:px-6 py-4 flex flex-col gap-3 mb-0">
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tight">Lista de Precios para Comercios</p>
                <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  El <span className="text-white">precio público</span> siempre se incluye en el PDF. Podés activar el precio Push si querés enviarlo también.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {prefetchingImages && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <Loader2 size={12} className="animate-spin text-brand-cyan" /> Preparando...
                  </span>
                )}
                <button
                  onClick={() => setShowPushPriceGlobal(!showPushPriceGlobal)}
                  className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest border-2 ${
                    showPushPriceGlobal
                      ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/30'
                  }`}
                >
                  {showPushPriceGlobal ? <Eye size={13} /> : <EyeOff size={13} />}
                  {showPushPriceGlobal ? 'Precio Push: ON' : 'Precio Push: OFF'}
                </button>
                <PDFDownloadLink
                  document={<ReportPDF products={filteredProducts} imageMap={imageMap} currentDate={new Date().toLocaleDateString()} showPushPrice={showPushPriceGlobal} />}
                  fileName={`Lista_Precios_${new Date().toLocaleDateString()}.pdf`}
                  className="h-9 px-5 bg-brand-cyan text-black rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest"
                >
                  {({ loading: pdfLoading }) => (
                    pdfLoading
                      ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                      : <><Download size={13} /> Descargar PDF</>
                  )}
                </PDFDownloadLink>
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-neutral-100">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-5 h-12 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-brand-cyan outline-none transition-all font-bold text-sm"
                  />
                </div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest shrink-0">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0 rounded-none md:rounded-3xl border-y md:border border-neutral-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50/80 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-5">Producto</th>
                      {showPushPriceGlobal && (
                        <th className="px-6 py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-brand-cyan/10 text-brand-cyan px-3 py-1 rounded-lg">
                            <Eye size={10} /> P. Push
                          </span>
                        </th>
                      )}
                      <th className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5">P. Público</span>
                        <span className="block text-[8px] text-neutral-300 normal-case font-bold tracking-normal mt-0.5">siempre visible en PDF</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {loading && filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={showPushPriceGlobal ? 3 : 2} className="py-20 text-center opacity-30">
                          <div className="flex flex-col items-center justify-center">
                            <span className="animate-spin w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full mb-3"></span>
                            <p className="text-xs font-black uppercase tracking-widest">Cargando catálogo...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredProducts.map(p => (
                      <tr key={p.id_producto} className="hover:bg-neutral-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border-2 border-neutral-100 overflow-hidden shrink-0 group-hover:border-brand-cyan/30 transition-all">
                              {imageMap[p.id_producto] ? (
                                <img src={imageMap[p.id_producto]} className="w-full h-full object-cover" />
                              ) : parseImagenes(p.imagen_url)[0] ? (
                                <img src={parseImagenes(p.imagen_url)[0]} className="w-full h-full object-cover" />
                              ) : <Package className="text-neutral-200" size={22} />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-neutral-900 uppercase leading-none">{p.nombre}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">{p.marca?.nombre_marca || 'General'}</span>
                                {p.atributos?.sabores && p.atributos.sabores.length > 0 && (
                                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">· {p.atributos.sabores.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {showPushPriceGlobal && (
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-neutral-300 text-xs font-black">$</span>
                              <input
                                type="number"
                                min="0"
                                value={p.precio_pushsport}
                                onChange={(e) => handlePriceChange(p.id_producto, 'precio_pushsport', e.target.value)}
                                className="w-28 h-10 bg-brand-cyan/5 border-2 border-brand-cyan/20 rounded-lg text-center font-black text-sm outline-none focus:border-brand-cyan transition-all"
                              />
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-neutral-300 text-xs font-black">$</span>
                            <input
                              type="number"
                              min="0"
                              value={p.precio_venta_sugerido}
                              onChange={(e) => handlePriceChange(p.id_producto, 'precio_venta_sugerido', e.target.value)}
                              className="w-28 h-10 bg-neutral-50 border-2 border-neutral-100 rounded-lg text-center font-black text-sm outline-none focus:border-brand-cyan transition-all"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Context banner for shop mode */}
            <div className="bg-neutral-900 rounded-2xl px-6 py-4">
              <p className="text-white font-black text-sm uppercase tracking-tight">Reporte de Visita a Comercio</p>
              <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Elegí la sucursal a visitar, seleccioná los productos que vas a dejar, ingresá las cantidades y generá el PDF para el comercio.
                El <span className="text-white">precio público siempre aparece</span> en el reporte — podés incluir el precio Push opcionalmente.
              </p>
            </div>

            {/* ── Step indicator ── */}
            <div className="flex items-center">
              <button
                onClick={() => { setShopStep(1); setSucursal(null); setSelectedItems([]); }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-l-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                  shopStep === 1
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  shopStep > 1 ? 'bg-brand-cyan text-black' : 'bg-brand-cyan text-black'
                }`}>
                  {shopStep > 1 ? <CheckCircle2 size={12} /> : '1'}
                </span>
                <Store size={13} />
                {shopStep > 1 && sucursal
                  ? <><span className="text-neutral-400 font-bold normal-case hidden sm:inline">Sucursal:</span> <span className="text-brand-cyan truncate max-w-[100px]">{sucursal.nombre}</span></>
                  : 'Elegir Sucursal'
                }
              </button>
              <div className="h-[38px] w-px bg-neutral-200" />
              <div
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-r-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                  shopStep === 2
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-300 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  shopStep === 2 ? 'bg-brand-cyan text-black' : 'bg-neutral-200 text-neutral-400'
                }`}>2</span>
                <ListPlus size={13} /> Armar Reporte
                {selectedItems.length > 0 && (
                  <span className="bg-brand-cyan text-black text-[9px] font-black px-2 py-0.5 rounded-full">{selectedItems.length}</span>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Select sucursal ── */}
              {shopStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-neutral-100"
                >
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                      <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Store className="text-brand-cyan w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter mb-2">¿A qué comercio vas a ir?</h3>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest max-w-sm mx-auto">
                        Seleccioná el comercio destino. El sistema va a consultar el stock actual de cada producto para ese local.
                      </p>
                    </div>

                    {/* Search — always visible, scales from 2 to 200 sucursales */}
                    <div className="relative mb-6">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        placeholder={`Buscar entre ${sucursales.length} comercio${sucursales.length !== 1 ? 's' : ''}...`}
                        value={sucursalSearch}
                        onChange={(e) => setSucursalSearch(e.target.value)}
                        className="w-full pl-14 pr-5 h-14 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-brand-cyan outline-none transition-all font-bold text-sm"
                      />
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                      sucursales.length > 8 ? 'max-h-[480px] overflow-y-auto pr-1' : ''
                    }`}>
                      {filteredSucursales.map(s => (
                        <button
                          key={s.id_comercio}
                          onClick={() => handleSelectSucursal(s)}
                          className="group w-full flex items-center gap-5 p-5 bg-neutral-50 border-2 border-neutral-100 rounded-2xl hover:border-brand-cyan hover:bg-white hover:shadow-lg transition-all text-left"
                        >
                          <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-cyan/10 transition-all">
                            <Store className="text-neutral-400 group-hover:text-brand-cyan transition-colors" size={24} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-neutral-900 uppercase tracking-tight text-sm">{s.nombre}</p>
                            {s.direccion && <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest truncate mt-0.5">{s.direccion}</p>}
                          </div>
                          <ChevronRight className="text-neutral-300 group-hover:text-brand-cyan transition-colors shrink-0" size={20} />
                        </button>
                      ))}
                      {filteredSucursales.length === 0 && (
                        <div className="col-span-2 py-10 text-center text-neutral-400">
                          <p className="text-xs font-black uppercase tracking-widest">No se encontraron sucursales</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Build report ── */}
              {shopStep === 2 && sucursal && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
                >
                  {/* Left: Catalog */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-premium border border-neutral-100 flex flex-col" style={{ height: '60vh', minHeight: '320px' }}>
                      <div className="mb-4 space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                          <Plus size={16} className="text-brand-cyan" /> Productos a dejar
                        </h3>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Tocá el <span className="text-brand-cyan">+</span> para agregar al reporte</p>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={shopSearchTerm}
                            onChange={(e) => setShopSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 h-11 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-brand-cyan outline-none transition-all font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {filteredShopProducts.map(p => {
                          const alreadyAdded = !!selectedItems.find(i => i.producto.id_producto === p.id_producto);
                          const isLoading = addingProduct === p.id_producto;
                          return (
                            <div
                              key={p.id_producto}
                              className={`group flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                                alreadyAdded
                                  ? 'bg-brand-cyan/5 border-brand-cyan/30 opacity-60'
                                  : 'bg-neutral-50 border-neutral-100 hover:border-brand-cyan/40 hover:bg-white'
                              }`}
                            >
                              <div className="w-11 h-11 rounded-lg bg-white border border-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {imageMap[p.id_producto] ? (
                                  <img src={imageMap[p.id_producto]} className="w-full h-full object-cover" />
                                ) : parseImagenes(p.imagen_url)[0] ? (
                                  <img src={parseImagenes(p.imagen_url)[0]} className="w-full h-full object-cover" />
                                ) : <Package className="text-neutral-200" size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-neutral-900 uppercase truncate leading-tight">{p.nombre}</p>
                                <p className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest truncate">{p.marca?.nombre_marca || 'General'}</p>
                              </div>
                              <button
                                onClick={() => !alreadyAdded && handleAddProduct(p)}
                                disabled={alreadyAdded || isLoading}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                  alreadyAdded
                                    ? 'bg-brand-cyan/20 text-brand-cyan cursor-default'
                                    : 'bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-black'
                                }`}
                              >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : alreadyAdded ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Report builder */}
                  <div className="lg:col-span-2 space-y-4 md:space-y-5">
                    {/* Actions bar */}
                    <div className="bg-neutral-900 rounded-2xl px-4 md:px-5 py-3 md:py-3.5 flex flex-wrap items-center justify-between gap-2 md:gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-cyan/20 rounded-lg flex items-center justify-center">
                          <Store className="text-brand-cyan" size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Preparando reporte para</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight leading-none">{sucursal.nombre}</p>
                        </div>
                        <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPushPriceShop(!showPushPriceShop)}
                          className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all text-[9px] font-black uppercase tracking-widest border-2 ${
                            showPushPriceShop
                              ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/30'
                          }`}
                        >
                          {showPushPriceShop ? <Eye size={12} /> : <EyeOff size={12} />}
                          {showPushPriceShop ? 'P. Push: ON' : 'P. Push: OFF'}
                        </button>
                        {(() => {
                          const hayExceso = selectedItems.some(i => i.cantidadDejada > (i.stockCentral ?? 0));
                          const nada = selectedItems.length === 0;
                          return (
                            <>
                              {hayExceso && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                                  <AlertCircle size={11} className="text-amber-400 shrink-0" />
                                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Superás el stock central</span>
                                </div>
                              )}
                              {nada ? (
                                <button
                                  disabled
                                  className="h-9 px-5 rounded-xl flex items-center gap-2 bg-neutral-700 text-neutral-500 cursor-not-allowed font-black uppercase tracking-widest text-[10px]"
                                >
                                  <Download size={13} /> Generar PDF
                                </button>
                              ) : (
                                <PDFDownloadLink
                                  document={<ShopReportPDF shopName={sucursal.nombre} items={selectedItems} imageMap={imageMap} currentDate={new Date().toLocaleDateString()} showPushPrice={showPushPriceShop} />}
                                  fileName={`Reporte_${sucursal.nombre}_${new Date().toLocaleDateString()}.pdf`}
                                  className={`h-9 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md font-black uppercase tracking-widest text-[10px] ${
                                    hayExceso
                                      ? 'bg-amber-500/80 text-black hover:scale-105'
                                      : 'bg-brand-cyan text-black hover:scale-105'
                                  }`}
                                >
                                  {({ loading: pdfLoading }) => pdfLoading
                                    ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                                    : <><Download size={13} />{hayExceso ? ' PDF (con advertencia)' : ` Generar PDF (${selectedItems.length})`}</>
                                  }
                                </PDFDownloadLink>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-neutral-100 min-h-[300px] md:min-h-[450px] flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-black text-neutral-900 tracking-tighter uppercase">Productos a entregar</h3>
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Ingresá cuántas unidades vas a dejar en el comercio</p>
                        </div>
                        {selectedItems.length > 0 && (
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 border border-neutral-200 px-3 py-1 rounded-lg">
                            {selectedItems.length} producto{selectedItems.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {selectedItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                          <ListPlus size={56} strokeWidth={1} className="text-brand-cyan/20 mb-4" />
                          <p className="text-sm font-black text-neutral-300 uppercase tracking-widest">Sin productos todavía</p>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2 max-w-xs mx-auto">
                            Usá el panel izquierdo para agregar productos que vas a dejar en <span className="text-brand-cyan">{sucursal.nombre}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedItems.map((item, idx) => (
                            <div key={idx} className="p-5 bg-neutral-50 rounded-2xl border-2 border-neutral-100 hover:border-brand-cyan/20 transition-all">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-white border-2 border-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                                  {imageMap[item.producto.id_producto] ? (
                                    <img src={imageMap[item.producto.id_producto]} className="w-full h-full object-cover" />
                                  ) : parseImagenes(item.producto.imagen_url)[0] ? (
                                    <img src={parseImagenes(item.producto.imagen_url)[0]} className="w-full h-full object-cover" />
                                  ) : <Package className="text-neutral-200" size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-neutral-900 uppercase tracking-tight text-sm">{item.producto.nombre}</p>
                                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mt-0.5">{item.producto.marca?.nombre_marca || 'General'}</p>
                                </div>
                                <button
                                  onClick={() => removeItemFromReport(idx)}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {/* Stock row */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                                {/* Col 1: Stock en comercio */}
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Stock comercio</label>
                                  <div className="h-11 bg-white border-2 border-neutral-100 rounded-xl flex items-center justify-center font-black text-sm text-neutral-500">
                                    {item.stockAnterior}
                                    <span className="text-[8px] ml-1 text-neutral-300 font-bold">uds</span>
                                  </div>
                                </div>

                                {/* Col 2: Disponible central */}
                                <div className="space-y-1.5">
                                  {(() => {
                                    const sc = item.stockCentral ?? 0;
                                    const excede = item.cantidadDejada > sc;
                                    return (
                                      <>
                                        <label className={`text-[9px] font-black uppercase tracking-widest ${excede ? 'text-amber-500' : 'text-neutral-400'}`}>Central disponible</label>
                                        <div className={`h-11 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all ${
                                          excede
                                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                                            : sc === 0
                                              ? 'bg-neutral-50 border-neutral-200 text-neutral-300'
                                              : 'bg-white border-neutral-100 text-neutral-700'
                                        }`}>
                                          {sc}
                                          <span className="text-[8px] ml-1 opacity-60 font-bold">uds</span>
                                        </div>
                                        {excede && (
                                          <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Superás el stock</p>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>

                                {/* Col 3: A dejar */}
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-cyan">A dejar</label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.cantidadDejada || ''}
                                    onChange={(e) => {
                                      const v = Math.max(0, Number(e.target.value));
                                      setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, cantidadDejada: v } : it));
                                    }}
                                    className={`w-full h-11 rounded-xl px-2 text-center font-black text-sm outline-none transition-all placeholder:text-neutral-200 border-2 ${
                                      item.cantidadDejada > (item.stockCentral ?? 0)
                                        ? 'bg-red-50 border-red-400 text-red-600 focus:border-red-500'
                                        : 'bg-white border-brand-cyan/50 focus:border-brand-cyan'
                                    }`}
                                  />
                                </div>

                                {/* Col 4: Stock nuevo en comercio */}
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Stock nuevo</label>
                                  <div className={`h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                                    item.cantidadDejada > 0 ? 'bg-neutral-900 text-brand-cyan' : 'bg-neutral-50 text-neutral-400 border-2 border-neutral-100'
                                  }`}>
                                    {item.stockAnterior + item.cantidadDejada}
                                    <span className="text-[8px] ml-1 opacity-60 font-bold">uds</span>
                                  </div>
                                </div>

                                {/* Col 5: P. Público */}
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">P. Público (PDF)</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 font-bold text-xs">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.precio_venta_sugerido}
                                      onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, precio_venta_sugerido: v } : it));
                                      }}
                                      className="w-full h-11 bg-white border-2 border-neutral-100 rounded-xl pl-7 pr-2 font-black text-sm outline-none focus:border-brand-cyan transition-all"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedItems.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-wrap justify-between items-center gap-4">
                          <div className="text-xs font-black uppercase tracking-widest">
                            <p className="text-neutral-400">Total unidades a dejar</p>
                            <p className="text-3xl text-neutral-900 tracking-tighter mt-1">{selectedItems.reduce((a, c) => a + c.cantidadDejada, 0)}</p>
                          </div>
                          <div className="text-right text-xs font-black uppercase tracking-widest">
                            <p className="text-neutral-400">Productos en reporte</p>
                            <p className="text-3xl text-neutral-900 tracking-tighter mt-1">{selectedItems.length}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reporteria;
