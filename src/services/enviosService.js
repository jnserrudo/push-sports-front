import api from '../api/api';

export const enviosService = {
    // Obtener todos los movimientos de stock (que son los "envíos" reales)
    // Acepta un sucursalId opcional. Si se envía, restringe la búsqueda a esa sucursal.
    getAll: async (sucursalId = null) => {
        const endpoint = sucursalId ? `/movimientos/comercio/${sucursalId}` : '/movimientos';
        const response = await api.get(endpoint);
        // Mapear los datos del backend al formato que espera el frontend
        return (response.data || []).map(mov => ({
            id: mov.id_movimiento,
            sucursal_id: mov.id_comercio,
            sucursal_nombre: mov.comercio?.nombre || 'N/A',
            producto_id: mov.id_producto,
            producto_nombre: mov.producto?.nombre || 'N/A',
            cantidad: Math.abs(mov.cantidad_cambio),
            fecha: mov.fecha_hora,
            tipo: mov.tipo_movimiento?.nombre_movimiento || 'MOVIMIENTO',
            usuario: mov.usuario?.nombre || 'Sistema'
        }));
    },

    // Crear un envío (movimiento de stock tipo ingreso)
    crearEnvio: async (sucursalId, productoId, cantidad) => {
        // Usamos el endpoint de inventario para actualizar stock
        // Buscamos el inventario del comercio+producto y actualizamos
        const response = await api.post('/movimientos', {
            id_comercio: sucursalId,
            id_producto: productoId,
            cantidad_cambio: Number(cantidad),
            id_tipo_movimiento: 1 // Tipo 1 = Ingreso/Envío
        });
        return response.data;
    }
};
