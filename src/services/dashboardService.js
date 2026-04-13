import api from '../api/api';

export const dashboardService = {
    getStats: async (sucursalId = null) => {
        const params = sucursalId ? { sucursalId } : {};
        const response = await api.get('/dashboard/stats', { params });
        return response.data;
    }
};
