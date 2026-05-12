import publicApi from '../api/api';

class ConsultaService {
  // Crear nueva consulta desde el checkout
  async crearConsulta(datos) {
    try {
      const response = await publicApi.post('/public/consultas', datos);
      return response.data;
    } catch (error) {
      console.error('Error al crear consulta:', error);
      
      // Manejo de errores específicos
      if (error.response?.status === 400) {
        const errores = error.response.data.errors;
        if (Array.isArray(errores)) {
          throw new Error(errores.map(err => err.msg || err.message).join(', '));
        }
        throw new Error(error.response.data.message || 'Error de validación');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Error del servidor. Por favor, intenta más tarde.');
      }
      
      throw new Error('Error al crear la consulta. Por favor, intenta de nuevo.');
    }
  }
}

export default new ConsultaService();
