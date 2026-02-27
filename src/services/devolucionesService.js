import api from '../api/api';

export const devolucionesService = {
    // Obtener una venta por ID (para buscarla y procesar la devolución)
    getVenta: async (id_venta) => {
        const response = await api.get(`/ventas/${id_venta}`);
        return response.data;
    },

    // Obtener todas las ventas (para el buscador)
    getVentas: async () => {
        const response = await api.get('/ventas');
        return response.data;
    },

    // Registrar una devolución
    procesarDevolucion: async ({ id_venta, id_producto, cantidad, motivo }) => {
        const response = await api.post('/devoluciones', { id_venta, id_producto, cantidad, motivo });
        return response.data;
    },

    // Historial de devoluciones de un comercio
    getHistorialComercio: async (id_comercio) => {
        const response = await api.get(`/devoluciones/comercio/${id_comercio}`);
        return response.data;
    },

    // Historial global (super admin)
    getHistorialGlobal: async () => {
        const response = await api.get('/devoluciones');
        return response.data;
    }
};
