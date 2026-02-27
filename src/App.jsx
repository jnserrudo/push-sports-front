import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/admin/Dashboard';
import Sucursales from './pages/admin/Sucursales';
import Productos from './pages/admin/Productos';
import Categorias from './pages/admin/Categorias';
import Marcas from './pages/admin/Marcas';
import Usuarios from './pages/admin/Usuarios';
import Descuentos from './pages/admin/Descuentos';
import Envios from './pages/admin/Envios';
import Auditoria from './pages/admin/Auditoria';
import Proveedores from './pages/admin/Proveedores';
import Combos from './pages/admin/Combos';
import Ofertas from './pages/admin/Ofertas';
import Liquidaciones from './pages/dashboard/Liquidaciones';
import POS from './pages/pos/POS';
import Inventario from './pages/admin/Inventario';
import Movimientos from './pages/admin/Movimientos';
import Register from './pages/Register';
import Toaster from './components/ui/Toaster';
import Devoluciones from './pages/dashboard/Devoluciones';

const App = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES - UNIFIED DASHBOARD */}
        <Route 
            path="/dashboard" 
            element={<DashboardLayout allowedRoles={['SUPER_ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR']} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="marcas" element={<Marcas />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="envios" element={<Envios />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="liquidaciones" element={<Liquidaciones />} />
          <Route path="descuentos" element={<Descuentos />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="combos" element={<Combos />} />
          <Route path="ofertas" element={<Ofertas />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="devoluciones" element={<Devoluciones />} />
          {/* POS also accessible under /dashboard for Vendedores */}
          <Route path="pos" element={<POS />} />
        </Route>

        {/* LEGACY / REDIRECTS */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/pos" element={<Navigate to="/dashboard/pos" replace />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
