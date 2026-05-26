import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Database,
  Check,
  Rows3,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Mini custom dropdown for rows-per-page
   Matches the PremiumSelect design language
   ────────────────────────────────────────────── */
const RowsPerPageSelect = ({ value, onChange }) => {
    const OPTIONS = [5, 8, 10, 15, 20, 50];
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                    open
                        ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan shadow-[0_0_8px_rgba(0,194,255,0.12)]'
                        : 'border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white hover:border-neutral-400 dark:hover:border-gray-500'
                }`}
            >
                <Rows3 size={11} className={open ? 'text-brand-cyan' : 'text-neutral-400'} />
                <span>{value} filas</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-cyan' : 'text-neutral-400'}`} />
            </button>

            {open && (
                <div className="absolute bottom-full mb-1.5 left-0 z-[80] bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[120px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-gray-700">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">Filas por página</span>
                    </div>
                    {OPTIONS.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                opt === value
                                    ? 'bg-brand-cyan/10 text-brand-cyan border-l-2 border-brand-cyan'
                                    : 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 border-l-2 border-transparent'
                            }`}
                        >
                            <span>{opt} filas</span>
                            {opt === value && <Check size={11} className="text-brand-cyan" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ──────────────────────────────────────────────
   Compact Actions Dropdown
   Replaces separate buttons to save space
   ────────────────────────────────────────────── */
const RowActions = ({ row, onEdit, onDelete, onView, customActions, refresh }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { 
            // No cerrar si el click fue en el botón principal (toggle)
            if (buttonRef.current && buttonRef.current.contains(e.target)) return;
            // Cerrar si el click fue fuera del componente
            if (ref.current && !ref.current.contains(e.target)) setOpen(false); 
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative flex justify-end">
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all cursor-pointer z-20 ${
                    open
                        ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan shadow-sm'
                        : 'border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-neutral-500 hover:border-neutral-400 dark:hover:border-gray-500 hover:text-black dark:hover:text-white'
                }`}
                title="Acciones"
            >
                <MoreHorizontal size={16} />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-1 z-[99999] bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden min-w-[160px] pointer-events-auto"
                >
                    <div className="p-0 flex flex-col gap-0 text-left pointer-events-auto">
                        {onView && (
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onView(row);
                                    setOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-100 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg transition-all cursor-pointer pointer-events-auto min-h-[44px]"
                            >
                                <Eye size={14} className="opacity-70 flex-shrink-0" />
                                <span>Ver Detalle</span>
                            </button>
                        )}
                        
                        {onEdit && (
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    console.log('Click en Editar, row:', row);
                                    onEdit(row);
                                    setOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-100 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer pointer-events-auto select-none min-h-[44px]"
                            >
                                <Pencil size={14} className="opacity-70 flex-shrink-0" />
                                <span>Editar</span>
                            </button>
                        )}

                        {customActions && (
                            <div className="contents pointer-events-auto">
                                {customActions(row, true, refresh, () => setOpen(false))}
                            </div>
                        )}

                        {onDelete && (
                            <>
                                <div className="h-px bg-neutral-100 dark:bg-gray-700 my-1" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(row);
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer pointer-events-auto min-h-[40px]"
                                >
                                    <Trash2 size={14} className="opacity-70" />
                                    <span>Dar de Baja</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DataTable = ({ 
    columns, 
    data, 
    searchPlaceholder = "BUSCAR REGISTROS...",
    onAdd,
    addLabel = "NUEVO REGISTRO",
    onEdit,
    onDelete,
    onView,
    variant,
    emptyIcon: EmptyIcon = Database,
    emptyTitle = "No hay datos disponibles",
    emptySubtitle = "Todavía no existen registros en esta sección. Puedes comenzar agregando nueva información.",
    customActions,
    refresh,
    hideSearch = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [itemsPerPage, setItemsPerPage] = useState(8);
    
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const searchInValue = (val, term, depth = 0) => {
        if (depth > 2) return false;
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(term);
        }
        if (Array.isArray(val)) {
            return val.some(item => searchInValue(item, term, depth + 1));
        }
        if (typeof val === 'object') {
            if (val instanceof Date) return false; 
            return Object.values(val).some(v => searchInValue(v, term, depth + 1));
        }
        return false;
    };

    const processedData = React.useMemo(() => {
        let filtered = data.filter(item => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return searchInValue(item, term);
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [data, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    const rangeStart = processedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const rangeEnd = Math.min(currentPage * itemsPerPage, processedData.length);

    const renderSortIcon = (col) => {
        if (!col.accessor) return null;
        if (sortConfig.key !== col.accessor) return <ChevronsUpDown size={14} className="ml-3 opacity-20" />;
        return sortConfig.direction === 'asc' 
            ? <ChevronUp size={14} className="ml-3 text-brand-cyan" /> 
            : <ChevronDown size={14} className="ml-3 text-brand-cyan" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 md:p-1.5 shadow-sm border border-neutral-100 dark:border-gray-700 relative animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Ambient Accent (Subtle) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />

            {/* Toolbar Principal - Compacto */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 md:gap-3 mb-3 md:mb-4 relative z-10 flex-wrap">
                {!hideSearch && (
                    <div className="relative flex-1 group w-full min-w-0 sm:min-w-[200px]">
                        <div className="relative flex items-center">
                            <div className="absolute left-3 md:left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-cyan transition-colors">
                                <Search size={16} className="md:w-5 md:h-5" />
                            </div>
                            <input 
                                type="text" 
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 md:pl-10 pr-7 md:pr-8 h-9 md:h-10 bg-neutral-50/50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 focus:border-brand-cyan dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-gray-600 text-neutral-900 dark:text-white text-[11px] md:text-xs font-bold tracking-wider uppercase rounded-md transition-all outline-none placeholder:text-neutral-400 dark:placeholder:text-gray-500 shadow-inner text-ellipsis"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-red-500 transition-all bg-white dark:bg-gray-700 rounded-full p-1"
                                >
                                    <XCircle size={14} className="md:w-4 md:h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {onAdd && (
                    <div className="flex items-end h-full sm:mt-auto w-full sm:w-auto mt-1 sm:mt-0">
                        <button 
                            onClick={onAdd}
                            className="w-full sm:w-auto bg-black text-white px-3 md:px-4 h-9 md:h-10 flex items-center justify-center gap-2 group rounded-md transition-all hover:bg-brand-cyan hover:text-black hover:shadow-md flex-shrink-0"
                            title={addLabel}
                        >
                            <Plus size={14} className="md:w-3.5 md:h-3.5 transition-transform group-hover:rotate-90" strokeWidth={3} />
                            <span className="font-black tracking-[0.1em] text-[9px] md:text-[10px] uppercase whitespace-nowrap">{addLabel}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Table Area */}
            <div className="rounded border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm relative z-10 w-full mb-2 min-h-[180px] overflow-visible">
                <div className="overflow-visible custom-scrollbar rounded">
                    <table className="w-full text-left border-collapse min-w-full md:min-w-[700px]">
                        <thead>
                            <tr className="bg-neutral-50/50 dark:bg-gray-700/50 text-neutral-500 dark:text-gray-400 border-b border-neutral-200 dark:border-gray-600">
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`px-1.5 py-1 md:px-2 md:py-1.5 font-black uppercase tracking-wider text-[8px] md:text-[9px] ${idx === 0 ? 'pl-2.5 md:pl-3' : ''} ${col.width || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th className="px-2 py-1 md:px-3 md:py-1.5 text-right font-black uppercase tracking-wider text-[8px] md:text-[9px]">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-gray-700 text-neutral-700 dark:text-gray-300">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} className="p-0 border-0">
                                        <div className="flex flex-col items-center justify-center p-6 md:p-10 w-full min-h-[150px] text-center bg-white dark:bg-gray-800 border-transparent">
                                            <div className="w-10 h-10 bg-neutral-50 dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-inner border border-neutral-100 dark:border-gray-600 mb-2">
                                                {searchTerm
                                                    ? <Search className="text-neutral-300 dark:text-gray-500 w-5 h-5" />
                                                    : <EmptyIcon className="text-neutral-300 dark:text-gray-500 w-5 h-5" />
                                                }
                                            </div>
                                            <div className="space-y-1 w-full max-w-md">
                                                <h4 className="text-xs font-bold text-neutral-800 dark:text-gray-200 leading-normal text-center w-full">
                                                    {searchTerm ? 'No se encontraron resultados' : emptyTitle}
                                                </h4>
                                                <p className="text-[10px] text-neutral-500 dark:text-gray-400 leading-relaxed text-center w-full">
                                                    {searchTerm 
                                                        ? 'No coinciden resultados.'
                                                        : emptySubtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className={`group hover:bg-neutral-50 dark:hover:bg-gray-700 border-b border-neutral-100 dark:border-gray-700 last:border-0 transition-colors text-[10px] md:text-[11px] text-neutral-700 dark:text-gray-300 ${
                                        row.activo === false ? 'opacity-50 grayscale' : 'bg-white dark:bg-gray-800'
                                    }`}>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-1.5 py-1 md:px-2 md:py-1 align-middle ${colIdx > 1 ? 'hidden sm:table-cell' : ''} ${colIdx === 0 ? 'text-black font-bold' : ''}`}>
                                                {col.render ? col.render(row) : <span className="text-neutral-600 dark:text-neutral-400">{row[col.accessor] ?? '—'}</span>}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || onView || customActions) && (
                                            <td className="px-1.5 py-1 md:px-3 md:py-1 text-right align-middle relative">
                                                <RowActions 
                                                    row={row} 
                                                    onEdit={onEdit} 
                                                    onDelete={onDelete} 
                                                    onView={onView} 
                                                    customActions={customActions} 
                                                    refresh={refresh}
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Premium Pagination Footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 z-10 relative mt-1 px-1">
                {/* Left: rows-per-page + count */}
                <div className="flex items-center gap-3">
                    <RowsPerPageSelect
                        value={itemsPerPage}
                        onChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                    />
                    <div className="h-4 w-px bg-neutral-200 dark:bg-gray-700" />
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                        {rangeStart}–{rangeEnd} <span className="text-neutral-300">de</span> {processedData.length}
                    </span>
                </div>
                
                {/* Right: page navigation */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            title="Primera página"
                        >
                            <ChevronsLeft size={13} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            title="Anterior"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        
                        <div className="flex items-center gap-0.5 mx-1">
                            <span className="px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-black min-w-[28px] text-center">{currentPage}</span>
                            <span className="text-[9px] text-neutral-300 font-bold mx-0.5">/</span>
                            <span className="text-[10px] font-black text-neutral-400">{totalPages}</span>
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            title="Siguiente"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            title="Última página"
                        >
                            <ChevronsRight size={13} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
