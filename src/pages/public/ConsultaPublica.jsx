import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, MapPin, Truck, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Home } from 'lucide-react';
import publicService from '../../services/publicService';

const ConsultaPublica = () => {
  const { token } = useParams();
  const [consulta, setConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuración de estados
  const estadoConfig = {
    PENDIENTE: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
      label: 'Pendiente',
      descripcion: 'Tu consulta ha sido recibida y está siendo revisada'
    },
    EN_PROCESO: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: AlertCircle,
      label: 'En Proceso',
      descripcion: 'Estamos preparando tu pedido'
    },
    CONFIRMADO: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle,
      label: 'Confirmado',
      descripcion: '¡Tu pedido está listo! Nos pondremos en contacto contigo'
    },
    CANCELADO: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
      label: 'Cancelado',
      descripcion: 'Este pedido ha sido cancelado'
    }
  };

  useEffect(() => {
    cargarConsulta();
  }, [token]);

  const cargarConsulta = async () => {
    try {
      setLoading(true);
      const response = await publicService.getConsultaByToken(token);
      setConsulta(response.data);
    } catch (err) {
      console.error('Error al cargar consulta:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // Timeline de estados
  const getTimelineSteps = () => {
    const steps = [
      { key: 'PENDIENTE', label: 'Recibido' },
      { key: 'EN_PROCESO', label: 'En Proceso' },
      { key: 'CONFIRMADO', label: 'Confirmado' }
    ];

    const currentIndex = steps.findIndex(s => s.key === consulta?.estado);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && consulta?.estado !== 'CANCELADO',
      active: step.key === consulta?.estado,
      cancelled: consulta?.estado === 'CANCELADO'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tu consulta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Consulta no encontrada</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
          >
            <Home size={20} />
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const estadoActual = estadoConfig[consulta.estado];
  const EstadoIcon = estadoActual.icon;
  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <img src="/icono.jpeg" alt="Push Sport" className="w-12 h-12 rounded-lg" />
            <h1 className="text-3xl font-black text-gray-900">
              PUSH<span className="text-brand-cyan">SPORT</span>
            </h1>
          </div>
          <p className="text-gray-600">Seguimiento de tu consulta</p>
        </div>

        {/* Estado Actual */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estado actual</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${estadoActual.color} font-bold`}>
                <EstadoIcon size={20} />
                {estadoActual.label}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Fecha de consulta</p>
              <p className="text-sm font-medium text-gray-900">{formatearFecha(consulta.fecha_consulta)}</p>
            </div>
          </div>

          <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
            {estadoActual.descripcion}
          </p>
        </div>

        {/* Timeline */}
        {consulta.estado !== 'CANCELADO' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Progreso del pedido</h2>
            <div className="relative">
              {/* Línea de conexión */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                <div 
                  className="h-full bg-brand-cyan transition-all duration-500"
                  style={{ 
                    width: `${(timelineSteps.filter(s => s.completed).length - 1) / (timelineSteps.length - 1) * 100}%` 
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {timelineSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${
                      step.completed 
                        ? 'bg-brand-cyan border-brand-cyan text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${step.active ? 'ring-4 ring-brand-cyan/30' : ''}`}>
                      {step.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <p className={`mt-2 text-xs font-medium text-center ${
                      step.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Información del Pedido */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-brand-cyan" />
            Productos solicitados
          </h2>
          <div className="space-y-3">
            {consulta.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {item.imagen && (
                  <img 
                    src={item.imagen} 
                    alt={item.nombre_producto}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.nombre_producto}</p>
                  {item.variante_info && (
                    <p className="text-sm text-gray-500">
                      {Object.values(item.variante_info.atributos_valores || {}).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatearPrecio(item.subtotal)}</p>
                  <p className="text-xs text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-brand-cyan">{formatearPrecio(consulta.total)}</span>
          </div>
        </div>

        {/* Información de Entrega */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información de entrega</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-brand-cyan mt-1" size={20} />
              <div>
                <p className="font-medium text-gray-900">{consulta.sucursal.nombre}</p>
                <p className="text-sm text-gray-600">{consulta.sucursal.direccion}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="text-brand-cyan mt-1" size={20} />
              <div>
                <p className="font-medium text-gray-900">
                  {consulta.metodo_entrega === 'retiro' ? 'Retiro en sucursal' : 'Envío a domicilio'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            ¿Tenés alguna consulta? Contactanos por WhatsApp
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Home size={20} />
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConsultaPublica;
