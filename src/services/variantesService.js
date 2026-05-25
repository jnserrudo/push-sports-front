import api from '../api/api';

export const variantesService = {
    // Obtener todas las variantes de un producto
    getByProducto: async (id_producto) => {
        const response = await api.get(`/variantes/productos/${id_producto}/variantes`);
        return response.data;
    },

    // Generar variantes automáticamente desde atributos
    generarDesdeAtributos: async (id_producto, atributos = null, combinacionesEspecificas = null) => {
        const payload = {};
        if (atributos) payload.atributos = atributos;
        if (combinacionesEspecificas) payload.combinaciones = combinacionesEspecificas;
        
        const response = await api.post(`/variantes/productos/${id_producto}/variantes/generar`, payload);
        return response.data;
    },

    // Crear una variante manualmente
    create: async (id_producto, data) => {
        const response = await api.post(`/variantes/productos/${id_producto}/variantes`, data);
        return response.data;
    },

    // Actualizar una variante
    update: async (id_variante, data) => {
        const response = await api.put(`/variantes/variantes/${id_variante}`, data);
        return response.data;
    },

    // Alias para actualizar (usado en el componente)
    actualizarVariante: async (id_variante, data) => {
        const response = await api.put(`/variantes/variantes/${id_variante}`, data);
        return response.data;
    },

    // Desactivar/eliminar una variante
    delete: async (id_variante) => {
        const response = await api.delete(`/variantes/variantes/${id_variante}`);
        return response.data;
    },

    // Alias para eliminar (usado en el componente)
    eliminarVariante: async (id_variante) => {
        const response = await api.delete(`/variantes/variantes/${id_variante}`);
        return response.data;
    },

    // Migrar stock existente a variantes
    migrarStock: async (id_producto, distribucion) => {
        const response = await api.post(`/variantes/productos/${id_producto}/migrar-stock`, {
            distribucion
        });
        return response.data;
    },

    // Activar/desactivar sistema de variantes para un producto
    toggleUsaVariantes: async (id_producto, usa_variantes) => {
        const response = await api.put(`/variantes/productos/${id_producto}/usa-variantes`, {
            usa_variantes
        });
        return response.data;
    },

    // Obtener stock de una variante en una sucursal
    getStockVariante: async (id_comercio, id_variante) => {
        const response = await api.get(`/inventarios/${id_comercio}/variantes/${id_variante}`);
        return response.data;
    },

    // Actualizar stock de una variante en una sucursal
    updateStockVariante: async (id_comercio, id_variante, data) => {
        const response = await api.put(`/inventarios/${id_comercio}/variantes/${id_variante}`, data);
        return response.data;
    }
};

export default variantesService;
