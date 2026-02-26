import api from '../api/api';

export const liquidacionesService = {
    // Obtener historial de liquidaciones de un comercio (o todas si no se pasa ID)
    getHistorial: async (sucursalId = null) => {
        if (!sucursalId) {
            // Para SUPER_ADMIN: obtener liquidaciones de todos los comercios
            try {
                const comerciosRes = await api.get('/comercios');
                const comercios = comerciosRes.data || [];
                const allLiquidaciones = [];
                for (const comercio of comercios) {
                    try {
                        const liqRes = await api.get(`/liquidaciones/${comercio.id_comercio}`);
                        const items = (liqRes.data || []).map(l => ({
                            ...l,
                            sucursal_nombre: comercio.nombre,
                            sucursal_id: comercio.id_comercio
                        }));
                        allLiquidaciones.push(...items);
                    } catch {
                        // Si un comercio falla, continuar
                    }
                }
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
    liquidarSucursal: async (sucursalId, totalVendido, comisionPorcentaje, netoPagado) => {
        const response = await api.post('/liquidaciones', {
            id_comercio: sucursalId,
            observacion: `Liquidación manual — Total vendido: $${totalVendido}, Comisión: ${comisionPorcentaje}%, Neto: $${netoPagado}`
        });
        return response.data;
    }
};
