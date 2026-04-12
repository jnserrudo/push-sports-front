import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    FileText, Clock, ShieldAlert, RefreshCw, Download, 
    Plus, Edit3, Trash2, Search, Filter, Eye, ChevronLeft, ChevronRight,
    User, MapPin, X, ArrowRight, Server, Activity, Database, ChevronDown,
    Calendar, Building2, AlertTriangle
} from 'lucide-react';
import { auditoriaService } from '../../services/auditoriaService';
import { sucursalesService } from '../../services/sucursalesService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ═══════════════════════════════════════════════════════════
// DICCIONARIOS DE TRADUCCIÓN
// ═══════════════════════════════════════════════════════════

const ENTIDADES_LEGIBLES = {
    'Producto': 'Producto',
    'ProductoVariante': 'Variante de Producto',
    'Categoria': 'Categoría',
    'Marca': 'Marca',
    'Comercio': 'Sucursal',
    'TipoComercio': 'Tipo de Sucursal',
    'InventarioComercio': 'Inventario de Sucursal',
    'InventarioComercioVariante': 'Stock de Variante',
    'MovimientoStock': 'Movimiento de Stock',
    'MovimientoStockVariante': 'Movimiento de Variante',
    'VentaCabecera': 'Venta',
    'VentaDetalle': 'Detalle de Venta',
    'VentaDetalleVariante': 'Venta con Variante',
    'Usuario': 'Usuario',
    'Proveedor': 'Proveedor',
    'Descuento': 'Código de Descuento',
    'Oferta': 'Oferta',
    'Combo': 'Combo',
    'Devolucion': 'Devolución',
    'Liquidacion': 'Liquidación'
};

const ACCIONES_LEGIBLES = {
    'CREATE': 'Creación',
    'UPDATE': 'Modificación',
    'DELETE': 'Eliminación'
};

const ACCIONES_VERBO = {
    'CREATE': 'Creó',
    'UPDATE': 'Modificó',
    'DELETE': 'Eliminó'
};

const CAMPOS_LEGIBLES = {
    'nombre': 'Nombre',
    'descripcion': 'Descripción',
    'precio': 'Precio',
    'precio_costo': 'Precio de Costo',
    'precio_base': 'Precio Base',
    'precio_publico': 'Precio Público',
    'precio_venta_sugerido': 'Precio de Venta',
    'precio_pushsport': 'Precio Push Sport',
    'costo_compra': 'Costo de Compra',
    'precio_variante': 'Precio Variante',
    'stock': 'Stock',
    'stock_central': 'Stock Central',
    'stock_minimo': 'Stock Mínimo',
    'stock_minimo_alerta': 'Stock Mínimo Alerta',
    'cantidad': 'Cantidad',
    'cantidad_actual': 'Cantidad Actual',
    'cantidad_cambio': 'Cantidad Modificada',
    'activo': 'Estado Activo',
    'sku': 'SKU',
    'sku_variante': 'SKU Variante',
    'codigo': 'Código',
    'email': 'Email',
    'telefono': 'Teléfono',
    'direccion': 'Dirección',
    'descuento': 'Descuento',
    'porcentaje': 'Porcentaje',
    'valor_descuento': 'Valor del Descuento',
    'descuento_porcentaje': 'Porcentaje de Descuento',
    'comision_pactada_porcentaje': 'Comisión Pactada (%)',
    'fecha_inicio': 'Fecha Inicio',
    'fecha_fin': 'Fecha Fin',
    'observaciones': 'Observaciones',
    'observacion': 'Observación',
    'categoria': 'Categoría',
    'marca': 'Marca',
    'proveedor': 'Proveedor',
    'nombre_proveedor': 'Nombre del Proveedor',
    'nombre_marca': 'Nombre de la Marca',
    'nombre_rol': 'Nombre del Rol',
    'razon_social': 'Razón Social',
    'cuit': 'CUIT',
    'metodo_pago': 'Método de Pago',
    'total_venta': 'Total de Venta',
    'monto_reembolso': 'Monto de Reembolso',
    'motivo': 'Motivo',
    'estado': 'Estado',
    'imagen_url': 'Imagen',
    'atributos': 'Atributos',
    'atributos_valores': 'Valores de Atributos',
    'usa_variantes': 'Usa Variantes',
    'usa_desglose_variantes': 'Usa Desglose por Variante',
    'tiene_desglose_variantes': 'Tiene Desglose de Variantes',
    'tiene_variantes': 'Tiene Variantes',
    'saldo_anterior': 'Saldo Anterior',
    'saldo_posterior': 'Saldo Posterior',
    'saldo_acumulado_mili': 'Saldo Acumulado',
    'usos_actuales': 'Usos Actuales',
    'usos_maximos': 'Usos Máximos',
    'tipo_descuento': 'Tipo de Descuento',
    'total_ventas_netas': 'Total Ventas Netas',
    'monto_recibido': 'Monto Recibido',
    'diferencia': 'Diferencia',
    'latitud': 'Latitud',
    'longitud': 'Longitud',
    'password_hash': 'Contraseña',
    'username': 'Nombre de Usuario',
    'apellido': 'Apellido',
    'id_rol': 'Rol',
    'id_tipo_comercio': 'Tipo de Sede',
    'id_categoria': 'Categoría',
    'id_marca': 'Marca',
    'id_proveedor': 'Proveedor',
    'id_comercio_asignado': 'Sucursal Asignada',
    'id_comercio': 'Sucursal',
    'id_producto': 'Producto',
    'id_variante': 'Variante',
    'id_venta': 'Venta',
    'id_usuario': 'Usuario',
    'id_tipo_movimiento': 'Tipo de Movimiento',
    'id_inventario': 'Inventario',
    'id_movimiento_var': 'ID Mov. Variante',
    'id_movimiento': 'ID Movimiento',
    'id_inventario_var': 'ID Stock Variante',
    'requiere_migracion': 'Requiere Migración',
    'factor_multiplicador': 'Factor Multiplicador',
    'nombre_movimiento': 'Tipo de Movimiento',
    'leido': 'Leído',
    'titulo': 'Título',
    'mensaje': 'Mensaje',
    'tipo': 'Tipo',
    'fecha_envio': 'Fecha de Envío',
    'fecha_creacion': 'Fecha de Creación',
    'fecha_actualizacion': 'Fecha de Actualización',
    'fecha_hora': 'Fecha y Hora',
    'fecha_cierre': 'Fecha de Cierre',
    'precio_unitario_cobrado': 'Precio Unitario Cobrado',
    'precio_pushsport_historico': 'Precio Push Sport Histórico',
    'costo_unitario_historico': 'Costo Unitario Histórico',
    'precio_unitario': 'Precio Unitario',
    'precio_combo': 'Precio del Combo',
    'color': 'Color',
    'talle': 'Talle',
    'dimensiones': 'Dimensiones',
    'talla': 'Talle',
    'sucursal': 'Sucursal',
    'comercio': 'Sucursal',
    'vendedor': 'Vendedor',
    'cliente': 'Cliente',
    'nombre_cliente': 'Nombre del Cliente',
    'dni_cliente': 'DNI del Cliente',
    'monto': 'Monto',
    'valor': 'Valor',
    'monto_total': 'Monto Total',
    'subtotal': 'Subtotal',
    'iva': 'IVA',
    'recargo': 'Recargo',
    'stock_disponible': 'Stock Disponible'
};

// Campos que NO se deben mostrar en el detalle de cambios (IDs internos, timestamps, etc.)
const CAMPOS_OCULTOS = [
    'id_auditoria', 'id_producto', 'id_variante', 'id_comercio', 'id_usuario',
    'id_venta', 'id_detalle', 'id_detalle_var', 'id_inventario', 'id_inventario_var',
    'id_movimiento', 'id_movimiento_var', 'id_proveedor', 'id_descuento', 'id_oferta',
    'id_combo', 'id_devolucion', 'id_liquidacion', 'id_tipo_comercio', 'id_categoria',
    'id_marca', 'id_rol', 'id_tipo_movimiento', 'id_comercio_asignado', 'id_notificacion',
    'createdAt', 'updatedAt', 'password_hash', 'deletedAt', 'reset_token', 'reset_token_expires',
    'token', 'refresh_token', '__v', 'id', 'uuid', 'id_migracion'
];

const parseJSON = (str) => {
    if (!str) return null;
    if (typeof str === 'object') return str;
    try {
        let parsed = JSON.parse(str);
        // Manejar JSON doblemente stringificado (común en algunas migraciones)
        if (typeof parsed === 'string') {
            try { return JSON.parse(parsed); } catch { return parsed; }
        }
        return parsed;
    } catch {
        return null;
    }
};

const getNombreCampoLegible = (campo) => {
    return CAMPOS_LEGIBLES[campo] || campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatearValor = (valor, campo = '', sucursalesMap = {}) => {
    if (valor === null || valor === undefined) return '—';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    
    // Mapeo especial para Sucursales
    if ((campo === 'id_comercio' || campo === 'id_comercio_asignado') && sucursalesMap[valor]) {
        return sucursalesMap[valor];
    }
    
    // Si el nombre del campo sugiere dinero, formatear como moneda
    const esMoneda = campo.toLowerCase().includes('precio') || 
                     campo.toLowerCase().includes('costo') || 
                     campo.toLowerCase().includes('monto') ||
                     campo.toLowerCase().includes('valor') ||
                     campo.toLowerCase().includes('saldo') ||
                     campo.toLowerCase().includes('total');

    if (typeof valor === 'number') {
        if (esMoneda) return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        return valor.toLocaleString('es-AR');
    }
    if (typeof valor === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
            try {
                return format(new Date(valor), 'dd/MM/yyyy HH:mm', { locale: es });
            } catch { return valor; }
        }
        if (valor === 'true') return 'Sí';
        if (valor === 'false') return 'No';
        if (valor.length > 40) return valor.substring(0, 37) + '...';
    }
    if (typeof valor === 'object') {
        try {
            const str = JSON.stringify(valor);
            if (str.length > 40) return str.substring(0, 37) + '...';
            return str;
        } catch { return '—'; }
    }
    return String(valor);
};

const getDescripcionLegible = (item) => {
    const entidad = ENTIDADES_LEGIBLES[item.entidad_afectada] || item.entidad_afectada;
    const verbo = ACCIONES_VERBO[item.accion] || item.accion;
    const datos = parseJSON(item.datos_nuevos) || parseJSON(item.datos_anteriores) || {};
    const nombre = datos.nombre || datos.sku || datos.codigo || datos.titulo || datos.nombre_marca || datos.nombre_proveedor || '';
    
    return nombre ? `${verbo} ${entidad}: "${nombre}"` : `${verbo} ${entidad}`;
};

const ITEMS_PER_PAGE = 25;

const TIPOS_ENTIDAD = [
    { value: '', label: 'Todas las entidades' },
    { value: 'Producto', label: 'Productos' },
    { value: 'ProductoVariante', label: 'Variantes' },
    { value: 'Comercio', label: 'Sucursales' },
    { value: 'Usuario', label: 'Usuarios' },
    { value: 'VentaCabecera', label: 'Ventas' },
    { value: 'InventarioComercio', label: 'Inventario' },
    { value: 'MovimientoStock', label: 'Movimientos de Stock' },
    { value: 'Categoria', label: 'Categorías' },
    { value: 'Proveedor', label: 'Proveedores' },
    { value: 'Marca', label: 'Marcas' },
    { value: 'Descuento', label: 'Descuentos' },
    { value: 'Oferta', label: 'Ofertas' },
    { value: 'Combo', label: 'Combos' },
    { value: 'Devolucion', label: 'Devoluciones' },
    { value: 'Liquidacion', label: 'Liquidaciones' },
];

const TIPOS_ACCION = [
    { value: '', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Creaciones' },
    { value: 'UPDATE', label: 'Modificaciones' },
    { value: 'DELETE', label: 'Eliminaciones' },
];

const Auditoria = () => {
    const { user, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    
    // Estados
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sucursalesMap, setSucursalesMap] = useState({});
    
    // Cargar nombres de sucursales para mapear IDs
    useEffect(() => {
        sucursalesService.getAll().then(sucs => {
            const map = {};
            sucs.forEach(s => map[s.id_comercio] = s.nombre);
            setSucursalesMap(map);
        }).catch(() => {});
    }, []);
    
    // Filtros
    const [filtros, setFiltros] = useState({
        entidad: '',
        accion: '',
        busqueda: '',
        desde: '',
        hasta: '',
    });

    // Filtros aplicados (solo se envían al hacer click en buscar o al paginar)
    const [filtrosAplicados, setFiltrosAplicados] = useState({});

    const loadData = useCallback(async (pageOverride = null) => {
        setLoading(true);
        try {
            const currentPage = pageOverride !== null ? pageOverride : page;
            const params = {
                limit: ITEMS_PER_PAGE,
                offset: currentPage * ITEMS_PER_PAGE,
                ...filtrosAplicados
            };

            if (!isSuperAdmin && sucursalId) params.comercio = sucursalId;
            
            const response = await auditoriaService.getAll(params);
            setAuditorias(response.data || []);
            setTotal(response.total || 0);
        } catch (err) {
            console.error('Error cargando auditoría:', err);
        } finally {
            setLoading(false);
        }
    }, [filtrosAplicados, page, isSuperAdmin, sucursalId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const aplicarFiltros = () => {
        const nuevos = {};
        if (filtros.entidad) nuevos.entidad = filtros.entidad;
        if (filtros.accion) nuevos.accion = filtros.accion;
        if (filtros.busqueda) nuevos.busqueda = filtros.busqueda;
        if (filtros.desde) nuevos.desde = filtros.desde;
        if (filtros.hasta) nuevos.hasta = filtros.hasta;
        setFiltrosAplicados(nuevos);
        setPage(0);
    };

    const limpiarFiltros = () => {
        setFiltros({ entidad: '', accion: '', busqueda: '', desde: '', hasta: '' });
        setFiltrosAplicados({});
        setPage(0);
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleExport = () => {
        if (!auditorias.length) return;
        const headers = ['Fecha', 'Acción', 'Entidad', 'Descripción', 'Usuario', 'IP'];
        const rows = auditorias.map(t => [
            t.fecha_hora ? format(new Date(t.fecha_hora), 'dd/MM/yyyy HH:mm', { locale: es }) : '',
            ACCIONES_LEGIBLES[t.accion] || t.accion,
            ENTIDADES_LEGIBLES[t.entidad_afectada] || t.entidad_afectada,
            t.descripcion_accion || getDescripcionLegible(t),
            t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido || ''}`.trim() : 'Sistema',
            t.ip_usuario || ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
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

    const getAccionBadge = (accion) => {
        switch (accion) {
            case 'CREATE': return { label: 'Creación', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', icon: Plus };
            case 'UPDATE': return { label: 'Modificación', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: Edit3 };
            case 'DELETE': return { label: 'Eliminación', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: Trash2 };
            default: return { label: accion, bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200', icon: Activity };
        }
    };

    // Obtener los cambios filtrados (sin IDs internos ni timestamps)
    const getCambiosFiltrados = (item) => {
        let cambios = parseJSON(item.cambios_detectados);
        
        // Si no hay cambios_detectados (ej: creaciones viejas o borrados), 
        // intentar reconstruir de datos_nuevos/anteriores o valor_nuevo/anterior (legacy)
        if (!cambios) {
            const nuevos = parseJSON(item.datos_nuevos) || parseJSON(item.valor_nuevo) || {};
            const anteriores = parseJSON(item.datos_anteriores) || parseJSON(item.valor_anterior) || {};
            
            if (item.accion === 'CREATE') {
                cambios = {};
                Object.entries(nuevos).forEach(([k, v]) => {
                    cambios[k] = { antes: null, despues: v };
                });
            } else if (item.accion === 'DELETE') {
                cambios = {};
                Object.entries(anteriores).forEach(([k, v]) => {
                    cambios[k] = { antes: v, despues: null };
                });
            } else {
                return [];
            }
        }

        return Object.entries(cambios)
            .filter(([campo, valores]) => {
                // Si el campo tiene una traducción explícita, LO MOSTRAMOS (aunque sea un ID)
                if (CAMPOS_LEGIBLES[campo]) return true;

                // Filtro de campos técnicos que NO queremos ver nunca
                const esTecnico = CAMPOS_OCULTOS.some(oculto => campo === oculto);
                if (esTecnico) return false;

                // Ocultar IDs que no tienen traducción (probablemente IDs internos irrelevantes)
                if (campo.startsWith('id_')) return false;
                
                // Si es un update, ocultar si el valor no cambió realmente (redundancia)
                if (item.accion === 'UPDATE' && valores.antes === valores.despues) {
                    return false;
                }
                
                return true;
            });
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
                        {total.toLocaleString('es-AR')} registros totales
                        {Object.keys(filtrosAplicados).length > 0 && (
                            <span className="ml-2 text-brand-cyan font-bold">• Filtros activos</span>
                        )}
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
                        {Object.keys(filtrosAplicados).length > 0 && (
                            <span className="ml-1 w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px]">
                                {Object.keys(filtrosAplicados).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => loadData()}
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

            {/* Filtros Expandibles */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Entidad</label>
                            <select
                                value={filtros.entidad}
                                onChange={(e) => setFiltros({...filtros, entidad: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                            >
                                {TIPOS_ENTIDAD.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Tipo de Acción</label>
                            <select
                                value={filtros.accion}
                                onChange={(e) => setFiltros({...filtros, accion: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                            >
                                {TIPOS_ACCION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha Desde</label>
                            <input
                                type="date"
                                value={filtros.desde}
                                onChange={(e) => setFiltros({...filtros, desde: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Fecha Hasta</label>
                            <input
                                type="date"
                                value={filtros.hasta}
                                onChange={(e) => setFiltros({...filtros, hasta: e.target.value})}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                            />
                        </div>
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
                    {/* Búsqueda por texto */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar en descripción de acciones..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs font-medium text-black dark:text-white"
                        />
                    </div>
                </div>
            )}

            {/* Tabla de Auditoría */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Sincronizando registros...</p>
                </div>
            ) : auditorias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Database size={48} className="text-neutral-300 mb-4" />
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Sin registros</p>
                    <p className="text-xs text-neutral-400 mt-1">No hay auditorías que coincidan con los filtros aplicados</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-gray-700/50 border-b border-neutral-200 dark:border-gray-600">
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500">Fecha</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500">Acción</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500">Entidad</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500">Descripción</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500">Usuario</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500 text-center">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
                                {auditorias.map((item) => {
                                    const badge = getAccionBadge(item.accion);
                                    const BadgeIcon = badge.icon;
                                    const cambios = getCambiosFiltrados(item);
                                    
                                    return (
                                        <tr
                                            key={item.id_auditoria}
                                            className="hover:bg-neutral-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            {/* Fecha */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-neutral-400 flex-shrink-0" />
                                                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                                        {formatFecha(item.fecha_hora)}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Acción */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
                                                    <BadgeIcon size={12} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            {/* Entidad */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                    {ENTIDADES_LEGIBLES[item.entidad_afectada] || item.entidad_afectada}
                                                </span>
                                            </td>
                                            {/* Descripción */}
                                            <td className="px-4 py-3 max-w-[300px]">
                                                <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                                                    {item.descripcion_accion || getDescripcionLegible(item)}
                                                </p>
                                                {cambios.length > 0 && (
                                                    <span className="text-[10px] text-brand-cyan font-medium">
                                                        {cambios.length} campo{cambios.length !== 1 ? 's' : ''} modificado{cambios.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </td>
                                            {/* Usuario */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={12} className="text-neutral-400 flex-shrink-0" />
                                                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                                        {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido || ''}`.trim() : 'Sistema'}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Ver Detalle */}
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-600 rounded-lg transition-colors mx-auto"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                >
                                                    <Eye size={16} className="text-neutral-400 hover:text-brand-cyan transition-colors" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-neutral-50/50 dark:bg-gray-700/30 border-t border-neutral-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                {((page * ITEMS_PER_PAGE) + 1).toLocaleString('es-AR')}–{Math.min((page + 1) * ITEMS_PER_PAGE, total).toLocaleString('es-AR')} de {total.toLocaleString('es-AR')}
                            </span>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                                    disabled={page === 0}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 text-neutral-500 hover:border-brand-cyan hover:text-brand-cyan disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 min-w-[60px] text-center">
                                    {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                                    disabled={page >= totalPages - 1}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-black text-white hover:bg-brand-cyan hover:text-black disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Detalle */}
            {selectedItem && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del Modal */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getAccionBadge(selectedItem.accion).bg} ${getAccionBadge(selectedItem.accion).text} ${getAccionBadge(selectedItem.accion).border}`}>
                                    {React.createElement(getAccionBadge(selectedItem.accion).icon, { size: 22 })}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        {getAccionBadge(selectedItem.accion).label} de {ENTIDADES_LEGIBLES[selectedItem.entidad_afectada] || selectedItem.entidad_afectada}
                                    </h3>
                                    <p className="text-sm text-neutral-500 mt-0.5">
                                        {formatFecha(selectedItem.fecha_hora)} — {selectedItem.usuario ? `${selectedItem.usuario.nombre} ${selectedItem.usuario.apellido || ''}`.trim() : 'Sistema'}
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
                            {/* Resumen */}
                            <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={16} className="text-brand-cyan" />
                                    <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">Resumen</span>
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                                    {selectedItem.descripcion_accion || getDescripcionLegible(selectedItem)}
                                </p>
                            </div>

                            {/* Tabla de Cambios */}
                            {(() => {
                                const cambios = getCambiosFiltrados(selectedItem);
                                if (cambios.length === 0) return (
                                    <div className="text-center py-6 border-2 border-dashed border-neutral-100 rounded-xl">
                                        <p className="text-xs text-neutral-400 font-medium">No hay cambios significativos registrados en los datos.</p>
                                    </div>
                                );
                                
                                const esCreacion = selectedItem.accion === 'CREATE';
                                const esEliminacion = selectedItem.accion === 'DELETE';
                                
                                return (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Edit3 size={16} className="text-brand-cyan" />
                                                <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">
                                                    {esCreacion ? 'Datos Ingresados' : esEliminacion ? 'Datos Eliminados' : 'Cambios Realizados'} ({cambios.length})
                                                </span>
                                            </div>
                                            {!esCreacion && !esEliminacion && (
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-0.5 rounded">MODIFICACIÓN</span>
                                            )}
                                        </div>
                                        <div className="border border-neutral-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-neutral-50 dark:bg-gray-700/50 border-b border-neutral-200 dark:border-gray-600">
                                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-500 w-[35%]">Campo</th>
                                                        {(!esCreacion && !esEliminacion) && (
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Valor Anterior</th>
                                                        )}
                                                        <th className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider ${esEliminacion ? 'text-red-500' : 'text-brand-cyan'}`}>
                                                            {esCreacion ? 'Valor Inicial' : esEliminacion ? 'Valor al Eliminar' : 'Valor Nuevo'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
                                                    {cambios.map(([campo, valores]) => (
                                                        <tr key={campo} className="hover:bg-neutral-50 dark:hover:bg-gray-700/30 transition-colors">
                                                            <td className="px-4 py-3 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                                                                {getNombreCampoLegible(campo)}
                                                            </td>
                                                            {(!esCreacion && !esEliminacion) && (
                                                                <td className="px-4 py-3 text-xs text-neutral-400 line-through decoration-red-300">
                                                                    {formatearValor(valores.antes, campo, sucursalesMap)}
                                                                </td>
                                                            )}
                                                            <td className={`px-4 py-3 text-xs font-medium ${esEliminacion ? 'text-red-500' : 'text-neutral-800 dark:text-neutral-100'}`}>
                                                                {formatearValor(esEliminacion ? valores.antes : valores.despues, campo, sucursalesMap)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Datos Técnicos (Colapsado) */}
                            <details className="bg-neutral-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                <summary className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                                    <Server size={12} />
                                    Información Técnica
                                    <ChevronDown size={14} className="ml-auto" />
                                </summary>
                                <div className="p-4 space-y-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-gray-700">
                                    {selectedItem.id_entidad_afectada && (
                                        <p><span className="text-neutral-500 font-bold">ID Registro:</span> {selectedItem.id_entidad_afectada}</p>
                                    )}
                                    {selectedItem.endpoint && (
                                        <p><span className="text-neutral-500 font-bold">Endpoint:</span> {selectedItem.endpoint}</p>
                                    )}
                                    {selectedItem.metodo_http && (
                                        <p><span className="text-neutral-500 font-bold">Método:</span> {selectedItem.metodo_http}</p>
                                    )}
                                    {selectedItem.ip_usuario && (
                                        <p><span className="text-neutral-500 font-bold">IP:</span> {selectedItem.ip_usuario}</p>
                                    )}
                                    <p><span className="text-neutral-500 font-bold">ID Auditoría:</span> {selectedItem.id_auditoria}</p>
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