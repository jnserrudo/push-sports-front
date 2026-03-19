import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Box, TrendingUp, Activity, Zap, BarChart3,
  ExternalLink, ArrowRight, Monitor, Store, ShieldCheck,
  Package, Truck, Tag, Ticket, AlertTriangle, CheckCircle2,
  ChevronRight, RefreshCw, CircleDollarSign, MapPin, Clock, CreditCard, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';
import { usuariosService } from '../../services/genericServices';
import { auditoriaService } from '../../services/auditoriaService';
import { inventarioService } from '../../services/inventarioService';
import { enviosService } from '../../services/enviosService';
import { devolucionesService } from '../../services/devolucionesService';
import DataTable from '../../components/ui/DataTable';
import api from '../../api/api';

// --- NUEVAS LIBRERÍAS DE ANALÍTICA Y ANIMACIÓN --- //
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, trend, sub, link, loading }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={link}
        className="group bg-black md:bg-white p-3 md:p-8 rounded-xl md:rounded-2xl border border-black md:border-neutral-200 shadow-md relative overflow-hidden transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-neutral-900 md:bg-neutral-50 rounded-full group-hover:bg-brand-cyan/10 transition-colors duration-500" />
        <div className="flex justify-between items-start mb-2 md:mb-6 relative z-10">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-neutral-900 md:bg-neutral-100 flex items-center justify-center text-brand-cyan md:text-black group-hover:bg-brand-cyan group-hover:text-black transition-all duration-300 border border-neutral-800 md:border-neutral-200">
            <Icon size={16} className="md:w-5 md:h-5" strokeWidth={3} />
          </div>
          {trend != null ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm">
              <TrendingUp size={12} strokeWidth={3} />+{trend}%
            </div>
          ) : null}
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <span className="text-[9px] md:text-xs font-black text-neutral-400 md:text-neutral-900 uppercase tracking-widest block mb-0.5 md:mb-1">{title}</span>
          {loading ? (
              <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 border-2 border-neutral-800 border-t-brand-cyan rounded-full animate-spin" />
              </div>
          ) : (
              <h3 className="text-2xl md:text-4xl font-sport m-0 text-white md:text-black uppercase leading-none tracking-tight">{value ?? '—'}</h3>
          )}
          {!loading && sub && <p className="text-[8px] md:text-[11px] font-black text-neutral-500 md:text-neutral-600 uppercase tracking-widest mt-1 m-0">{sub}</p>}
        </div>
        <div className="mt-2 md:mt-6 flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 md:text-neutral-800 group-hover:text-brand-cyan transition-colors pt-2 md:pt-4 border-t border-neutral-800 md:border-neutral-200 relative z-10">
          <span>Ver Detalles</span>
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform text-neutral-400 group-hover:text-brand-cyan md:text-black" strokeWidth={3} />
        </div>
      </Link>
  </motion.div>
);

// ─── Quick Action Card ─────────────────────────────────────────────────────────
const QuickCard = ({ icon: Icon, title, desc, link, accent = false }) => (
  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Link
        to={link}
        className={`rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 border transition-all duration-300 group cursor-pointer relative overflow-hidden h-full
          ${accent ? 'bg-neutral-900 border-neutral-800 hover:border-brand-cyan shadow-md' : 'bg-white border-neutral-200 hover:border-brand-cyan hover:shadow-premium'}`}
      >
        <div className="flex items-center justify-between w-full sm:w-auto relative z-10">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 border
            ${accent ? 'bg-neutral-800 border-neutral-700 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-black group-hover:border-brand-cyan' : 'bg-neutral-50 border-neutral-200 text-black group-hover:bg-brand-cyan group-hover:text-black group-hover:border-brand-cyan'}`}
          >
            <Icon size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
          </div>
          <ChevronRight size={18} className={`sm:hidden flex-shrink-0 transition-transform group-hover:translate-x-1 ${accent ? 'text-brand-cyan' : 'text-black'}`} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
          <h3 className={`text-sm md:text-base font-sport uppercase m-0 leading-none mb-1 md:mb-1.5 group-hover:text-brand-cyan transition-colors ${accent ? 'text-white' : 'text-black'}`}>
            {title}
          </h3>
          <p className={`font-bold text-[9px] md:text-[10px] uppercase tracking-widest leading-tight m-0 ${accent ? 'text-neutral-400' : 'text-neutral-600'}`}>{desc}</p>
        </div>
        <ChevronRight size={18} className={`hidden sm:block flex-shrink-0 transition-transform group-hover:translate-x-1 ${accent ? 'text-brand-cyan' : 'text-black'}`} strokeWidth={2.5} />
      </Link>
  </motion.div>
);

// ─── Dashboard Principal ───────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, sucursalId } = useAuthStore();
  const isSuperAdmin = user?.id_rol === 1;

  const [loading, setLoading] = useState(true);
  const [currentSucursal, setCurrentSucursal] = useState(null);
  const [sucursalesOptions, setSucursalesOptions] = useState([]);
  const [globalSucursalId, setGlobalSucursalId] = useState('ALL');

  const [stats, setStats] = useState({
    ventas: null, usuarios: null, productos: null,
    stockCritico: [], movimientos: [], sucursalesCount: 0,
    chartData: [], sucursalesDeuda: []
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const sucursales = await sucursalesService.getAll().catch(() => []);
      if (isSuperAdmin) setSucursalesOptions(sucursales);

      const filterId = isSuperAdmin ? (globalSucursalId === 'ALL' ? null : Number(globalSucursalId)) : sucursalId;

      const [productos, usuarios, todosMovimientos] = await Promise.all([
        productosService.getAll().catch(() => []),
        usuariosService.getAll().catch(() => []),
        enviosService.getAll().catch(() => []),
      ]);

      if (!isSuperAdmin && sucursalId) {
         setCurrentSucursal(sucursales.find(s => s.id_comercio === sucursalId));
      }

      const movimientosFiltrados = filterId 
        ? todosMovimientos.filter(m => m.sucursal_id === filterId || m.id_comercio === filterId)
        : todosMovimientos;

      const criticos = productos.filter(p => (p.stock_total || 0) <= (p.stock_minimo || 5) && p.activo);

      const sucursalesCalculo = filterId ? sucursales.filter(s => s.id_comercio === filterId) : sucursales;
      const totalCaja = sucursalesCalculo.reduce((acc, s) => acc + Number(s.saldo_acumulado_mili || 0), 0);

      // Top 3 deudas de sucursales (para el widget de Liquidaciones en vivo)
      const sucursalesDeuda = [...sucursalesCalculo]
        .sort((a, b) => Number(b.saldo_acumulado_mili || 0) - Number(a.saldo_acumulado_mili || 0))
        .slice(0, 3);

      // ── Ventas reales de los últimos 7 días ──
      let chartData = [];
      try {
        const ventasRes = await api.get('/ventas');
        const todasVentas = ventasRes.data || [];

        // Filtrar por comercio si aplica
        const ventasFiltradas = filterId
          ? todasVentas.filter(v => v.id_comercio === filterId)
          : todasVentas;

        // Agrupar por día de la semana (últimos 7 días)
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const saldoPorDia = {};
        dias.forEach(d => { saldoPorDia[d] = 0; });

        const ahora = new Date();
        const haceUnaSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

        ventasFiltradas.forEach(v => {
          const fecha = new Date(v.fecha_hora);
          if (fecha >= haceUnaSemana) {
            const diaNombre = dias[fecha.getDay()];
            saldoPorDia[diaNombre] += parseFloat(v.total_venta || 0);
          }
        });

        // Ordenar desde hoy hacia atrás
        const hoy = ahora.getDay();
        chartData = [];
        for (let i = 6; i >= 0; i--) {
          const diaIdx = (hoy - i + 7) % 7;
          chartData.push({ name: dias[diaIdx], ventas: Math.round(saldoPorDia[dias[diaIdx]]) });
        }
      } catch {
        chartData = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => ({ name: d, ventas: 0 }));
      }

      setStats({
        ventas: totalCaja > 0 ? `$${(totalCaja / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })}K` : '$0',
        usuarios: usuarios.length,
        productos: productos.filter(p => p.activo).length,
        stockCritico: criticos.slice(0, 3),
        movimientos: movimientosFiltrados,
        sucursalesCount: sucursales.length,
        chartData,
        sucursalesDeuda
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [isSuperAdmin, sucursalId, globalSucursalId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 rounded-xl border border-neutral-800 shadow-premium">
          <p className="font-bold text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{`DÍA: ${label}`}</p>
          <p className="font-sport text-xl text-brand-cyan">{`$${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 md:space-y-8 max-w-[1400px] mx-auto pb-6 md:pb-12"
    >
      {/* ── HEADER ── */}
      <header className="relative bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,255,0.08),transparent_60%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 p-5 md:p-10">
          <div className="w-full lg:w-auto">
            <h1 className="text-white text-3xl md:text-5xl mb-3 font-sport uppercase leading-none">
              Panel <span className="text-brand-cyan">Analítico.</span>
            </h1>
            <p className="text-neutral-400 text-xs md:text-sm font-bold uppercase tracking-widest leading-loose max-w-md">
                Auditoría en tiempo real y transacciones métricas.
            </p>
          </div>
          {/* Controls */}
           <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {isSuperAdmin && (
              <div className="w-full flex items-center bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3">
                 <Store size={14} className="text-brand-cyan mr-3" />
                 <select
                   value={globalSucursalId}
                   onChange={(e) => setGlobalSucursalId(e.target.value)}
                   className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer flex-1"
                 >
                   <option value="ALL">VISIÓN GLOBAL</option>
                   {sucursalesOptions.map(suc => (
                     <option key={suc.id_comercio} value={suc.id_comercio}>{suc.nombre}</option>
                   ))}
                 </select>
              </div>
            )}
            <button onClick={loadStats} className="bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl hover:bg-brand-cyan transition-colors">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand-cyan/10 rounded-lg flex items-center justify-center border border-brand-cyan/20">
                   <BarChart3 size={18} className="text-brand-cyan" />
                 </div>
                 <div>
                   <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] block mb-1">RENDIMIENTO SEMANAL</span>
                   <h3 className="font-sport text-xl uppercase m-0 leading-none text-black">
                       Volumen de <span className="text-brand-cyan">Ventas.</span>
                   </h3>
                 </div>
               </div>
          </div>
          
          <div className="h-64 md:h-80 w-full">
              {loading ? (
                  <div className="w-full h-full bg-neutral-50 rounded-xl animate-pulse flex items-center justify-center">
                      <span className="text-xs font-black uppercase tracking-widest text-neutral-300">Generando Gráfica...</span>
                  </div>
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00c2ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00c2ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#a3a3a3', fontWeight: 900}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#a3a3a3', fontWeight: 900}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="ventas" stroke="#00c2ff" strokeWidth={4} fillOpacity={1} fill="url(#colorVentas)" />
                    </AreaChart>
                  </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* Panel Liquidaciones en Vivo (Widget) */}
        {isSuperAdmin && (
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl p-5 md:p-8 flex flex-col relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-cyan/10 blur-3xl rounded-full" />
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-neutral-800">
                     <CircleDollarSign size={18} className="text-brand-cyan" />
                   </div>
                   <div>
                     <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em] block mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span> LIVE TRACKER
                     </span>
                     <h3 className="font-sport text-xl md:text-2xl uppercase m-0 leading-none text-white">Liquidaciones</h3>
                   </div>
                 </div>

                 <div className="flex-1 space-y-3">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-14 bg-neutral-800 animate-pulse rounded-xl w-full" />
                        ))
                    ) : stats.sucursalesDeuda.length === 0 ? (
                        <div className="py-8 text-center text-neutral-500 font-bold text-xs uppercase tracking-widest">
                            No hay saldos pendientes
                        </div>
                    ) : (
                        stats.sucursalesDeuda.map((sucursal) => (
                           <div key={sucursal.id_comercio} className="bg-black/50 border border-neutral-800 p-3 md:p-4 rounded-xl flex justify-between items-center group-hover:border-neutral-700 transition-colors">
                               <div className="flex items-center gap-3">
                                   <Store size={14} className="text-neutral-500" />
                                   <span className="text-sm font-bold text-neutral-300 uppercase tracking-wide truncate max-w-[120px] md:max-w-[180px]">{sucursal.nombre}</span>
                               </div>
                               <span className="font-sport text-brand-cyan text-lg md:text-xl">
                                   ${Number(sucursal.saldo_acumulado_mili || 0).toLocaleString()}
                               </span>
                           </div>
                        ))
                    )}
                 </div>

                 <Link to="/dashboard/liquidaciones" className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-brand-cyan transition-colors">
                     <span>Ir a Tablero Completo</span>
                     <ArrowRight size={14} />
                 </Link>
               </div>
            </div>
        )}
      </div>

      {/* ── MÉTRICAS ── */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <MetricCard title="Caja Fuerte" value={stats.ventas} icon={CreditCard} sub="Saldo acumulado" link="/dashboard/liquidaciones" loading={loading} />
        {isSuperAdmin && (
            <MetricCard title="Staff" value={stats.usuarios} icon={Users} sub="Operadores" link="/dashboard/usuarios" loading={loading} />
        )}
        <MetricCard title="Productos" value={loading ? '-' : stats.productos} icon={Package} sub="Catálogo Activo" link="/dashboard/productos" loading={loading} />
      </section>

      {/* ── LIVE TRACKER: FLUJO DE INVENTARIO (CRÍTICO PARA UX) ── */}
      <section className="mt-8 md:mt-12 bg-white rounded-2xl md:rounded-[2rem] border-2 border-neutral-100 shadow-sm p-5 md:p-8 overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-neutral-100 pb-4 mb-6 gap-4">
             <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block mb-1">MONITOREO EN TIEMPO REAL</span>
                 <h2 className="text-xl md:text-2xl font-sport uppercase m-0 leading-none text-black">
                     Flujo de <span className="text-brand-cyan">Inventario.</span>
                 </h2>
                 <p className="text-xs text-neutral-500 font-medium mt-1">El ciclo de vida de tus productos: Asignaciones, Ventas y Alertas.</p>
             </div>
             <Link to="/dashboard/movimientos" className="text-[10px] font-black text-brand-cyan uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1">
                 Ver Historial Completo <ArrowRight size={12} />
             </Link>
         </div>

         <div className="space-y-3 md:space-y-4">
             {loading ? (
                 Array(3).fill(0).map((_, i) => (
                     <div key={i} className="h-16 bg-neutral-50 animate-pulse rounded-xl w-full" />
                 ))
             ) : stats.movimientos.length === 0 ? (
                 <div className="py-10 text-center">
                     <Package size={32} className="mx-auto text-neutral-200 mb-3" />
                     <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Sin movimientos recientes</p>
                 </div>
             ) : (
                 stats.movimientos.slice(0, 5).map((mov, i) => {
                     // Determinar el flujo basado en si es ingreso o salida
                     const isIngreso = mov.tipo === 'INGRESO' || mov.cantidad > 0; // Asumiendo que 'Envío' es ingreso
                     const isVenta = mov.tipo === 'VENTA' || mov.tipo === 'EGRESO';
                     
                     let IconComponent = Box;
                     let colorClass = "bg-neutral-100 text-neutral-600 border-neutral-200";
                     let verb = "Movimiento Registrado";

                     if (isIngreso) {
                         IconComponent = Truck;
                         colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
                         verb = "Stock Recibido (Admin)";
                     } else if (isVenta) {
                         IconComponent = CreditCard;
                         colorClass = "bg-blue-50 text-blue-600 border-blue-200";
                         verb = "Venta Procesada (Local)";
                     }

                     return (
                         <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-brand-cyan hover:shadow-md transition-all duration-300 bg-white"
                         >
                             <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${colorClass} group-hover:scale-110 duration-300`}>
                                     <IconComponent size={20} strokeWidth={2.5} />
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-0.5">{verb}</span>
                                     <span className="font-bold text-sm text-neutral-900 group-hover:text-brand-cyan transition-colors">{mov.producto_nombre}</span>
                                     <span className="text-xs text-neutral-500 font-medium">{mov.sucursal_nombre} • {new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col items-end">
                                 <span className={`font-sport text-lg md:text-xl leading-none ${isIngreso ? 'text-emerald-500' : isVenta ? 'text-blue-500' : 'text-neutral-900'}`}>
                                     {isIngreso ? '+' : '-'}{Math.abs(mov.cantidad)}
                                 </span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">UNIDADES</span>
                             </div>
                         </motion.div>
                     );
                 })
             )}
         </div>
      </section>

      {/* ── ALERTAS DE STOCK CRÍTICO ── */}
      {stats.stockCritico.length > 0 && (
        <section className="bg-neutral-900 rounded-2xl md:rounded-[2rem] p-5 md:p-8 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-brand-cyan" size={24} />
            <h3 className="text-white font-sport text-xl uppercase leading-none m-0">Stock <span className="text-brand-cyan">Crítico</span></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stats.stockCritico.map(p => (
              <div key={p.id_producto} className="bg-black border border-neutral-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold text-sm block">{p.nombre}</span>
                  <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest block mt-1">Mínimo: {p.stock_minimo || 5}</span>
                </div>
                <div className="bg-brand-cyan/20 text-brand-cyan px-3 py-1.5 rounded-lg font-sport text-lg leading-none">
                  {p.stock_total || 0}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Dashboard;