/**
 * Genera un mensaje de WhatsApp formateado para el pedido
 * @param {Object} orderData - Datos del pedido
 * @param {Array} orderData.items - Items del carrito
 * @param {number} orderData.total - Total del pedido
 * @param {string} orderData.customerName - Nombre del cliente
 * @param {string} orderData.customerPhone - Teléfono del cliente
 * @param {string} orderData.sucursal - Sucursal preferida
 * @param {string} orderData.deliveryMethod - Método de entrega
 * @param {string} orderData.comments - Comentarios adicionales
 * @param {string} orderData.tokenSeguimiento - Token para seguimiento público
 * @returns {string} Mensaje formateado
 */
export const generateWhatsAppMessage = (orderData) => {
  const {
    items,
    total,
    customerName,
    customerPhone,
    sucursal,
    deliveryMethod,
    comments,
    tokenSeguimiento
  } = orderData;

  let message = '*PEDIDO PUSHSPORT*\n\n';
  
  // Datos del cliente
  message += `*Cliente:* ${customerName}\n`;
  message += `*Teléfono:* ${customerPhone}\n\n`;
  
  // Productos
  message += '*PRODUCTOS:*\n';
  items.forEach(item => {
    const varianteInfo = item.variante 
      ? ` (${Object.values(item.variante.atributos_valores || {}).join(', ')})`
      : '';
    message += `• ${item.cantidad}x ${item.nombre}${varianteInfo} - ${formatPrice(item.precio * item.cantidad)}\n`;
  });
  
  // Total
  message += `\n*TOTAL:* ${formatPrice(total)}\n\n`;
  
  // Sucursal y entrega
  message += `*Sucursal:* ${sucursal}\n`;
  message += `*Entrega:* ${deliveryMethod}\n`;
  
  // Comentarios
  if (comments) {
    message += `\n*Comentarios:* ${comments}\n`;
  }
  
  message += '\n________________________________\n';
  
  // URL de seguimiento si existe token
  if (tokenSeguimiento) {
    message += `\n🔗 *Seguí tu pedido aquí:*\n`;
    message += `https://push-sports-front.onrender.com/consulta/${tokenSeguimiento}\n`;
    message += '\n';
  }
  
  message += 'Pedido generado desde https://push-sports-front.onrender.com';
  
  return encodeURIComponent(message);
};

/**
 * Abre WhatsApp con el mensaje pre-llenado
 * @param {string} phoneNumber - Número de WhatsApp del negocio
 * @param {string} message - Mensaje a enviar
 */
export const openWhatsApp = (phoneNumber, message) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${message}`;
  console.log('📱 Abriendo WhatsApp con:', { phoneNumber, cleanPhone, url: url.substring(0, 100) + '...' });
  
  const opened = window.open(url, '_blank');
  
  if (!opened || opened.closed || typeof opened.closed === 'undefined') {
    console.warn('⚠️ El navegador bloqueó la ventana emergente de WhatsApp');
    // Fallback: intentar con location.href
    window.location.href = url;
  } else {
    console.log('✅ WhatsApp abierto correctamente');
  }
};

/**
 * Formatea un precio en pesos argentinos
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
