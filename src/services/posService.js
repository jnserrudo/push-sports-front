import api from '../api/api';

export const posService = {
    // Obtiene solo los productos que la sucursal tiene en inventario
    getInventarioSucursal: async (sucursalId) => {
        const response = await api.get(`/inventarios/${sucursalId}`);
        return response.data;
    },

    // Registra la venta (Cabecera y Detalle normalizado para la API)
    registrarVenta: async (sucursalId, vendedorId, items, montoTotal, metodoPago = 'Efectivo') => {
        const payload = {
            id_comercio: sucursalId,
            id_usuario: vendedorId,
            metodo_pago: metodoPago,
            total_venta: montoTotal, // Aclaro monto total por si acaso el backend lo requiere
            detalles: items.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidadAComprar,
                precio_unitario: item.precio_venta
            }))
        };

        const response = await api.post('/ventas', payload);
        return response.data;
    }
};
