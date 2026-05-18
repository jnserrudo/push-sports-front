import api from '../api/api';

export const impersonationService = {
    // Iniciar impersonación
    startImpersonation: async (userId) => {
        const response = await api.post('/impersonation/start', {
            id_usuario_impersonar: userId
        });
        return response.data;
    },

    // Detener impersonación
    stopImpersonation: async () => {
        const response = await api.post('/impersonation/stop');
        return response.data;
    },

    // Obtener estado actual de impersonación
    getStatus: async () => {
        const response = await api.get('/impersonation/status');
        return response.data;
    }
};
