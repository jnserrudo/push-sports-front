import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Box, 
  TrendingUp, 
  Activity,
  Zap,
  BarChart3,
  ExternalLink,
  ArrowRight,
  Monitor,
  Store
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import React, { useState, useEffect } from 'react';

const MetricCard = ({ title, value, icon: Icon, trend, color = "brand-cyan", link = "/dashboard" }) => (
  <div className="card-premium group relative overflow-hidden bg-white p-12 border-4 border-neutral-100 shadow-soft">
    <div className="relative z-10">
        <div className={`w-16 h-16 rounded-2xl bg-neutral-50 border-2 border-brand-cyan/20 text-brand-cyan flex items-center justify-center mb-10 shadow-sm group-hover:shadow-md transition-all duration-500`}>
            <Icon size={32} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-3">
            <span className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em] block">{title}</span>
            <div className="flex items-baseline gap-4">
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter m-0 text-neutral-900">{value}</h3>
                {trend && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 text-neutral-900 rounded-lg text-[10px] font-black uppercase tracking-widest border border-neutral-100">
                        <TrendingUp size={14} className="text-brand-cyan" />
                        {trend}%
                    </div>
                )}
            </div>
        </div>

        <Link to={link} className="mt-10 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-brand-cyan hover:brightness-110 transition-all">
            DETALLES <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </Link>
    </div>
  </div>
);

const Dashboard = () => {
    const { user, role, sucursalId } = useAuthStore();
    const isSuperAdmin = user?.id_rol === 1;
    const [currentSucursal, setCurrentSucursal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isSuperAdmin && sucursalId) {
            sucursalesService.getById(sucursalId)
                .then(setCurrentSucursal)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [isSuperAdmin, sucursalId]);

    const metrics = {
        ventas: isSuperAdmin ? "$4.2M" : "$1.1M",
        usuarios: isSuperAdmin ? "1.2k" : "85",
        productos: isSuperAdmin ? "850" : "120"
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* Header: Extreme Visibility */}
            <header className="flex flex-col lg:flex-row justify-between items-center gap-12 bg-white border-2 border-neutral-100 p-14 md:p-20 rounded-[3rem] relative overflow-hidden shadow-lg">
                <img src="/primera.jpeg" className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale scale-125" alt="Dashboard BG" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${isSuperAdmin ? 'bg-brand-cyan' : 'bg-amber-500'} animate-pulse shadow-lg`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
                            {isSuperAdmin ? 'MONITOREO INTEGRAL' : 'GESTIÓN POR COMERCIO'}
                        </span>
                    </div>

                    {!isSuperAdmin && currentSucursal && (
                        <div className="mb-6 flex items-center gap-4 bg-neutral-900 text-white px-6 py-3 rounded-2xl w-fit shadow-xl">
                            <Store size={18} className="text-brand-cyan" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Gestionando: {currentSucursal.nombre}</span>
                        </div>
                    )}

                    <h1 className="text-neutral-900 text-4xl md:text-6xl mb-6 leading-tight font-black tracking-tighter uppercase">
                        Tablero de <br/>
                        <span className="text-brand-cyan">{isSuperAdmin ? 'Gestión Central' : 'Control Local'}.</span>
                    </h1>
                </div>

                {isSuperAdmin && (
                    <div className="relative z-10 flex flex-wrap gap-4">
                        <Link to="/dashboard/productos" className="btn-cyan h-16 px-10 flex items-center justify-center text-xs font-black uppercase tracking-widest shadow-xl">NUEVO PRODUCTO</Link>
                        <Link to="/dashboard/auditoria" className="bg-white border-2 border-neutral-200 text-neutral-600 px-10 h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-50 hover:text-black transition-all text-center flex items-center justify-center shadow-sm">AUDITORÍA</Link>
                    </div>
                )}
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard 
                    title={isSuperAdmin ? "Ventas Globales" : "Ventas Sucursal"} 
                    value={metrics.ventas} 
                    icon={Activity} 
                    trend={12.5}
                    link="/dashboard/liquidaciones"
                />
                <MetricCard 
                    title="Staff / Atletas" 
                    value={metrics.usuarios} 
                    icon={Users} 
                    trend={8.2}
                    link="/dashboard/usuarios"
                />
                <MetricCard 
                    title="Stock Productos" 
                    value={metrics.productos} 
                    icon={Box} 
                    trend={-2.1}
                    link="/dashboard/productos"
                />
            </section>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                <div className="lg:col-span-8 flex flex-col gap-8">
                     <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-10 rounded-[2rem] border border-neutral-100 shadow-sm group">
                         <div className="space-y-3">
                            <h3 className="tracking-tight text-2xl uppercase">Notificaciones Pendientes</h3>
                            <p className="text-neutral-400 font-medium text-sm">Hay requerimientos de stock que necesitan validación inmediata.</p>
                         </div>
                         <button className="bg-brand-cyan text-white px-10 h-14 mt-6 sm:mt-0 flex items-center justify-center gap-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all">
                            GESTIONAR <ExternalLink size={16} />
                         </button>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="card-premium bg-neutral-50/30">
                            <div className="w-12 h-12 bg-white text-brand-cyan rounded-xl flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl mb-3 tracking-tight">Promociones</h3>
                            <p className="text-neutral-400 font-bold text-[9px] uppercase tracking-widest">
                                12 Ofertas activas en Salta Capital.
                            </p>
                        </div>
                        <div className="card-premium">
                            <div className="w-12 h-12 bg-neutral-100 text-brand-cyan rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                <Monitor size={24} />
                            </div>
                            <h3 className="text-xl mb-3 tracking-tight">Sedes On-Line</h3>
                            <p className="text-neutral-400 font-bold text-[9px] uppercase tracking-widest">
                                4 Terminales CORE conectadas.
                            </p>
                        </div>
                     </div>
                </div>

                <div className="lg:col-span-4 bg-white rounded-[2rem] p-10 border border-neutral-100 shadow-sm flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <BarChart3 size={24} className="text-brand-cyan" />
                            <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-neutral-300">Respuesta en Vivo</span>
                        </div>
                        <h3 className="text-xl leading-relaxed uppercase tracking-tight mb-6">Suministro de <br/> Precisión.</h3>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                            {isSuperAdmin 
                                ? "Análisis predictivo de stock para la zona norte. Recomendación de envío enviada a supervisión."
                                : `Estado actual de stock para ${currentSucursal?.nombre || 'la sede asignada'}. Reposición automática habilitada.`}
                        </p>
                    </div>
                    <Link to="/dashboard/envios" className="w-full py-5 px-6 mt-10 rounded-xl bg-brand-cyan text-white font-black text-xs text-center uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center">
                        LOGÍSTICA PREVENTIVA
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
