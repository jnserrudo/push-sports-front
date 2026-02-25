import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  CheckCircle2, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  UserCircle, 
  ChevronRight 
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register(formData);
            setSuccess(true);
        } catch (error) {
            alert('Error al registrar: ' + (error.response?.data?.message || 'Error en el servidor'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative">
              <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-12 md:p-20 text-center shadow-premium border border-neutral-100 animate-in zoom-in-95 duration-500 relative z-10">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 uppercase">Solicitud Transmitida.</h2>
                <p className="text-neutral-400 font-medium text-lg mb-12 leading-relaxed">
                  Su perfil de operador ha sido enviado para validación. <br/>
                  <span className="text-neutral-900 font-bold uppercase tracking-widest text-[10px]">Verificación administrativa requerida</span>
                </p>
                <button 
                    onClick={() => navigate('/login')}
                    className="w-full btn-premium h-16"
                >
                  VOLVER AL LOGIN
                </button>
              </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-0 md:p-8 relative font-sans overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-cyan/5 to-transparent"></div>
          
          <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white h-screen md:h-[80vh] md:rounded-[2.5rem] shadow-premium relative z-10 overflow-hidden border border-neutral-100">
            
            {/* INFO PANEL */}
            <div className="hidden lg:flex md:w-5/12 bg-white relative flex-col justify-end p-16 overflow-hidden border-r border-neutral-100">
                <div className="relative z-20 space-y-6">
                    <div className="w-16 h-1 bg-brand-cyan rounded-full"></div>
                    <h2 className="text-4xl font-bold text-neutral-900 leading-tight tracking-tight uppercase">
                        Nivel <br />
                        <span className="text-brand-cyan italic">Personal.</span>
                    </h2>
                    <p className="text-neutral-500 font-medium text-lg leading-relaxed max-w-xs">
                        Incorpórese al personal de PushSport Salta para la gestión de inventario regional.
                    </p>
                </div>
                {/* Restore Original Background Asset */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img src="/segunda.jpeg" alt="Push" className="w-full h-full object-cover grayscale" />
                    <div className="absolute inset-0 bg-neutral-950/80"></div>
                </div>
            </div>

            {/* FORM SIDE */}
            <div className="w-full lg:w-7/12 p-8 md:p-16 bg-white flex flex-col justify-center animate-in slide-in-from-right-10 duration-1000 overflow-y-auto">
                <div className="mb-14">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 bg-white border-2 border-neutral-100 p-3 rounded-2xl shadow-sm transition-transform hover:scale-110 duration-500">
                            <img src="/icono.jpeg" alt="Logo" className="w-full h-full object-contain invert" />
                        </div>
                        <div>
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-cyan">SOLICITUD DE ACCESO</span>
                             <h1 className="text-neutral-900 text-3xl font-black tracking-tighter uppercase m-0 leading-none mt-2">
                                Registro.
                             </h1>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 ml-1">Nombre</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                                <input 
                                    required type="text" name="nombre"
                                    className="input-premium pl-14 h-16 text-sm"
                                    value={formData.nombre} onChange={handleChange}
                                    placeholder="NOMBRE"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 ml-1">Apellido</label>
                            <div className="relative group">
                            <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                                <input 
                                    required type="text" name="apellido"
                                    className="input-premium pl-14 h-16 text-sm"
                                    value={formData.apellido} onChange={handleChange}
                                    placeholder="APELLIDO"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 ml-1">Email Profesional</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                            <input 
                                required type="email" name="email"
                                className="input-premium pl-14 h-16 text-sm"
                                value={formData.email} onChange={handleChange}
                                placeholder="USUARIO@PUSHSPORT.COM"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-cyan transition-colors" size={20} />
                            <input 
                                required type="password" name="password"
                                className="input-premium pl-14 h-16 text-sm"
                                value={formData.password} onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-neutral-50 rounded-2xl flex items-center gap-5 border border-neutral-100">
                        <ShieldCheck className="text-brand-cyan" size={24} />
                        <p className="text-[10px] font-medium text-neutral-400 leading-relaxed uppercase tracking-widest">
                            El acceso requiere <span className="text-black font-bold">Validación de Supervisor</span> para activar permisos.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full h-16 flex items-center justify-center gap-4 group transition-all ${loading ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'btn-premium'}`}
                        >
                            {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                        <Link to="/login" className="text-center text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-300 hover:text-black transition-colors">Volver al Ingreso</Link>
                    </div>
                </form>
            </div>
          </div>
        </div>
    );
};

export default Register;
