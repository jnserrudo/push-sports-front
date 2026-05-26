import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, ExternalLink, X, Check, Eye, EyeOff, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NotificationBadge = () => {
  const [consultasPendientes, setConsultasPendientes] = useState(0);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [consultas, setConsultas] = useState([]);
  const [consultasLeidas, setConsultasLeidas] = useState(new Set());
  const [consultasOcultas, setConsultasOcultas] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarConsultasPendientes();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarConsultasPendientes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarConsultasPendientes = async () => {
    try {
      const response = await fetch('/api/consultas/notificaciones/pendientes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsultasPendientes(data.data.total);
        setConsultas(data.data.consultas);
      }
    } catch (error) {
      console.error('Error al cargar consultas pendientes:', error);
    }
  };

  const handleBadgeClick = () => {
    setMostrarDropdown(!mostrarDropdown);
    
    // Cargar las últimas consultas si no están cargadas
    if (!mostrarDropdown && consultas.length === 0) {
      cargarConsultasPendientes();
    }
  };

  const verConsulta = (idConsulta) => {
    navigate(`/dashboard/consultas/${idConsulta}`);
    setMostrarDropdown(false);
  };

  const verTodas = () => {
    navigate('/dashboard/consultas');
    setMostrarDropdown(false);
  };

  const marcarComoProcesada = async (idConsulta) => {
    try {
      const response = await fetch(`/api/consultas/${idConsulta}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estado: 'EN_PROCESO' })
      });

      if (response.ok) {
        toast.success('Consulta marcada como en proceso');
        cargarConsultasPendientes();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const marcarComoLeida = (idConsulta) => {
    const nuevasLeidas = new Set(consultasLeidas);
    if (nuevasLeidas.has(idConsulta)) {
      nuevasLeidas.delete(idConsulta);
      toast.success('Notificación marcada como no leída');
    } else {
      nuevasLeidas.add(idConsulta);
      toast.success('Notificación marcada como leída');
    }
    setConsultasLeidas(nuevasLeidas);
    
    // Guardar en localStorage
    localStorage.setItem('consultasLeidas', JSON.stringify([...nuevasLeidas]));
  };

  const ocultarNotificacion = (idConsulta) => {
    const nuevasOcultas = new Set(consultasOcultas);
    if (nuevasOcultas.has(idConsulta)) {
      nuevasOcultas.delete(idConsulta);
      toast.success('Notificación visible');
    } else {
      nuevasOcultas.add(idConsulta);
      toast.success('Notificación oculta');
    }
    setConsultasOcultas(nuevasOcultas);
    
    // Guardar en localStorage
    localStorage.setItem('consultasOcultas', JSON.stringify([...nuevasOcultas]));
  };

  // Cargar notificaciones leídas y ocultas del localStorage
  useEffect(() => {
    const leidas = localStorage.getItem('consultasLeidas');
    const ocultas = localStorage.getItem('consultasOcultas');
    
    if (leidas) {
      setConsultasLeidas(new Set(JSON.parse(leidas)));
    }
    if (ocultas) {
      setConsultasOcultas(new Set(JSON.parse(ocultas)));
    }
  }, []);

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaConsulta = new Date(fecha);
    const diffMs = ahora - fechaConsulta;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;
    
    return fechaConsulta.toLocaleDateString('es-AR');
  };

  const formatearFechaHora = (fecha) => {
    const fechaConsulta = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - fechaConsulta;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Si es hoy, mostrar hora
    if (diffDays < 1) {
      return fechaConsulta.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    // Si es esta semana, mostrar día y hora
    if (diffDays < 7) {
      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${dias[fechaConsulta.getDay()]} ${fechaConsulta.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`;
    }
    
    // Si es más antiguo, mostrar fecha completa
    return fechaConsulta.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  return (
    <div className="relative">
      {/* Badge con contador */}
      <button
        onClick={handleBadgeClick}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Consultas pendientes"
      >
        <Bell size={20} />
        
        {consultasPendientes > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            {consultasPendientes > 99 ? '99+' : consultasPendientes}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {mostrarDropdown && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMostrarDropdown(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} />
                  Consultas Pendientes
                </h3>
                <span className="bg-brand-cyan text-white text-xs font-bold px-2 py-1 rounded-full">
                  {consultasPendientes}
                </span>
              </div>
            </div>

            {/* Lista de consultas */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
                </div>
              ) : consultas.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto text-gray-400 dark:text-gray-500 mb-2" size={32} />
                  <p className="text-gray-500 dark:text-gray-400">No hay consultas pendientes</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {consultas
                    .filter(consulta => !consultasOcultas.has(consulta.id_consulta))
                    .map((consulta) => {
                      const esLeida = consultasLeidas.has(consulta.id_consulta);
                      
                      return (
                        <div 
                          key={consulta.id_consulta} 
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${esLeida ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  #{consulta.id_consulta.substring(0, 8).toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatearFecha(consulta.fecha_consulta)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatearFechaHora(consulta.fecha_consulta)}
                                </span>
                                {esLeida && (
                                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                                    Leída
                                  </span>
                                )}
                              </div>
                              
                              <p className={`font-medium truncate ${esLeida ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {consulta.nombre_cliente}
                              </p>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {consulta.cantidad_items} productos • {formatearPrecio(consulta.total)}
                              </p>
                              
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {consulta.sucursal?.nombre}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => marcarComoLeida(consulta.id_consulta)}
                                className={`p-1 rounded transition-colors ${
                                  esLeida 
                                    ? 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                    : 'text-brand-cyan hover:text-brand-cyan/70 hover:bg-brand-cyan/10 dark:hover:bg-cyan-900/20'
                                }`}
                                title={esLeida ? 'Marcar como no leída' : 'Marcar como leída'}
                              >
                                <Eye size={16} />
                              </button>
                              
                              <button
                                onClick={() => ocultarNotificacion(consulta.id_consulta)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Ocultar notificación"
                              >
                                <EyeOff size={16} />
                              </button>
                              
                              <button
                                onClick={() => marcarComoProcesada(consulta.id_consulta)}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Marcar como en proceso"
                              >
                                <Check size={16} />
                              </button>
                              
                              <button
                                onClick={() => verConsulta(consulta.id_consulta)}
                                className="p-1 text-gray-400 hover:text-brand-cyan dark:hover:text-cyan-400 hover:bg-brand-cyan/10 dark:hover:bg-cyan-900/20 rounded transition-colors"
                                title="Ver detalle"
                              >
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 space-y-2">
              {/* Estadísticas */}
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Total: {consultas.length}</span>
                <span>Leídas: {consultasLeidas.size}</span>
                <span>Ocultas: {consultasOcultas.size}</span>
              </div>
              
              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={verTodas}
                  className="flex-1 px-3 py-2 bg-brand-cyan text-white text-sm font-medium rounded-lg hover:bg-brand-cyan/90 transition-colors"
                >
                  Ver Todas
                </button>
                
                {consultasOcultas.size > 0 && (
                  <button
                    onClick={() => {
                      setConsultasOcultas(new Set());
                      localStorage.removeItem('consultasOcultas');
                      toast.success('Todas las notificaciones visibles');
                    }}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Mostrar Ocultas ({consultasOcultas.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBadge;
