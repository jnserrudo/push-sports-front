import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/admin/Dashboard';
import Sucursales from './pages/admin/Sucursales';
import TiposComercio from './pages/admin/TiposComercio';
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
import Eventos from './pages/admin/Eventos';
import EventLanding from './pages/EventLanding';
import Hub from './pages/Hub';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Toaster from './components/ui/Toaster';
import { GlobalLoader } from './components/ui/GlobalLoader';
import Devoluciones from './pages/dashboard/Devoluciones';
const Reporteria = React.lazy(() => import('./pages/admin/Reporteria'));
import Perfil from './pages/dashboard/Perfil';
import PublicLayout from './components/layout/PublicLayout';
import Catalog from './pages/public/Catalog';
import Unsubscribe from './pages/public/Unsubscribe';
import PublicSucursales from './pages/public/Sucursales';

const App = () => {
  return (
    <Router>
      <GlobalLoader />
      <Toaster />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Evento landing público (QR) */}
        <Route path="/e/:id" element={<EventLanding />} />
        {/* Hub de enlaces sociales */}
        <Route path="/hub" element={<Hub />} />
        {/* Desuscripción de marketing (sin auth) */}
        <Route path="/unsubscribe" element={<Unsubscribe />} />

        {/* PORTAL PÚBLICO B2C — bajo /shop */}
        <Route path="/shop" element={<PublicLayout />}>
          <Route index element={<Catalog />} />
          <Route path="sucursales" element={<PublicSucursales />} />
        </Route>

        {/* PROTECTED ROUTES - UNIFIED DASHBOARD */}
        <Route 
            path="/dashboard" 
            element={<DashboardLayout allowedRoles={['SUPER_ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR']} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="tipos-comercio" element={<TiposComercio />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="marcas" element={<Marcas />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="envios" element={<Envios />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="reporteria" element={
            <React.Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-lg">Cargando...</div></div>}>
              <Reporteria />
            </React.Suspense>
          } />
          <Route path="liquidaciones" element={<Liquidaciones />} />
          <Route path="descuentos" element={<Descuentos />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="combos" element={<Combos />} />
          <Route path="ofertas" element={<Ofertas />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="devoluciones" element={<Devoluciones />} />
          <Route path="perfil" element={<Perfil />} />
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
