import { create } from 'zustand';

// Roles disponibles: 'SUPER_ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR'

// Helper to get initial state from localStorage
const getInitialState = () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedImpersonatedUser = localStorage.getItem('impersonatedUser');
    const savedRealUser = localStorage.getItem('realUser');
    const savedIsImpersonating = localStorage.getItem('isImpersonating');
    
    if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        const rawSucId = user.id_comercio_asignado || user.sucursal_id;
        const sucursalId = typeof rawSucId === 'object' ? rawSucId?.id_comercio : rawSucId;

        return {
            user,
            token: savedToken,
            isAuthenticated: true,
            role: user.id_rol,
            sucursalId: String(sucursalId),
            // Estado de impersonación
            isImpersonating: savedIsImpersonating === 'true',
            impersonatedUser: savedImpersonatedUser ? JSON.parse(savedImpersonatedUser) : null,
            realUser: savedRealUser ? JSON.parse(savedRealUser) : null
        };
    }
    
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        role: null,
        sucursalId: null,
        isImpersonating: false,
        impersonatedUser: null,
        realUser: null
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
      isImpersonating: false,
      impersonatedUser: null,
      realUser: null
    });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('realUser');
    localStorage.removeItem('isImpersonating');
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      sucursalId: null,
      token: null,
      isImpersonating: false,
      impersonatedUser: null,
      realUser: null
    });
  },

  // Iniciar impersonación
  startImpersonation: (impersonatedUserData, realUserData, token) => {
    localStorage.setItem('user', JSON.stringify(impersonatedUserData));
    localStorage.setItem('token', token);
    localStorage.setItem('impersonatedUser', JSON.stringify(impersonatedUserData));
    localStorage.setItem('realUser', JSON.stringify(realUserData));
    localStorage.setItem('isImpersonating', 'true');
    
    const rawSucId = impersonatedUserData.id_comercio_asignado || impersonatedUserData.sucursal_id;
    const sucursalId = typeof rawSucId === 'object' ? rawSucId?.id_comercio : rawSucId;
    
    set({
      user: impersonatedUserData,
      token: token,
      role: impersonatedUserData.id_rol,
      sucursalId: String(sucursalId),
      isImpersonating: true,
      impersonatedUser: impersonatedUserData,
      realUser: realUserData
    });
  },

  // Detener impersonación
  stopImpersonation: (adminUserData, token) => {
    localStorage.setItem('user', JSON.stringify(adminUserData));
    localStorage.setItem('token', token);
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('realUser');
    localStorage.removeItem('isImpersonating');
    
    const rawSucId = adminUserData.id_comercio_asignado || adminUserData.sucursal_id;
    const sucursalId = typeof rawSucId === 'object' ? rawSucId?.id_comercio : rawSucId;
    
    set({
      user: adminUserData,
      token: token,
      role: adminUserData.id_rol,
      sucursalId: String(sucursalId),
      isImpersonating: false,
      impersonatedUser: null,
      realUser: null
    });
  },
}));
