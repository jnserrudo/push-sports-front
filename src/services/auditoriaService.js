import api from '../api/api';

export const auditoriaService = {
    getAll: async () => {
        const response = await api.get('/auditoria');
        return response.data;
    },

    getByEntidad: async (nombreEntidad) => {
        const response = await api.get(`/auditoria/entidad/${nombreEntidad}`);
        return response.data;
    }
};
