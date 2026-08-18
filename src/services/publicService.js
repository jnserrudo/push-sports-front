import axios from 'axios';

// Instancia de Axios sin interceptores de autenticación.
// Esta capa se usa exclusivamente para endpoints que no requieren login (B2C).
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pushsport.com.ar/api',
});

const publicService = {
  /**
   * Obtiene el catálogo público de productos con disponibilidad por sucursal.
   * No requiere autenticación.
   */
  getCatalog: async () => {
    const { data } = await publicApi.get('/public/catalog');
    return data;
  },

  /**
   * Obtiene las sucursales activas con su dirección y coordenadas.
   */
  getSucursales: async () => {
    const { data } = await publicApi.get('/public/sucursales');
    return data;
  },

  /**
   * Desuscribe al usuario de emails de marketing usando un token JWT seguro.
   * @param {string} token - JWT token recibido en el email.
   */
  unsubscribe: async (token) => {
    const { data } = await publicApi.post('/public/unsubscribe', { token });
    return data;
  },

  /**
   * Obtiene una consulta por su token de seguimiento.
   * @param {string} token - Token de seguimiento de la consulta.
   */
  getConsultaByToken: async (token) => {
    const { data } = await publicApi.get(`/public/consulta/${token}`);
    return data;
  },
};

export default publicService;
