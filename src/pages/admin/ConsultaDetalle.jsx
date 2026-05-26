import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Package, DollarSign, Calendar, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, ShoppingCart, Edit, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ConsultaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModalVenta, setMostrarModalVenta] = useState(false);
  const [datosVenta, setDatosVenta] = useState({
    metodo_pago: 'EFECTIVO',
    observaciones: ''
  });

  // Estados de consulta con sus colores
  const estadoConfig = {
    PENDIENTE: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
    EN_PROCESO: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'En Proceso' },
    CONFIRMED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmado' },
    CANCELADO: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelado' }
  };

  useEffect(() => {
    if (id) {
      cargarConsulta();
    }
  }, [id]);

  const cargarConsulta = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/consultas/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Consulta no encontrada');
          navigate('/dashboard/consultas');
          return;
        }
        throw new Error('Error al cargar consulta');
      }

      const data = await response.json();
      setConsulta(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar consulta');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const response = await fetch(`/api/consultas/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) throw new Error('Error al actualizar estado');

      toast.success('Estado actualizado correctamente');
      cargarConsulta();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const convertirAVenta = async () => {
    try {
      const response = await fetch(`/api/consultas/${id}/convertir-venta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(datosVenta)
      });

      if (!response.ok) throw new Error('Error al convertir a venta');

      toast.success('Consulta convertida a venta exitosamente');
      setMostrarModalVenta(false);
      cargarConsulta();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al convertir a venta');
    }
  };

  const eliminarConsulta = async () => {
    if (!confirm('¿Estás seguro de eliminar esta consulta? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/consultas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar consulta');

      toast.success('Consulta eliminada correctamente');
      navigate('/dashboard/consultas');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar consulta');
    }
  };

  const contactarWhatsApp = () => {
    if (!consulta) return;
    
    const mensaje = encodeURIComponent(
      `Hola ${consulta.nombre_cliente}, soy de PushSport. Vi tu consulta sobre los productos que solicitaste. ¿Podemos coordinar el pago y la entrega?`
    );
    
    window.open(`https://wa.me/${consulta.telefono_cliente.replace(/\D/g, '')}?text=${mensaje}`, '_blank');
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Cargando consulta...</p>
        </div>
      </div>
    );
  }

  if (!consulta) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Consulta no encontrada</p>
        </div>
      </div>
    );
  }

  const EstadoIcon = estadoConfig[consulta.estado].icon;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/consultas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver a Consultas
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Consulta #{consulta.id_consulta.substring(0, 8).toUpperCase()}
            </h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${estadoConfig[consulta.estado].color}`}>
                <EstadoIcon size={16} />
                {estadoConfig[consulta.estado].label}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatearFecha(consulta.fecha_consulta)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Botón principal: Convertir a Venta */}
            {!consulta.id_venta_generada && consulta.estado !== 'CANCELADO' && (
              <button
                onClick={() => setMostrarModalVenta(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl font-bold text-base"
              >
                <ShoppingCart size={20} />
                Convertir a Venta
              </button>
            )}
            
            {/* Acciones secundarias */}
            <div className="flex items-center gap-2">
              {/* Cambiar estado */}
              {consulta.estado === 'PENDIENTE' && (
                <button
                  onClick={() => cambiarEstado('EN_PROCESO')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Marcar como en proceso"
                >
                  <AlertCircle size={18} />
                  En Proceso
                </button>
              )}
              
              {consulta.estado === 'EN_PROCESO' && (
                <button
                  onClick={() => cambiarEstado('CONFIRMADO')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Marcar como confirmado"
                >
                  <CheckCircle size={18} />
                  Confirmar
                </button>
              )}
              
              {/* Contactar por WhatsApp */}
              <button
                onClick={contactarWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                title="Contactar por WhatsApp"
              >
                <Send size={18} />
                WhatsApp
              </button>
              
              {/* Eliminar */}
              {!consulta.id_venta_generada && (
                <button
                  onClick={eliminarConsulta}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Eliminar consulta"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={20} />
              Datos del Cliente
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                  <p className="font-medium">{consulta.nombre_cliente}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                  <p className="font-medium">{consulta.telefono_cliente}</p>
                </div>
              </div>
              
              {consulta.email_cliente && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{consulta.email_cliente}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de Entrega */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Entrega
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sucursal</p>
                  <p className="font-medium">{consulta.sucursal?.nombre || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Package size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Método</p>
                  <p className="font-medium">
                    {consulta.metodo_entrega === 'retiro' ? 'Retiro en sucursal' : 'Envío a domicilio'}
                  </p>
                </div>
              </div>
            </div>
            
            {consulta.comentarios && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={18} className="text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Comentarios</p>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {consulta.comentarios}
                </p>
              </div>
            )}
          </div>

          {/* Información de Venta (si existe) */}
          {consulta.venta_generada && (
            <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Convertida a Venta
              </h2>
              
              <div className="space-y-2">
                <p className="text-sm text-green-700">
                  <strong>ID Venta:</strong> #{consulta.venta_generada.id_venta.substring(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Fecha:</strong> {formatearFecha(consulta.venta_generada.fecha_hora)}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Método de Pago:</strong> {consulta.venta_generada.metodo_pago}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package size={20} />
              Productos Solicitados
            </h2>
            
            <div className="space-y-4">
              {consulta.items.map((item, index) => (
                <div key={item.id_item} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {item.producto?.imagen_url && (
                    <img
                      src={item.producto.imagen_url}
                      alt={item.nombre_producto}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.nombre_producto}</h3>
                    {item.variante_info && (
                      <p className="text-sm text-gray-500 mt-1">
                        {Object.values(item.variante_info).join(', ')}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Cantidad: {item.cantidad}</span>
                      <span>Precio unit: {formatearPrecio(item.precio_unitario)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatearPrecio(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-brand-cyan">
                  {formatearPrecio(consulta.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Convertir a Venta */}
      {mostrarModalVenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShoppingCart size={28} />
                Convertir a Venta
              </h3>
              <p className="text-green-100 mt-1">
                Confirma los detalles para registrar esta venta en el sistema
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Resumen de Productos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package size={18} className="text-brand-cyan" />
                  Resumen del Pedido
                </h4>
                <div className="space-y-2">
                  {consulta.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.cantidad}x {item.nombre_producto}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatearPrecio(item.subtotal)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-300 flex justify-between font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-green-600 text-lg">
                      {formatearPrecio(consulta.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Cliente
                </h4>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{consulta.nombre_cliente}</span> • {consulta.telefono_cliente}
                </p>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={datosVenta.metodo_pago}
                  onChange={(e) => setDatosVenta(prev => ({ ...prev, metodo_pago: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                  <option value="TARJETA">💳 Tarjeta de Crédito/Débito</option>
                  <option value="MERCADO_PAGO">🛒 Mercado Pago</option>
                  <option value="OTRO">📝 Otro</option>
                </select>
              </div>
              
              {/* Observaciones */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={datosVenta.observaciones}
                  onChange={(e) => setDatosVenta(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Notas adicionales sobre la venta (descuentos, acuerdos especiales, etc.)"
                />
              </div>

              {/* Advertencia de Stock */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Al convertir esta consulta a venta, se descontará automáticamente el stock de los productos en la sucursal seleccionada.
                  </span>
                </p>
              </div>
            </div>
            
            {/* Footer con botones */}
            <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setMostrarModalVenta(false)}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={convertirAVenta}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Confirmar y Registrar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaDetalle;
