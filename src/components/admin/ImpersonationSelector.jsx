import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Shield, ChevronDown, Search, MapPin, X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { impersonationService } from '../../services/impersonationService';
import { usuariosService } from '../../services/genericServices';
import toast from 'react-hot-toast';

const ImpersonationSelector = () => {
    const { user, isImpersonating, startImpersonation } = useAuthStore();
    const [usuarios, setUsuarios] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Solo mostrar si el usuario es admin (rol 1) y NO está impersonando
    if (!user || user.id_rol !== 1 || isImpersonating) {
        return null;
    }

    useEffect(() => {
        loadUsuarios();
        
        // Cerrar dropdown al hacer clic fuera
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUsuarios = async () => {
        try {
            const data = await usuariosService.getAll();
            const usuariosImpersonables = data.filter(u => 
                u.activo && (u.id_rol === 2 || u.id_rol === 3)
            );
            setUsuarios(usuariosImpersonables);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            toast.error('Error al cargar usuarios');
        }
    };

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSelectUser = (usuario) => {
        setSelectedUser(usuario);
        setShowConfirm(true);
    };

    const handleConfirmImpersonation = async () => {
        if (!selectedUser) return;

        setLoading(true);
        setIsOpen(false);
        setShowConfirm(false);
        
        try {
            const response = await impersonationService.startImpersonation(selectedUser.id_usuario);
            
            startImpersonation(
                response.impersonatedUser,
                response.realUser,
                response.token
            );
            
            toast.success(`Impersonando a ${selectedUser.nombre} ${selectedUser.apellido}`);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error al iniciar impersonación:', error);
            toast.error(error.response?.data?.error || 'Error al iniciar impersonación');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (rolId) => {
        if (rolId === 2) {
            return <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-[9px] font-black uppercase rounded">Supervisor</span>;
        }
        return <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-black uppercase rounded">Vendedor</span>;
    };

    const filteredUsuarios = usuarios.filter(u => {
        const searchLower = searchTerm.toLowerCase();
        const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
        const email = u.email?.toLowerCase() || '';
        const sucursal = u.comercio_asignado?.nombre?.toLowerCase() || '';
        
        return nombreCompleto.includes(searchLower) || 
               email.includes(searchLower) || 
               sucursal.includes(searchLower);
    });

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón principal - versión móvil optimizada */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg hover:border-brand-cyan dark:hover:border-cyan-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50 md:hidden"
            >
                <Shield size={16} className="text-brand-cyan dark:text-cyan-400" />
            </button>

            {/* Botón principal - versión desktop */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg hover:border-brand-cyan dark:hover:border-cyan-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
                <Shield size={14} className="text-brand-cyan dark:text-cyan-400" />
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wide">
                    Impersonar
                </span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Modal Móvil / Dropdown Desktop */}
            {isOpen && (
                <>
                    {/* Versión Móvil - Modal de pantalla completa */}
                    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] md:hidden overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-brand-cyan dark:text-cyan-400" />
                                <h2 className="text-sm font-black uppercase tracking-wide text-neutral-900 dark:text-white">
                                    Seleccionar Usuario
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-800"
                            >
                                <X size={20} className="text-neutral-600 dark:text-neutral-300" />
                            </button>
                        </div>

                        {/* Búsqueda */}
                        <div className="p-4 border-b border-neutral-200 dark:border-gray-700">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 text-neutral-900 dark:text-white"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lista de usuarios */}
                        <div className="p-4">
                            {filteredUsuarios.length === 0 ? (
                                <div className="py-12 text-center">
                                    <UserCircle size={48} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredUsuarios.map((usuario) => (
                                        <button
                                            key={usuario.id_usuario}
                                            onClick={() => handleSelectUser(usuario)}
                                            className="w-full p-4 bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 border border-neutral-200 dark:border-gray-700 rounded-xl transition-colors text-left"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-black dark:from-cyan-500 dark:to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-brand-cyan dark:text-white font-black text-sm">
                                                        {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-neutral-900 dark:text-white truncate">
                                                            {usuario.nombre} {usuario.apellido}
                                                        </span>
                                                        {getRoleBadge(usuario.id_rol)}
                                                    </div>
                                                    
                                                    {usuario.comercio_asignado && (
                                                        <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                            <MapPin size={12} />
                                                            <span className="truncate">{usuario.comercio_asignado.nombre}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Versión Desktop - Dropdown */}
                    <div className="hidden md:block absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl shadow-2xl z-[80] overflow-hidden">
                        {/* Header con búsqueda */}
                        <div className="p-3 border-b border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-900">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={14} className="text-brand-cyan dark:text-cyan-400" />
                                <span className="text-xs font-black uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
                                    Seleccionar Usuario
                                </span>
                            </div>
                            <div className="relative">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-7 pr-7 py-1.5 text-xs bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan dark:focus:border-cyan-400 text-neutral-700 dark:text-neutral-200"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lista de usuarios */}
                        <div className="max-h-80 overflow-y-auto">
                            {filteredUsuarios.length === 0 ? (
                                <div className="p-6 text-center">
                                    <UserCircle size={32} className="mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                                    </p>
                                </div>
                            ) : (
                                filteredUsuarios.map((usuario) => (
                                    <button
                                        key={usuario.id_usuario}
                                        onClick={() => handleSelectUser(usuario)}
                                        className="w-full p-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 border-b border-neutral-100 dark:border-gray-700 last:border-b-0 transition-colors text-left"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-neutral-800 to-black dark:from-cyan-500 dark:to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-brand-cyan dark:text-white font-black text-xs">
                                                    {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-black text-neutral-900 dark:text-white truncate">
                                                        {usuario.nombre} {usuario.apellido}
                                                    </span>
                                                    {getRoleBadge(usuario.id_rol)}
                                                </div>
                                                
                                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mb-1">
                                                    {usuario.email}
                                                </p>
                                                
                                                {usuario.comercio_asignado && (
                                                    <div className="flex items-center gap-1 text-[10px] text-neutral-600 dark:text-neutral-300">
                                                        <MapPin size={10} />
                                                        <span className="truncate">{usuario.comercio_asignado.nombre}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 bg-neutral-50 dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700">
                            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 text-center">
                                {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''} disponible{filteredUsuarios.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Confirmación Mejorado */}
            {showConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                        {/* Header */}
                        <div className="bg-neutral-50 dark:bg-gray-900 px-5 py-4 border-b border-neutral-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-cyan/20 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                                    <Shield size={20} className="text-brand-cyan dark:text-cyan-400" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wide text-neutral-900 dark:text-white">
                                    Confirmar Impersonación
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-black dark:from-cyan-500 dark:to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-brand-cyan dark:text-white font-black text-sm">
                                        {selectedUser.nombre.charAt(0)}{selectedUser.apellido.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-neutral-900 dark:text-white mb-1">
                                        {selectedUser.nombre} {selectedUser.apellido}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getRoleBadge(selectedUser.id_rol)}
                                        {selectedUser.comercio_asignado && (
                                            <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                <MapPin size={10} />
                                                <span>{selectedUser.comercio_asignado.nombre}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {selectedUser.email}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-700 dark:text-amber-300">
                                        <p className="font-black mb-1">Importante:</p>
                                        <p>Todas las acciones que realices se registrarán en auditoría como ejecutadas por este usuario, pero también se guardará que fuiste tú quien las ejecutó.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-neutral-50 dark:bg-gray-900 px-5 py-3 border-t border-neutral-200 dark:border-gray-700 flex gap-2">
                            <button
                                onClick={() => { setShowConfirm(false); setSelectedUser(null); }}
                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 text-neutral-700 dark:text-neutral-200 font-black text-xs uppercase tracking-wide rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmImpersonation}
                                disabled={loading}
                                className="flex-1 px-3 py-2 bg-neutral-900 dark:bg-cyan-600 text-brand-cyan dark:text-white font-black text-xs uppercase tracking-wide rounded-lg hover:bg-neutral-800 dark:hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImpersonationSelector;
