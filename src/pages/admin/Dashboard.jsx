import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Box, TrendingUp, Activity, Zap, BarChart3,
  ExternalLink, ArrowRight, Monitor, Store, ShieldCheck,
  Package, Truck, Tag, Ticket, AlertTriangle, CheckCircle2,
  ChevronRight, RefreshCw, CircleDollarSign, MapPin, Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';
import { usuariosService } from '../../services/genericServices';
import { auditoriaService } from '../../services/auditoriaService';
import { inventarioService } from '../../services/inventarioService';

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, trend, sub, link, loading }) => (
  <Link
    to={link}
    className="group bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden hover:border-black hover:shadow-md transition-all duration-300 block"
  >
    {/* Fondo decorativo */}
    <div className="absolute -right-6 -top-6 w-28 h-28 bg-neutral-50 rounded-full group-hover:bg-brand-cyan/5 transition-colors duration-500" />

    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black group-hover:bg-brand-cyan group-hover:text-white transition-all duration-300">
        <Icon size={22} strokeWidth={2} />
      </div>
    {loading ? (
      <div className="w-14 h-6 bg-neutral-100 rounded-md animate-pulse" />
    ) : trend != null ? (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[9px] font-bold uppercase tracking-widest border border-green-100">
        <TrendingUp size={11} />+{trend}%
      </div>
    ) : null}
    </div>

    <div className="relative z-10">
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">{title}</span>
      {loading ? (
        <div className="w-24 h-9 bg-neutral-100 rounded-lg animate-pulse mt-1" />
      ) : (
        <h3 className="text-3xl md:text-4xl font-sport m-0 text-black uppercase leading-none">{value ?? '—'}</h3>
      )}
      {sub && <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 m-0">{sub}</p>}
    </div>

    <div className="mt-6 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-300 group-hover:text-brand-cyan transition-colors pt-4 border-t border-neutral-100 relative z-10">
      <span>Ver Detalles</span>
      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

// ─── Quick Action Card ─────────────────────────────────────────────────────────
const QuickCard = ({ icon: Icon, title, desc, link, accent = false }) => (
  <Link
    to={link}
    className={`rounded-xl p-6 flex items-center gap-5 border transition-all duration-300 group cursor-pointer
      ${accent
        ? 'bg-neutral-900 border-neutral-800 hover:border-brand-cyan'
        : 'bg-white border-neutral-200 hover:border-brand-cyan hover:shadow-md'
      }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300
      ${accent
        ? 'bg-neutral-800 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-black'
        : 'bg-neutral-100 text-black group-hover:bg-brand-cyan group-hover:text-white'
      }`}
    >
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className={`text-base font-sport uppercase m-0 leading-none mb-1 group-hover:text-brand-cyan transition-colors ${accent ? 'text-white' : 'text-black'}`}>
        {title}
      </h3>
      <p className={`font-medium text-xs m-0 truncate ${accent ? 'text-neutral-500' : 'text-neutral-400'}`}>{desc}</p>
    </div>
    <ChevronRight size={16} className={`flex-shrink-0 group-hover:translate-x-1 transition-transform ${accent ? 'text-neutral-600' : 'text-neutral-300'}`} />
  </Link>
);

// ─── Alert Row ─────────────────────────────────────────────────────────────────
const AlertRow = ({ type, message, time, link }) => (
  <Link to={link} className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors group border border-transparent hover:border-neutral-200">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
      ${type === 'warning' ? 'bg-amber-50 text-amber-500' : type === 'ok' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
      {type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-black uppercase tracking-wide m-0 leading-snug">{message}</p>
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{time}</span>
    </div>
    <ArrowRight size={14} className="text-neutral-300 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
  </Link>
);

// ─── Dashboard Principal ───────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, sucursalId } = useAuthStore();
  const isSuperAdmin = user?.id_rol === 1;

  const [loading, setLoading] = useState(true);
  const [currentSucursal, setCurrentSucursal] = useState(null);
  const [stats, setStats] = useState({
    ventas: null, usuarios: null, productos: null,
    stockCritico: [], ultimasOps: [], sucursalesCount: 0
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const promises = [
        productosService.getAll().catch(() => []),
        usuariosService.getAll().catch(() => []),
        auditoriaService.getAll().catch(() => []),
      ];
      if (!isSuperAdmin && sucursalId) {
        promises.push(sucursalesService.getById(sucursalId).catch(() => null));
      }
      if (isSuperAdmin) {
        promises.push(inventarioService.getAll().catch(() => []));
      }

      const results = await Promise.all(promises);
      const productos  = results[0] || [];
      const usuarios   = results[1] || [];
      const auditoria  = results[2] || [];
      const extra      = results[3];

      if (!isSuperAdmin && extra) setCurrentSucursal(extra);

      // Stock crítico — productos con stock <= mínimo
      const criticos = productos.filter(p => (p.stock_total || 0) <= (p.stock_minimo || 5) && p.activo);

      // Últimas 4 operaciones de auditoría
      const ultimas = auditoria.slice(0, 4);

      // Ventas simuladas sobre saldo de sucursales (o dato fijo si no disponible)
      const sucursales = isSuperAdmin ? await sucursalesService.getAll().catch(() => []) : [];
      const totalCaja = sucursales.reduce((acc, s) => acc + Number(s.saldo_acumulado_mili || 0), 0);

      setStats({
        ventas: totalCaja > 0
          ? `$${(totalCaja / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })}K`
          : '$0',
        usuarios: usuarios.length,
        productos: productos.filter(p => p.activo).length,
        stockCritico: criticos.slice(0, 3),
        ultimasOps: ultimas,
        sucursalesCount: sucursales.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [isSuperAdmin, sucursalId]);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1400px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── HEADER ── */}
      <header className="relative bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
        {/* Textura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.03),transparent_60%)]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 md:p-10">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isSuperAdmin ? 'bg-brand-cyan' : 'bg-amber-400'}`} />
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-500">
                {isSuperAdmin ? 'MONITOREO GLOBAL · CORE SYSTEM' : `GESTIÓN DE SEDE · ${currentSucursal?.nombre || 'CARGANDO...'}`}
              </span>
            </div>

            <h1 className="text-white text-2xl md:text-5xl mb-3 font-sport uppercase leading-none">
              {saludo}, <br className="md:hidden" /> <span className="text-brand-cyan">{user?.nombre || 'Operador'}.</span>
            </h1>

            <p className="text-neutral-500 text-xs md:text-sm font-medium m-0 max-w-md">
              {isSuperAdmin
                ? 'Vista global del sistema PushSport. Todos los módulos activos.'
                : `Conectado a ${currentSucursal?.nombre || 'tu sede'}. Gestión de inventario local.`}
            </p>
          </div>

          {/* Acciones del header */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {isSuperAdmin && (
              <>
                <Link
                  to="/dashboard/productos"
                  className="bg-brand-cyan text-black px-5 py-4 md:py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Package size={14} /> NUEVO PRODUCTO
                </Link>
                <div className="flex gap-2">
                    <Link
                      to="/dashboard/auditoria"
                      className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-5 py-4 md:py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={14} /> AUDITORÍA
                    </Link>
                    <button
                      onClick={loadStats}
                      className="w-14 h-14 md:w-12 md:h-12 bg-neutral-900 border border-neutral-700 text-white rounded-xl flex items-center justify-center hover:bg-brand-cyan transition-colors"
                    >
                      <RefreshCw size={16} />
                    </button>
                </div>
              </>
            )}
            {!isSuperAdmin && (
              <Link
                to="/dashboard/productos"
                className="w-full sm:w-auto bg-brand-cyan text-black px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Box size={16} /> VER INVENTARIO
              </Link>
            )}
          </div>
        </div>

        {/* Barra de estado inferior */}
        <div className="relative z-10 border-t border-neutral-800 px-6 md:px-10 py-3 flex flex-wrap gap-x-6 md:gap-x-8 gap-y-2">
          {[
            { label: 'Sistema', value: 'Online' },
            { label: 'DB', value: 'OK' },
            { label: 'Sync', value: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-green-400" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-500">{item.label}:</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-300">{item.value}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── MÉTRICAS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard
          title={isSuperAdmin ? 'Caja Global' : 'Caja Sucursal'}
          value={stats.ventas}
          icon={CircleDollarSign}
          sub="Saldo acumulado AR$"
          link="/dashboard/liquidaciones"
          loading={loading}
        />
        <MetricCard
          title="Staff"
          value={stats.usuarios}
          icon={Users}
          sub="Operadores activos"
          link="/dashboard/usuarios"
          loading={loading}
        />
        <MetricCard
          title="Productos"
          value={stats.productos}
          icon={Package}
          sub="En catálogo master"
          link="/dashboard/productos"
          loading={loading}
        />
      </section>

      {/* ── FILA CENTRAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Panel de alertas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div>
                <span className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-widest block">ALERTAS</span>
                <h3 className="font-sport text-lg md:text-xl uppercase m-0 leading-none">Estado de Stock</h3>
              </div>
            </div>
            <Link
              to="/dashboard/productos"
              className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-cyan transition-colors"
            >
              VER TODO
            </Link>
          </div>

          <div className="px-2 md:px-4 py-2">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1,2].map(i => <div key={i} className="h-14 bg-neutral-50 rounded-xl animate-pulse" />)}
              </div>
            ) : stats.stockCritico.length > 0 ? (
              stats.stockCritico.slice(0, 3).map((p, i) => (
                <AlertRow
                  key={i}
                  type={p.stock_total === 0 ? 'error' : 'warning'}
                  message={`${p.nombre}: ${p.stock_total || 0} un.`}
                  time={`Crítico: ${p.stock_minimo || 5} un.`}
                  link="/dashboard/productos"
                />
              ))
            ) : (
              <div className="flex items-center gap-4 p-8">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wide m-0">Todo en orden</p>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest m-0">Sin alertas críticas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de últimas operaciones */}
        <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden shadow-md">
          <div className="absolute -top-8 -right-8 opacity-[0.04] pointer-events-none">
            <Activity size={140} />
          </div>

          <div className="relative z-10 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-brand-cyan" />
              <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-neutral-500">REAL-TIME LOG</span>
            </div>
            <h3 className="text-white font-sport text-xl md:text-2xl uppercase m-0 leading-tight">
              Log <span className="text-brand-cyan">en Vivo.</span>
            </h3>
          </div>

          <div className="relative z-10 flex-1 space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-10 bg-neutral-800 rounded-lg animate-pulse" />)
            ) : stats.ultimasOps.length > 0 ? (
              stats.ultimasOps.map((op, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-neutral-800 last:border-0">
                  <div className="w-1 h-1 rounded-full bg-brand-cyan mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white uppercase tracking-wide m-0 truncate">{op.accion || op.tipo || 'OPERACIÓN'}</p>
                    <p className="text-[8px] font-medium text-neutral-500 m-0 truncate">{op.entidad_afectada || op.descripcion}</p>
                  </div>
                  <span className="text-[8px] font-bold text-neutral-600 flex-shrink-0">
                    {new Date(op.fecha_hora || op.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Sin registros</p>
            )}
          </div>

          <Link
            to="/dashboard/auditoria"
            className="w-full py-4 mt-6 rounded-xl bg-white text-black font-black text-[9px] text-center uppercase tracking-widest hover:bg-brand-cyan transition-colors relative z-10"
          >
            AUDITORÍA COMPLETA
          </Link>
        </div>
      </div>

      {/* ── ACCESOS RÁPIDOS ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sport text-xl md:text-2xl uppercase text-black m-0 leading-none">
            Accesos <span className="text-brand-cyan">Rápidos.</span>
          </h2>
          <div className="w-10 h-0.5 bg-brand-cyan rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard icon={Zap} title="Ofertas" desc="Promociones activas" link="/dashboard/ofertas" />
          <QuickCard icon={Truck} title="Traslados" desc="Movimientos de stock" link="/dashboard/envios" />
          <QuickCard icon={Activity} title="Stock" desc="Kardex de movimientos" link="/dashboard/movimientos" />
          <QuickCard icon={Package} title="Productos" desc="Gestión de catálogo" link="/dashboard/productos" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <QuickCard icon={Monitor} title="Sucursales" desc="Sedes conectadas" link="/dashboard/sucursales" accent />
          <QuickCard icon={Users} title="Staff" desc="Operadores del sistema" link="/dashboard/usuarios" accent />
          <QuickCard icon={Wallet} title="Caja" desc="Ventas y cierres" link="/dashboard/liquidaciones" accent />
          <QuickCard icon={Activity} title="Auditoria" desc="Logs de seguridad" link="/dashboard/auditoria" accent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;