import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, MapPin, User, Phone, Mail, Package, DollarSign, Eye, Edit, Trash2, Check, X, Clock, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import PremiumSelect from '../../components/ui/PremiumSelect';
import Modal from '../../components/ui/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 25;

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: '',
    id_sucursal: '',
    fecha_inicio: '',
    fecha_fin: '',
    busqueda: ''
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de consulta con sus colores
  const estadoConfig = {
    PENDIENTE: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
    EN_PROCESO: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'En Proceso' },
    CONFIRMED: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Confirmado' },
    CANCELADO: { color: 'bg-red-100 text-red-800', icon: X, label: 'Cancelado' }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        limit: ITEMS_PER_PAGE,
        offset: page * ITEMS_PER_PAGE,
        ...filtrosAplicados
      };

      Object.entries(filtrosAplicados).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.get(`/consultas?${new URLSearchParams(params)}`);
      const data = response.data;

      setConsultas(data.data?.consultas || []);
      setTotal(data.data?.total || 0);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      toast.error('Error al cargar consultas');
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [page, filtrosAplicados]);

  useEffect(() => { loadData(); }, [loadData]);


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

  const aplicarFiltros = () => {
    const nuevos = {};
    if (filtros.estado) nuevos.estado = filtros.estado;
    if (filtros.id_sucursal) nuevos.id_sucursal = filtros.id_sucursal;
    if (filtros.fecha_inicio) nuevos.fecha_inicio = filtros.fecha_inicio;
    if (filtros.fecha_fin) nuevos.fecha_fin = filtros.fecha_fin;
    if (filtros.busqueda) nuevos.busqueda = filtros.busqueda;
    setFiltrosAplicados(nuevos);
    setPage(0);
  };


  const cambiarEstado = async (idConsulta, nuevoEstado) => {
    try {
      await api.put(`/consultas/${idConsulta}/estado`, { estado: nuevoEstado });
      toast.success('Estado actualizado correctamente');
      loadData();
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
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar consulta');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch { return '—'; }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  const limpiarFiltros = () => {
    setFiltros({ estado: '', id_sucursal: '', fecha_inicio: '', fecha_fin: '', busqueda: '' });
    setFiltrosAplicados({});
    setPage(0);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black dark:border-gray-600 pb-4 gap-4 flex-wrap">
        <div className="flex-1 min-w-0 pr-0 md:pr-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-brand-cyan" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">ATENCIÓN AL CLIENTE</span>
          </div>
          <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
            Consultas Web
          </h2>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal">
            Gestiona las consultas y pedidos recibidos desde la landing page. Seguimiento de clientes, estados de consulta y conversión a ventas.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black uppercase text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
              {total.toLocaleString('es-AR')} CONSULTAS
            </span>
            {Object.keys(filtrosAplicados).length > 0 && (
              <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
                Filtros activos
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm active:scale-95 ${
              mostrarFiltros 
                ? 'bg-brand-cyan text-black shadow-md' 
                : 'bg-neutral-100 dark:bg-gray-700 text-black dark:text-white hover:bg-neutral-200 hover:shadow-md'
            }`}
          >
            <Filter size={16} />
            Filtros
            {Object.keys(filtrosAplicados).length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px]">
                {Object.keys(filtrosAplicados).length}
              </span>
            )}
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-100 dark:bg-gray-700 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-gray-600 transition-all px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] shadow-sm disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            ACTUALIZAR
          </button>
        </div>
      </div>

      {/* Panel de Filtros Expandible */}
      {mostrarFiltros && (
        <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Estado */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Estado</label>
              <PremiumSelect
                placeholder="Todos los estados"
                options={[
                  { value: '', label: 'Todos los estados' },
                  ...Object.entries(estadoConfig).map(([key, config]) => ({ value: key, label: config.label }))
                ]}
                value={filtros.estado}
                onChange={val => setFiltros({ ...filtros, estado: val })}
              />
            </div>

            {/* Sucursal */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Sucursal</label>
              <PremiumSelect
                placeholder="Todas las sucursales"
                isLoading={loadingSucursales}
                options={[
                  { value: '', label: 'Todas las sucursales' },
                  ...sucursales.map(suc => ({ value: suc.id_comercio, label: suc.nombre }))
                ]}
                value={filtros.id_sucursal}
                onChange={val => setFiltros({ ...filtros, id_sucursal: val })}
              />
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha Desde</label>
              <input
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha Hasta</label>
              <input
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
              />
            </div>
          </div>

          {/* Búsqueda general */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
            />
          </div>

          {/* Botones */}
          <div className="flex items-end gap-2">
            <button
              onClick={aplicarFiltros}
              className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white hover:bg-brand-cyan hover:text-black transition-colors px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em]"
            >
              <Search size={14} />
              Buscar
            </button>
            <button
              onClick={limpiarFiltros}
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-red-500 transition-colors border border-neutral-200 dark:border-gray-600 rounded-lg"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Consultas */}
      {initialLoad ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-gray-700 animate-in fade-in duration-500">
          <div className="flex justify-between mb-4 gap-3">
            <div className="w-full max-w-md h-12 bg-neutral-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-40 h-12 bg-neutral-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-gray-700 border-b border-neutral-200 dark:border-gray-600">
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-3 bg-neutral-200 dark:bg-gray-600 rounded w-16 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    {[...Array(7)].map((_, colI) => (
                      <td key={colI} className="px-4 py-3 relative">
                        <div className="flex items-center gap-2">
                          {colI === 0 && <div className="w-8 h-8 bg-neutral-100 rounded-lg flex-shrink-0 animate-pulse" />}
                          <div className="h-2.5 bg-neutral-100 rounded animate-pulse" style={{ width: `${Math.max(30, 80 - (i * colI * 10) % 50)}%` }} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <DataTable
          data={consultas}
          totalItems={total}
          onPageChange={(p) => setPage(p - 1)}
          itemsPerPageDefault={ITEMS_PER_PAGE}
          columns={[
            {
              header: 'Cliente',
              render: (consulta) => (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <User size={10} className="text-neutral-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-black dark:text-white">{consulta.nombre_cliente}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={10} className="text-neutral-400 flex-shrink-0" />
                    <span className="text-[9px] text-neutral-500">{consulta.telefono_cliente}</span>
                  </div>
                  {consulta.email_cliente && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={10} className="text-neutral-400 flex-shrink-0" />
                      <span className="text-[9px] text-neutral-500 truncate max-w-[150px]">{consulta.email_cliente}</span>
                    </div>
                  )}
                </div>
              )
            },
            {
              header: 'Productos',
              render: (consulta) => (
                <div className="flex items-center gap-1.5">
                  <Package size={10} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-black dark:text-white">{consulta.cantidad_items} items</span>
                </div>
              )
            },
            {
              header: 'Total',
              render: (consulta) => (
                <div className="flex items-center gap-1.5">
                  <DollarSign size={10} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-black dark:text-white">{formatearPrecio(consulta.total)}</span>
                </div>
              )
            },
            {
              header: 'Sucursal',
              render: (consulta) => (
                <div className="flex items-center gap-1.5">
                  <MapPin size={10} className="text-brand-cyan flex-shrink-0" />
                  <span className="text-[10px] font-bold text-black dark:text-white">{consulta.sucursal?.nombre || 'N/A'}</span>
                </div>
              )
            },
            {
              header: 'Estado',
              render: (consulta) => {
                const EstadoIcon = estadoConfig[consulta.estado]?.icon || Clock;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${estadoConfig[consulta.estado]?.color || 'bg-gray-100 text-gray-800'}`}>
                    <EstadoIcon size={10} />
                    {estadoConfig[consulta.estado]?.label || consulta.estado}
                  </span>
                );
              }
            },
            {
              header: 'Fecha',
              render: (consulta) => (
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-black dark:text-white">{formatFecha(consulta.fecha_consulta)}</span>
                </div>
              )
            },
            {
              header: 'Acciones',
              render: (consulta) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setConsultaSeleccionada(consulta);
                      setMostrarModal(true);
                    }}
                    className="p-1 text-neutral-600 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded transition-colors"
                    title="Ver detalle"
                  >
                    <Eye size={14} />
                  </button>
                  {consulta.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => cambiarEstado(consulta.id_consulta, 'EN_PROCESO')}
                      className="p-1 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Marcar en proceso"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {consulta.estado === 'EN_PROCESO' && (
                    <button
                      onClick={() => cambiarEstado(consulta.id_consulta, 'CONFIRMED')}
                      className="p-1 text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Confirmar"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {!consulta.id_venta_generada && (
                    <button
                      onClick={() => eliminarConsulta(consulta.id_consulta)}
                      className="p-1 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            }
          ]}
          searchPlaceholder="Buscar por nombre, teléfono o email..."
          emptyIcon={MessageSquare}
          emptyTitle="Sin consultas"
          emptySubtitle="No se encontraron consultas con los filtros actuales."
        />
      )}

      {/* Modal de Detalles */}
      <Modal
        isOpen={mostrarModal}
        onClose={() => !isLoading && setMostrarModal(false)}
        title="Detalle de Consulta"
      >
        {consultaSeleccionada && (
          <div className="space-y-4">
            {/* Estado */}
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Estado</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${estadoConfig[consultaSeleccionada.estado]?.color || 'bg-gray-100 text-gray-800'}`}>
                {React.createElement(estadoConfig[consultaSeleccionada.estado]?.icon || Clock, { size: 12 })}
                {estadoConfig[consultaSeleccionada.estado]?.label || consultaSeleccionada.estado}
              </span>
            </div>

            {/* Información del Cliente */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <User size={16} className="text-brand-cyan" />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-[9px] text-neutral-500 mb-1">Nombre</p>
                  <p className="text-xs font-medium text-black dark:text-white">{consultaSeleccionada.nombre_cliente}</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-[9px] text-neutral-500 mb-1">Teléfono</p>
                  <p className="text-xs font-medium text-black dark:text-white flex items-center gap-1.5">
                    <Phone size={12} />
                    {consultaSeleccionada.telefono_cliente}
                  </p>
                </div>
                {consultaSeleccionada.email_cliente && (
                  <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg md:col-span-2">
                    <p className="text-[9px] text-neutral-500 mb-1">Email</p>
                    <p className="text-xs font-medium text-black dark:text-white flex items-center gap-1.5">
                      <Mail size={12} />
                      {consultaSeleccionada.email_cliente}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Entrega */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <MapPin size={16} className="text-brand-cyan" />
                Información de Entrega
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-[9px] text-neutral-500 mb-1">Sucursal</p>
                  <p className="text-xs font-medium text-black dark:text-white">{consultaSeleccionada.sucursal?.nombre || 'N/A'}</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-[9px] text-neutral-500 mb-1">Método de Entrega</p>
                  <p className="text-xs font-medium text-black dark:text-white capitalize">{consultaSeleccionada.metodo_entrega}</p>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <Package size={16} className="text-brand-cyan" />
                Productos ({consultaSeleccionada.cantidad_items})
              </h3>
              <div className="space-y-1.5">
                {consultaSeleccionada.items?.map((item, index) => (
                  <div key={index} className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-black dark:text-white">{item.nombre_producto}</p>
                      <p className="text-[9px] text-neutral-500">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="text-xs font-semibold text-black dark:text-white">{formatearPrecio(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-3 bg-brand-cyan/10 rounded-lg border border-brand-cyan/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-black dark:text-white">Total</span>
                <span className="text-lg font-bold text-brand-cyan">{formatearPrecio(consultaSeleccionada.total)}</span>
              </div>
            </div>

            {/* Comentarios */}
            {consultaSeleccionada.comentarios && (
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-black dark:text-white">Comentarios</h3>
                <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">{consultaSeleccionada.comentarios}</p>
                </div>
              </div>
            )}

            {/* Fecha */}
            <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-lg">
              <p className="text-[9px] text-neutral-500 mb-1">Fecha de Consulta</p>
              <p className="text-xs font-medium text-black dark:text-white flex items-center gap-1.5">
                <Calendar size={12} />
                {formatFecha(consultaSeleccionada.fecha_consulta)}
              </p>
            </div>

            {/* Acciones */}
            <div className="pt-3 border-t border-neutral-200 dark:border-gray-600 flex gap-2 justify-end">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-neutral-100 dark:bg-gray-600 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-gray-500 transition-colors text-[10px] font-bold uppercase tracking-wider"
              >
                Cerrar
              </button>
              {consultaSeleccionada.estado === 'PENDIENTE' && (
                <button
                  onClick={() => {
                    cambiarEstado(consultaSeleccionada.id_consulta, 'EN_PROCESO');
                    setMostrarModal(false);
                  }}
                  className="px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan/90 transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  Marcar como En Proceso
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Consultas;
