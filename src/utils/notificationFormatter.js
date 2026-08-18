/**
 * Formatea los tipos de notificación para que sean legibles para el usuario
 * Convierte tipos como "CONSULTA_WEB" en "Consulta Web Recibida"
 */

/**
 * Mapeo de tipos de notificación a texto legible
 */
const NOTIFICATION_TYPE_LABELS = {
    VENCIMIENTO: 'Producto por vencer',
    CONSULTA_WEB: 'Consulta Web Recibida',
  STOCK_BAJO: 'Stock Bajo',
  VENTA_NUEVA: 'Venta Nueva',
  VENTA_CANCELADA: 'Venta Cancelada',
  PRODUCTO_NUEVO: 'Producto Nuevo',
  USUARIO_NUEVO: 'Usuario Nuevo',
  ALERTA_SISTEMA: 'Alerta del Sistema',
  INFO: 'Información',
  WARNING: 'Advertencia',
  ERROR: 'Error',
  SUCCESS: 'Éxito'
};

/**
 * Formatea un tipo de notificación a texto legible
 * @param {string} tipo - Tipo de notificación (ej: "CONSULTA_WEB")
 * @returns {string} Texto formateado (ej: "Consulta Web Recibida")
 */
export const formatearTipoNotificacion = (tipo) => {
  if (!tipo) return 'Notificación';
  
  // Si existe en el mapeo, retornar el label
  if (NOTIFICATION_TYPE_LABELS[tipo]) {
    return NOTIFICATION_TYPE_LABELS[tipo];
  }
  
  // Si no existe, formatear automáticamente:
  // 1. Reemplazar guiones bajos por espacios
  // 2. Convertir a minúsculas
  // 3. Capitalizar primera letra de cada palabra
  return tipo
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Obtiene el color del badge según el tipo de notificación
 * @param {string} tipo - Tipo de notificación
 * @returns {string} Clases de Tailwind para el badge
 */
export const getColorTipoNotificacion = (tipo) => {
  const colorMap = {
    VENCIMIENTO: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    CONSULTA_WEB: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    STOCK_BAJO: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    VENTA_NUEVA: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    VENTA_CANCELADA: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    PRODUCTO_NUEVO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    USUARIO_NUEVO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    ALERTA_SISTEMA: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  };
  
  return colorMap[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
};

/**
 * Obtiene el icono según el tipo de notificación
 * @param {string} tipo - Tipo de notificación
 * @returns {string} Nombre del icono de Lucide
 */
export const getIconoTipoNotificacion = (tipo) => {
  const iconMap = {
    VENCIMIENTO: 'AlertTriangle',
    CONSULTA_WEB: 'MessageSquare',
    STOCK_BAJO: 'AlertTriangle',
    VENTA_NUEVA: 'ShoppingCart',
    VENTA_CANCELADA: 'XCircle',
    PRODUCTO_NUEVO: 'Package',
    USUARIO_NUEVO: 'UserPlus',
    ALERTA_SISTEMA: 'Bell',
    INFO: 'Info',
    WARNING: 'AlertCircle',
    ERROR: 'XOctagon',
    SUCCESS: 'CheckCircle'
  };
  
  return iconMap[tipo] || 'Bell';
};
