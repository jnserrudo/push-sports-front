import { create } from 'zustand';

// Roles disponibles: 'SUPER_ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR'

// Helper to get initial state from localStorage
const getInitialState = () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        return {
            user,
            token: savedToken,
            isAuthenticated: true,
            role: user.rol || user.id_rol, // Handle both name or id if necessary
            sucursalId: user.id_comercio_asignado || user.sucursal_id
        };
    }
    
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        role: null,
        sucursalId: null
    };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({
      user: userData,
      isAuthenticated: true,
      role: userData.rol,
      sucursalId: userData.id_comercio_asignado || userData.sucursal_id,
      token: token,
    });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      sucursalId: null,
      token: null,
    });
  },
}));
