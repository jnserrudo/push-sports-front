import api from '../api/api';

export const posService = {
    // Obtiene solo los productos que la sucursal tiene en inventario
    getInventarioSucursal: async (sucursalId) => {
        const response = await api.get(`/inventarios/${sucursalId}?soloConStock=true`);
        return response.data;
    },

    // Registra la venta (Cabecera y Detalle normalizado para la API)
    registrarVenta: async (sucursalId, vendedorId, items, montoTotal, metodoPago = 'Efectivo', codigoDescuento = null) => {
        const payload = {
            id_comercio: sucursalId,
            id_usuario: vendedorId,
            metodo_pago: metodoPago,
            total_venta: montoTotal,
            codigo_descuento: codigoDescuento || undefined,
            detalles: items.map(item => ({
                id_producto: item.id_producto,
                id_variante: item.id_variante,
                cantidad: item.cantidadAComprar,
                precio_unitario: item.precio_venta,
                precio_push: item.precio_push || 0,
                precio_base: item.precio_base || 0,
                precio_lista: item.precio_lista || item.precio_base || item.precio_venta,
                descuento_tipo: item.descuento_tipo || null,
                descuento_valor: item.descuento_valor ?? null
            }))
        };

        console.log('[DEBUG posService] Payload a enviar:', JSON.stringify(payload, null, 2));

        const response = await api.post('/ventas', payload);
        return response.data;
    },

    // Valida un código de descuento contra el subtotal actual
    validarDescuento: async (codigo, subtotal) => {
        const response = await api.post('/descuentos/validar', { codigo, subtotal });
        return response.data;
    },

    // Trae las ofertas activas vigentes para aplicar al catálogo
    getOfertasVigentes: async () => {
        const response = await api.get('/ofertas');
        const now = new Date();
        return (response.data || []).filter(o => {
            if (!o.activo) return false;
            if (o.fecha_fin && new Date(o.fecha_fin) < now) return false;
            return true;
        });
    }
};
