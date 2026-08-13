import React, { useState } from 'react';
import { Scan, Package, DollarSign, Box, Edit, X, Tag } from 'lucide-react';
import BarcodeScanner from '../../components/ui/BarcodeScanner';
import Modal from '../../components/ui/Modal';
import { productosService } from '../../services/productosService';
import { parseImagenes } from '../../lib/supabaseStorage';

const ConsultaBarcode = () => {
  const [producto, setProducto] = useState(null);
  const [varianteMatched, setVarianteMatched] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState('');

  const handleScan = async (code) => {
    if (!code || code === lastScannedCode) return;
    
    setLastScannedCode(code);
    setLoading(true);
    setError('');
    setProducto(null);
    setVarianteMatched(null);
    
    try {
      const data = await productosService.buscarPorCodigo(code);
      setProducto(data.producto);
      setVarianteMatched(data.variante_matched || null);
    } catch (err) {
      console.error('Error al buscar producto:', err);
      if (err.response?.status === 404) {
        setError(`Producto no encontrado con código: ${code}`);
      } else {
        setError('Error al buscar producto. Verificá tu conexión.');
      }
      setProducto(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProducto(null);
    setVarianteMatched(null);
    setLastScannedCode('');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Scan size={32} className="text-black" />
          </div>
          <h1 className="text-3xl md:text-4xl font-sport uppercase text-black dark:text-white mb-2 tracking-tight">
            Consulta de Productos
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 text-sm md:text-base">
            Escaneá un producto para ver su información completa
          </p>
        </div>

        {/* Scanner */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-gray-700">
          <BarcodeScanner
            value=""
            onChange={handleScan}
            placeholder="Escanear código de barras..."
            autoFocus
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700">
              <div className="w-5 h-5 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-neutral-600 dark:text-gray-400">Buscando producto...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <X size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  Verificá que el código sea correcto o que el producto esté cargado en el sistema.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal con info del producto */}
      <Modal 
        isOpen={!!producto} 
        onClose={handleClose}
        title="Información del Producto"
        size="large"
      >
        {producto && (
          <div className="space-y-6">
            {/* Imagen + Nombre */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-full sm:w-32 h-32 bg-neutral-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                {(() => {
                    const imagenes = parseImagenes(producto.imagen_url);
                    return imagenes.length > 0 ? (
                    <img 
                    src={imagenes[0]} 
                    alt={producto.nombre} 
                    className="w-full h-full object-cover" 
                    />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={40} className="text-neutral-300 dark:text-gray-600" />
                  </div>
                )}
                )()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-sport uppercase text-black dark:text-white mb-2 leading-tight">
                  {producto.nombre}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-gray-700 rounded-lg text-neutral-600 dark:text-gray-300 font-bold">
                    {producto.categoria?.nombre || 'Sin categoría'}
                  </span>
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-gray-700 rounded-lg text-neutral-600 dark:text-gray-300 font-bold">
                    {producto.marca?.nombre_marca || 'Sin marca'}
                  </span>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-gray-700 rounded-xl border border-neutral-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-neutral-400" />
                  <span className="text-xs font-bold uppercase text-neutral-500 dark:text-gray-400 tracking-wider">
                    Precio Público
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                  ${producto.precio_venta_sugerido ? Number(producto.precio_venta_sugerido).toLocaleString('es-AR') : '0'}
                </p>
              </div>
              <div className="p-4 bg-brand-cyan/10 dark:bg-cyan-900/20 rounded-xl border-2 border-brand-cyan/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-brand-cyan" />
                  <span className="text-xs font-bold uppercase text-brand-cyan tracking-wider">
                    Precio PUSH
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-brand-cyan">
                  ${producto.precio_pushsport ? Number(producto.precio_pushsport).toLocaleString('es-AR') : '0'}
                </p>
              </div>
            </div>

            {/* Stock */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Box size={18} className="text-neutral-400" />
                <span className="text-sm font-bold uppercase text-neutral-500 dark:text-gray-400 tracking-wider">
                  Stock por Sucursal
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg border border-neutral-200 dark:border-gray-600">
                  <span className="font-bold text-sm text-black dark:text-white">Central</span>
                  <span className="text-brand-cyan font-bold text-lg">{producto.stock_central || 0} unidades</span>
                </div>
                {producto.inventarios && producto.inventarios.length > 0 ? (
                  producto.inventarios.map((inv, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg border border-neutral-200 dark:border-gray-600">
                      <span className="font-bold text-sm text-black dark:text-white">
                        {inv.comercio?.nombre || `Sucursal ${idx + 1}`}
                      </span>
                      <span className="text-brand-cyan font-bold text-lg">{inv.cantidad_actual || 0} unidades</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 dark:text-gray-500 italic p-3">
                    Sin stock en sucursales
                  </p>
                )}
              </div>
            </div>

            {/* Variante escaneada (si el código correspondía a una variante puntual) */}
            {varianteMatched && (
              <div className="p-4 bg-brand-cyan/10 dark:bg-cyan-900/20 rounded-xl border-2 border-brand-cyan/30">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-brand-cyan" />
                  <span className="text-xs font-bold uppercase text-brand-cyan tracking-wider">
                    Variante Escaneada
                  </span>
                </div>
                <p className="text-lg font-bold text-black dark:text-white mb-1">
                  {Object.values(varianteMatched.atributos_valores || {}).join(' / ')}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="font-bold text-neutral-600 dark:text-gray-300">
                    SKU: <span className="font-mono">{varianteMatched.sku_variante || '-'}</span>
                  </span>
                  <span className="font-bold text-neutral-600 dark:text-gray-300">
                    Stock: <span className="text-brand-cyan">{varianteMatched.stock_central || 0} unidades</span>
                  </span>
                  {varianteMatched.precio_variante > 0 && (
                    <span className="font-bold text-neutral-600 dark:text-gray-300">
                      Precio propio: <span className="text-brand-cyan">${Number(varianteMatched.precio_variante).toLocaleString('es-AR')}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Código de Barras */}
            <div className="p-4 bg-neutral-50 dark:bg-gray-700 rounded-xl border border-neutral-200 dark:border-gray-600">
              <span className="text-xs font-bold uppercase text-neutral-500 dark:text-gray-400 block mb-2 tracking-wider">
                Código de Barras Escaneado
              </span>
              <p className="text-xl md:text-2xl font-mono font-bold text-black dark:text-white tracking-wider">
                {lastScannedCode || '-'}
              </p>
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="p-4 bg-neutral-50 dark:bg-gray-700 rounded-xl border border-neutral-200 dark:border-gray-600">
                <span className="text-xs font-bold uppercase text-neutral-500 dark:text-gray-400 block mb-2 tracking-wider">
                  Descripción
                </span>
                <p className="text-sm text-neutral-600 dark:text-gray-300">
                  {producto.descripcion}
                </p>
              </div>
            )}

            {/* Botón Editar */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-gray-700">
              <button
                onClick={() => window.location.href = `/dashboard/productos?edit=${producto.id_producto}`}
                className="flex-1 px-4 py-3 bg-brand-cyan hover:bg-cyan-400 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Editar Producto
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-3 bg-neutral-200 dark:bg-gray-700 hover:bg-neutral-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsultaBarcode;
