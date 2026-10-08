import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Package, Scan, RefreshCw, CircleDollarSign, PackageX, Tag, CreditCard,
  BarChart3, Info, ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import { cargarMisProductos } from '../../utils/misProductos';

const money = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

const Atajo = ({ to, icon: Icon, title, desc, accent }) => (
  <Link
    to={to}
    className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
      accent
        ? 'bg-neutral-900 border-neutral-900 hover:border-brand-cyan'
        : 'bg-white dark:bg-gray-800 border-neutral-200 dark:border-gray-700 hover:border-brand-cyan'
    }`}
  >
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-brand-cyan text-black' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
      <Icon size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <p className={`text-sm font-black uppercase tracking-tight m-0 ${accent ? 'text-white' : 'text-black dark:text-white'}`}>{title}</p>
      <p className={`text-[11px] font-bold m-0 mt-0.5 ${accent ? 'text-neutral-400' : 'text-neutral-500 dark:text-gray-400'}`}>{desc}</p>
    </div>
    <ArrowRight size={18} className={`shrink-0 transition-transform group-hover:translate-x-1 ${accent ? 'text-brand-cyan' : 'text-neutral-300'}`} />
  </Link>
);

const Dato = ({ titulo, valor, detalle, icon: Icon, to, loading }) => {
  const contenido = (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-brand-cyan" />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 m-0">{titulo}</p>
      </div>
      <p className="font-sport text-3xl text-black dark:text-white leading-none m-0">{loading ? '…' : valor}</p>
      <p className="text-[11px] font-bold text-neutral-500 dark:text-gray-400 m-0 mt-1">{detalle}</p>
    </>
  );
  const cls = 'block bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4';
  return to
    ? <Link to={to} className={`${cls} hover:border-brand-cyan transition-colors`}>{contenido}</Link>
    : <div className={cls}>{contenido}</div>;
};

const PanelSucursal = () => {
  const { user, sucursalId } = useAuthStore();
  const esSupervisor = user?.id_rol === 2;
  const nombreSucursal = user?.comercio_asignado?.nombre || 'tu sucursal';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [productos, setProductos] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, misProductos] = await Promise.all([
        dashboardService.getStats(sucursalId).catch(() => null),
        sucursalId ? cargarMisProductos(sucursalId).catch(() => []) : [],
      ]);
      setStats(data);
      setProductos(misProductos);
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => { load(); }, [load]);

  const conStock = useMemo(() => productos.filter(p => p.stock > 0), [productos]);
  const agotados = useMemo(() => productos.filter(p => p.stock <= 0), [productos]);
  const unidades = conStock.reduce((sum, p) => sum + p.stock, 0);

  const sinVentas = !loading && !stats;
  const msgSinVentas = 'No se pudieron cargar las ventas. Tocá Actualizar.';
  const msgVacio = sinVentas ? msgSinVentas : 'Todavía no hay ventas en los últimos 30 días.';
  const m = stats?.metrics || {};
  const chartData = stats?.chartData || [];
  const productosTop = stats?.productosTop || [];
  const metodosPago = stats?.metodosPago || [];
  const totalMetodos = metodosPago.reduce((sum, x) => sum + x.total, 0);

  return (
    <div className="space-y-3 md:space-y-4 max-w-[1400px] mx-auto pb-4">
      <header className="bg-black rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan m-0">{nombreSucursal}</p>
          <h1 className="text-white text-xl md:text-2xl font-sport uppercase leading-none m-0 mt-1">
            Hola, <span className="text-brand-cyan">{user?.nombre || 'equipo'}</span>
          </h1>
          <p className="text-neutral-400 text-xs font-bold m-0 mt-1">Este es el resumen de tu local.</p>
        </div>
        <button
          onClick={load}
          className="self-start md:self-auto flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-brand-cyan"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </header>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">¿Qué querés hacer?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Atajo to="/dashboard/ventas" icon={ShoppingCart} title="Vender" desc="Registrar Ventas: cobrás al cliente y el stock baja solo." accent />
          <Atajo to="/dashboard/inventario" icon={Package} title="Ver mis productos" desc="Lo que tenés, con sabores, precios y descarga en Excel." />
          <Atajo to="/dashboard/consulta-barcode" icon={Scan} title="Buscar por código" desc="Escaneás o escribís el código y ves precio y stock." />
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${esSupervisor ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
        <Dato
          titulo="Vendiste (30 días)"
          valor={sinVentas ? '—' : money(m.totalVentas)}
          detalle={sinVentas ? 'No se pudo cargar. Tocá Actualizar.' : `${m.cantidadVentas || 0} ventas · lo que cobraste al cliente`}
          icon={ShoppingCart}
          loading={loading}
        />
        <Dato
          titulo="Productos en tu local"
          valor={conStock.length}
          detalle={`${unidades} unidades en total`}
          icon={Package}
          to="/dashboard/inventario"
          loading={loading}
        />
        <Dato
          titulo="Se te agotaron"
          valor={agotados.length}
          detalle={agotados.length ? 'Pedile a Push Sport que te deje más' : 'Todavía tenés de todo'}
          icon={PackageX}
          to="/dashboard/inventario"
          loading={loading}
        />
        {esSupervisor && (
          <Dato
            titulo="Le debés a Push"
            valor={sinVentas ? '—' : money(m.totalCaja)}
            detalle={sinVentas ? 'No se pudo cargar. Tocá Actualizar.' : 'Push de tus ventas que todavía no pagaste'}
            icon={CircleDollarSign}
            to="/dashboard/liquidaciones"
            loading={loading}
          />
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 rounded-xl p-3 flex items-start gap-3">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold leading-relaxed m-0">
          <strong>Vendiste</strong> es lo que cobraste a tus clientes (precio de venta).
          {esSupervisor && <> <strong>Le debés a Push</strong> es lo que tenés que pagarle a Push Sport por esas ventas; se pone en 0 cuando Push te cobra.</>}
          {' '}Todo se actualiza solo cuando vendés o te llega mercadería.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <section className="lg:col-span-2 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-brand-cyan" />
            <h3 className="font-sport text-base uppercase m-0 text-black dark:text-white">Tus ventas · <span className="text-brand-cyan">últimos 7 días</span></h3>
          </div>
          <div className="h-44">
            {sinVentas ? (
              <p className="h-full flex items-center justify-center text-xs font-bold text-neutral-500 m-0">{msgSinVentas}</p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ventasSucursal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c2ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00c2ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 900 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#a3a3a3' }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)} />
                <Tooltip formatter={(v) => [money(v), 'Vendiste']} />
                <Area type="monotone" dataKey="ventas" stroke="#00c2ff" strokeWidth={3} fill="url(#ventasSucursal)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <PackageX size={16} className="text-red-500" />
            <h3 className="font-sport text-base uppercase m-0 text-black dark:text-white">Se te <span className="text-red-500">agotó</span></h3>
          </div>
          {agotados.length === 0 ? (
            <p className="text-xs font-bold text-neutral-500 m-0">No tenés productos agotados.</p>
          ) : (
            <ul className="space-y-1.5 m-0 p-0 list-none">
              {agotados.slice(0, 6).map(p => (
                <li key={p.id} className="text-xs font-bold text-black dark:text-white uppercase truncate">· {p.nombre}</li>
              ))}
              {agotados.length > 6 && (
                <li className="text-[11px] font-bold text-neutral-500">y {agotados.length - 6} más</li>
              )}
            </ul>
          )}
          <Link to="/dashboard/inventario" className="inline-flex items-center gap-1 mt-3 text-[10px] font-black uppercase tracking-widest text-brand-cyan hover:underline">
            Ver mis productos <ArrowRight size={12} />
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <section className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-purple-500" />
            <h3 className="font-sport text-base uppercase m-0 text-black dark:text-white">Lo que más vendiste <span className="text-neutral-400 text-xs">(30 días)</span></h3>
          </div>
          {productosTop.length === 0 ? (
            <p className="text-xs font-bold text-neutral-500 m-0">{msgVacio}</p>
          ) : (
            <div className="space-y-2">
              {productosTop.map((p, i) => (
                <div key={p.nombre} className="flex items-center justify-between gap-3 bg-neutral-50 dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 rounded-lg p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-black dark:text-white truncate m-0">#{i + 1} {p.nombre}</p>
                    <p className="text-[10px] text-neutral-500 m-0">{p.cantidad} unidades</p>
                  </div>
                  <span className="font-sport text-brand-cyan shrink-0">{money(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-green-600" />
            <h3 className="font-sport text-base uppercase m-0 text-black dark:text-white">Cómo te pagaron <span className="text-neutral-400 text-xs">(30 días)</span></h3>
          </div>
          {metodosPago.length === 0 ? (
            <p className="text-xs font-bold text-neutral-500 m-0">{msgVacio}</p>
          ) : (
            <div className="space-y-2">
              {metodosPago.map(x => {
                const pct = totalMetodos > 0 ? Math.round((x.total / totalMetodos) * 100) : 0;
                return (
                  <div key={x.metodo} className="bg-neutral-50 dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 rounded-lg p-2.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-black dark:text-white uppercase">{x.metodo}</span>
                      <span className="font-sport text-brand-cyan">{money(x.total)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-neutral-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-cyan rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-neutral-500">{pct}% · {x.cantidad} ventas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PanelSucursal;
