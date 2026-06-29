import api from '../api/api';

export const ventasService = {
    async getAllVentas(filtros = {}) {
        const params = new URLSearchParams();
        
        if (filtros.id_comercio) params.append('id_comercio', filtros.id_comercio);
        if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
        if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.estado_liquidacion) params.append('estado_liquidacion', filtros.estado_liquidacion);
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        
        const response = await api.get(`/ventas?${params.toString()}`);
        return response.data;
    },

    async getVentaDetalle(id_venta) {
        const response = await api.get(`/ventas/${id_venta}`);
        return response.data;
    }
};
