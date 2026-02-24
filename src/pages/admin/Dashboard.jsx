import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  Store, 
  Box, 
  TrendingUp, 
  PackageSearch,
  Truck,
  Zap
} from 'lucide-react';
import { productosService } from '../../services/productosService';
import { sucursalesService } from '../../services/sucursalesService';
import { 
    usuariosService, 
    combosService, 
    proveedoresService, 
    ofertasService 
} from '../../services/genericServices';

const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase tracking-widest text-sm text-neutral-500">{title}</h3>
            <div className="bg-neutral-100 p-2 border-2 border-black">
                <Icon size={24} className="text-black" />
            </div>
        </div>
        <div>
            <span className="text-4xl font-black italic tracking-tighter block">{value}</span>
            {trend && (
                <span className={`text-xs font-bold uppercase tracking-wider ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {trend} vs mes anterior
                </span>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { user, role } = useAuthStore();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({
        productos: 0,
        sucursales: 0,
        usuarios: 0,
        combos: 0,
        proveedores: 0,
        ofertas: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Si es vendedor, no necesitamos cargar métricas globales pesadas
                if (role === 'VENDEDOR') {
                    setIsLoading(false);
                    return;
                }

                const [prods, sucs, usrs, cbos, provs, oferts] = await Promise.all([
                    productosService.getAll(),
                    sucursalesService.getAll(),
                    usuariosService.getAll(),
                    combosService.getAll(),
                    proveedoresService.getAll(),
                    ofertasService.getAll()
                ]);

                setMetrics({
                    productos: prods.length,
                    sucursales: sucs.length,
                    usuarios: usrs.length,
                    combos: cbos.length,
                    proveedores: provs.length,
                    ofertas: oferts.length
                });
            } catch (error) {
                console.error("Error cargando métricas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [role]);

    if (isLoading) {
         return (
             <div className="flex items-center justify-center min-h-[400px]">
                 <div className="text-center font-black text-2xl uppercase tracking-widest animate-pulse border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                     Calculando Métricas...
                 </div>
             </div>
         );
    }

    // --- VISTA PARA VENDEDOR ---
    if (role === 'VENDEDOR') {
        return (
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="border-b-4 border-black pb-6">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                        Punto de Trabajo
                    </h2>
                    <p className="text-neutral-500 font-bold tracking-widest uppercase text-sm">
                        Turno Activo / <span className="text-black">Sucursal #{user?.sucursal_id}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Acción Principal */}
                    <div className="bg-black text-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center justify-center space-y-6">
                        <Store size={64} strokeWidth={2.5} />
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">Terminal de Ventas</h3>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">
                            Inicia una nueva transacción en el sistema POS
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/pos')}
                            className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-sm border-2 border-white hover:bg-black hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            Ir a la Caja (POS)
                        </button>
                    </div>

                    {/* Resumen del día */}
                    <div className="space-y-6">
                        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                             <h4 className="font-black uppercase tracking-widest text-xs border-b-2 border-black pb-2 mb-4">Información de Hoy</h4>
                             <div className="space-y-4">
                                 <div className="flex justify-between items-end">
                                     <span className="text-neutral-500 font-bold uppercase text-[10px]">Ventas Realizadas</span>
                                     <span className="text-2xl font-black">12</span>
                                 </div>
                                 <div className="flex justify-between items-end">
                                     <span className="text-neutral-500 font-bold uppercase text-[10px]">Total Recaudado</span>
                                     <span className="text-2xl font-black text-green-600 font-mono">$45,200</span>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-neutral-900 text-white p-6 border-4 border-black border-dashed">
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Aviso del Sistema</p>
                             <p className="text-sm font-bold italic">"Recordá solicitar el DNI en ventas superiores a $50,000 para validación de impuestos."</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA PARA ADMIN / SUPER_ADMIN ---
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="border-b-4 border-black pb-6 flex justify-between items-end flex-wrap gap-4">
                 <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                        {role === 'ADMIN_SUCURSAL' ? 'Panel de Sucursal' : 'Dashboard Operativo'}
                    </h2>
                    <p className="text-neutral-500 font-bold tracking-widest uppercase text-sm">
                        Visión General / <span className="text-black">{role.replace('_', ' ')}</span>
                    </p>
                 </div>
                 
                 <div className="bg-black text-white p-4 font-mono text-xs border-2 border-transparent">
                     <p><span className="text-neutral-400">OPERADOR:</span> {user?.nombre} {user?.apellido}</p>
                     <p><span className="text-neutral-400">ESTADO:</span> EN LÍNEA</p>
                 </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Productos" 
                    value={metrics.productos} 
                    icon={Box} 
                    trend="+12%" 
                />
                <MetricCard 
                    title="Sucursales Activas" 
                    value={metrics.sucursales} 
                    icon={Store} 
                />
                <MetricCard 
                    title="Usuarios/Vendedores" 
                    value={metrics.usuarios} 
                    icon={Users} 
                    trend="+3" 
                />
                <MetricCard 
                    title="Ofertas & Combos" 
                    value={metrics.ofertas + metrics.combos} 
                    icon={Zap} 
                />
                
                {role === 'SUPER_ADMIN' && (
                    <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center text-center col-span-1 md:col-span-2 space-y-4">
                        <TrendingUp size={48} className="mb-2" />
                        <h3 className="font-black text-2xl uppercase italic tracking-tighter">Panel de Rentabilidad</h3>
                        <p className="font-bold text-neutral-400 text-sm uppercase tracking-widest max-w-xs">
                            Análisis global de costos y márgenes de ganancia.
                        </p>
                        <button className="mt-4 border-2 border-white px-6 py-3 font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
                            Generar Reporte Mensual
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mt-12 pt-8 border-t-4 border-black grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-black pl-4">
                    <h4 className="font-black uppercase tracking-widest mb-2 text-xs">Advertencias</h4>
                    <ul className="space-y-2 text-xs font-bold text-neutral-500 uppercase list-none">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500"/> 2 Productos con stock crítico</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500"/> Liquidación pendiente Sede #1</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
