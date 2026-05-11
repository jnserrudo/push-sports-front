/**
 * Formatea un precio en pesos argentinos
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '$0';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Calcula el porcentaje de descuento entre dos precios
 * @param {number} originalPrice - Precio original
 * @param {number} discountedPrice - Precio con descuento
 * @returns {number} Porcentaje de descuento
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Determina si un producto tiene descuento
 * @param {Object} producto - Producto a evaluar
 * @returns {boolean} True si tiene descuento
 */
export const hasDiscount = (producto) => {
  return producto.precio_promocion && producto.precio_promocion < producto.precio_base;
};

/**
 * Obtiene el precio final de un producto (con o sin descuento)
 * @param {Object} producto - Producto
 * @returns {number} Precio final
 */
export const getFinalPrice = (producto) => {
  return producto.precio_promocion || producto.precio_base;
};
