import { create } from 'zustand';

// Roles disponibles: 'SUPER_ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR'

// Helper to get initial state from localStorage
const getInitialState = () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        const rawSucId = user.id_comercio_asignado || user.sucursal_id;
        const sucursalId = typeof rawSucId === 'object' ? rawSucId?.id_comercio : rawSucId;

        return {
            user,
            token: savedToken,
            isAuthenticated: true,
            role: user.id_rol,
            sucursalId: String(sucursalId)
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
      role: userData.id_rol,
      sucursalId: typeof userData.id_comercio_asignado === 'object' ? userData.id_comercio_asignado?.id_comercio : (userData.id_comercio_asignado || userData.id_comercio || userData.sucursal_id),
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
