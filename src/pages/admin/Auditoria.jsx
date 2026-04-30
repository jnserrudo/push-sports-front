import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    FileText, Clock, ShieldAlert, RefreshCw, Download, 
    Plus, Edit3, Trash2, Search, Filter, Eye, ChevronLeft, ChevronRight,
    User, MapPin, X, ArrowRight, Server, Activity, Database, ChevronDown,
    Calendar, Building2, AlertTriangle
} from 'lucide-react';
import { auditoriaService } from '../../services/auditoriaService';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';
import { 
    usuariosService, marcasService, categoriasService, 
    descuentosService, combosService, ofertasService 
} from '../../services/genericServices';
import { eventosService } from '../../services/eventosService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PremiumSelect from '../../components/ui/PremiumSelect';
import DataTable from '../../components/ui/DataTable';

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
    'Liquidacion': 'Liquidación',
    'Evento': 'Evento / Campaña'
};

const ACCIONES_LEGIBLES = {
    'CREATE': 'Creación',
    'UPDATE': 'Modificación',
    'DELETE': 'Eliminación',
    'createMany': 'Creación Masiva',
    'updateMany': 'Modificación Masiva',
    'deleteMany': 'Eliminación Masiva',
    'CREATEMANY': 'Creación Masiva',
    'UPDATEMANY': 'Modificación Masiva',
    'DELETEMANY': 'Eliminación Masiva'
};

const ACCIONES_VERBO = {
    'CREATE': 'Creó',
    'UPDATE': 'Modificó',
    'DELETE': 'Eliminó',
    'createMany': 'Creó (Masivo)',
    'updateMany': 'Modificó (Masivo)',
    'deleteMany': 'Eliminó (Masivo)',
    'CREATEMANY': 'Creó (Masivo)',
    'UPDATEMANY': 'Modificó (Masivo)',
    'DELETEMANY': 'Eliminó (Masivo)'
};

const CAMPOS_LEGIBLES = {
    'count': 'Cantidad de Registros Afectados',
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
    'id_comercio': 'Sucursal',
    'id_comercio_asignado': 'Sucursal Asignada',
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
    'stock_disponible': 'Stock Disponible',
    'id_producto': 'Producto',
    'id_variante': 'Variante',
    'id_usuario': 'Usuario',
    'id_venta': 'Referencia de Venta',
    'id_movimiento': 'Referencia de Movimiento',
    // Campos de Evento/Campaña
    'recompensa_texto': 'Mensaje de Recompensa',
    'id_evento_origen': 'Evento de Origen',
    'acepta_marketing': 'Acepta Marketing',
    'leads': 'Leads Capturados'
};

const CAMPOS_CONTEXTO = [
    'nombre', 'sku', 'codigo', 'titulo', 'nombre_cliente', 
    'nombre_marca', 'nombre_proveedor', 'nombre_rol',
    'username', 'apellido', 'talle', 'color', 'sucursal', 'comercio',
    'id_comercio', 'id_comercio_asignado', 'id_venta', 'nro_ticket',
    'id_producto', 'id_variante', 'id_usuario', 'id_proveedor',
    'id_categoria', 'id_marca', 'id_descuento', 'id_combo', 'id_oferta',
    'id_evento_origen', 'recompensa_texto'
];

// Campos que NO se deben mostrar en el detalle de cambios (SÓLO IDs REALMENTE TÉCNICOS o sensibles)
const CAMPOS_OCULTOS = [
    'id_auditoria', 'id_detalle', 'id_detalle_var', 'id_inventario', 'id_inventario_var',
    'id_movimiento_var', 'id_notificacion', 'id_migracion', 'id_rol', 'id_tipo_comercio', 
    'id_tipo_movimiento', 'createdAt', 'updatedAt', 'password_hash', 'deletedAt', 
    'reset_token', 'reset_token_expires', 'token', 'refresh_token', '__v', 'id', 'uuid',
    'otp_code', 'otp_expira_en'
];


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
    { value: 'Evento', label: 'Eventos / Campañas' },
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
    const [productosMap, setProductosMap] = useState({});
    const [usuariosMap, setUsuariosMap] = useState({});
    const [marcasMap, setMarcasMap] = useState({});
    const [categoriasMap, setCategoriasMap] = useState({});
    const [proveedoresMap, setProveedoresMap] = useState({});
    const [descuentosMap, setDescuentosMap] = useState({});
    const [ofertasMap, setOfertasMap] = useState({});
    const [combosMap, setCombosMap] = useState({});
    const [tiposMovimientoMap, setTiposMovimientoMap] = useState({});
    const [variantesMap, setVariantesMap] = useState({});
    const [eventosMap, setEventosMap] = useState({});
    
    
    // Cargar catálogos para mapear IDs
    const cargarCatalogos = async () => {
        try {
            const [
                sucData, prodData, userData, marcaData, catData, 
                provData, descData, oferData, combData, eventData
            ] = await Promise.allSettled([
                sucursalesService.getAll(),
                productosService.getAll(),
                usuariosService.getAll(),
                marcasService.getAll(),
                categoriasService.getAll(),
                productosService.getProveedores(),
                descuentosService.getAll(),
                ofertasService.getAll(),
                combosService.getAll(),
                eventosService.getAll()
            ]);
            
            // Mapear Sucursales
            if (sucData.status === 'fulfilled') {
                const sMap = {};
                sucData.value.forEach(s => sMap[s.id_comercio] = s.nombre);
                setSucursalesMap(sMap);
            }

            // Mapear Productos + Variantes (las variantes vienen incluidas en la respuesta de productos)
            if (prodData.status === 'fulfilled') {
                const pMap = {};
                const vMap = {};
                prodData.value.forEach(p => {
                    const idProd = p.id_producto?.toLowerCase();
                    if (idProd) pMap[idProd] = p.nombre;
                    // Extraer variantes del producto
                    if (p.variantes && Array.isArray(p.variantes)) {
                        p.variantes.forEach(v => {
                            let attrs = v.atributos_valores || {};
                            if (typeof attrs === 'string') {
                                try { attrs = JSON.parse(attrs); } catch (e) { attrs = {}; }
                            }
                            const partes = Object.values(attrs).filter(Boolean);
                            const nombreVariante = partes.length > 0 
                                ? `${p.nombre} — ${partes.join(' / ')}` 
                                : v.sku_variante 
                                    ? `${p.nombre} — SKU: ${v.sku_variante}`
                                    : p.nombre;
                            const idVar = v.id_variante?.toLowerCase();
                            if (idVar) vMap[idVar] = nombreVariante;
                        });
                    }
                });
                setProductosMap(pMap);
                setVariantesMap(vMap);
            }

            // Mapear Usuarios
            if (userData.status === 'fulfilled') {
                const uMap = {};
                userData.value.forEach(u => uMap[u.id_usuario] = `${u.nombre} ${u.apellido || ''}`.trim());
                setUsuariosMap(uMap);
            }

            // Mapear Marcas (Corregido campo nombre_marca)
            if (marcaData.status === 'fulfilled') {
                const mMap = {};
                marcaData.value.forEach(m => mMap[m.id_marca] = m.nombre_marca || m.nombre);
                setMarcasMap(mMap);
            }

            // Mapear Categorías
            if (catData.status === 'fulfilled') {
                const cMap = {};
                catData.value.forEach(c => cMap[c.id_categoria] = c.nombre);
                setCategoriasMap(cMap);
            }

            // Mapear Proveedores
            if (provData.status === 'fulfilled') {
                const provMap = {};
                provData.value.forEach(p => provMap[p.id_proveedor] = p.nombre_proveedor);
                setProveedoresMap(provMap);
            }

            // Mapear Descuentos
            if (descData.status === 'fulfilled') {
                const dMap = {};
                descData.value.forEach(d => dMap[d.id_descuento] = d.codigo);
                setDescuentosMap(dMap);
            }

            // Mapear Ofertas
            if (oferData.status === 'fulfilled') {
                const oMap = {};
                oferData.value.forEach(o => oMap[o.id_oferta] = o.nombre);
                setOfertasMap(oMap);
            }

            // Mapear Combos
            if (combData.status === 'fulfilled') {
                const combMap = {};
                combData.value.forEach(c => combMap[c.id_combo] = c.nombre);
                setCombosMap(combMap);
            }

            // Mapear Eventos
            if (eventData.status === 'fulfilled') {
                const evMap = {};
                eventData.value.forEach(e => evMap[e.id_evento] = e.nombre);
                setEventosMap(evMap);
            }

        } catch (error) {
            console.error('Error cargando catálogos para auditoría:', error);
        }
    };

    useEffect(() => {
        cargarCatalogos();
    }, []);
    
    // Master Map unificado para todas las funciones
    const masterMaps = useMemo(() => {
        const m = {
            sucursales: sucursalesMap,
            productos: productosMap,
            variantes: variantesMap,
            usuarios: usuariosMap,
            marcas: marcasMap,
            categorias: categoriasMap,
            proveedores: proveedoresMap,
            descuentos: descuentosMap,
            ofertas: ofertasMap,
            combos: combosMap,
            tiposMovimiento: tiposMovimientoMap,
            eventos: eventosMap
        };
        return m;
    }, [
        sucursalesMap, productosMap, variantesMap, usuariosMap, marcasMap, 
        categoriasMap, proveedoresMap, descuentosMap, ofertasMap, 
        combosMap, tiposMovimientoMap, eventosMap
    ]);

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

    // ═══════════════════════════════════════════════════
    // HELPERS DE FORMATEO (dentro del componente)
    // ═══════════════════════════════════════════════════

    const parseJSON = (str) => {
        if (!str) return null;
        if (typeof str === 'object') return str;
        try {
            let parsed = JSON.parse(str);
            if (typeof parsed === 'string') {
                try { return JSON.parse(parsed); } catch { return parsed; }
            }
            return parsed;
        } catch { return null; }
    };

    const getNombreCampoLegible = (campo) => {
        const campoStr = String(campo);
        return CAMPOS_LEGIBLES[campoStr] || CAMPOS_LEGIBLES[campoStr.toLowerCase()] || campoStr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '—';
        try { return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es }); }
        catch { return String(fecha); }
    };

    const getAccionBadge = (accion) => {
        switch (accion) {
            case 'CREATE': case 'createMany':
                return { label: accion === 'createMany' ? 'Creación Masiva' : 'Creación', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', icon: Plus };
            case 'UPDATE': case 'updateMany':
                return { label: accion === 'updateMany' ? 'Modif. Masiva' : 'Modificación', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: Edit3 };
            case 'DELETE': case 'deleteMany':
                return { label: accion === 'deleteMany' ? 'Eliminación Masiva' : 'Eliminación', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: Trash2 };
            default: return { label: accion, bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200', icon: Activity };
        }
    };

    const formatearValor = (valor, campo, maps = masterMaps, context = {}) => {
        if (valor === null || valor === undefined) return '—';
        if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';

        const isUUID = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

        // Campo especial: atributos_valores → mostrar como "Sabor: Vainilla / Tamaño: 1KG"
        if (campo === 'atributos_valores' && typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
            const partes = Object.entries(valor).map(([k, v]) => `${k}: ${v}`);
            return partes.length > 0 ? partes.join(' / ') : '—';
        }

        // Mapeos por campo con fallback a contexto del registro
        const valLower = typeof valor === 'string' ? valor.toLowerCase() : valor;
        
        if (campo === 'id_comercio' || campo === 'id_comercio_asignado') {
            if (maps.sucursales?.[valLower]) return maps.sucursales[valLower];
            if (context.comercio_nombre) return context.comercio_nombre;
        }
        if (campo === 'id_producto') {
            if (maps.productos?.[valLower]) return maps.productos[valLower];
            if (context.producto_nombre || context.nombre) return context.producto_nombre || context.nombre;
        }
        if (campo === 'id_variante') {
            if (maps.variantes?.[valLower]) return maps.variantes[valLower];
            if (context.talle && context.color) return `${context.talle} / ${context.color}`;
            if (context.talle) return context.talle;
            if (context.color) return context.color;
            if (context.sku_variante || context.sku) return context.sku_variante || context.sku;
            // Intentar con atributos_valores del contexto
            if (context.atributos_valores) {
                const attrs = typeof context.atributos_valores === 'string' 
                    ? JSON.parse(context.atributos_valores) 
                    : context.atributos_valores;
                const partes = Object.values(attrs).filter(Boolean);
                if (partes.length > 0) return partes.join(' / ');
            }
        }
        if (campo === 'id_usuario' && maps.usuarios?.[valor]) return maps.usuarios[valor];
        if (campo === 'id_marca' && maps.marcas?.[valor]) return maps.marcas[valor];
        if (campo === 'id_categoria' && maps.categorias?.[valor]) return maps.categorias[valor];
        if (campo === 'id_proveedor' && maps.proveedores?.[valor]) return maps.proveedores[valor];
        if (campo === 'id_descuento' && maps.descuentos?.[valor]) return maps.descuentos[valor];
        if (campo === 'id_oferta' && maps.ofertas?.[valor]) return maps.ofertas[valor];
        if (campo === 'id_combo' && maps.combos?.[valor]) return maps.combos[valor];
        if (campo === 'id_tipo_movimiento' && maps.tiposMovimiento?.[valor]) return maps.tiposMovimiento[valor];
        if (campo === 'id_evento_origen' && maps.eventos?.[valor]) return maps.eventos[valor];
        if (campo === 'acepta_marketing') return valor ? 'Acepta marketing' : 'No acepta marketing';

        // Fallback UUID — intentar buscar en TODOS los mapas antes de truncar
        if (isUUID(valor)) {
            // Buscar en todos los mapas posibles
            for (const [, mapObj] of Object.entries(maps)) {
                if (mapObj?.[valLower]) return mapObj[valLower];
            }
            const fieldBase = campo.replace('id_', '');
            if (context[`${fieldBase}_nombre`]) return context[`${fieldBase}_nombre`];
            // Mostrar ID truncado solo para campos id_
            if (campo.startsWith('id_')) return valor.substring(0, 8) + '…';
            return '(ID Técnico)';
        }

        // Moneda
        const esMoneda = /precio|costo|monto|valor_descuento|saldo|total|comision/i.test(campo);
        if (typeof valor === 'number') {
            if (esMoneda) return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
            return valor.toLocaleString('es-AR');
        }
        if (typeof valor === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
                try { return format(new Date(valor), 'dd/MM/yyyy HH:mm', { locale: es }); } catch { return valor; }
            }
            if (valor === 'true') return 'Sí';
            if (valor === 'false') return 'No';
            if (valor.length > 80) return valor.substring(0, 77) + '…';
        }
        if (typeof valor === 'object' && valor !== null) {
            // Objetos key-value (como atributos) → mostrar legible
            if (!Array.isArray(valor)) {
                const entries = Object.entries(valor).filter(([k]) => !k.startsWith('id_'));
                if (entries.length > 0 && entries.length <= 5) {
                    return entries.map(([k, v]) => `${k}: ${v}`).join(' / ');
                }
            }
            try { const s = JSON.stringify(valor); return s.length > 60 ? s.substring(0, 57) + '…' : s; } catch { return '—'; }
        }
        return String(valor);
    };

    const getTituloAccion = (item) => {
        const entidad = ENTIDADES_LEGIBLES[item.entidad_afectada] || item.entidad_afectada;
        const accion = item.accion;

        // Caso especial: Registro de leads desde eventos
        if (item.entidad_afectada === 'Usuario' && accion === 'CREATE' && item.valor_nuevo) {
            try {
                const data = JSON.parse(item.valor_nuevo);
                if (data.id_evento_origen) return 'Registro desde Evento';
            } catch (e) {}
        }

        // Mapeo por Entidad + Acción
        const mapping = {
            'Usuario': {
                'CREATE': 'Alta de Usuario',
                'UPDATE': 'Modificación de Usuario',
                'DELETE': 'Baja de Usuario'
            },
            'Producto': {
                'CREATE': 'Lanzamiento de Producto',
                'UPDATE': 'Actualización de Ficha',
                'DELETE': 'Baja de Producto'
            },
            'InventarioComercio': {
                'UPDATE': 'Ajuste de Stock en Sucursal',
                'CREATE': 'Carga inicial de Stock'
            },
            'InventarioComercioVariante': {
                'UPDATE': 'Ajuste de Stock de Variante'
            },
            'MovimientoStock': {
                'CREATE': 'Registro de Movimiento'
            },
            'VentaCabecera': {
                'CREATE': 'Registro de Venta',
                'UPDATE': 'Anulación/Modificación de Venta'
            },
            'Evento': {
                'CREATE': 'Nueva Campaña de Marketing',
                'UPDATE': 'Ajuste de Campaña',
                'DELETE': 'Finalización de Evento'
            },
            'Descuento': {
                'CREATE': 'Nuevo Cupón de Descuento',
                'UPDATE': 'Modificación de Beneficio'
            }
        };

        const titulo = mapping[item.entidad_afectada]?.[accion];
        if (titulo) return titulo;

        // Fallback genérico profesional
        const verbos = {
            'CREATE': 'Alta de',
            'UPDATE': 'Modificación de',
            'DELETE': 'Baja de',
            'createMany': 'Creación Masiva de',
            'updateMany': 'Modificación Masiva de',
            'deleteMany': 'Eliminación Masiva de'
        };

        return `${verbos[accion] || accion} ${entidad}`;
    };

    const getDescripcionLegible = (item, maps = masterMaps) => {
        const entidad = ENTIDADES_LEGIBLES[item.entidad_afectada] || item.entidad_afectada;
        const verbo = ACCIONES_VERBO[item.accion] || item.accion;
        const datosNuevos = parseJSON(item.datos_nuevos) || parseJSON(item.valor_nuevo) || {};
        const datosAnteriores = parseJSON(item.datos_anteriores) || parseJSON(item.valor_anterior) || {};
        const datos = { ...datosAnteriores, ...datosNuevos };

        const idProducto = datos.id_producto || item.id_producto;
        const idComercio = datos.id_comercio || item.id_comercio;

        let nombreProducto = (idProducto && maps.productos?.[idProducto]) || datos.nombre || '';
        let nombreVariante = '';
        if (item.entidad_afectada.includes('Variante')) {
            const talle = datos.talle || datos.talla || '';
            const color = datos.color || '';
            if (talle || color) nombreVariante = `${talle}${talle && color ? ' / ' : ''}${color}`;
            else if (datos.sku_variante) nombreVariante = `SKU: ${datos.sku_variante}`;
        }

        let id = datos.nombre || datos.titulo || datos.username || datos.nombre_marca || datos.nombre_proveedor || '';
        if (item.entidad_afectada.includes('Variante')) {
            if (nombreProducto && nombreVariante) id = `${nombreProducto} (${nombreVariante})`;
            else id = nombreProducto || nombreVariante || id;
        } else if (!id && nombreProducto) {
            id = nombreProducto;
        }

        const sucursal = maps.sucursales?.[idComercio] || '';
        if (sucursal) id = id ? `${id} en ${sucursal}` : `en ${sucursal}`;

        return id ? `${verbo} ${entidad}: "${id}"` : `${verbo} ${entidad}`;
    };

    // Obtener los cambios filtrados (sin IDs internos ni timestamps)
    const getCambiosFiltrados = (item, maps = masterMaps) => {
        const accion = item.accion;
        const nuevosRaw = parseJSON(item.datos_nuevos) || parseJSON(item.valor_nuevo);
        const anterioresRaw = parseJSON(item.datos_anteriores) || parseJSON(item.valor_anterior);

        // Caso Masivo (Array)
        if (Array.isArray(nuevosRaw) || Array.isArray(anterioresRaw)) {
            return { type: 'massive', data: nuevosRaw || anterioresRaw };
        }

        let cambios = parseJSON(item.cambios_detectados);
        if (!cambios) {
            const nuevos = nuevosRaw || {};
            const anteriores = anterioresRaw || {};
            cambios = {};
            if (accion.includes('CREATE')) {
                Object.entries(nuevos).forEach(([k, v]) => { cambios[k] = { antes: null, despues: v }; });
            } else if (accion.includes('DELETE')) {
                Object.entries(anteriores).forEach(([k, v]) => { cambios[k] = { antes: v, despues: null }; });
            } else if (accion.includes('UPDATE')) {
                const allKeys = new Set([...Object.keys(anteriores), ...Object.keys(nuevos)]);
                allKeys.forEach(k => {
                    if (JSON.stringify(anteriores[k]) !== JSON.stringify(nuevos[k])) {
                        cambios[k] = { antes: anteriores[k], despues: nuevos[k] };
                    }
                });
            } else {
                return { type: 'field', data: [] };
            }
        }

        // ← AQUÍ estaba el bug: datosReferencia no se declaraba
        const datosReferencia = parseJSON(item.datos_anteriores) || parseJSON(item.datos_nuevos)
                             || parseJSON(item.valor_anterior) || parseJSON(item.valor_nuevo) || {};
        const contextExtendido = { ...item, ...datosReferencia };

        const entries = Object.entries(cambios)
            .filter(([campo, valores]) => {
                if (CAMPOS_OCULTOS.includes(campo)) return false;
                if (accion.includes('UPDATE') && JSON.stringify(valores.antes) === JSON.stringify(valores.despues)) return false;
                return true;
            });

        // Forzar IDs de contexto genéricos transversalmente (sin harcodear por entidad específica)
        const forzarCtx = (key, value) => {
            if (!value) return;
            // Si ya existe en entries (ej: por ser un CREATE insertado o un UPDATE modificado), lo convertimos a contexto
            const entryIndex = entries.findIndex(([k]) => k === key);
            if (entryIndex !== -1) {
                entries[entryIndex][1].isContext = true;
                return;
            }
            const fmtVal = formatearValor(value, key, maps, contextExtendido);
            if (fmtVal !== '(ID Técnico)') {
                entries.unshift([key, { antes: value, despues: value, isContext: true }]);
            }
        };

        // Recorrer el universo de CAMPOS_CONTEXTO y forzar su extracción al bloque "Contexto"
        CAMPOS_CONTEXTO.forEach(ctxKey => {
            if (contextExtendido[ctxKey] !== undefined && contextExtendido[ctxKey] !== null) {
                forzarCtx(ctxKey, contextExtendido[ctxKey]);
            }
        });

        // Filtrar IDs técnicos que no pudimos resolver
        const finalEntries = entries.filter(([campo, valores]) => {
            const valor = valores.despues || valores.antes;
            if (valor === undefined || valor === null) return true;
            return formatearValor(valor, campo, maps, contextExtendido) !== '(ID Técnico)';
        });

        return { type: 'field', data: finalEntries };
    };

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black dark:border-gray-600 pb-4 gap-4 flex-wrap">
                <div className="flex-1 min-w-0 pr-0 md:pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={14} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">SISTEMA DE REGISTRO</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Gestión de <span className="text-brand-cyan">Auditoría</span>
                    </h2>
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-2 whitespace-normal">
                        Control de integridad y trazabilidad. Consultá el historial de cambios, creaciones y eliminaciones realizadas por los operadores del sistema.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black uppercase text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                            {total.toLocaleString('es-AR')} REGISTROS
                        </span>
                        {Object.keys(filtrosAplicados).length > 0 && (
                            <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
                                Filtros activos
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm active:scale-95 ${
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
                            <PremiumSelect
                                placeholder="Todas las entidades"
                                options={TIPOS_ENTIDAD.map(t => ({ value: t.value, label: t.label }))}
                                value={filtros.entidad}
                                onChange={val => setFiltros({ ...filtros, entidad: val })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Tipo de Acción</label>
                            <PremiumSelect
                                placeholder="Todas las acciones"
                                options={TIPOS_ACCION.map(t => ({ value: t.value, label: t.label }))}
                                value={filtros.accion}
                                onChange={val => setFiltros({ ...filtros, accion: val })}
                            />
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
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Recopilando historial de auditoría...</p>
                </div>
            ) : auditorias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Database size={48} className="text-neutral-300 mb-4" />
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Sin registros</p>
                    <p className="text-xs text-neutral-400 mt-1">No hay auditorías que coincidan con los filtros aplicados</p>
                </div>
            ) : (
                <DataTable 
                    data={auditorias}
                    totalItems={total}
                    onPageChange={(p) => setPage(p - 1)}
                    itemsPerPageDefault={ITEMS_PER_PAGE}
                    columns={[
                        { 
                            header: 'Fecha', 
                            render: (item) => (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={10} className="text-neutral-400 flex-shrink-0" />
                                    <span className="text-[10px] font-bold whitespace-nowrap">
                                        {formatFecha(item.fecha_hora)}
                                    </span>
                                </div>
                            )
                        },
                        { 
                            header: 'Acción', 
                            render: (item) => {
                                const badge = getAccionBadge(item.accion);
                                const BadgeIcon = badge.icon;
                                return (
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
                                        <BadgeIcon size={10} />
                                        {getTituloAccion(item)}
                                    </span>
                                );
                            }
                        },
                        { 
                            header: 'Entidad', 
                            render: (item) => (
                                <span className="text-[10px] font-bold">
                                    {ENTIDADES_LEGIBLES[item.entidad_afectada] || item.entidad_afectada}
                                </span>
                            )
                        },
                        { 
                            header: 'Descripción', 
                            render: (item) => {
                                const cambios = getCambiosFiltrados(item, masterMaps);
                                return (
                                    <div className="max-w-[250px]">
                                        <p className="text-[10px] text-neutral-600 dark:text-neutral-300 truncate">
                                            {item.descripcion_accion || getDescripcionLegible(item, masterMaps)}
                                        </p>
                                        {cambios.type === 'field' && cambios.data.length > 0 && (
                                            <span className="text-[8px] text-brand-cyan font-black uppercase">
                                                {cambios.data.length} campo{cambios.data.length !== 1 ? 's' : ''} modificado{cambios.data.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {cambios.type === 'massive' && (
                                            <span className="text-[8px] text-amber-500 font-black uppercase">
                                                {cambios.data.length} registros afectados
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                        },
                        { 
                            header: 'Usuario', 
                            render: (item) => (
                                <div className="flex items-center gap-1.5">
                                    <User size={10} className="text-neutral-400 flex-shrink-0" />
                                    <span className="text-[10px] font-bold">
                                        {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido || ''}`.trim() : 'Sistema'}
                                    </span>
                                </div>
                            )
                        }
                    ]}
                    onView={(item) => setSelectedItem(item)}
                />
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
                                    <h3 className="text-xl font-sport text-black dark:text-white leading-none">
                                        {getTituloAccion(selectedItem)}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-semibold text-neutral-400">
                                            {format(new Date(selectedItem.fecha_hora), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </span>
                                        <span className="text-neutral-300 dark:text-gray-600">—</span>
                                        <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
                                            {selectedItem.usuario ? `${selectedItem.usuario.nombre} ${selectedItem.usuario.apellido || ''}` : 'Sistema'}
                                        </span>
                                    </div>
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
                            {/* Tabla de Cambios */}
                            {(() => {
                                const cambios = getCambiosFiltrados(selectedItem);
                                
                                if (cambios.type === 'massive') {
                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Database size={16} className="text-amber-500" />
                                                <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">
                                                    Registros Afectados ({cambios.data.length})
                                                </span>
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-gray-700/30 rounded-xl p-4 border border-neutral-200 dark:border-gray-600 overflow-auto max-h-[300px]">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {cambios.data.map((reg, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-neutral-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                                            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-gray-700/50 pb-2 mb-1">
                                                                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">ÍTEM #{idx + 1}</span>
                                                                <div className="w-2 h-2 rounded-full bg-brand-cyan/20"></div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                {Object.entries(reg).filter(([k]) => !CAMPOS_OCULTOS.includes(k) && !k.startsWith('id_')).map(([k, v]) => (
                                                                    <div key={k} className="flex justify-between items-start gap-3">
                                                                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase shrink-0">
                                                                            {getNombreCampoLegible(k)}
                                                                        </span>
                                                                        <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200 text-right leading-tight">
                                                                            {formatearValor(v, k, masterMaps, reg)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (cambios.data.length === 0) return (
                                    <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-neutral-100 dark:border-gray-700 rounded-2xl bg-neutral-50/30 dark:bg-gray-800/20">
                                        <AlertTriangle size={32} className="text-amber-400 mb-3" />
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-center max-w-[250px]">
                                            No se detectaron cambios significativos en los datos operativos.
                                        </p>
                                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 text-center">
                                            Es posible que se hayan actualizado registros técnicos o metadatos internos del sistema.
                                        </p>
                                    </div>
                                );
                                
                                const esCreacion = selectedItem.accion.includes('CREATE');
                                const esEliminacion = selectedItem.accion.includes('DELETE');
                                const camposContexto = cambios.data.filter(([_, v]) => v.isContext);
                                const camposModificados = cambios.data.filter(([_, v]) => !v.isContext);
                                
                                return (
                                    <div className="space-y-4">
                                        {/* Contexto */}
                                        {camposContexto.length > 0 && (
                                            <div className="bg-neutral-50 dark:bg-gray-700/30 rounded-xl p-3 border border-neutral-200 dark:border-gray-600">
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    <MapPin size={14} className="text-neutral-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Contexto de la Operación</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {camposContexto.map(([campo, valores]) => (
                                                        <div key={campo} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 px-3 py-1.5 rounded-lg shadow-sm">
                                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">{getNombreCampoLegible(campo)}:</span>
                                                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                                                                {formatearValor(valores.despues, campo, masterMaps, parseJSON(selectedItem.datos_nuevos) || {})}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cambios */}
                                        {camposModificados.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <Edit3 size={16} className="text-brand-cyan" />
                                                        <span className="font-bold text-sm text-neutral-700 dark:text-neutral-200">
                                                            {esCreacion ? 'Datos Ingresados' : esEliminacion ? 'Datos Eliminados' : 'Cambios Realizados'} ({camposModificados.length})
                                                        </span>
                                                    </div>
                                                    {!esCreacion && !esEliminacion && (
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-0.5 rounded">MODIFICACIÓN</span>
                                                    )}
                                                </div>
                                                <div className="border border-neutral-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-neutral-50 dark:bg-gray-700/50 border-b border-neutral-200 dark:border-gray-700">
                                                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500 w-[30%]">Campo</th>
                                                                {(!esCreacion && !esEliminacion) && (
                                                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Estado Anterior</th>
                                                                )}
                                                                <th className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest ${esEliminacion ? 'text-red-500' : 'text-brand-cyan'}`}>
                                                                    {esCreacion ? 'Valor Registrado' : esEliminacion ? 'Valor Final' : 'Nuevo Estado'}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
                                                            {camposModificados.map(([campo, valores]) => (
                                                                <tr key={campo} className="group hover:bg-neutral-50/50 dark:hover:bg-gray-700/20 transition-all">
                                                                    <td className="px-5 py-4">
                                                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                                                                            {getNombreCampoLegible(campo)}
                                                                        </span>
                                                                    </td>
                                                                    {(!esCreacion && !esEliminacion) && (
                                                                        <td className="px-5 py-4">
                                                                            <div className="text-xs text-neutral-400 font-medium line-through decoration-red-300/50">
                                                                                {formatearValor(valores.antes, campo, masterMaps, parseJSON(selectedItem.datos_anteriores) || parseJSON(selectedItem.valor_anterior) || {})}
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    <td className="px-5 py-4">
                                                                        <div className={`text-xs font-black p-2 rounded-lg inline-block break-all max-w-[250px] ${
                                                                            esEliminacion 
                                                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600' 
                                                                                : esCreacion 
                                                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                                                                    : 'bg-cyan-50 dark:bg-cyan-900/20 text-brand-cyan'
                                                                        }`}>
                                                                            {formatearValor(esEliminacion ? valores.antes : valores.despues, campo, masterMaps, parseJSON(selectedItem.datos_nuevos) || parseJSON(selectedItem.valor_nuevo) || {})}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
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