import React, { useState, useEffect, useCallback } from 'react';
import { 
    Activity, ArrowUpRight, ArrowDownLeft, RefreshCw, Filter, Search, 
    Clock, Box, User, Store, ChevronLeft, ChevronRight, Download,
    Calendar, X, Eye, Package, ArrowRight, ChevronDown, Layers
} from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { usuariosService } from '../../services/genericServices';
import PremiumSelect from '../../components/ui/PremiumSelect';
import DataTable from '../../components/ui/DataTable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 25;

const Movimientos = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    
    const [movimientos, setMovimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [sucursalesOptions, setSucursalesOptions] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loadingSucursales, setLoadingSucursales] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [selectedMov, setSelectedMov] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [filtros, setFiltros] = useState({
        sucursalId: 'ALL',
        desde: '',
        hasta: '',
        id_tipo_movimiento: '',
        id_usuario: '',
        busqueda: ''
    });

    const [filtrosAplicados, setFiltrosAplicados] = useState({});

    // Cargar sucursales al inicio (solo superadmin)
    useEffect(() => {
        if (isSuperAdmin) {
            setLoadingSucursales(true);
            sucursalesService.getAll()
                .then(sucs => setSucursalesOptions(sucs))
                .catch(() => [])
                .finally(() => setLoadingSucursales(false));
        }
    }, [isSuperAdmin]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setLoadingTipos(true);
        setLoadingUsuarios(true);
        try {
            const params = {
                limit: ITEMS_PER_PAGE,
                offset: page * ITEMS_PER_PAGE,
                ...filtrosAplicados
            };

            // Determinar sucursal
            if (isSuperAdmin) {
                const sucId = filtrosAplicados.sucursalId || filtros.sucursalId;
                if (sucId && sucId !== 'ALL') {
                    params.sucursalId = sucId;
                }
            } else {
                params.sucursalId = sucursalId;
            }

            // Limpiar sucursalId del params ya que se maneja en el service
            const { sucursalId: sid, ...queryParams } = params;
            const cleanSid = typeof sid === 'object' ? sid?.id_comercio : sid;
            
            const response = await enviosService.getAll({ ...queryParams, sucursalId: cleanSid || (isSuperAdmin ? null : sucursalId) });

            setMovimientos(response.data || []);
            setTotal(response.total || 0);
            
            // Guardar metadatos de filtros del backend
            if (response.tipos_movimiento) setTiposMovimiento(response.tipos_movimiento);
            if (response.usuarios) setUsuariosDisponibles(response.usuarios);
        } catch (err) {
            console.error('Error cargando movimientos:', err);
        } finally {
            setIsLoading(false);
            setLoadingTipos(false);
            setLoadingUsuarios(false);
        }
    }, [page, filtrosAplicados, isSuperAdmin, sucursalId, filtros.sucursalId]);

    useEffect(() => { loadData(); }, [loadData]);

    const aplicarFiltros = () => {
        const nuevos = {};
        if (filtros.sucursalId && filtros.sucursalId !== 'ALL') nuevos.sucursalId = filtros.sucursalId;
        if (filtros.desde) nuevos.desde = filtros.desde;
        if (filtros.hasta) nuevos.hasta = filtros.hasta;
        if (filtros.id_tipo_movimiento) nuevos.id_tipo_movimiento = filtros.id_tipo_movimiento;
        if (filtros.id_usuario) nuevos.id_usuario = filtros.id_usuario;
        if (filtros.busqueda) nuevos.busqueda = filtros.busqueda;
        setFiltrosAplicados(nuevos);
        setPage(0);
    };

    const limpiarFiltros = () => {
        setFiltros({ sucursalId: 'ALL', desde: '', hasta: '', id_tipo_movimiento: '', id_usuario: '', busqueda: '' });
        setFiltrosAplicados({});
        setPage(0);
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const formatFecha = (fecha) => {
        if (!fecha) return '—';
        try {
            return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch { return '—'; }
    };

    const getTipoInfo = (tipo) => {
        const nombre = tipo?.toUpperCase() || '';
        if (nombre.includes('INGRESO') || nombre.includes('COMPRA') || nombre.includes('ENVÍO') || nombre.includes('ENVIO')) {
            return { icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', label: 'Ingreso' };
        }
        if (nombre.includes('EGRESO') || nombre.includes('VENTA') || nombre.includes('SALIDA')) {
            return { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', label: 'Egreso' };
        }
        if (nombre.includes('AJUSTE')) {
            return { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', label: 'Ajuste' };
        }
        return { icon: Activity, color: 'text-brand-cyan', bg: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-200 dark:border-cyan-800', label: 'Movimiento' };
    };

    const getVarianteLabel = (variantes) => {
        if (!variantes || variantes.length === 0) return null;
        return variantes.map(v => {
            const attrs = v.variante?.atributos_valores;
            if (!attrs) return v.variante?.sku_variante || 'Variante';
            return Object.values(attrs).join(' / ');
        }).join(', ');
    };

    const handleExport = () => {
        if (!movimientos.length) return;
        const headers = ['Fecha', 'Tipo', 'Producto', 'Sucursal', 'Cantidad', 'Saldo Ant.', 'Saldo Post.', 'Operador'];
        const rows = movimientos.map(m => [
            m.fecha_hora ? format(new Date(m.fecha_hora), 'dd/MM/yyyy HH:mm', { locale: es }) : '',
            m.tipo_movimiento?.nombre_movimiento || '',
            m.producto?.nombre || '',
            m.comercio?.nombre || '',
            m.cantidad_cambio,
            m.saldo_anterior,
            m.saldo_posterior,
            m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido || ''}`.trim() : 'Sistema'
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movimientos_stock_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black dark:border-gray-600 pb-4 gap-4 flex-wrap">
                <div className="flex-1 min-w-0 pr-0 md:pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">TRAZABILIDAD</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Historial de Movimientos
                    </h2>
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal">
                        Seguimiento logístico detallado. Historial completo de ingresos, egresos, ajustes de inventario y envíos entre sedes.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black uppercase text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                            {total.toLocaleString('es-AR')} MOVIMIENTOS
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
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm active:scale-95 ${
                            showFilters 
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
                    <button
                        onClick={handleExport}
                        disabled={!movimientos.length}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white hover:bg-brand-cyan hover:text-black dark:text-white transition-all px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] shadow-sm disabled:opacity-40 active:scale-95"
                    >
                        <Download size={16} /> EXPORTAR
                    </button>
                </div>
            </div>

            {/* Panel de Filtros Expandible */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {/* Sucursal (solo superadmin) */}
                        {isSuperAdmin && (
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Sucursal</label>
                                <PremiumSelect
                                    placeholder="Todas las sucursales"
                                    isLoading={loadingSucursales}
                                    options={[
                                        { value: 'ALL', label: 'Todas las sucursales' },
                                        ...sucursalesOptions.map(suc => ({ value: suc.id_comercio, label: suc.nombre }))
                                    ]}
                                    value={filtros.sucursalId}
                                    onChange={val => setFiltros({ ...filtros, sucursalId: val })}
                                />
                            </div>
                        )}
                        {/* Tipo de operación */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Tipo de Operación</label>
                            <PremiumSelect
                                placeholder="Todos los tipos"
                                isLoading={loadingTipos}
                                options={[
                                    { value: '', label: 'Todos los tipos' },
                                    ...tiposMovimiento.map(t => ({ value: t.id_tipo_movimiento, label: t.nombre_movimiento }))
                                ]}
                                value={filtros.id_tipo_movimiento}
                                onChange={val => setFiltros({ ...filtros, id_tipo_movimiento: val })}
                            />
                        </div>
                        {/* Operador */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Operador</label>
                            <PremiumSelect
                                placeholder="Todos los operadores"
                                isLoading={loadingUsuarios}
                                options={[
                                    { value: '', label: 'Todos los operadores' },
                                    ...usuariosDisponibles.map(u => ({ value: u.id_usuario, label: `${u.nombre} ${u.apellido || ''}` }))
                                ]}
                                value={filtros.id_usuario}
                                onChange={val => setFiltros({ ...filtros, id_usuario: val })}
                            />
                        </div>
                        {/* Fecha Desde */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha Desde</label>
                            <input
                                type="date"
                                value={filtros.desde}
                                onChange={(e) => setFiltros({...filtros, desde: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                            />
                        </div>
                        {/* Fecha Hasta */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha Hasta</label>
                            <input
                                type="date"
                                value={filtros.hasta}
                                onChange={(e) => setFiltros({...filtros, hasta: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
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
                    {/* Búsqueda general por texto */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de producto, sucursal u operador..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                        />
                    </div>
                </div>
            )}

            {/* Tabla de Movimientos */}
            <DataTable 
                    data={movimientos}
                    totalItems={total}
                    onPageChange={(p) => setPage(p - 1)}
                    itemsPerPageDefault={ITEMS_PER_PAGE}
                    columns={[
                        { 
                            header: 'Fecha', 
                            render: (mov) => (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={10} className="text-neutral-400 flex-shrink-0" />
                                    <span className="text-[10px] font-bold whitespace-nowrap">
                                        {formatFecha(mov.fecha_hora)}
                                    </span>
                                </div>
                            )
                        },
                        { 
                            header: 'Tipo', 
                            render: (mov) => {
                                const tipoNombre = mov.tipo_movimiento?.nombre_movimiento || 'Movimiento';
                                const tipoInfo = getTipoInfo(tipoNombre);
                                const TipoIcon = tipoInfo.icon;
                                return (
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${tipoInfo.bg} ${tipoInfo.color} ${tipoInfo.border}`}>
                                        <TipoIcon size={10} />
                                        {tipoNombre}
                                    </span>
                                );
                            }
                        },
                        { 
                            header: 'Producto', 
                            render: (mov) => {
                                const variantesLabel = getVarianteLabel(mov.variantes);
                                return (
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <Box size={10} className="text-neutral-400 flex-shrink-0" />
                                            <span className="text-[10px] font-bold">
                                                {mov.producto?.nombre || 'N/A'}
                                            </span>
                                        </div>
                                        {mov.tiene_desglose_variantes && variantesLabel && (
                                            <div className="flex items-center gap-1 mt-0.5 ml-4">
                                                <Layers size={8} className="text-brand-cyan flex-shrink-0" />
                                                <span className="text-[8px] text-brand-cyan font-black uppercase truncate max-w-[150px]">
                                                    {variantesLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        },
                        { 
                            header: 'Sucursal', 
                            render: (mov) => (
                                <div className="flex items-center gap-1.5">
                                    <Store size={10} className="text-brand-cyan flex-shrink-0" />
                                    <span className="text-[10px] font-bold">
                                        {mov.comercio?.nombre || 'N/A'}
                                    </span>
                                </div>
                            )
                        },
                        { 
                            header: 'Cantidad', 
                            render: (mov) => (
                                <div className="text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black border ${
                                        mov.cantidad_cambio > 0 
                                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                                            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                    }`}>
                                        {mov.cantidad_cambio > 0 ? '+' : ''}{mov.cantidad_cambio}
                                    </span>
                                </div>
                            )
                        },
                        { 
                            header: 'Saldo', 
                            render: (mov) => (
                                <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                                    <span>{mov.saldo_anterior}</span>
                                    <ArrowRight size={10} className="text-neutral-300" />
                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{mov.saldo_posterior}</span>
                                </div>
                            )
                        },
                        { 
                            header: 'Operador', 
                            render: (mov) => (
                                <div className="flex items-center gap-1.5">
                                    <User size={10} className="text-neutral-400 flex-shrink-0" />
                                    <span className="text-[10px] font-bold">
                                        {mov.usuario ? `${mov.usuario.nombre} ${mov.usuario.apellido || ''}`.trim() : 'Sistema'}
                                    </span>
                                </div>
                            )
                        }
                    ]}
                    onView={(mov) => setSelectedMov(mov)}
                />
            {/* Modal de Detalle de Movimiento */}
            {selectedMov && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMov(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full mx-4 max-h-[85vh] overflow-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getTipoInfo(selectedMov.tipo_movimiento?.nombre_movimiento).bg} ${getTipoInfo(selectedMov.tipo_movimiento?.nombre_movimiento).color} ${getTipoInfo(selectedMov.tipo_movimiento?.nombre_movimiento).border}`}>
                                    {React.createElement(getTipoInfo(selectedMov.tipo_movimiento?.nombre_movimiento).icon, { size: 22 })}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        {selectedMov.tipo_movimiento?.nombre_movimiento || 'Movimiento'}
                                    </h3>
                                    <p className="text-sm text-neutral-500 mt-0.5">
                                        {formatFecha(selectedMov.fecha_hora)}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedMov(null)}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Info General */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Producto</p>
                                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{selectedMov.producto?.nombre || 'N/A'}</p>
                                </div>
                                <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Sucursal</p>
                                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{selectedMov.comercio?.nombre || 'N/A'}</p>
                                </div>
                                <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Operador</p>
                                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                        {selectedMov.usuario ? `${selectedMov.usuario.nombre} ${selectedMov.usuario.apellido || ''}`.trim() : 'Sistema'}
                                    </p>
                                </div>
                                <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Cantidad</p>
                                    <p className={`text-lg font-black ${selectedMov.cantidad_cambio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedMov.cantidad_cambio > 0 ? '+' : ''}{selectedMov.cantidad_cambio}
                                    </p>
                                </div>
                            </div>

                            {/* Flujo de Saldo */}
                            <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-3">Flujo de Stock</p>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-neutral-400">{selectedMov.saldo_anterior}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Antes</p>
                                    </div>
                                    <ArrowRight size={24} className="text-brand-cyan" />
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-neutral-900 dark:text-white">{selectedMov.saldo_posterior}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Después</p>
                                    </div>
                                </div>
                            </div>

                            {/* Variantes (si aplica) */}
                            {selectedMov.tiene_desglose_variantes && selectedMov.variantes && selectedMov.variantes.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Layers size={16} className="text-brand-cyan" />
                                        <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">
                                            Desglose por Variante ({selectedMov.variantes.length})
                                        </span>
                                    </div>
                                    <div className="border border-neutral-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-neutral-50 dark:bg-gray-700/50 border-b border-neutral-200 dark:border-gray-600">
                                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-neutral-500">Variante</th>
                                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-neutral-500 text-center">Cantidad</th>
                                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-neutral-500 text-center">Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
                                                {selectedMov.variantes.map((v, i) => {
                                                    const attrs = v.variante?.atributos_valores;
                                                    const label = attrs ? Object.entries(attrs).map(([k, val]) => `${k}: ${val}`).join(' • ') : (v.variante?.sku_variante || `Variante ${i + 1}`);
                                                    
                                                    return (
                                                        <tr key={v.id_movimiento_var || i} className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 transition-colors">
                                                            <td className="px-3 py-2 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-tight">{label}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <span className={`text-[10px] font-black ${v.cantidad_cambio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {v.cantidad_cambio > 0 ? '+' : ''}{v.cantidad_cambio}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <div className="flex items-center justify-center gap-1 text-[9px] text-neutral-400">
                                                                    <span>{v.saldo_anterior}</span>
                                                                    <ArrowRight size={8} className="text-neutral-300" />
                                                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{v.saldo_posterior}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movimientos;
