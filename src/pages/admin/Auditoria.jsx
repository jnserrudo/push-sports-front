import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    FileText, Clock, ShieldAlert, RefreshCw, Download, 
    Plus, Edit3, Trash2, Search, Filter, Eye, ChevronLeft, ChevronRight,
    User, MapPin, X, ArrowRight, Server, Activity, Database, ChevronDown
} from 'lucide-react';
import { auditoriaService } from '../../services/auditoriaService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const parseJSON = (str) => {
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
};

const getDescripcionLegible = (item) => {
    const entidades = {
        'Producto': 'Producto',
        'ProductoVariante': 'Variante',
        'Categoria': 'Categoría',
        'Marca': 'Marca',
        'Comercio': 'Sucursal',
        'InventarioComercio': 'Inventario',
        'InventarioComercioVariante': 'Stock Variante',
        'MovimientoStock': 'Movimiento',
        'MovimientoStockVariante': 'Mov. Variante',
        'VentaCabecera': 'Venta',
        'VentaDetalle': 'Detalle Venta',
        'VentaDetalleVariante': 'Venta Variante',
        'Usuario': 'Usuario',
        'Proveedor': 'Proveedor',
        'Descuento': 'Descuento',
        'Oferta': 'Oferta',
        'Combo': 'Combo'
    };
    
    const acciones = {
        'CREATE': 'Creó',
        'UPDATE': 'Modificó',
        'DELETE': 'Eliminó'
    };
    
    const entidad = entidades[item.entidad_afectada] || item.entidad_afectada;
    const accion = acciones[item.accion] || item.accion;
    const datos = parseJSON(item.datos_nuevos) || parseJSON(item.datos_anteriores) || {};
    const nombre = datos.nombre || datos.sku || datos.codigo || '';
    
    return nombre ? `${accion} ${entidad}: "${nombre}"` : `${accion} ${entidad}`;
};

const getResumenOperacion = (item) => {
    const datos = parseJSON(item.datos_nuevos) || parseJSON(item.datos_anteriores) || {};
    const nombre = datos.nombre || datos.sku || datos.codigo || datos.titulo || 'un registro';
    
    switch (item.accion) {
        case 'CREATE':
            return `Se creó "${nombre}"`;
        case 'UPDATE':
            return `Se modificó "${nombre}"`;
        case 'DELETE':
            return `Se eliminó "${nombre}"`;
        default:
            return `Operación sobre "${nombre}"`;
    }
};

const getCambiosPreview = (item) => {
    const cambios = parseJSON(item.cambios_detectados);
    if (!cambios || Object.keys(cambios).length === 0) return null;
    
    const camposIgnorados = ['id_', 'fecha_', 'createdAt', 'updatedAt', 'usuario_creacion', 'usuario_modificacion'];
    const camposValidos = Object.entries(cambios).filter(([campo]) => 
        !camposIgnorados.some(p => campo.toLowerCase().includes(p.toLowerCase()))
    );
    
    if (camposValidos.length === 0) return null;
    
    return camposValidos.slice(0, 2).map(([campo, valores]) => {
        const antes = formatearValor(valores.antes);
        const despues = formatearValor(valores.despues);
        return `${getNombreCampoLegible(campo)}: ${antes} → ${despues}`;
    }).join(' | ');
};

const formatearValor = (valor) => {
    if (valor === null || valor === undefined) return '—';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    if (typeof valor === 'number') {
        if (valor > 1000) return `$${valor.toLocaleString()}`;
        return valor.toString();
    }
    if (typeof valor === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
            return new Date(valor).toLocaleDateString('es-AR');
        }
        if (valor.length > 20) return valor.substring(0, 17) + '...';
    }
    return String(valor);
};

const getNombreCampoLegible = (campo) => {
    const nombres = {
        'nombre': 'Nombre',
        'descripcion': 'Descripción',
        'precio': 'Precio',
        'precio_costo': 'Precio de Costo',
        'precio_base': 'Precio Base',
        'precio_publico': 'Precio Público',
        'stock': 'Stock',
        'stock_minimo': 'Stock Mínimo',
        'cantidad': 'Cantidad',
        'activo': 'Estado Activo',
        'sku': 'SKU',
        'codigo': 'Código',
        'email': 'Email',
        'telefono': 'Teléfono',
        'direccion': 'Dirección',
        'descuento': 'Descuento',
        'porcentaje': 'Porcentaje',
        'fecha_inicio': 'Fecha Inicio',
        'fecha_fin': 'Fecha Fin',
        'observaciones': 'Observaciones',
        'categoria': 'Categoría',
        'marca': 'Marca',
        'proveedor': 'Proveedor'
    };
    return nombres[campo] || campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ENTIDADES_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'Producto', label: 'Productos' },
    { value: 'ProductoVariante', label: 'Variantes' },
    { value: 'Comercio', label: 'Sucursales' },
    { value: 'Usuario', label: 'Usuarios' },
    { value: 'VentaCabecera', label: 'Ventas' },
    { value: 'InventarioComercio', label: 'Inventario' },
    { value: 'MovimientoStock', label: 'Movimientos' },
    { value: 'Categoria', label: 'Categorías' },
    { value: 'Proveedor', label: 'Proveedores' },
    { value: 'Marca', label: 'Marcas' },
];

const ACCIONES_CONFIG = {
    'CREATE': { label: 'Creó', color: 'text-green-600 bg-green-50 border-green-200', icon: Plus },
    'UPDATE': { label: 'Modificó', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Edit3 },
    'DELETE': { label: 'Eliminó', color: 'text-red-600 bg-red-50 border-red-200', icon: Trash2 },
};

const TIPOS_ENTIDAD = [
    { value: '', label: 'Todas las entidades' },
    { value: 'Producto', label: 'Productos' },
    { value: 'ProductoVariante', label: 'Variantes' },
    { value: 'Comercio', label: 'Sucursales' },
    { value: 'Usuario', label: 'Usuarios' },
    { value: 'VentaCabecera', label: 'Ventas' },
    { value: 'InventarioComercio', label: 'Inventario' },
    { value: 'MovimientoStock', label: 'Movimientos' },
    { value: 'Categoria', label: 'Categorías' },
    { value: 'Proveedor', label: 'Proveedores' },
    { value: 'Marca', label: 'Marcas' },
];

const TIPOS_ACCION = [
    { value: '', label: 'Todas las acciones', icon: Activity },
    { value: 'CREATE', label: 'Creaciones', icon: Plus, color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'UPDATE', label: 'Modificaciones', icon: Edit3, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'DELETE', label: 'Eliminaciones', icon: Trash2, color: 'text-red-600 bg-red-50 border-red-200' },
];

const Auditoria = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    
    // Estados
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filtros
    const [filtros, setFiltros] = useState({
        entidad: '',
        accion: '',
        busqueda: '',
        desde: '',
        hasta: '',
        id_entidad: ''
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtros.entidad) params.entidad = filtros.entidad;
            if (filtros.accion) params.accion = filtros.accion;
            if (filtros.busqueda) params.busqueda = filtros.busqueda;
            if (filtros.desde) params.desde = filtros.desde;
            if (filtros.hasta) params.hasta = filtros.hasta;
            if (filtros.id_entidad) params.id_entidad = filtros.id_entidad;
            if (!isSuperAdmin && sucursalId) params.comercio = sucursalId;
            
            const response = await auditoriaService.getAll(params);
            setAuditorias(response.data || []);
            setTotal(response.total || 0);
        } catch (err) {
            console.error('Error cargando auditoría:', err);
        } finally {
            setLoading(false);
        }
    }, [filtros, isSuperAdmin, sucursalId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleExport = () => {
        if (!auditorias.length) return;
        const headers = ['ID', 'Accion', 'Entidad', 'Descripcion', 'Fecha', 'Usuario', 'IP', 'Endpoint'];
        const rows = auditorias.map(t => [
            t.id_auditoria,
            t.accion || '',
            t.entidad_afectada || '',
            t.descripcion_accion || '',
            t.fecha_hora ? new Date(t.fecha_hora).toLocaleString() : '',
            t.usuario?.nombre || 'Sistema',
            t.ip_usuario || '',
            t.endpoint || ''
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_pushsport_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '—';
        return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    const getAccionIcon = (accion) => {
        const tipo = TIPOS_ACCION.find(t => t.value === accion);
        return tipo?.icon || Activity;
    };

    const getAccionColor = (accion) => {
        switch (accion) {
            case 'CREATE': return 'text-green-600 bg-green-50 border-green-200';
            case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'DELETE': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        }
    };

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-4 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={14} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">SISTEMA DE REGISTRO</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Auditoría <span className="text-brand-cyan">Plumada</span>
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium mt-2">
                        {total} registros de seguimiento • {auditorias.length} mostrados
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                            showFilters 
                                ? 'bg-brand-cyan text-black' 
                                : 'bg-neutral-100 dark:bg-gray-700 text-black dark:text-white hover:bg-neutral-200'
                        }`}
                    >
                        <Filter size={14} />
                        Filtros
                    </button>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-neutral-100 dark:bg-gray-700 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-gray-600 transition-colors px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        ACTUALIZAR
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!auditorias.length}
                        className="flex items-center gap-1.5 bg-black text-white hover:bg-brand-cyan hover:text-black dark:text-white transition-colors px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] shadow-sm disabled:opacity-40"
                    >
                        <Download size={14} /> EXPORTAR
                    </button>
                </div>
            </div>

            {/* Filtros */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Entidad</label>
                            <select
                                value={filtros.entidad}
                                onChange={(e) => setFiltros({...filtros, entidad: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium"
                            >
                                {TIPOS_ENTIDAD.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Acción</label>
                            <select
                                value={filtros.accion}
                                onChange={(e) => setFiltros({...filtros, accion: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium"
                            >
                                {TIPOS_ACCION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Desde</label>
                            <input
                                type="date"
                                value={filtros.desde}
                                onChange={(e) => setFiltros({...filtros, desde: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Hasta</label>
                            <input
                                type="date"
                                value={filtros.hasta}
                                onChange={(e) => setFiltros({...filtros, hasta: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Buscar en descripción..."
                                value={filtros.busqueda}
                                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFiltros({ entidad: '', accion: '', busqueda: '', desde: '', hasta: '', id_entidad: '' });
                            }}
                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de Auditoría */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Sincronizando registros...</p>
                </div>
            ) : auditorias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Database size={48} className="text-neutral-300 mb-4" />
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Sin registros</p>
                    <p className="text-xs text-neutral-400 mt-1">No hay auditorías que coincidan con los filtros</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {auditorias.map((item) => {
                        const AccionIcon = getAccionIcon(item.accion);
                        const cambios = parseJSON(item.cambios_detectados);
                        const datosNuevos = parseJSON(item.datos_nuevos);
                        const datosAnteriores = parseJSON(item.datos_anteriores);
                        
                        return (
                            <div
                                key={item.id_auditoria}
                                className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icono de Acción */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${getAccionColor(item.accion)}`}>
                                        <AccionIcon size={20} />
                                    </div>
                                    
                                    {/* Contenido Principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getAccionColor(item.accion)}`}>
                                                {item.accion}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                                {item.entidad_afectada}
                                            </span>
                                            <span className="text-neutral-300">•</span>
                                            <span className="text-[10px] text-neutral-400 font-medium">
                                                #{String(item.id_auditoria).split('-')[0]}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                                            {item.descripcion_accion || `${item.accion} en ${item.entidad_afectada}`}
                                        </p>
                                        
                                        {/* Detalles de cambios si hay */}
                                        {cambios && Object.keys(cambios).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {Object.entries(cambios).slice(0, 3).map(([campo, valores]) => (
                                                    <span 
                                                        key={campo}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-gray-700 rounded text-[10px] text-neutral-600 dark:text-neutral-300"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                                                        {campo}: {JSON.stringify(valores.antes).substring(0, 15)} 
                                                        <ArrowRight size={10} className="text-brand-cyan" /> 
                                                        {JSON.stringify(valores.despues).substring(0, 15)}
                                                    </span>
                                                ))}
                                                {Object.keys(cambios).length > 3 && (
                                                    <span className="text-[10px] text-neutral-400">
                                                        +{Object.keys(cambios).length - 3} más
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Metadatos */}
                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-neutral-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} />
                                                <span className="font-medium">{item.usuario?.nombre || 'Sistema'} {item.usuario?.apellido || ''}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                <span>{formatFecha(item.fecha_hora)}</span>
                                            </div>
                                            {item.ip_usuario && (
                                                <div className="flex items-center gap-1.5">
                                                    <Server size={12} />
                                                    <span>{item.ip_usuario}</span>
                                                </div>
                                            )}
                                            {item.id_comercio && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={12} />
                                                    <span>Sede: {item.id_comercio?.slice(0, 8)}...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Botón Ver Detalle */}
                                    <button className="flex-shrink-0 p-2 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <Eye size={18} className="text-neutral-400" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Detalle - Versión Amigable */}
            {selectedItem && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getAccionColor(selectedItem.accion)}`}>
                                    {React.createElement(getAccionIcon(selectedItem.accion), { size: 22 })}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white">
                                        {selectedItem.descripcion_accion || getDescripcionLegible(selectedItem)}
                                    </h3>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        {formatFecha(selectedItem.fecha_hora)} por {selectedItem.usuario?.nombre || 'Sistema'} {selectedItem.usuario?.apellido || ''}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Resumen de la operación */}
                            <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={18} className="text-brand-cyan" />
                                    <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">Resumen de la Operación</span>
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                    {getResumenOperacion(selectedItem)}
                                </p>
                            </div>

                            {/* Cambios realizados */}
                            {selectedItem.cambios_detectados && parseJSON(selectedItem.cambios_detectados) && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <GitCompare size={18} className="text-brand-cyan" />
                                        <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">Cambios Realizados</span>
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(parseJSON(selectedItem.cambios_detectados))
                                            .filter(([campo]) => !['id_', 'fecha_', 'createdAt', 'updatedAt'].some(p => campo.toLowerCase().includes(p)))
                                            .slice(0, 5)
                                            .map(([campo, valores]) => (
                                            <div key={campo} className="flex items-center gap-3 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg p-3">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{getNombreCampoLegible(campo)}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-red-600 dark:text-red-400 line-through">
                                                            {formatearValor(valores.antes)}
                                                        </span>
                                                        <ArrowRight size={14} className="text-neutral-400" />
                                                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                            {formatearValor(valores.despues)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Información del sistema - Solo para debug, colapsada */}
                            <details className="bg-neutral-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                <summary className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                                    <Server size={12} />
                                    Datos Técnicos (Solo para soporte)
                                </summary>
                                <div className="p-4 space-y-2 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-gray-700">
                                    {selectedItem.id_entidad_afectada && (
                                        <p><span className="text-neutral-500">ID Registro:</span> {selectedItem.id_entidad_afectada}</p>
                                    )}
                                    {selectedItem.endpoint && (
                                        <p><span className="text-neutral-500">Endpoint:</span> {selectedItem.endpoint}</p>
                                    )}
                                    {selectedItem.ip_usuario && (
                                        <p><span className="text-neutral-500">IP:</span> {selectedItem.ip_usuario}</p>
                                    )}
                                    <p><span className="text-neutral-500">ID Auditoría:</span> {selectedItem.id_auditoria}</p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Auditoria;