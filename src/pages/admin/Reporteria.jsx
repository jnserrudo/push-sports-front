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
  X,
  Mail,
  DollarSign,
  Info,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../api/api';
import { Link } from 'react-router-dom';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { productosService } from '../../services/productosService';
import { sucursalesService } from '../../services/sucursalesService';
import { inventarioService } from '../../services/inventarioService';
import { reportesEntregaService } from '../../services/reportesEntregaService';
import ReportPDF from '../../components/reports/ReportPDF';
import ShopReportPDF from '../../components/reports/ShopReportPDF';
import ShopStockPDF from '../../components/reports/ShopStockPDF';
import { 
  parseImagenes,
  prefetchProductImages
} from '../../lib/supabaseStorage';
import Toaster from '../../components/ui/Toaster';
import DataTable from '../../components/ui/DataTable';
import BulkPriceUpdateModal from '../../components/modals/BulkPriceUpdateModal';
import { exportToExcel } from '../../utils/exportExcel';

const Reporteria = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopSearchTerm, setShopSearchTerm] = useState('');
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);

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

  // Shop sub-tab: 'entrega' | 'inventario'
  const [shopSubTab, setShopSubTab] = useState('entrega');
  const [stockInventory, setStockInventory] = useState([]);
  const [loadingStockInventory, setLoadingStockInventory] = useState(false);
  const [stockInventorySearch, setStockInventorySearch] = useState('');

  // Toggles
  const [showPushPriceGlobal, setShowPushPriceGlobal] = useState(false);
  const [showPushPriceShop, setShowPushPriceShop] = useState(false);
  const [showBasePriceShop, setShowBasePriceShop] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  const [toaster, setToaster] = useState(null);

  // Helper para labels con tooltip explicativo
  const LabelTip = ({ label, tip }) => (
    <span className="group/tooltip relative inline-flex items-center gap-1">
      {label}
      <Info size={10} className="text-neutral-400 dark:text-gray-500 cursor-help" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-900 dark:bg-gray-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20 shadow-lg normal-case tracking-normal leading-snug">
        {tip}
      </span>
    </span>
  );

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

  // Los precios son de solo lectura - se modifican desde la sección de Productos

  const handleSelectSucursal = (s) => {
    setSucursal(s);
    setSelectedItems([]);
    setShopStep(2);
    setSucursalSearch('');
    if (shopSubTab === 'inventario') {
      loadStockInventory(s.id_comercio);
    }
  };

  const loadStockInventory = async (comercioId) => {
    if (!comercioId) return;
    setLoadingStockInventory(true);
    try {
      const inv = await inventarioService.getBySucursal(comercioId);
      // Ordenar: primero con stock, luego sin stock, ambos por nombre
      const sorted = (inv || []).sort((a, b) => {
        const stockA = a.producto?.usa_desglose_variantes || a.usa_desglose_variantes
          ? (a.variantes || []).reduce((sum, v) => sum + (v.cantidad_actual || 0), 0)
          : (a.cantidad_actual || 0);
        const stockB = b.producto?.usa_desglose_variantes || b.usa_desglose_variantes
          ? (b.variantes || []).reduce((sum, v) => sum + (v.cantidad_actual || 0), 0)
          : (b.cantidad_actual || 0);
        if (stockB > 0 && stockA === 0) return 1;
        if (stockA > 0 && stockB === 0) return -1;
        return (a.producto?.nombre || '').localeCompare(b.producto?.nombre || '');
      });
      setStockInventory(sorted);
    } catch (error) {
      console.error('Error cargando inventario:', error);
      setToaster({ type: 'error', message: 'Error al cargar el inventario de la sucursal' });
    } finally {
      setLoadingStockInventory(false);
    }
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
          precio_pushsport: p.precio_pushsport,
          precio_base: p.costo_compra
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

  const dateStamp = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

  const handleExportGlobalExcel = () => {
    const rows = [...filteredProducts]
      .filter(p => p.activo !== false)
      .sort((a, b) => (a.codigo_producto?.codigo || '').localeCompare(b.codigo_producto?.codigo || ''))
      .map(p => ({
        _imageUrl: parseImagenes(p.imagen_url)[0] || '',
        Codigo: p.codigo_producto?.codigo || '',
        Producto: p.nombre || '',
        Marca: p.marca?.nombre_marca || '',
        'Precio Push': Number(p.precio_pushsport || 0),
        'Precio Publico': Number(p.precio_venta_sugerido || 0),
      }));
    exportToExcel(rows, `Lista_Precios_${dateStamp()}`);
  };

  const handleExportEntregaExcel = () => {
    if (!sucursal || selectedItems.length === 0) return;
    const rows = [...selectedItems]
      .sort((a, b) => (a.producto?.codigo_producto?.codigo || '').localeCompare(b.producto?.codigo_producto?.codigo || ''))
      .map(item => ({
        _imageUrl: parseImagenes(item.producto?.imagen_url)[0] || '',
        Sucursal: sucursal.nombre,
        Codigo: item.producto?.codigo_producto?.codigo || '',
        Producto: item.producto?.nombre || '',
        Cantidad: Number(item.cantidadDejada) || 0,
        'Precio Publico': Number(item.precio_venta_sugerido) || 0,
        'Precio Push': Number(item.precio_pushsport) || 0,
      }));
    exportToExcel(rows, `Reporte_Entrega_${sucursal.nombre}_${dateStamp()}`);
  };

  const handleExportStockExcel = () => {
    if (!sucursal || stockInventory.length === 0) return;
    const rows = stockInventory.map(item => {
      const prod = item.producto || item;
      const cantidad = item.producto?.usa_desglose_variantes || item.usa_desglose_variantes
        ? (item.variantes || []).reduce((sum, v) => sum + (v.cantidad_actual || 0), 0)
        : (item.cantidad_actual || 0);
      return {
        _imageUrl: parseImagenes(prod.imagen_url)[0] || '',
        Sucursal: sucursal.nombre,
        Codigo: prod.codigo_producto?.codigo || '',
        Producto: prod.nombre || '',
        Stock: cantidad,
        'Precio Publico': Number(prod.precio_venta_sugerido || 0),
        'Precio Push': Number(prod.precio_pushsport || 0),
      };
    });
    exportToExcel(rows, `Inventario_${sucursal.nombre}_${dateStamp()}`);
  };

  const handleDownloadReport = async () => {
    if (!sucursal || selectedItems.length === 0) return;
    setSavingReport(true);
    try {
      const detalles = selectedItems.map(item => ({
        id_producto: item.producto.id_producto,
        cantidad: Number(item.cantidadDejada) || 0,
        precio_venta: Number(item.precio_venta_sugerido) || 0,
        precio_pushsport: Number(item.precio_pushsport) || 0,
        precio_base: Number(item.precio_base) || 0
      }));

      const { data: savedData } = await reportesEntregaService.create({
        id_comercio: sucursal.id_comercio,
        detalles
      });

      const reporte = savedData?.data || savedData;
      const numeroReporte = reporte?.numero_reporte || '';

      const sortedSelectedItems = [...selectedItems].sort((a,b) => (a.producto?.codigo_producto?.codigo || '').localeCompare(b.producto?.codigo_producto?.codigo || ''));

      const blob = await pdf(
        <ShopReportPDF
          shopName={sucursal.nombre}
          items={sortedSelectedItems}
          imageMap={imageMap}
          currentDate={new Date().toLocaleDateString()}
          showPushPrice={showPushPriceShop}
          showBasePrice={showBasePriceShop}
          reportNumber={numeroReporte}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_${numeroReporte}_${sucursal.nombre}_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToaster({ type: 'success', message: `Reporte ${numeroReporte} guardado y descargado` });
    } catch (error) {
      console.error('Error guardando/descargando reporte:', error);
      setToaster({ type: 'error', message: error.response?.data?.error || 'Error al guardar o descargar el reporte' });
    } finally {
      setSavingReport(false);
    }
  };

  const handleDownloadStockPDF = async () => {
    if (!sucursal || stockInventory.length === 0) return;
    try {
      const itemsForPdf = stockInventory.map(item => {
        const prod = item.producto || item;
        const cantidad = item.producto?.usa_desglose_variantes || item.usa_desglose_variantes
          ? (item.variantes || []).reduce((sum, v) => sum + (v.cantidad_actual || 0), 0)
          : (item.cantidad_actual || 0);
        return {
          ...prod,
          cantidad_actual: cantidad,
          precio_venta_sugerido: prod.precio_venta_sugerido,
          precio_pushsport: prod.precio_pushsport,
          costo_compra: prod.costo_compra
        };
      });

      const sortedItemsForPdf = itemsForPdf.sort((a,b) => (a.codigo_producto?.codigo || '').localeCompare(b.codigo_producto?.codigo || ''));

      const blob = await pdf(
        <ShopStockPDF
          shopName={sucursal.nombre}
          items={sortedItemsForPdf}
          imageMap={imageMap}
          currentDate={new Date().toLocaleDateString()}
          showPushPrice={showPushPriceShop}
          showBasePrice={showBasePriceShop}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Inventario_${sucursal.nombre}_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToaster({ type: 'success', message: 'PDF de inventario descargado' });
    } catch (error) {
      console.error('Error descargando PDF de inventario:', error);
      setToaster({ type: 'error', message: 'Error al generar el PDF de inventario' });
    }
  };

  const handleBulkPriceUpdate = async (data) => {
    try {
      const result = await productosService.bulkUpdatePrices(data);
      setToaster({ type: 'success', message: `${result.count} producto${result.count !== 1 ? 's' : ''} actualizado${result.count !== 1 ? 's' : ''} exitosamente` });
      setIsBulkPriceModalOpen(false);
      // Recargar productos
      const updatedProducts = await productosService.getAll(true);
      setProducts(updatedProducts);
    } catch (err) {
      setToaster({ type: 'error', message: err.response?.data?.error || 'Error al actualizar precios' });
    }
  };

  return (
    <div className="space-y-3 md:space-y-4 animate-in fade-in duration-500">
      {toaster && <Toaster type={toaster.type} message={toaster.message} onClose={() => setToaster(null)} />}
      
      <AnimatePresence>
        {loading && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
                <Loader2 className="w-12 h-12 text-brand-cyan animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-900 dark:text-white">Sincronizando datos...</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black dark:border-gray-600 pb-4 gap-4 flex-wrap">
        <div className="flex-1 min-w-0 pr-0 md:pr-4">
            <div className="flex items-center gap-2 mb-1">
                <ClipboardList size={14} className="text-brand-cyan" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-gray-400">PUSH SPORT</span>
            </div>
            <h1 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                <span className="text-brand-cyan">Reportería</span>
            </h1>
            <p className="text-neutral-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal">
                Generá listas de precios, planificá entregas a sucursales o descargá el stock actual de una sucursal en PDF. La generación de PDFs es informativa y no modifica la base de datos.
            </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row bg-neutral-100 dark:bg-gray-800 p-1.5 rounded-xl w-full md:w-auto gap-1.5 mt-2 md:mt-0 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('global')}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'global' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-md border border-neutral-200 dark:border-gray-600' : 'text-neutral-500 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'}`}
            >
                <Download size={14} />
                Precios
            </button>
            <button 
                onClick={() => setActiveTab('shop')}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-md border border-neutral-200 dark:border-gray-600' : 'text-neutral-500 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'}`}
            >
                <Store size={14} />
                Sucursal
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
            className="space-y-2"
          >
            {/* Context banner */}
            <div className="bg-neutral-900 dark:bg-gray-800 rounded-xl px-3 md:px-4 py-3 flex flex-col gap-2 mb-0">
              <div>
                <p className="text-white dark:text-gray-100 font-black text-xs uppercase tracking-tight">Lista de Precios para Comercios</p>
                <p className="text-neutral-400 dark:text-gray-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">
                  El <span className="text-white">precio público</span> siempre se incluye en el PDF. Podés activar el precio Push si querés enviarlo también.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {prefetchingImages && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-gray-500">
                    <Loader2 size={12} className="animate-spin text-brand-cyan" /> Preparando...
                  </span>
                )}
                <button
                  onClick={() => setShowPushPriceGlobal(!showPushPriceGlobal)}
                  className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest border-2 ${
                    showPushPriceGlobal
                      ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                      : 'bg-white/5 border-white/10 text-neutral-400 dark:text-gray-500 hover:border-white/30'
                  }`}
                >
                  {showPushPriceGlobal ? <Eye size={13} /> : <EyeOff size={13} />}
                  {showPushPriceGlobal ? 'Precio Push: ON' : 'Precio Push: OFF'}
                </button>
                <PDFDownloadLink
                  document={<ReportPDF products={[...filteredProducts].sort((a,b) => (a.codigo_producto?.codigo || '').localeCompare(b.codigo_producto?.codigo || ''))} imageMap={imageMap} currentDate={new Date().toLocaleDateString()} showPushPrice={showPushPriceGlobal} />}
                  fileName={`Lista_Precios_${new Date().toLocaleDateString()}.pdf`}
                  className="h-9 px-5 bg-neutral-100 dark:bg-gray-700 text-black dark:text-white rounded-xl flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-gray-600 transition-all shadow-md text-[10px] font-black uppercase tracking-widest"
                >
                  {({ loading: pdfLoading }) => (
                    pdfLoading
                      ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                      : <><Download size={13} /> PDF Lista Precios</>
                  )}
                </PDFDownloadLink>
                <button
                  type="button"
                  onClick={handleExportGlobalExcel}
                  disabled={filteredProducts.length === 0}
                  className="h-9 px-5 bg-emerald-600 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  <FileSpreadsheet size={13} /> Excel Lista Precios
                </button>

                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await api.post('/reportes/send-weekly');
                      setToaster({ type: 'success', message: 'Reporte semanal enviado a tu email' });
                    } catch (error) {
                      console.error(error);
                      setToaster({ type: 'error', message: 'Error al enviar reporte por email' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="h-9 px-5 bg-black text-brand-cyan rounded-xl flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest border border-brand-cyan/30"
                >
                  <Mail size={13} /> Enviar Reporte Semanal
                </button>

                <button
                  onClick={() => setIsBulkPriceModalOpen(true)}
                  className="h-9 px-5 bg-brand-cyan text-white rounded-xl flex items-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest"
                >
                  <DollarSign size={13} /> Actualizar Precios
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-neutral-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-4">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg focus:border-brand-cyan dark:focus:border-cyan-400 outline-none transition-all font-bold text-xs text-neutral-900 dark:text-gray-100 placeholder:text-neutral-400 dark:placeholder:text-gray-500"
                  />
                </div>
                <p className="text-[10px] font-black text-neutral-400 dark:text-gray-500 uppercase tracking-widest shrink-0">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <DataTable 
                data={filteredProducts}
                hideSearch={true}
                columns={[
                  { 
                    header: 'Producto', 
                    render: (p) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center border border-neutral-100 dark:border-gray-600 overflow-hidden shrink-0">
                          {imageMap[p.id_producto] && imageMap[p.id_producto].length > 0 ? (
                            <img src={imageMap[p.id_producto][0]} className="w-full h-full object-cover" />
                          ) : parseImagenes(p.imagen_url)[0] ? (
                            <img src={parseImagenes(p.imagen_url)[0]} className="w-full h-full object-cover" />
                          ) : <Package className="text-neutral-200 dark:text-gray-500" size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-neutral-900 dark:text-gray-100 uppercase leading-none truncate max-w-[200px]">{p.nombre}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest">{p.marca?.nombre_marca || 'General'}</span>
                          </div>
                        </div>
                      </div>
                    )
                  },
                  ...(showPushPriceGlobal ? [{
                    header: 'P. Push',
                    render: (p) => (
                      <div className="flex items-center justify-center">
                        <div className="px-3 py-1.5 bg-brand-cyan/5 dark:bg-cyan-900/10 border border-brand-cyan/20 rounded-lg">
                          <span className="text-brand-cyan dark:text-cyan-400 text-[10px] font-black">
                            ${(p.precio_pushsport || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  }] : []),
                  {
                    header: 'P. Público',
                    render: (p) => (
                      <div className="flex items-center justify-center">
                        <div className="px-3 py-1.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 rounded-lg">
                          <span className="text-neutral-900 dark:text-gray-100 text-[10px] font-black">
                            ${(p.precio_venta_sugerido || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {/* Context banner + sub-tabs for shop mode */}
            <div className="bg-neutral-900 dark:bg-gray-800 rounded-2xl px-4 md:px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-white dark:text-gray-100 font-black text-sm uppercase tracking-tight">Reportes por Sucursal</p>
                  <p className="text-neutral-400 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 max-w-xl">
                    Elegí una sucursal. Luego podés planificar una entrega o descargar el stock actual de esa sucursal.
                  </p>
                </div>
                <div className="flex items-center bg-black/30 dark:bg-black/40 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setShopSubTab('entrega')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      shopSubTab === 'entrega'
                        ? 'bg-brand-cyan text-black'
                        : 'text-neutral-400 dark:text-gray-400 hover:text-white'
                    }`}
                  >
                    <ListPlus size={12} className="inline mr-1.5" /> Entrega
                  </button>
                  <button
                    onClick={() => {
                      setShopSubTab('inventario');
                      if (sucursal && shopStep === 2) loadStockInventory(sucursal.id_comercio);
                    }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      shopSubTab === 'inventario'
                        ? 'bg-brand-cyan text-black'
                        : 'text-neutral-400 dark:text-gray-400 hover:text-white'
                    }`}
                  >
                    <Boxes size={12} className="inline mr-1.5" /> Inventario
                  </button>
                </div>
              </div>
            </div>

            {/* ── Step indicator ── */}
            <div className="flex items-center">
              <button
                onClick={() => { setShopStep(1); setSucursal(null); setSelectedItems([]); }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-l-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                  shopStep === 1
                    ? 'bg-neutral-900 dark:bg-gray-700 border-neutral-900 dark:border-gray-700 text-white dark:text-gray-100'
                    : 'bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-600 text-neutral-500 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  shopStep > 1 ? 'bg-brand-cyan text-black' : 'bg-brand-cyan text-black'
                }`}>
                  {shopStep > 1 ? <CheckCircle2 size={12} /> : '1'}
                </span>
                <Store size={13} />
                {shopStep > 1 && sucursal
                  ? <><span className="text-neutral-400 dark:text-gray-500 font-bold normal-case hidden sm:inline">Sucursal:</span> <span className="text-brand-cyan truncate max-w-[100px]">{sucursal.nombre}</span></>
                  : 'Elegir Sucursal'
                }
              </button>
              <div className="h-[38px] w-px bg-neutral-200" />
              <div
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-r-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                  shopStep === 2
                    ? 'bg-neutral-900 dark:bg-gray-700 border-neutral-900 dark:border-gray-700 text-white dark:text-gray-100'
                    : 'bg-neutral-50 dark:bg-gray-800 border-neutral-200 dark:border-gray-600 text-neutral-300 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  shopStep === 2 ? 'bg-brand-cyan text-black' : 'bg-neutral-200 dark:bg-gray-600 text-neutral-400 dark:text-gray-500'
                }`}>2</span>
                {shopSubTab === 'inventario' ? <Boxes size={13} /> : <ListPlus size={13} />}
                {shopSubTab === 'inventario' ? 'Ver Inventario' : 'Armar Entrega'}
                {shopSubTab === 'entrega' && selectedItems.length > 0 && (
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
                  className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-premium border border-neutral-100 dark:border-gray-700"
                >
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-brand-cyan/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Store className="text-brand-cyan w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">¿A qué comercio vas a ir?</h3>
                      <p className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest max-w-sm mx-auto">
                        Seleccioná el comercio destino. El sistema va a consultar el stock actual de cada producto para ese local.
                      </p>
                    </div>

                    {/* Search — always visible, scales from 2 to 200 sucursales */}
                    <div className="relative mb-6">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500" size={18} />
                      <input
                        type="text"
                        placeholder={`Buscar entre ${sucursales.length} comercio${sucursales.length !== 1 ? 's' : ''}...`}
                        value={sucursalSearch}
                        onChange={(e) => setSucursalSearch(e.target.value)}
                        className="w-full pl-14 pr-5 h-14 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-2xl focus:border-brand-cyan dark:focus:border-cyan-400 outline-none transition-all font-bold text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                      sucursales.length > 8 ? 'max-h-[480px] overflow-y-auto pr-1' : ''
                    }`}>
                      {filteredSucursales.map(s => (
                        <button
                          key={s.id_comercio}
                          onClick={() => handleSelectSucursal(s)}
                          className="group w-full flex items-center gap-5 p-5 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-2xl hover:border-brand-cyan hover:bg-white dark:hover:bg-gray-600 hover:shadow-lg transition-all text-left"
                        >
                          <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-cyan/10 transition-all">
                            <Store className="text-neutral-400 group-hover:text-brand-cyan transition-colors" size={24} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm">{s.nombre}</p>
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
                  key={`step2-${shopSubTab}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
                >
                  {/* Context Banner */}
                  {shopSubTab === 'entrega' ? (
                    <div className="lg:col-span-3 bg-amber-500/10 border-2 border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div className="text-[11px] font-bold uppercase tracking-wider leading-relaxed">
                        <p className="font-black text-xs mb-1">ATENCIÓN: ESTE REPORTE NO CAMBIA EL STOCK EN EL SISTEMA</p>
                        <p>
                          Esta pantalla sirve para planificar la mercadería que vas a entregar físicamente. El PDF se imprime para firmar, pero el stock real de la sucursal no cambia.
                          Para que el comercio pueda vender este stock, registrá el ingreso desde la sección <Link to="/dashboard/inventario" className="underline font-black hover:text-black dark:hover:text-white mx-1 text-neutral-900 dark:text-gray-100">STOCK</Link>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="lg:col-span-3 bg-blue-500/10 border-2 border-blue-500/30 text-blue-700 dark:text-blue-400 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                      <Info className="w-5 h-5 mt-0.5 shrink-0" />
                      <div className="text-[11px] font-bold uppercase tracking-wider leading-relaxed">
                        <p className="font-black text-xs mb-1">INVENTARIO REAL DE LA SUCURSAL</p>
                        <p>
                          Estos son los productos activos y el stock actual registrado en el sistema para <span className="font-black">{sucursal.nombre}</span>.
                          Si hiciste un envío de stock y no se refleja aquí, revisá el movimiento en la sección <Link to="/dashboard/movimientos" className="underline font-black hover:text-black dark:hover:text-white mx-1 text-neutral-900 dark:text-gray-100">Movimientos</Link>.
                        </p>
                      </div>
                    </div>
                  )}

                  {shopSubTab === 'entrega' && (
                    <>
                  {/* Left: Catalog */}
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-premium border border-neutral-100 dark:border-gray-700 flex flex-col" style={{ height: '60vh', minHeight: '320px' }}>
                      <div className="mb-4 space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white flex items-center gap-2">
                          <Plus size={16} className="text-brand-cyan" /> Productos a entregar
                        </h3>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Tocá el <span className="text-brand-cyan">+</span> para agregar al reporte</p>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={shopSearchTerm}
                            onChange={(e) => setShopSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 h-11 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-xl focus:border-brand-cyan dark:focus:border-cyan-400 outline-none transition-all font-bold text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500"
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
                                  ? 'bg-brand-cyan/5 dark:bg-cyan-900/20 border-brand-cyan/30 dark:border-cyan-700/50 opacity-60'
                                  : 'bg-neutral-50 dark:bg-gray-700 border-neutral-100 dark:border-gray-600 hover:border-brand-cyan/40 hover:bg-white dark:hover:bg-gray-600'
                              }`}
                            >
                              <div className="w-11 h-11 rounded-lg bg-white dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 overflow-hidden shrink-0 flex items-center justify-center">
                                {imageMap[p.id_producto] && imageMap[p.id_producto].length > 0 ? (
                                  <img src={imageMap[p.id_producto][0]} className="w-full h-full object-cover" />
                                ) : parseImagenes(p.imagen_url)[0] ? (
                                  <img src={parseImagenes(p.imagen_url)[0]} className="w-full h-full object-cover" />
                                ) : <Package className="text-neutral-200" size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase truncate leading-tight">{p.nombre}</p>
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
                        <button
                          onClick={() => setShowBasePriceShop(!showBasePriceShop)}
                          className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all text-[9px] font-black uppercase tracking-widest border-2 ${
                            showBasePriceShop
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/30'
                          }`}
                        >
                          {showBasePriceShop ? <Eye size={12} /> : <EyeOff size={12} />}
                          {showBasePriceShop ? 'P. Base: ON' : 'P. Base: OFF'}
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
                                  <Download size={13} /> Descargar Reporte
                                </button>
                              ) : (
                                <>
                                <button
                                  onClick={handleDownloadReport}
                                  disabled={savingReport}
                                  className={`h-9 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md font-black uppercase tracking-widest text-[10px] ${
                                    hayExceso
                                      ? 'bg-amber-500/80 text-black hover:scale-105'
                                      : 'bg-brand-cyan text-black hover:scale-105'
                                  } disabled:opacity-60`}
                                >
                                  {savingReport
                                    ? <><Loader2 size={13} className="animate-spin" /> Guardando...</>
                                    : <><Download size={13} />{hayExceso ? ' Reporte PDF (con adv.)' : ` Descargar Reporte PDF (${selectedItems.length})`}</>
                                  }
                                </button>
                                <button
                                  type="button"
                                  onClick={handleExportEntregaExcel}
                                  className="h-9 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <FileSpreadsheet size={13} /> Excel
                                </button>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-neutral-100 dark:border-gray-700 min-h-[300px] md:min-h-[450px] flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tighter uppercase">Productos a entregar</h3>
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
                            Usá el panel izquierdo para agregar productos que vas a entregar a <span className="text-brand-cyan">{sucursal.nombre}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedItems.map((item, idx) => (
                            <div key={idx} className="p-5 bg-neutral-50 dark:bg-gray-800/50 rounded-2xl border-2 border-neutral-100 dark:border-gray-700 hover:border-brand-cyan/20 dark:hover:border-brand-cyan/40 transition-all">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 overflow-hidden shrink-0 flex items-center justify-center">
                                  {imageMap[item.producto.id_producto] && imageMap[item.producto.id_producto].length > 0 ? (
                                    <img src={imageMap[item.producto.id_producto][0]} className="w-full h-full object-cover" />
                                  ) : parseImagenes(item.producto.imagen_url)[0] ? (
                                    <img src={parseImagenes(item.producto.imagen_url)[0]} className="w-full h-full object-cover" />
                                  ) : <Package className="text-neutral-200" size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm">{item.producto.nombre}</p>
                                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mt-0.5">{item.producto.marca?.nombre_marca || 'General'}</p>
                                </div>
                                <button
                                  onClick={() => removeItemFromReport(idx)}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {/* Stock row */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 items-start">
                                {/* Col 1: Stock en comercio */}
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 min-h-[20px] flex items-center"><LabelTip label="Stock comercio" tip="Stock actual registrado en la sucursal. Si ya hiciste un envío, debería verse reflejado aquí." /></label>
                                  <div className="h-11 bg-white dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-xl flex items-center justify-center font-black text-sm text-neutral-500 dark:text-gray-300">
                                    {item.stockAnterior}
                                    <span className="text-[8px] ml-1 text-neutral-300 dark:text-gray-500 font-bold">uds</span>
                                  </div>
                                </div>

                                {/* Col 2: Disponible central */}
                                <div className="flex flex-col">
                                  {(() => {
                                    const sc = item.stockCentral ?? 0;
                                    const excede = item.cantidadDejada > sc;
                                    return (
                                      <>
                                        <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 min-h-[20px] flex items-center ${excede ? 'text-amber-500' : 'text-neutral-400'}`}><LabelTip label="Central disponible" tip="Stock disponible en depósito central. Si superás este valor, no hay mercadería suficiente para enviar." /></label>
                                        <div className={`h-11 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all ${
                                          excede
                                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                                            : sc === 0
                                              ? 'bg-neutral-50 dark:bg-gray-700 border-neutral-200 dark:border-gray-600 text-neutral-300 dark:text-gray-500'
                                              : 'bg-white dark:bg-gray-700 border-neutral-100 dark:border-gray-600 text-neutral-700 dark:text-gray-300'
                                        }`}>
                                          {sc}
                                          <span className="text-[8px] ml-1 opacity-60 font-bold">uds</span>
                                        </div>
                                        {excede && (
                                          <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">Superás el stock</p>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>

                                {/* Col 3: A dejar */}
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-cyan mb-1.5 min-h-[20px] flex items-center"><LabelTip label="A dejar" tip="Cantidad que planificás entregar en esta visita. Inicia en 0 porque el reporte es una planificación, no un envío ya realizado." /></label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.cantidadDejada || ''}
                                    onChange={(e) => {
                                      const v = Math.max(0, Number(e.target.value));
                                      setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, cantidadDejada: v } : it));
                                    }}
                                    className={`w-full h-11 rounded-xl px-3 text-center font-black text-sm outline-none transition-all placeholder:text-neutral-200 dark:placeholder:text-gray-600 border-2 ${
                                      item.cantidadDejada > (item.stockCentral ?? 0)
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-600 dark:text-red-400 focus:border-red-500 dark:focus:border-red-400'
                                        : 'bg-white dark:bg-gray-700 border-brand-cyan/50 dark:border-brand-cyan/30 text-neutral-900 dark:text-white focus:border-brand-cyan dark:focus:border-cyan-400'
                                    }`}
                                  />
                                </div>

                                {/* Col 4: Stock nuevo en comercio */}
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 min-h-[20px] flex items-center"><LabelTip label="Stock nuevo" tip="Proyección del stock que tendrá la sucursal si se entrega la cantidad indicada en 'A dejar'." /></label>
                                  <div className={`h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                                    item.cantidadDejada > 0 ? 'bg-neutral-900 dark:bg-gray-900 text-brand-cyan' : 'bg-neutral-50 dark:bg-gray-700 text-neutral-400 dark:text-gray-500 border-2 border-neutral-100 dark:border-gray-600'
                                  }`}>
                                    {item.stockAnterior + item.cantidadDejada}
                                    <span className="text-[8px] ml-1 opacity-60 font-bold">uds</span>
                                  </div>
                                </div>

                                {/* Col 5: P. Público */}
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 min-h-[20px] flex items-center">P. Público (PDF)</label>
                                  <div className="relative h-11">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-gray-500 font-bold text-xs">$</span>
                                    <div className="w-full h-11 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-xl pl-7 pr-3 font-black text-sm flex items-center text-neutral-700 dark:text-gray-300">
                                      {item.precio_venta_sugerido?.toLocaleString() || 0}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedItems.length > 0 && (
                        <>
                          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
                            <div className="text-xs font-black uppercase tracking-widest">
                              <p className="text-neutral-400 dark:text-gray-400">Total unidades a entregar</p>
                              <p className="text-3xl text-neutral-900 dark:text-white tracking-tighter mt-1">{selectedItems.reduce((a, c) => a + c.cantidadDejada, 0)}</p>
                            </div>
                            <div className="text-right text-xs font-black uppercase tracking-widest">
                              <p className="text-neutral-400 dark:text-gray-400">Productos en entrega</p>
                              <p className="text-3xl text-neutral-900 dark:text-white tracking-tighter mt-1">{selectedItems.length}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3.5 bg-neutral-50 dark:bg-gray-700/30 rounded-2xl border border-neutral-200 dark:border-gray-600 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-gray-400 leading-normal">
                            RECUERDA: Tras realizar la entrega física de la mercadería y firmar este reporte, debés ir a 
                            <Link to="/dashboard/inventario" className="text-brand-cyan dark:text-cyan-400 underline font-black mx-1 hover:text-black dark:hover:text-white">STOCK</Link> 
                            y actualizar el "Stock Actual" de cada producto al valor indicado arriba en "Stock nuevo".
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                    </>
                  )}

                  {shopSubTab === 'inventario' && (
                    <div className="lg:col-span-3 space-y-4">
                      <div className="bg-neutral-900 rounded-2xl px-4 md:px-5 py-3 md:py-3.5 flex flex-wrap items-center justify-between gap-2 md:gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-cyan/20 rounded-lg flex items-center justify-center">
                            <Store className="text-brand-cyan" size={16} />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Inventario actual de</p>
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
                          <button
                            onClick={() => setShowBasePriceShop(!showBasePriceShop)}
                            className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all text-[9px] font-black uppercase tracking-widest border-2 ${
                              showBasePriceShop
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/30'
                            }`}
                          >
                            {showBasePriceShop ? <Eye size={12} /> : <EyeOff size={12} />}
                            {showBasePriceShop ? 'P. Base: ON' : 'P. Base: OFF'}
                          </button>
                          <button
                            onClick={handleDownloadStockPDF}
                            disabled={loadingStockInventory || stockInventory.length === 0}
                            className="h-9 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md font-black uppercase tracking-widest text-[10px] bg-brand-cyan text-black hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                          >
                            {loadingStockInventory
                              ? <><Loader2 size={13} className="animate-spin" /> Cargando...</>
                              : <><Download size={13} /> Descargar PDF</>
                            }
                          </button>
                          <button
                            type="button"
                            onClick={handleExportStockExcel}
                            disabled={loadingStockInventory || stockInventory.length === 0}
                            className="h-9 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            <FileSpreadsheet size={13} /> Excel
                          </button>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-neutral-100 dark:border-gray-700 min-h-[300px] md:min-h-[450px] flex flex-col">
                        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tighter uppercase flex items-center gap-2">
                              <Boxes size={18} className="text-brand-cyan" /> Stock de Sucursal
                            </h3>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                              Todos los productos activos. Se muestra el stock registrado en el sistema.
                            </p>
                          </div>
                          <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                            <input
                              type="text"
                              placeholder="Buscar producto..."
                              value={stockInventorySearch}
                              onChange={(e) => setStockInventorySearch(e.target.value)}
                              className="w-full pl-11 pr-4 h-11 bg-neutral-50 dark:bg-gray-700 border-2 border-neutral-100 dark:border-gray-600 rounded-xl focus:border-brand-cyan dark:focus:border-cyan-400 outline-none transition-all font-bold text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500"
                            />
                          </div>
                        </div>

                        {loadingStockInventory ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-16">
                            <Loader2 size={40} className="text-brand-cyan animate-spin mb-4" />
                            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Cargando inventario...</p>
                          </div>
                        ) : (
                          <DataTable
                            data={stockInventory.filter(item =>
                              (item.producto?.nombre || '').toLowerCase().includes(stockInventorySearch.toLowerCase()) ||
                              (item.producto?.marca?.nombre_marca || '').toLowerCase().includes(stockInventorySearch.toLowerCase())
                            )}
                            hideSearch={true}
                            columns={[
                              {
                                header: 'Producto',
                                render: (item) => {
                                  const prod = item.producto || item;
                                  return (
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center border border-neutral-100 dark:border-gray-600 overflow-hidden shrink-0">
                                        {imageMap[prod.id_producto] && imageMap[prod.id_producto].length > 0 ? (
                                          <img src={imageMap[prod.id_producto][0]} className="w-full h-full object-cover" />
                                        ) : parseImagenes(prod.imagen_url)[0] ? (
                                          <img src={parseImagenes(prod.imagen_url)[0]} className="w-full h-full object-cover" />
                                        ) : <Package className="text-neutral-200 dark:text-gray-500" size={16} />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-black text-neutral-900 dark:text-gray-100 uppercase leading-none truncate max-w-[200px]">{prod.nombre}</p>
                                        <p className="text-[8px] font-black text-brand-cyan uppercase tracking-widest mt-0.5">{prod.marca?.nombre_marca || 'General'}</p>
                                      </div>
                                    </div>
                                  );
                                }
                              },
                              {
                                header: 'Stock actual',
                                render: (item) => {
                                  const prod = item.producto || item;
                                  const hasVariants = prod.usa_variantes || item.usa_desglose_variantes || (item.variantes && item.variantes.length > 0);
                                  const stock = hasVariants
                                    ? (item.variantes || []).reduce((sum, v) => sum + (v.cantidad_actual || 0), 0)
                                    : (item.cantidad_actual || 0);
                                  return (
                                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 font-black text-[10px] uppercase tracking-widest ${
                                      stock > 0
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                    }`}>
                                      {stock} <span className="text-[8px] opacity-70">uds</span>
                                    </div>
                                  );
                                }
                              },
                              ...(showPushPriceShop ? [{
                                header: 'P. Push',
                                render: (item) => {
                                  const prod = item.producto || item;
                                  return (
                                    <div className="flex items-center justify-center">
                                      <div className="px-3 py-1.5 bg-brand-cyan/5 dark:bg-cyan-900/10 border border-brand-cyan/20 rounded-lg">
                                        <span className="text-brand-cyan dark:text-cyan-400 text-[10px] font-black">
                                          ${(prod.precio_pushsport || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              }] : []),
                              ...(showBasePriceShop ? [{
                                header: 'P. Base',
                                render: (item) => {
                                  const prod = item.producto || item;
                                  return (
                                    <div className="flex items-center justify-center">
                                      <div className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-900/10 border border-amber-500/20 rounded-lg">
                                        <span className="text-amber-600 dark:text-amber-400 text-[10px] font-black">
                                          ${(prod.costo_compra || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              }] : []),
                              {
                                header: 'P. Público',
                                render: (item) => {
                                  const prod = item.producto || item;
                                  return (
                                    <div className="flex items-center justify-center">
                                      <div className="px-3 py-1.5 bg-neutral-50 dark:bg-gray-700 border border-neutral-100 dark:border-gray-600 rounded-lg">
                                        <span className="text-neutral-900 dark:text-gray-100 text-[10px] font-black">
                                          ${(prod.precio_venta_sugerido || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              }
                            ]}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Actualización Masiva de Precios */}
      <BulkPriceUpdateModal
        isOpen={isBulkPriceModalOpen}
        onClose={() => setIsBulkPriceModalOpen(false)}
        products={products}
        onSubmit={handleBulkPriceUpdate}
      />
    </div>
  );
};

export default Reporteria;
