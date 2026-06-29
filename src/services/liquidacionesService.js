import api from '../api/api';

export const liquidacionesService = {
    // Preview: obtener resumen pre-liquidación de un comercio
    getPreview: async (sucursalId, idVentas = null) => {
        const params = {};
        if (idVentas && Array.isArray(idVentas) && idVentas.length > 0) {
            params.id_ventas = JSON.stringify(idVentas);
        }
        const response = await api.get(`/liquidaciones/${sucursalId}/preview`, { params });
        return response.data;
    },

    // Obtener historial de liquidaciones de un comercio (o todas si no se pasa ID)
    getHistorial: async (sucursalId = null) => {
        if (!sucursalId) {
            // Para SUPER_ADMIN: obtener liquidaciones de todos los comercios
            try {
                const comerciosRes = await api.get('/comercios');
                const comercios = comerciosRes.data || [];
                const promesas = comercios.map(async (comercio) => {
                    try {
                        const liqRes = await api.get(`/liquidaciones/${comercio.id_comercio}`);
                        return liqRes.data || [];
                    } catch {
                        return [];
                    }
                });
                
                const resultados = await Promise.all(promesas);
                const allLiquidaciones = resultados.flat();
                // Ordenar por fecha descendente
                allLiquidaciones.sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre));
                return allLiquidaciones;
            } catch {
                return [];
            }
        }
        // Para un comercio específico
        const response = await api.get(`/liquidaciones/${sucursalId}`);
        return response.data || [];
    },

    // Generar una liquidación para un comercio
    liquidarSucursal: async (sucursalId, montoRecibido = null, idVentas = null) => {
        const body = { id_comercio: sucursalId };
        if (montoRecibido !== null && montoRecibido !== undefined) {
            body.monto_recibido = parseFloat(montoRecibido);
        }
        if (idVentas && Array.isArray(idVentas) && idVentas.length > 0) {
            body.id_ventas = idVentas;
        }
        const response = await api.post('/liquidaciones', body);
        return response.data;
    }
};
