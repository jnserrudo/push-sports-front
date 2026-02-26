import api from '../api/api';

// Create a generic service generator for CRUD operations
const createApiService = (endpointName) => ({
    getAll: async () => {
        const response = await api.get(`/${endpointName}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/${endpointName}/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post(`/${endpointName}`, data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/${endpointName}/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/${endpointName}/${id}`);
        return response.data;
    }
});

// Catálogos: anidados bajo /catalogos en el backend
export const categoriasService = createApiService('catalogos/categorias');
export const marcasService = createApiService('catalogos/marcas');

// Entidades directas
export const usuariosService = createApiService('usuarios');
export const proveedoresService = createApiService('proveedores');

// Entidades con endpoints propios en el backend
export const descuentosService = createApiService('descuentos');
export const combosService = createApiService('combos');
export const ofertasService = createApiService('ofertas');

// Re-export sucursales apuntando a comercios
export const sucursalesGenericService = createApiService('comercios');
