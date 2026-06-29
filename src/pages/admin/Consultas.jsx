import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, User, Phone, Mail, Package, DollarSign, Eye, Edit, Trash2, Check, X, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: '',
    id_sucursal: '',
    fecha_inicio: '',
    fecha_fin: '',
    busqueda: ''
  });
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 20,
    total: 0,
    totalPaginas: 1
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de consulta con sus colores
  const estadoConfig = {
    PENDIENTE: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
    EN_PROCESO: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'En Proceso' },
    CONFIRMED: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Confirmado' },
    CANCELADO: { color: 'bg-red-100 text-red-800', icon: X, label: 'Cancelado' }
  };

  useEffect(() => {
    console.log('🔄 useEffect ejecutado en Consultas.jsx');
    cargarConsultas();
    cargarSucursales();
  }, [filtros, paginacion.pagina]);

  const cargarConsultas = async () => {
    console.log('📥 Iniciando cargarConsultas()');
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('pagina', paginacion.pagina);
      params.append('limite', paginacion.limite);

      console.log('🔍 Parámetros de consulta:', params.toString());
      const response = await api.get(`/consultas?${params}`);
      console.log('📊 Respuesta de consultas:', response);

      const data = response.data;
      console.log('🔍 Estructura completa de respuesta:', data);
      console.log('🔍 data.data:', data.data);
      console.log('🔍 data.data.consultas:', data.data?.consultas);
      
      setConsultas(data.data.consultas);
      setPaginacion(prev => ({
        ...prev,
        total: data.data.total,
        totalPaginas: data.data.totalPaginas
      }));
      console.log('✅ Consultas cargadas:', data.data.consultas?.length || 0);
    } catch (error) {
      console.error('❌ Error en cargarConsultas:', error);
      toast.error('Error al cargar consultas');
    } finally {
      setLoading(false);
    }
  };

  const cargarSucursales = async () => {
    console.log('📥 Iniciando cargarSucursales()');
    setLoadingSucursales(true);
    try {
      const response = await api.get('/public/sucursales');
      console.log('📊 Respuesta de sucursales:', response);
      if (response.data) {
        setSucursales(response.data);
        console.log('✅ Sucursales cargadas:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error al cargar sucursales:', error);
    } finally {
      setLoadingSucursales(false);
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  const handleBusqueda = (e) => {
    handleFiltroChange('busqueda', e.target.value);
  };

  const cambiarEstado = async (idConsulta, nuevoEstado) => {
    try {
      await api.put(`/consultas/${idConsulta}/estado`, { estado: nuevoEstado });

      toast.success('Estado actualizado correctamente');
      cargarConsultas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const eliminarConsulta = async (idConsulta) => {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;

    try {
      await api.delete(`/consultas/${idConsulta}`);

      toast.success('Consulta eliminada correctamente');
      cargarConsultas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar consulta');
    }
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

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      id_sucursal: '',
      fecha_inicio: '',
      fecha_fin: '',
      busqueda: ''
    });
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Consultas Web</h1>
        <p className="text-gray-600">Gestiona las consultas y pedidos recibidos desde la landing page</p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter size={18} />
              Filtros
            </button>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {paginacion.total} consultas encontradas
          </div>
        </div>

        {mostrarFiltros && (
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(estadoConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Sucursal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                <div className="relative">
                  <select
                    value={filtros.id_sucursal}
                    onChange={(e) => handleFiltroChange('id_sucursal', e.target.value)}
                    disabled={loadingSucursales}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan disabled:opacity-50 appearance-none"
                  >
                    <option value="">Todas las sucursales</option>
                    {sucursales.map(sucursal => (
                      <option key={sucursal.id_comercio} value={sucursal.id_comercio}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                  {loadingSucursales && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <RefreshCw size={16} className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filtros.fecha_inicio}
                  onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
                />
              </div>

              {/* Fecha fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filtros.fecha_fin}
                  onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
                />
              </div>
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={filtros.busqueda}
              onChange={handleBusqueda}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
            />
          </div>
        </div>
      </div>

      {/* Lista de consultas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando consultas...</p>
          </div>
        ) : consultas.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No se encontraron consultas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consultas.map((consulta) => {
                  const EstadoIcon = estadoConfig[consulta.estado].icon;
                  return (
                    <tr key={consulta.id_consulta} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <User size={14} />
                            {consulta.nombre_cliente}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Phone size={14} />
                            {consulta.telefono_cliente}
                          </div>
                          {consulta.email_cliente && (
                            <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Mail size={14} />
                              {consulta.email_cliente}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          {consulta.cantidad_items} items
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {formatearPrecio(consulta.total)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {consulta.sucursal?.nombre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${estadoConfig[consulta.estado].color}`}>
                          <EstadoIcon size={12} />
                          {estadoConfig[consulta.estado].label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatearFecha(consulta.fecha_consulta)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setConsultaSeleccionada(consulta);
                              setMostrarModal(true);
                            }}
                            className="p-1 text-gray-600 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {consulta.estado === 'PENDIENTE' && (
                            <button
                              onClick={() => cambiarEstado(consulta.id_consulta, 'EN_PROCESO')}
                              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Marcar en proceso"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          
                          {consulta.estado === 'EN_PROCESO' && (
                            <button
                              onClick={() => cambiarEstado(consulta.id_consulta, 'CONFIRMED')}
                              className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Confirmar"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          
                          {!consulta.id_venta_generada && (
                            <button
                              onClick={() => eliminarConsulta(consulta.id_consulta)}
                              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && consultas.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((paginacion.pagina - 1) * paginacion.limite) + 1} a {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)} de {paginacion.total} consultas
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacion.pagina === 1}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                {paginacion.pagina} / {paginacion.totalPaginas}
              </span>
              <button
                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacion.pagina === paginacion.totalPaginas}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {mostrarModal && consultaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-brand-cyan to-brand-purple p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Detalle de Consulta</h2>
                  <p className="text-white/80 text-sm mt-1">
                    ID: #{consultaSeleccionada.id_consulta.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Estado */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado</span>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${estadoConfig[consultaSeleccionada.estado].color}`}>
                  {React.createElement(estadoConfig[consultaSeleccionada.estado].icon, { size: 16 })}
                  {estadoConfig[consultaSeleccionada.estado].label}
                </span>
              </div>

              {/* Información del Cliente */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-brand-cyan" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
                    <p className="font-medium text-gray-900 dark:text-white">{consultaSeleccionada.nombre_cliente}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone size={14} />
                      {consultaSeleccionada.telefono_cliente}
                    </p>
                  </div>
                  {consultaSeleccionada.email_cliente && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl md:col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail size={14} />
                        {consultaSeleccionada.email_cliente}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Entrega */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin size={20} className="text-brand-cyan" />
                  Información de Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sucursal</p>
                    <p className="font-medium text-gray-900 dark:text-white">{consultaSeleccionada.sucursal?.nombre || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Método de Entrega</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{consultaSeleccionada.metodo_entrega}</p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={20} className="text-brand-cyan" />
                  Productos ({consultaSeleccionada.cantidad_items})
                </h3>
                <div className="space-y-2">
                  {consultaSeleccionada.items?.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.nombre_producto}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {item.cantidad}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatearPrecio(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 rounded-xl border-2 border-brand-cyan/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-brand-cyan">{formatearPrecio(consultaSeleccionada.total)}</span>
                </div>
              </div>

              {/* Comentarios */}
              {consultaSeleccionada.comentarios && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comentarios</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300">{consultaSeleccionada.comentarios}</p>
                  </div>
                </div>
              )}

              {/* Fecha */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha de Consulta</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar size={14} />
                  {formatearFecha(consultaSeleccionada.fecha_consulta)}
                </p>
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-6 rounded-b-2xl border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Cerrar
                </button>
                {consultaSeleccionada.estado === 'PENDIENTE' && (
                  <button
                    onClick={() => {
                      cambiarEstado(consultaSeleccionada.id_consulta, 'EN_PROCESO');
                      setMostrarModal(false);
                    }}
                    className="px-6 py-2.5 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
                  >
                    Marcar como En Proceso
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultas;
