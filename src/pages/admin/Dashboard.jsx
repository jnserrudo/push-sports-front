import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  People, 
  Shop, 
  Box, 
  TrendUp, 
  Notification,
  Flash,
  StatusUp,
  Profile2User,
  ArchiveBook,
  CardPos,
  DirectRight
} from 'iconsax-react';
import { productosService } from '../../services/productosService';
import { sucursalesService } from '../../services/sucursalesService';
import { 
    usuariosService, 
    combosService, 
    proveedoresService, 
    ofertasService 
} from '../../services/genericServices';

const MetricCard = ({ title, value, icon: Icon, trend, color = "bg-brand-cyan" }) => (
    <div className="card-premium p-6 flex flex-col justify-between h-full group">
        <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">{title}</span>
                <span className="text-3xl font-bold tracking-tight text-neutral-900">{value}</span>
            </div>
            <div className={`p-3 rounded-2xl ${color}/10 text-neutral-900 group-hover:${color} group-hover:text-black transition-all duration-300`}>
                <Icon size={24} variant="Bold" />
            </div>
        </div>
        {trend && (
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <StatusUp size={12} variant="Bold" className={trend.startsWith('+') ? '' : 'rotate-180'} />
                    {trend}
                </div>
                <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">vs mes anterior</span>
            </div>
        )}
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
             <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                 <div className="w-12 h-12 border-4 border-neutral-100 border-t-brand-cyan rounded-full animate-spin"></div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 animate-pulse">Sincronizando Indicadores...</p>
             </div>
         );
    }

    // --- VISTA PARA VENDEDOR ---
    if (role === 'VENDEDOR') {
        return (
            <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-100 pb-10 gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">ESTACIÓN DE TRABAJO</span>
                        <h2 className="text-4xl font-bold tracking-tight mt-2 text-neutral-900">
                            Dashboard de Ventas
                        </h2>
                    </div>
                    <div className="bg-neutral-900 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                            Turno Activo • Sede Central
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Acción Principal */}
                    <div className="lg:col-span-2 bg-neutral-900 text-white rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-brand-cyan">
                                    <CardPos size={32} variant="Bold" />
                                </div>
                                <h3 className="text-4xl font-bold tracking-tight">Terminal POS Premium</h3>
                                <p className="text-neutral-400 font-medium text-lg max-w-md leading-relaxed">
                                    Inicia una nueva sesión de venta y procesa pagos de forma segura y eficiente.
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => navigate('/pos')}
                                className="mt-12 w-fit btn-cyan px-12 py-5 text-xs flex items-center gap-4 group"
                            >
                                ABRIR TERMINAL DE VENTAS
                                <DirectRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Resumen del día */}
                    <div className="flex flex-col gap-6">
                        <div className="card-premium p-8 flex flex-col justify-between">
                             <div className="flex justify-between items-center mb-8">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Resumen Hoy</span>
                                <div className="p-2 bg-neutral-50 rounded-lg"><Notification size={18} /></div>
                             </div>
                             <div className="space-y-6">
                                 <div className="flex justify-between items-end">
                                     <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-widest">Ventas</span>
                                     <span className="text-3xl font-bold tracking-tight">12</span>
                                 </div>
                                 <div className="h-px bg-neutral-50"></div>
                                 <div className="flex justify-between items-end">
                                     <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-widest">Recaudación</span>
                                     <span className="text-3xl font-bold tracking-tight text-emerald-500">$45.200</span>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-brand-cyan/10 p-8 rounded-[2rem] border border-brand-cyan/20">
                             <div className="flex items-center gap-4 mb-4 text-brand-cyan">
                                <Flash size={20} variant="Bold" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Tip del Día</span>
                             </div>
                             <p className="text-xs font-bold text-neutral-800 leading-relaxed uppercase">
                                "Solicita validación de identidad para ventas mayores a $50,000."
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA PARA ADMIN / SUPER_ADMIN ---
    return (
        <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-100 pb-10 gap-6">
                 <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-300">
                        BIENVENIDO, {user?.nombre?.toUpperCase()}
                    </span>
                    <h2 className="text-4xl font-bold tracking-tight mt-2 text-neutral-900">
                        {role === 'ADMIN_SUCURSAL' ? 'Panel de Sucursal' : 'Control Central'}
                    </h2>
                 </div>
                 
                 <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm flex items-center gap-6">
                     <div className="flex flex-col border-r border-neutral-100 pr-6">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Operador</span>
                        <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">{user?.nombre} {user?.apellido}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                        <span className="text-[9px] font-bold text-neutral-900 uppercase tracking-widest">SISTEMA ONLINE</span>
                     </div>
                 </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Catálogo de Productos" 
                    value={metrics.productos} 
                    icon={ArchiveBook} 
                    trend="+12%" 
                />
                <MetricCard 
                    title="Sedes Vinculadas" 
                    value={metrics.sucursales} 
                    icon={Shop} 
                    color="bg-brand-cyan"
                />
                <MetricCard 
                    title="Equipo Operativo" 
                    value={metrics.usuarios} 
                    icon={Profile2User} 
                    trend="+3" 
                />
                <MetricCard 
                    title="Ofertas & Promos" 
                    value={metrics.ofertas + metrics.combos} 
                    icon={Flash} 
                />
            </div>
            
            {/* Secciones Inferiores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                
                {role === 'SUPER_ADMIN' && (
                    <div className="lg:col-span-2 bg-black text-white rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-cyan">
                                    <TrendUp size={24} variant="Bold" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Análisis Estratégico</h3>
                            </div>
                            <p className="text-neutral-400 font-medium text-lg max-w-md leading-relaxed mb-10">
                                Monitorea los márgenes de ganancia globales y el rendimiento por sucursal en tiempo real.
                            </p>
                            <button className="btn-cyan px-10 py-4 text-[10px] uppercase font-bold tracking-[0.2em] group">
                                GENERAR REPORTE EJECUTIVO
                            </button>
                        </div>
                    </div>
                )}

                <div className="card-premium p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-brand-cyan rounded-full"></div>
                            <h4 className="font-bold uppercase tracking-widest text-[11px] text-neutral-900">Alertas Críticas</h4>
                        </div>
                        <ul className="space-y-6 list-none">
                            <li className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                                <div>
                                    <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight">Stock Crítico</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">2 Productos requieren reposición urgente</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                                <div>
                                    <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight">Liquidación Pendiente</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">Sede Norte (#444) tiene arqueo sin cerrar</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <button className="mt-12 text-[10px] font-bold uppercase tracking-widest text-neutral-300 hover:text-brand-cyan transition-colors flex items-center justify-center gap-3 py-4 border-t border-neutral-50 w-full">
                        VER TODAS LAS NOTIFICACIONES <DirectRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
