import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('pushsport_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error cargando carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('pushsport_cart', JSON.stringify(cart));
  }, [cart]);

  // Agregar producto al carrito
  const addToCart = (producto, cantidad = 1, variante = null) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => 
        item.id === producto.id && 
        JSON.stringify(item.variante) === JSON.stringify(variante)
      );

      if (existingIndex > -1) {
        // Si ya existe, aumentar cantidad
        const newCart = [...prevCart];
        newCart[existingIndex].cantidad += cantidad;
        return newCart;
      } else {
        // Si no existe, agregar nuevo
        return [...prevCart, {
          id: producto.id,
          nombre: producto.nombre,
          precio: variante?.precio_variante || producto.precio_base,
          imagen: producto.imagen,
          marca: producto.marca,
          categoria: producto.categoria,
          cantidad,
          variante,
          disponibilidad: producto.disponibilidad
        }];
      }
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productoId, variante = null) => {
    setCart(prevCart => 
      prevCart.filter(item => 
        !(item.id === productoId && JSON.stringify(item.variante) === JSON.stringify(variante))
      )
    );
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productoId, cantidad, variante = null) => {
    if (cantidad <= 0) {
      removeFromCart(productoId, variante);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productoId && JSON.stringify(item.variante) === JSON.stringify(variante)
          ? { ...item, cantidad }
          : item
      )
    );
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Calcular total
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Calcular cantidad total de items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productoId, variante = null) => {
    return cart.some(item => 
      item.id === productoId && 
      JSON.stringify(item.variante) === JSON.stringify(variante)
    );
  };

  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = (productoId, variante = null) => {
    const item = cart.find(item => 
      item.id === productoId && 
      JSON.stringify(item.variante) === JSON.stringify(variante)
    );
    return item?.cantidad || 0;
  };

  const value = {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
