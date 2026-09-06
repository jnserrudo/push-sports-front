import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Package, Users, Store, Clock, RefreshCw, 
  MapPin, AlertCircle, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight,
  TrendingDown, ArrowRight, Monitor, ShieldCheck, Truck, Tag, Ticket, 
  AlertTriangle, CheckCircle2, ChevronRight, CircleDollarSign, CreditCard, RotateCcw, Info
} from 'lucide-react';
import PremiumSelect from '../../components/ui/PremiumSelect';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { dashboardService } from '../../services/dashboardService';

import DataTable from '../../components/ui/DataTable';
import api from '../../api/api';

// --- NUEVAS LIBRERÍAS DE ANALÍTICA Y ANIMACIÓN --- //
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import QueQueresHacer from '../../components/ui/QueQueresHacer';

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, trend, sub, link, loading, description }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  return (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
      <Link
        to={link}
        className="group bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-neutral-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand-cyan dark:hover:border-brand-cyan relative transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div className="absolute -right-3 -top-3 w-16 h-16 bg-neutral-50 dark:bg-gray-900 rounded-full group-hover:bg-brand-cyan/10 transition-colors duration-500" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-gray-900 flex items-center justify-center text-black dark:text-white group-hover:bg-brand-cyan group-hover:text-black transition-all duration-300 border border-neutral-200 dark:border-gray-700">
            <Icon size={14} strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1">
            {trend != null ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[8px] font-black uppercase tracking-widest border border-green-200">
                <TrendingUp size={10} strokeWidth={3} />+{trend}%
              </div>
            ) : null}
            {description && (
              <div 
                className="relative group/tooltip"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTooltipVisible(!tooltipVisible);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 dark:text-gray-500 hover:text-brand-cyan hover:bg-neutral-100 dark:hover:bg-gray-900 transition-colors focus:outline-none relative z-10"
                  aria-label="Ver información"
                >
                  <Info size={14} strokeWidth={2.5} />
                </button>
                <div className={`absolute bottom-full right-0 mb-2 w-44 p-2.5 bg-neutral-900 dark:bg-gray-900 text-white text-[10px] leading-relaxed rounded-lg shadow-2xl border border-neutral-700 transition-all duration-200 ${tooltipVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'} z-[100]`}>
                  {description}
                  <div className="absolute -bottom-1 right-2 w-2 h-2 bg-neutral-900 dark:bg-gray-900 transform rotate-45 border-b border-r border-neutral-700"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center min-h-[60px]">
          <span className="text-[9px] md:text-[10px] font-black text-neutral-500 dark:text-gray-400 uppercase tracking-widest block mb-0.5">{title}</span>
          {loading ? (
              <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 border-2 border-neutral-200 dark:border-gray-600 border-t-brand-cyan rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-wider">Cargando...</span>
              </div>
          ) : (
              <>
                <h3 className="text-xl md:text-2xl font-sport m-0 text-black dark:text-white uppercase leading-none tracking-tight">{value ?? '—'}</h3>
                {sub && <p className="text-[7px] md:text-[8px] font-black text-neutral-400 dark:text-gray-500 uppercase tracking-widest mt-1 m-0">{sub}</p>}
              </>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-gray-500 group-hover:text-brand-cyan transition-colors pt-2 border-t border-neutral-100 dark:border-gray-700 relative z-10">
          <span>Detalles</span>
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform text-neutral-300 dark:text-gray-600 group-hover:text-brand-cyan" strokeWidth={2.5} />
        </div>
      </Link>
  </motion.div>
  );
};

// ─── Quick Action Card ─────────────────────────────────────────────────────────
const QuickCard = ({ icon: Icon, title, desc, link, accent = false }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={link}
        className={`rounded-xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border transition-all duration-300 group cursor-pointer relative overflow-hidden h-full
          ${accent ? 'bg-neutral-900 border-neutral-800 hover:border-brand-cyan shadow-md' : 'bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-700 hover:border-brand-cyan hover:shadow-premium'}`}
      >
        <div className="flex items-center justify-between w-full sm:w-auto relative z-10">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 border
            ${accent ? 'bg-neutral-800 border-neutral-700 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-black group-hover:border-brand-cyan' : 'bg-neutral-50 border-neutral-200 text-black group-hover:bg-brand-cyan group-hover:text-black group-hover:border-brand-cyan'}`}
          >
            <Icon size={16} className="md:w-4 md:h-4" strokeWidth={2.5} />
          </div>
          <ChevronRight size={16} className={`sm:hidden flex-shrink-0 transition-transform group-hover:translate-x-1 ${accent ? 'text-brand-cyan' : 'text-black'}`} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
          <h3 className={`text-xs md:text-sm font-sport uppercase m-0 leading-none mb-1 group-hover:text-brand-cyan transition-colors ${accent ? 'text-white' : 'text-black dark:text-white'}`}>
            {title}
          </h3>
          <p className={`font-bold text-[8px] md:text-[9px] uppercase tracking-widest leading-tight m-0 ${accent ? 'text-neutral-400' : 'text-neutral-600 dark:text-gray-400'}`}>{desc}</p>
        </div>
        <ChevronRight size={16} className={`hidden sm:block flex-shrink-0 transition-transform group-hover:translate-x-1 ${accent ? 'text-brand-cyan' : 'text-black'}`} strokeWidth={2.5} />
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
    chartData: [], sucursalesDeuda: [],
    totalVentas: null, cantidadVentas: null, crecimientoVentas: 0,
    totalIngresos: null, cantidadLiquidaciones: null,
    productosTop: [], metodosPago: [], rendimientoSucursales: []
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const sucursales = await sucursalesService.getAll().catch(() => []);
      if (isSuperAdmin) setSucursalesOptions(sucursales);

      const filterId = isSuperAdmin ? (globalSucursalId === 'ALL' ? null : globalSucursalId) : sucursalId;

      const dashboardData = await dashboardService.getStats(filterId);

      if (!isSuperAdmin && sucursalId) {
         setCurrentSucursal(sucursales.find(s => s.id_comercio === sucursalId));
      }

      setStats({
        ventas: dashboardData.metrics.totalCaja,
        usuarios: dashboardData.metrics.usuariosCount,
        productos: dashboardData.metrics.productosCount,
        stockCritico: dashboardData.stockCritico || [],
        movimientos: [], // Optimizamos eliminando fetch redundante de movimientos
        chartData: dashboardData.chartData || [],
        sucursalesDeuda: dashboardData.sucursalesDeuda || [],
        totalVentas: dashboardData.metrics.totalVentas,
        cantidadVentas: dashboardData.metrics.cantidadVentas,
        crecimientoVentas: dashboardData.metrics.crecimientoVentas,
        totalIngresos: dashboardData.metrics.totalIngresos,
        cantidadLiquidaciones: dashboardData.metrics.cantidadLiquidaciones,
        productosTop: dashboardData.productosTop || [],
        metodosPago: dashboardData.metodosPago || [],
        rendimientoSucursales: dashboardData.rendimientoSucursales || []
      });

      console.log('📊 Frontend Stats:', {
        totalVentas: dashboardData.metrics.totalVentas,
        totalIngresos: dashboardData.metrics.totalIngresos,
        productosTop: dashboardData.productosTop?.length,
        metodosPago: dashboardData.metodosPago?.length
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { loadStats(); }, [isSuperAdmin, sucursalId, globalSucursalId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-2 rounded-lg border border-neutral-800 shadow-premium">
          <p className="font-bold text-[8px] uppercase tracking-widest text-neutral-400 mb-0.5">{`DÍA: ${label}`}</p>
          <p className="font-sport text-lg text-brand-cyan">{`$${payload[0].value.toLocaleString()}`}</p>
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
        className="space-y-2 md:space-y-4 max-w-[1400px] mx-auto pb-2 md:pb-4"
    >
      {/* ── HEADER ── */}
      <header className="relative bg-black rounded-lg border border-neutral-800 shadow-lg">
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,255,0.08),transparent_60%)]" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 md:gap-3 p-3 md:p-4">
          <div className="w-full lg:w-auto">
            <h1 className="text-white text-lg md:text-xl mb-0.5 font-sport uppercase leading-none">
              Panel <span className="text-brand-cyan">Analítico</span>
            </h1>
            <p className="text-neutral-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest leading-relaxed max-w-md m-0">
                Resumen operativo global. Visualiza métricas, cajas y alertas.
            </p>
          </div>
          {/* Controls */}
           <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            {isSuperAdmin && (
               <div className="w-48 md:w-56">
                 <PremiumSelect
                   placeholder="VISIÓN GLOBAL"
                   searchable={false}
                   options={[
                     { value: 'ALL', label: 'VISIÓN GLOBAL', subtitle: 'Todas las sedes' },
                     ...sucursalesOptions.map(suc => ({ value: suc.id_comercio, label: suc.nombre }))
                   ]}
                   value={globalSucursalId}
                   onChange={val => setGlobalSucursalId(val)}
                   className="!bg-neutral-900 !border-neutral-700 !py-1"
                 />
               </div>
            )}
            <button onClick={loadStats} className="bg-neutral-900 border border-neutral-700 text-white p-1.5 rounded-lg hover:bg-brand-cyan transition-colors">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <QueQueresHacer />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 shadow-sm p-3 md:p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 bg-brand-cyan/10 rounded flex items-center justify-center border border-brand-cyan/20">
                   <BarChart3 size={14} className="text-brand-cyan" />
                 </div>
                 <div>
                   <span className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.2em] block">RENDIMIENTO</span>
                   <h3 className="font-sport text-base uppercase m-0 leading-none text-black dark:text-white">
                       Volumen <span className="text-brand-cyan">Ventas</span>
                   </h3>
                 </div>
               </div>
          </div>
          
          <div className="h-40 md:h-48 w-full min-h-[150px] relative">
              {loading ? (
                  <div className="w-full h-full bg-neutral-50 rounded-lg animate-pulse flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Generando...</span>
                  </div>
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00c2ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00c2ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                      <XAxis dataKey="name" tick={{fontSize: 8, fill: '#a3a3a3', fontWeight: 900}} tickLine={false} axisLine={false} />
                      <YAxis 
                        tick={{fontSize: 8, fill: '#a3a3a3', fontWeight: 900}} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => val >= 1000 ? `$${(val/1000).toFixed(1)}k` : `$${val}`} 
                        domain={[0, 'auto']}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="ventas" stroke="#00c2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                    </AreaChart>
                  </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* Panel Liquidaciones en Vivo (Widget) */}
        {isSuperAdmin && (
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-lg p-3 md:p-4 flex flex-col relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-cyan/10 blur-3xl rounded-full" />
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-7 h-7 bg-black rounded flex items-center justify-center border border-neutral-800">
                     <CircleDollarSign size={14} className="text-brand-cyan" />
                   </div>
                   <div>
                     <span className="text-[9px] font-black text-brand-cyan uppercase tracking-[0.2em] block flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-brand-cyan rounded-full animate-pulse"></span> LIVE
                     </span>
                     <h3 className="font-sport text-lg uppercase m-0 leading-none text-white">Liquidaciones</h3>
                   </div>
                 </div>

                 <div className="flex-1 space-y-2">
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
                           <div key={sucursal.id_comercio} className="bg-black/50 border border-neutral-800 p-3 md:p-4 rounded-xl flex justify-between items-center gap-3 group-hover:border-neutral-700 transition-colors overflow-hidden">
                               <div className="flex items-center gap-3 flex-1 min-w-0">
                                   <Store size={14} className="text-neutral-500 flex-shrink-0" />
                                   <span className="text-sm font-bold text-neutral-300 uppercase tracking-wide truncate">{sucursal.nombre}</span>
                               </div>
                               <span className="font-sport text-brand-cyan text-lg md:text-xl flex-shrink-0">
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

      {/* ── EXPLICACIÓN DE MÉTRICAS ── */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 md:p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
            <Info size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">¿Cómo interpretar estas métricas?</h4>
            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-300 leading-relaxed m-0">
              <strong>Total Ventas:</strong> todo lo vendido en los últimos 30 días.{' '}
              <strong>Ingresos:</strong> dinero ya cobrado por liquidaciones.{' '}
              <strong>Caja Fuerte:</strong> saldo pendiente de liquidar. Si Caja Fuerte es $0 significa que ya cobraste todo.
            </p>
          </div>
        </div>
      </section>

      {/* ── MÉTRICAS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        <MetricCard 
          title="Total Ventas" 
          value={`$${Number(stats.totalVentas || 0).toLocaleString('es-AR')}`} 
          icon={ShoppingCart} 
          trend={!loading && stats.crecimientoVentas > 0 ? stats.crecimientoVentas : null}
          sub={`${stats.cantidadVentas || 0} ventas (30 días)`} 
          link="/dashboard/liquidaciones" 
          loading={loading} 
          description="Suma de todas las ventas realizadas en los últimos 30 días, incluyendo ventas activas y ya liquidadas."
        />
        <MetricCard 
          title="Ingresos" 
          value={`$${Number(stats.totalIngresos || 0).toLocaleString('es-AR')}`} 
          icon={DollarSign} 
          sub={`${stats.cantidadLiquidaciones || 0} liquidaciones (30 días)`} 
          link="/dashboard/liquidaciones" 
          loading={loading} 
          description="Dinero efectivamente cobrado a través de liquidaciones de sucursales en los últimos 30 días."
        />
        <MetricCard 
          title="Caja Fuerte" 
          value={`$${Number(stats.ventas || 0).toLocaleString('es-AR')}`} 
          icon={CircleDollarSign} 
          sub="Saldo pendiente" 
          link="/dashboard/liquidaciones" 
          loading={loading} 
          description="Saldo acumulado que aún no ha sido liquidado por las sucursales. Si es $0, todo el dinero ya fue cobrado."
        />
        {isSuperAdmin && (
            <MetricCard 
              title="Staff" 
              value={stats.usuarios || 0} 
              icon={Users} 
              sub="Operadores" 
              link="/dashboard/usuarios" 
              loading={loading} 
              description="Cantidad total de operadores/usuarios registrados en el sistema con acceso habilitado."
            />
        )}
        <MetricCard 
          title="Productos" 
          value={stats.productos || 0} 
          icon={Package} 
          sub="En catálogo" 
          link="/dashboard/productos" 
          loading={loading} 
          description="Total de productos activos disponibles en el catálogo del sistema."
        />
      </section>

      {/* ── MOVIMIENTOS RECIENTES ── */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 shadow-sm p-3 md:p-4 mt-3 md:mt-4">
         <div className="flex items-center gap-2 mb-3">
             <div className="w-6 h-6 bg-brand-cyan/10 rounded flex items-center justify-center border border-brand-cyan/20">
                 <Package size={14} className="text-brand-cyan" />
             </div>
             <h3 className="font-sport text-sm md:text-base uppercase leading-none text-black dark:text-white m-0">
                 Movimientos <span className="text-brand-cyan">Recientes</span>
             </h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
             {loading ? (
                 Array(3).fill(0).map((_, i) => (
                     <div key={i} className="h-14 bg-neutral-100 dark:bg-gray-700 animate-pulse rounded-lg w-full" />
                 ))
             ) : stats.movimientos.length === 0 ? (
                 <div className="py-8 text-center col-span-full border-2 border-dashed border-neutral-200 dark:border-gray-700 rounded-xl">
                     <Package size={24} className="mx-auto text-neutral-300 dark:text-gray-500 mb-2" />
                     <p className="text-[10px] font-bold text-neutral-400 dark:text-gray-400 uppercase tracking-widest">Sin movimientos recientes</p>
                 </div>
             ) : (
                 stats.movimientos.slice(0, 5).map((mov, i) => {
                     // Determinar el flujo basado en si es ingreso o salida
                     const isIngreso = mov.tipo === 'INGRESO' || mov.cantidad > 0;
                     const isVenta = mov.tipo === 'VENTA' || mov.tipo === 'EGRESO';
                     
                     let IconComponent = Box;
                     let colorClass = "bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-300 border-neutral-200 dark:border-gray-600";
                     let verb = "Movimiento";

                     if (isIngreso) {
                         IconComponent = Truck;
                         colorClass = "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
                         verb = "Stock Recibido";
                     } else if (isVenta) {
                         IconComponent = CreditCard;
                         colorClass = "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
                         verb = "Venta";
                     }

                     return (
                         <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="group flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-gray-700 hover:border-brand-cyan dark:hover:border-brand-cyan hover:shadow-sm transition-all duration-300 bg-neutral-50 dark:bg-gray-800"
                         >
                             <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${colorClass} group-hover:scale-110 duration-300`}>
                                     <IconComponent size={16} strokeWidth={2.5} />
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-gray-500">{verb}</span>
                                     <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white group-hover:text-brand-cyan transition-colors truncate max-w-[150px] md:max-w-[180px]">{mov.producto_nombre}</span>
                                     <span className="text-[9px] md:text-[10px] text-neutral-500 dark:text-gray-400 font-medium truncate max-w-[150px]">{mov.sucursal_nombre}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col items-end pl-2">
                                 <span className={`font-sport text-lg md:text-xl leading-none ${isIngreso ? 'text-emerald-500' : isVenta ? 'text-blue-500' : 'text-neutral-900 dark:text-white'}`}>
                                     {isIngreso ? '+' : '-'}{Math.abs(mov.cantidad)}
                                 </span>
                                 <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 dark:text-gray-500 mt-0.5">UND</span>
                             </div>
                         </motion.div>
                     );
                 })
             )}
         </div>
      </section>

      {/* ── PRODUCTOS MÁS VENDIDOS & MÉTODOS DE PAGO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
        {/* Productos Top */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 shadow-sm p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <Tag size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-sport text-sm md:text-base uppercase leading-none text-black dark:text-white m-0">
              Productos <span className="text-brand-cyan">Top</span>
            </h3>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-100 dark:bg-gray-700 animate-pulse rounded-lg" />
              ))
            ) : stats.productosTop.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-neutral-200 dark:border-gray-700 rounded-xl">
                <Package size={24} className="mx-auto text-neutral-300 dark:text-gray-500 mb-2" />
                <p className="text-[10px] font-bold text-neutral-400 dark:text-gray-400 uppercase tracking-widest">Sin datos de productos</p>
              </div>
            ) : (
              stats.productosTop.map((prod, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-neutral-50 dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 p-3 rounded-lg flex justify-between items-center group hover:border-brand-cyan transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-purple-800">
                      <span className="font-sport text-purple-600 dark:text-purple-400 text-sm">#{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black dark:text-white truncate">{prod.nombre}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-gray-400">{prod.cantidad} unidades</p>
                    </div>
                  </div>
                  <span className="font-sport text-brand-cyan text-sm md:text-base flex-shrink-0 ml-2">
                    ${Number(prod.total || 0).toLocaleString()}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Métodos de Pago */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 shadow-sm p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center border border-green-200 dark:border-green-800">
              <CreditCard size={14} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-sport text-sm md:text-base uppercase leading-none text-black dark:text-white m-0">
              Métodos de <span className="text-brand-cyan">Pago</span>
            </h3>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-100 dark:bg-gray-700 animate-pulse rounded-lg" />
              ))
            ) : stats.metodosPago.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-neutral-200 dark:border-gray-700 rounded-xl">
                <CreditCard size={24} className="mx-auto text-neutral-300 dark:text-gray-500 mb-2" />
                <p className="text-[10px] font-bold text-neutral-400 dark:text-gray-400 uppercase tracking-widest">Sin datos de pagos</p>
              </div>
            ) : (
              stats.metodosPago.map((metodo, idx) => {
                const totalGeneral = stats.metodosPago.reduce((sum, m) => sum + m.total, 0);
                const porcentaje = totalGeneral > 0 ? Math.round((metodo.total / totalGeneral) * 100) : 0;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-neutral-50 dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-black dark:text-white uppercase">{metodo.metodo}</span>
                      <span className="font-sport text-brand-cyan text-sm">
                        ${Number(metodo.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-neutral-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-cyan rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-neutral-500 dark:text-gray-400">{porcentaje}%</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-1">{metodo.cantidad} transacciones</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ── RENDIMIENTO POR SUCURSAL (Solo SuperAdmin) ── */}
      {isSuperAdmin && stats.rendimientoSucursales.length > 0 && (
        <section className="bg-gradient-to-br from-neutral-900 to-black rounded-xl border border-neutral-800 shadow-lg p-3 md:p-4 mt-3 md:mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-brand-cyan/20 rounded flex items-center justify-center border border-brand-cyan/30">
              <Store size={14} className="text-brand-cyan" />
            </div>
            <h3 className="font-sport text-sm md:text-base uppercase leading-none text-white m-0">
              Ranking de <span className="text-brand-cyan">Sucursales</span>
            </h3>
          </div>
          <div className="space-y-2">
            {stats.rendimientoSucursales.map((suc, idx) => (
              <motion.div
                key={suc.id_comercio}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black/50 border border-neutral-800 p-3 rounded-lg flex justify-between items-center group hover:border-brand-cyan transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-brand-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-cyan/30">
                    <span className="font-sport text-brand-cyan text-sm">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{suc.nombre}</p>
                    <p className="text-[10px] text-neutral-400">{suc.cantidad} ventas</p>
                  </div>
                </div>
                <span className="font-sport text-brand-cyan text-base md:text-lg flex-shrink-0 ml-2">
                  ${Number(suc.total || 0).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── ALERTAS DE STOCK CRÍTICO ── */}
      {stats.stockCritico.length > 0 && (
        <section className="bg-neutral-900 rounded-xl md:rounded-2xl p-3 md:p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-brand-cyan" size={18} />
            <h3 className="text-white font-sport text-base md:text-lg uppercase leading-none m-0">Stock <span className="text-brand-cyan">Crítico</span></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {stats.stockCritico.map((p, index) => (
              <div key={`${p.id_producto || 'p'}-${index}`} className="bg-black border border-neutral-800 p-2.5 md:p-3 rounded-lg flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <span className="text-white font-bold text-xs block truncate">{p.nombre}</span>
                  <span className="text-neutral-500 text-[8px] font-black uppercase tracking-widest block">Mín: {p.stock_minimo || 5}</span>
                </div>
                <div className="bg-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-md font-sport text-sm leading-none flex-shrink-0">
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