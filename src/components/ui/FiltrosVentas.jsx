import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FiltrosVentas = ({ sucursales, filtros, onFiltrosChange, onLimpiar }) => {
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const handleChange = (campo, valor) => {
        onFiltrosChange({ ...filtros, [campo]: valor });
    };

    const filtrosActivos = Object.values(filtros).filter(v => v && v !== '').length;

    return (
        <div className="mb-4">
            <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-gray-700 transition-colors"
            >
                <Filter size={14} />
                Filtros
                {filtrosActivos > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-brand-cyan text-black rounded-full text-[10px] font-black">
                        {filtrosActivos}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {mostrarFiltros && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-neutral-50 dark:bg-gray-800 p-4 rounded-xl border border-neutral-200 dark:border-gray-700 relative z-50"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Sucursal */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Sucursal</label>
                                <select
                                    value={filtros.id_comercio || ''}
                                    onChange={(e) => handleChange('id_comercio', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs text-black dark:text-white"
                                >
                                    <option value="">Todas</option>
                                    {sucursales.map(suc => (
                                        <option key={suc.id_comercio || suc.id} value={suc.id_comercio || suc.id}>
                                            {suc.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fecha Desde */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Fecha Desde</label>
                                <input
                                    type="date"
                                    value={filtros.fecha_desde || ''}
                                    onChange={(e) => handleChange('fecha_desde', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs text-black dark:text-white"
                                />
                            </div>

                            {/* Fecha Hasta */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={filtros.fecha_hasta || ''}
                                    onChange={(e) => handleChange('fecha_hasta', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs text-black dark:text-white"
                                />
                            </div>

                            {/* Método de Pago */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Método de Pago</label>
                                <select
                                    value={filtros.metodo_pago || ''}
                                    onChange={(e) => handleChange('metodo_pago', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs text-black dark:text-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Mercado Pago">Mercado Pago</option>
                                </select>
                            </div>

                            {/* Estado de Liquidación */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Estado Liquidación</label>
                                <select
                                    value={filtros.estado_liquidacion || ''}
                                    onChange={(e) => handleChange('estado_liquidacion', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs text-black dark:text-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="LIQUIDADA">Liquidada</option>
                                </select>
                            </div>

                            {/* Búsqueda */}
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Buscar por ID</label>
                                <input
                                    type="text"
                                    value={filtros.busqueda || ''}
                                    onChange={(e) => handleChange('busqueda', e.target.value)}
                                    placeholder="Ingrese ID de venta..."
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg text-xs text-black dark:text-white placeholder:text-neutral-400"
                                />
                            </div>
                        </div>

                        {/* Botón Limpiar */}
                        {filtrosActivos > 0 && (
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => {
                                        onLimpiar();
                                        setMostrarFiltros(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-gray-700 text-black dark:text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-neutral-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <X size={14} />
                                    Limpiar Filtros
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FiltrosVentas;
