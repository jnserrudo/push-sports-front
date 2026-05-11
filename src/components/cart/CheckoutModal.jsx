import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { generateWhatsAppMessage, openWhatsApp } from '../../utils/whatsappHelper';
import publicService from '../../services/publicService';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, getTotal, clearCart, setIsCartOpen } = useCart();
  const [sucursales, setSucursales] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    sucursal: '',
    deliveryMethod: 'retiro',
    comments: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const data = await publicService.getSucursales();
        setSucursales(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, sucursal: data[0].nombre }));
        }
      } catch (error) {
        console.error('Error cargando sucursales:', error);
      }
    };
    fetchSucursales();
  }, []);

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

    if (!formData.sucursal) {
      newErrors.sucursal = 'Selecciona una sucursal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Generar mensaje de WhatsApp
    const message = generateWhatsAppMessage({
      items: cart,
      total: getTotal(),
      ...formData,
      deliveryMethod: formData.deliveryMethod === 'retiro' 
        ? 'Retiro en sucursal' 
        : 'Envío a domicilio'
    });

    // Número de WhatsApp del negocio (configurar en .env)
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+5493875792395';

    // Abrir WhatsApp
    openWhatsApp(whatsappNumber, message);

    // Limpiar carrito y cerrar
    setTimeout(() => {
      clearCart();
      setIsCartOpen(false);
      onClose();
    }, 500);
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

          {/* Sucursal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-400 mb-2">
              Sucursal Preferida *
            </label>
            <select
              name="sucursal"
              value={formData.sucursal}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-gray-800 border ${
                errors.sucursal ? 'border-red-500' : 'border-neutral-200 dark:border-gray-700'
              } rounded-xl text-sm font-medium focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all cursor-pointer`}
            >
              {sucursales.map(suc => (
                <option key={suc.id_comercio} value={suc.nombre}>
                  {suc.nombre}
                </option>
              ))}
            </select>
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

          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-green-600 hover:shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <Send size={20} />
            Enviar Pedido por WhatsApp
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
