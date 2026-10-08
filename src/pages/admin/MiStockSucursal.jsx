import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Box, Info, FileSpreadsheet, Loader2, PackageCheck, PackageX, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import DataTable from '../../components/ui/DataTable';
import QueQueresHacer from '../../components/ui/QueQueresHacer';
import { exportToExcel } from '../../utils/exportExcel';
import { cargarMisProductos } from '../../utils/misProductos';

const money = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

const MiStockSucursal = () => {
    const { user, sucursalId } = useAuthStore();
    const nombreSucursal = user?.comercio_asignado?.nombre || 'tu sucursal';

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [vista, setVista] = useState('con_stock');

    const load = useCallback(async () => {
        if (!sucursalId) return;
        setIsLoading(true);
        try {
            setItems(await cargarMisProductos(sucursalId));
        } catch (e) {
            console.error(e);
            toast.error('No se pudo cargar tu stock');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [sucursalId]);

    useEffect(() => { load(); }, [load]);

    const conStock = useMemo(() => items.filter(i => i.stock > 0), [items]);
    const sinStock = useMemo(() => items.filter(i => i.stock <= 0), [items]);
    const visibles = vista === 'con_stock' ? conStock : sinStock;
    const totalUnidades = conStock.reduce((sum, i) => sum + i.stock, 0);
    const totalPublico = conStock.reduce((sum, i) => sum + i.stock * i.publico, 0);

    const handleExport = () => {
        const rows = conStock.flatMap(i => {
            const fila = (variante, cantidad) => ({
                _imageUrl: i.imagen,
                Producto: i.nombre,
                Variante: variante,
                Cantidad: cantidad,
                'Precio de venta': i.publico,
                'Precio Push': i.push,
                'Total a precio de venta': cantidad * i.publico,
            });
            if (i.variantes.length) {
                return i.variantes.filter(v => v.cantidad > 0).map(v => fila(v.nombre, v.cantidad));
            }
            return [fila('', i.stock)];
        });
        const stamp = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
        exportToExcel(rows, `Mis_Productos_${nombreSucursal}_${stamp}`);
    };

    const columns = [
        {
            header: 'Producto',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-neutral-100 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                        {row.imagen
                            ? <img src={row.imagen} alt="" className="w-full h-full object-cover" />
                            : <Box size={16} className="text-neutral-400" />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-xs text-black dark:text-white uppercase leading-tight">{row.nombre}</p>
                        {row.marca && <p className="text-[9px] font-black text-brand-cyan uppercase tracking-widest mt-0.5">{row.marca}</p>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Sabores / talles',
            render: (row) => row.variantes.length ? (
                <div className="flex flex-wrap gap-1 max-w-[260px]">
                    {row.variantes.map(v => (
                        <span
                            key={v.nombre}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                v.cantidad > 0
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                    : 'bg-neutral-50 dark:bg-gray-700 border-neutral-200 dark:border-gray-600 text-neutral-400'
                            }`}
                        >
                            {v.nombre}: {v.cantidad}
                        </span>
                    ))}
                </div>
            ) : <span className="text-[10px] text-neutral-400">—</span>,
        },
        {
            header: 'Tengo',
            render: (row) => (
                <span className={`font-sport text-2xl leading-none ${row.stock > 0 ? 'text-black dark:text-white' : 'text-red-500'}`}>
                    {row.stock}
                    <span className="text-[9px] font-bold text-neutral-400 ml-1">u.</span>
                </span>
            ),
        },
        {
            header: 'Precio de venta',
            render: (row) => <span className="text-xs font-black text-black dark:text-white">{money(row.publico)}</span>,
        },
        {
            header: 'Le pagás a Push',
            render: (row) => <span className="text-xs font-black text-brand-cyan">{money(row.push)}</span>,
        },
    ];

    return (
        <div className="space-y-3 max-w-[1400px] mx-auto pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black dark:border-gray-600 pb-4 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-brand-cyan" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{nombreSucursal}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl uppercase leading-none m-0 font-sport text-black dark:text-white">
                        Mis <span className="text-brand-cyan">productos</span>
                    </h2>
                    <p className="text-neutral-500 text-xs font-bold mt-2 max-w-xl">
                        Lo que tenés hoy en tu local, con el precio al que lo vendés y lo que le pagás a Push Sport.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={isLoading || conStock.length === 0}
                    className="h-11 px-5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[11px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    <FileSpreadsheet size={15} /> Descargar mi lista (Excel)
                </button>
            </div>

            <QueQueresHacer />

            <div className="bg-blue-500/10 border-2 border-blue-500/30 text-blue-800 dark:text-blue-300 rounded-xl p-3 flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5" />
                <div className="text-[11px] font-bold leading-relaxed">
                    <p className="font-black mb-0.5">¿Cómo se actualiza?</p>
                    <p>
                        Sube sola cuando Push Sport te deja mercadería. Baja sola cuando vendés en{' '}
                        <Link to="/dashboard/ventas" className="underline font-black">Registrar Ventas</Link>.
                        Si algo no coincide con lo que tenés en el local, avisale a Push Sport.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Productos con stock</p>
                    <p className="font-sport text-3xl text-black dark:text-white leading-none mt-1">{conStock.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Unidades en el local</p>
                    <p className="font-sport text-3xl text-black dark:text-white leading-none mt-1">{totalUnidades}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Vale a precio de venta</p>
                    <p className="font-sport text-3xl text-black dark:text-white leading-none mt-1">{money(totalPublico)}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={() => setVista('con_stock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                        vista === 'con_stock' ? 'border-brand-cyan bg-brand-cyan/10 text-black dark:text-white' : 'border-neutral-200 dark:border-gray-700 text-neutral-500'
                    }`}
                >
                    <PackageCheck size={15} /> Lo que tengo ({conStock.length})
                </button>
                <button
                    type="button"
                    onClick={() => setVista('sin_stock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                        vista === 'sin_stock' ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-black dark:text-white' : 'border-neutral-200 dark:border-gray-700 text-neutral-500'
                    }`}
                >
                    <PackageX size={15} /> Se me agotó ({sinStock.length})
                </button>
                <p className="sm:ml-auto self-center text-[10px] font-bold text-neutral-500 flex items-center gap-1">
                    <Search size={12} /> Para buscar uno, escribí el nombre en el buscador de la tabla.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700">
                    <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Cargando tus productos...</span>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={visibles}
                    searchPlaceholder="BUSCAR UN PRODUCTO..."
                    emptyTitle={vista === 'con_stock' ? 'Todavía no tenés productos con stock' : 'No tenés productos agotados'}
                    emptySubtitle={vista === 'con_stock' ? 'Cuando Push Sport te deje mercadería, va a aparecer acá.' : 'Todo lo que te dejaron todavía tiene stock.'}
                    emptyIcon={Package}
                />
            )}
        </div>
    );
};

export default MiStockSucursal;
