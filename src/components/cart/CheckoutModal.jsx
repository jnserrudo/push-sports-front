import React, { useState, useEffect } from 'react';
import { X, Send, RefreshCw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { generateWhatsAppMessage, openWhatsApp } from '../../utils/whatsappHelper';
import publicService from '../../services/publicService';
import consultaService from '../../services/consultaService';
import toast from 'react-hot-toast';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, getTotal, clearCart, setIsCartOpen } = useCart();
  const [sucursales, setSucursales] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    sucursal: '',
    deliveryMethod: 'retiro',
    comments: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar sucursales y filtrar por stock disponible
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const allSucursales = await publicService.getSucursales();
        
        // Verificar si algún item no tiene disponibilidad
        const itemsSinDisponibilidad = cart.filter(item => !item.disponibilidad || !Array.isArray(item.disponibilidad));
        
        // Si hay items sin disponibilidad, recargar desde el catálogo
        let cartActualizado = [...cart];
        if (itemsSinDisponibilidad.length > 0) {
          console.warn('⚠️ ADVERTENCIA: Algunos items no tienen disponibilidad guardada');
          console.warn('Items sin disponibilidad:', itemsSinDisponibilidad.map(i => i.nombre));
          console.warn('🔄 Recargando disponibilidad desde el catálogo...');
          
          try {
            const catalogo = await publicService.getCatalog();
            
            cartActualizado = cart.map(item => {
              if (!item.disponibilidad || !Array.isArray(item.disponibilidad)) {
                const productoEnCatalogo = catalogo.find(p => p.id === item.id);
                if (productoEnCatalogo) {
                  console.log(`✅ Disponibilidad recargada para: ${item.nombre}`);
                  return {
                    ...item,
                    disponibilidad: productoEnCatalogo.disponibilidad
                  };
                }
              }
              return item;
            });
            
            console.log('✅ Disponibilidad actualizada');
          } catch (error) {
            console.error('❌ Error al recargar disponibilidad:', error);
          }
        }
        
        // Verificar disponibilidad de cada item
        cartActualizado.forEach((item, index) => {
          console.log(`\n📦 Item ${index + 1}: ${item.nombre}`);
          console.log('   - Cantidad solicitada:', item.cantidad);
          console.log('   - Disponibilidad:', item.disponibilidad);
          console.log('   - Tiene disponibilidad?:', !!item.disponibilidad);
          console.log('   - Es array?:', Array.isArray(item.disponibilidad));
          console.log('   - Longitud:', item.disponibilidad?.length);
          
          // Mostrar cada sucursal en disponibilidad
          if (item.disponibilidad && Array.isArray(item.disponibilidad)) {
            item.disponibilidad.forEach((disp, idx) => {
              console.log(`     ${idx + 1}. Sucursal: "${disp.sucursal}" | Cantidad: ${disp.cantidad}`);
            });
          }
        });
        
        // Filtrar sucursales que tengan stock de todos los productos del carrito
        const sucursalesConStock = allSucursales.filter(sucursal => {
          console.log(`\n🔍 Evaluando sucursal: ${sucursal.nombre}`);
          
          const tieneStock = cartActualizado.every(item => {
            // Buscar el stock de este producto en esta sucursal
            // Normalizar nombres para comparación (trim y case-insensitive)
            const nombreSucursalNormalizado = sucursal.nombre.trim().toLowerCase();
            
            console.log(`   🔎 Buscando "${nombreSucursalNormalizado}" en disponibilidad de ${item.nombre}`);
            
            const stockEnSucursal = item.disponibilidad?.find(
              disp => {
                const nombreDisp = disp.sucursal.trim().toLowerCase();
                console.log(`      Comparando: "${nombreDisp}" === "${nombreSucursalNormalizado}" → ${nombreDisp === nombreSucursalNormalizado}`);
                return nombreDisp === nombreSucursalNormalizado;
              }
            );
            
            const resultado = stockEnSucursal && stockEnSucursal.cantidad >= item.cantidad;
            
            console.log(`   📦 ${item.nombre}:`, {
              disponibilidad: item.disponibilidad,
              stockEnSucursal: stockEnSucursal,
              stockDisponible: stockEnSucursal?.cantidad || 0,
              cantidadSolicitada: item.cantidad,
              cumpleRequisito: resultado
            });
            
            // Verificar que exista stock y que sea suficiente para la cantidad solicitada
            return resultado;
          });
          
          console.log(`   ✓ Resultado para ${sucursal.nombre}:`, tieneStock);
          return tieneStock;
        });
        
        console.log('\n✅ Sucursales con stock completo:', sucursalesConStock.map(s => s.nombre));
        console.log('=== FIN DEBUG CHECKOUT ===\n');
        
        setSucursales(sucursalesConStock);
        if (sucursalesConStock.length > 0) {
          setFormData(prev => ({ ...prev, sucursal: sucursalesConStock[0].nombre }));
        }
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      } finally {
        setLoadingSucursales(false);
      }
    };
    
    if (isOpen && cart.length > 0) {
      setLoadingSucursales(true);
      fetchSucursales();
    }
  }, [isOpen, cart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Teléfono inválido';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email inválido';
    }

    if (sucursales.length === 0) {
      newErrors.sucursal = 'No hay sucursales con stock disponible';
    } else if (!formData.sucursal) {
      newErrors.sucursal = 'Selecciona una sucursal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Obtener ID de la sucursal seleccionada
      const sucursalSeleccionada = sucursales.find(s => s.nombre === formData.sucursal);
      if (!sucursalSeleccionada) {
        setErrors({ sucursal: 'Sucursal no válida' });
        setIsSubmitting(false);
        return;
      }

      // Preparar datos para la consulta
      const consultaData = {
        nombre_cliente: formData.customerName,
        telefono_cliente: formData.customerPhone,
        email_cliente: formData.customerEmail || null,
        id_sucursal: sucursalSeleccionada.id_comercio,
        metodo_entrega: formData.deliveryMethod,
        comentarios: formData.comments,
        items: cart.map(item => ({
          id_producto: item.id,
          nombre_producto: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.precio * item.cantidad,
          id_variante: item.variante?.id || null,
          variante_info: item.variante || null
        })),
        total: getTotal(),
        cantidad_items: cart.length
      };

      // Guardar consulta en el backend
      console.log('📤 Enviando consulta al backend...', consultaData);
      const response = await consultaService.crearConsulta(consultaData);
      console.log('✅ Consulta guardada:', response);

      // Mostrar toast de éxito
      toast.success('¡Pedido registrado! Abriendo WhatsApp...', {
        duration: 3000,
        icon: '✅'
      });

      // Generar mensaje de WhatsApp con token de seguimiento
      const tokenSeguimiento = response.data?.token_seguimiento || response.token_seguimiento;
      console.log('🔑 Token de seguimiento:', tokenSeguimiento);
      console.log('📦 Respuesta completa:', response);
      
      const message = generateWhatsAppMessage({
        items: cart,
        total: getTotal(),
        ...formData,
        deliveryMethod: formData.deliveryMethod === 'retiro' 
          ? 'Retiro en sucursal' 
          : 'Envío a domicilio',
        tokenSeguimiento
      });

      // Número de WhatsApp del negocio (configurar en .env)
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+5493875792395';

      // Abrir WhatsApp
      console.log('📱 Abriendo WhatsApp...');
      openWhatsApp(whatsappNumber, message);

      // Limpiar carrito y cerrar
      setTimeout(() => {
        clearCart();
        setIsCartOpen(false);
        onClose();
        setIsSubmitting(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Error al procesar el pedido:', error);
      
      // Mostrar error al usuario con toast
      toast.error(error.message || 'Error al procesar el pedido', {
        duration: 4000
      });
      
      setErrors({ general: error.message || 'Error al procesar el pedido' });
      
      // Resetear estado de submitting
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-sport uppercase">Completa tu Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border ${
                errors.customerName ? 'border-red-500' : 'border-neutral-200 dark:border-gray-700'
              } rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all`}
            />
            {errors.customerName && (
              <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="+54 9 387 123-4567"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border ${
                errors.customerPhone ? 'border-red-500' : 'border-neutral-200 dark:border-gray-700'
              } rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all`}
            />
            {errors.customerPhone && (
              <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-2">
              Email (Opcional)
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border ${
                errors.customerEmail ? 'border-red-500' : 'border-neutral-200 dark:border-gray-700'
              } rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all`}
            />
            {errors.customerEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>
            )}
          </div>

          {/* Sucursal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-1">
              Sucursal para Retiro/Envío *
            </label>
            <p className="text-xs text-neutral-500 dark:text-gray-500 mb-2">
              Solo sucursales con stock disponible de tus productos
            </p>
            {loadingSucursales ? (
              <div className="w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-cyan border-t-transparent"></div>
                <p className="text-sm text-neutral-600 dark:text-gray-400">
                  Verificando disponibilidad...
                </p>
              </div>
            ) : sucursales.length === 0 ? (
              <div className="w-full px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  No hay sucursales con stock suficiente para todos los productos
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Reduce las cantidades o contacta por WhatsApp para consultar disponibilidad
                </p>
              </div>
            ) : (
              <div className="relative">
                <select
                  name="sucursal"
                  value={formData.sucursal}
                  onChange={handleChange}
                  disabled={loadingSucursales}
                  className={`w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border ${
                    errors.sucursal ? 'border-red-500' : 'border-neutral-200 dark:border-gray-700'
                  } rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all cursor-pointer disabled:opacity-50 appearance-none`}
                >
                  {sucursales.map(suc => (
                    <option key={suc.id_comercio} value={suc.nombre}>
                      {suc.nombre}
                    </option>
                  ))}
                </select>
                {loadingSucursales && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw size={16} className="animate-spin text-neutral-400" />
                  </div>
                )}
              </div>
            )}
            {errors.sucursal && (
              <p className="text-xs text-red-500 mt-1">{errors.sucursal}</p>
            )}
          </div>

          {/* Método de entrega */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-3">
              Método de Entrega
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="retiro"
                  checked={formData.deliveryMethod === 'retiro'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-brand-cyan"
                />
                <div className="flex-1">
                  <span className="font-bold text-sm text-black dark:text-white block mb-1">
                    Retiro en Sucursal
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-gray-400">
                    Sin cargo • Coordinarás horario por WhatsApp
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="envio"
                  checked={formData.deliveryMethod === 'envio'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-brand-cyan"
                />
                <div className="flex-1">
                  <span className="font-bold text-sm text-black dark:text-white block mb-1">
                    Envío a Domicilio
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-gray-400">
                    Costo a coordinar • Según zona de entrega
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-2">
              Comentarios (Opcional)
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Ej: Prefiero retirar por la tarde..."
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all resize-none"
            />
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-black text-white hover:bg-brand-cyan'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <Send size={18} />
                Finalizar Pedido por WhatsApp
              </>
            )}
          </button>

          <p className="text-xs text-neutral-400 dark:text-gray-500 text-center">
            Se abrirá WhatsApp con tu pedido pre-cargado para coordinar el pago y entrega
          </p>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
