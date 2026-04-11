import React, { useState } from 'react';
import { Activity } from 'lucide-react';
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
  Database
} from 'lucide-react';

const DataTable = ({ 
    columns, 
    data, 
    searchPlaceholder = "BUSCAR REGISTROS...",
    onAdd,
    addLabel = "NUEVO REGISTRO",
    onEdit,
    onDelete,
    onView,
    variant, // pass 'minimal' for compact layout (no outer shadow/rounded)
    emptyIcon: EmptyIcon = Database,
    emptyTitle = "No hay datos disponibles",
    emptySubtitle = "Todavía no existen registros en esta sección. Puedes comenzar agregando nueva información."
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const itemsPerPage = 8;
    
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Función para buscar recursivamente en objetos anidados
    const searchInValue = (val, term) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            return String(val).toLowerCase().includes(term);
        }
        if (Array.isArray(val)) {
            return val.some(item => searchInValue(item, term));
        }
        if (typeof val === 'object') {
            return Object.values(val).some(v => searchInValue(v, term));
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

    const renderSortIcon = (col) => {
        if (!col.accessor) return null;
        if (sortConfig.key !== col.accessor) return <ChevronsUpDown size={14} className="ml-3 opacity-20" />;
        return sortConfig.direction === 'asc' 
            ? <ChevronUp size={14} className="ml-3 text-brand-cyan" /> 
            : <ChevronDown size={14} className="ml-3 text-brand-cyan" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-neutral-100 dark:border-gray-700 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Ambient Accent (Subtle) */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/5 blur-3xl pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />

            {/* Toolbar Principal - Compacto */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-5 relative z-10">
                <div className="relative flex-1 group w-full min-w-0">
                    <label className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1 ml-1">Explorador</label>
                    <div className="relative flex items-center">
                        <div className="absolute left-4 md:left-6 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-cyan transition-colors">
                            <Search size={20} className="md:w-6 md:h-6" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 md:pl-12 pr-8 md:pr-10 h-10 md:h-12 bg-neutral-50/50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 focus:border-brand-cyan dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-gray-600 text-neutral-900 dark:text-white text-xs md:text-sm font-bold tracking-wider uppercase rounded-lg transition-all outline-none placeholder:text-neutral-400 dark:placeholder:text-gray-500 shadow-inner"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-red-500 transition-all bg-white dark:bg-gray-700 rounded-full p-1"
                            >
                                <XCircle size={18} className="md:w-5 md:h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {onAdd && (
                    <div className="flex items-end h-full mt-auto">
                        <button 
                            onClick={onAdd}
                            className="w-full md:w-auto bg-black text-white px-4 md:px-6 h-10 md:h-12 flex items-center justify-center gap-2 group rounded-lg transition-all hover:bg-brand-cyan hover:text-black hover:shadow-md hover:-translate-y-0.5"
                            title={addLabel}
                        >
                            <Plus size={16} className="md:w-4 md:h-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
                            <span className="font-black tracking-[0.15em] text-[10px] md:text-xs uppercase whitespace-nowrap">{addLabel}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Table Area - Compacta */}
            <div className="rounded-lg border border-neutral-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800 shadow-sm relative z-10 w-full mb-3">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-full md:min-w-[800px]">
                        <thead>
                            <tr className="bg-neutral-50/50 dark:bg-gray-700/50 text-neutral-500 dark:text-gray-400 text-[10px] md:text-xs font-semibold border-b border-neutral-200 dark:border-gray-600">
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`px-3 py-2 md:px-4 md:py-3 font-black uppercase tracking-wider text-[9px] md:text-[10px] ${idx === 0 ? 'pl-4 md:pl-6' : ''} ${col.width || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th className="px-4 md:px-8 py-3 md:py-5 text-right font-semibold">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-gray-700 text-neutral-700 dark:text-gray-300">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} className="p-0 border-0">
                                        <div className="flex flex-col items-center justify-center p-8 md:p-16 w-full min-h-[200px] text-center bg-white dark:bg-gray-800 border-transparent">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-neutral-50 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-inner border border-neutral-100 dark:border-gray-600 mb-4 transition-all duration-300 hover:scale-105">
                                                {searchTerm
                                                    ? <Search className="text-neutral-300 dark:text-gray-500 w-6 h-6 md:w-7 md:h-7" />
                                                    : <EmptyIcon className="text-neutral-300 dark:text-gray-500 w-6 h-6 md:w-7 md:h-7" />
                                                }
                                            </div>
                                            <div className="space-y-2 w-full max-w-md">
                                                <h4 className="text-sm md:text-base font-bold text-neutral-800 dark:text-gray-200 leading-normal text-center w-full">
                                                    {searchTerm ? 'No se encontraron resultados' : emptyTitle}
                                                </h4>
                                                <p className="text-xs text-neutral-500 dark:text-gray-400 leading-relaxed text-center w-full">
                                                    {searchTerm 
                                                        ? 'No pudimos encontrar datos que coincidan con tu búsqueda.'
                                                        : emptySubtitle}
                                                </p>
                                                {!searchTerm && onAdd && (
                                                    <div className="pt-4 flex justify-center w-full">
                                                        <button 
                                                            onClick={onAdd} 
                                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-black rounded-lg hover:bg-brand-cyan hover:text-black hover:-translate-y-0.5 transition-all w-full md:w-auto shadow-md"
                                                        >
                                                            <Plus size={16} strokeWidth={2.5} />
                                                            Crear Primer Registro
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className={`group hover:bg-neutral-50 dark:hover:bg-gray-700 border-b border-neutral-100 dark:border-gray-700 last:border-0 transition-colors text-xs md:text-sm text-neutral-700 dark:text-gray-300 ${
                                        row.activo === false ? 'opacity-50 grayscale' : 'bg-white dark:bg-gray-800'
                                    }`}>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-3 py-2.5 md:px-4 md:py-3 align-middle ${colIdx > 1 ? 'hidden sm:table-cell' : ''} ${colIdx === 0 ? 'text-black font-bold' : ''}`}>
                                                {col.render ? col.render(row) : <span className="text-neutral-600">{row[col.accessor] ?? '—'}</span>}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || onView) && (
                                            <td className="px-3 py-2.5 md:px-4 md:py-3 text-right align-middle">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {onView && (
                                                        <button
                                                            onClick={() => onView(row)}
                                                            title="Inspeccionar"
                                                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan hover:text-black transition-all"
                                                        >
                                                            <Eye size={14} className="md:w-4 md:h-4" />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(row)}
                                                            title="Modificar"
                                                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-neutral-500 dark:text-gray-400 bg-neutral-100 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 hover:bg-black dark:hover:bg-gray-600 hover:text-white hover:border-black dark:hover:border-gray-500 transition-all"
                                                        >
                                                            <Pencil size={14} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(row)}
                                                            title="Eliminar"
                                                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-red-500 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={14} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
                <div className="flex items-center gap-3 md:gap-4 px-4 py-2 bg-neutral-50 dark:bg-gray-700 rounded-xl border border-neutral-100 dark:border-gray-600">
                     <div className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Activity className="text-brand-cyan" strokeWidth={2.5} size={18} />
                     </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] leading-none mb-1">DATASTREAM</span>
                        <span className="font-black text-xs md:text-sm uppercase tracking-widest text-black leading-none">
                            {processedData.length} REGISTROS
                        </span>
                    </div>
                </div>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-4 md:gap-6 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 p-2 rounded-2xl shadow-sm">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 md:w-12 md:h-12 bg-neutral-50 dark:bg-gray-700 rounded-xl text-neutral-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-neutral-50 dark:disabled:hover:bg-gray-700 transition-all flex items-center justify-center border border-neutral-200 dark:border-gray-600 cursor-pointer"
                        >
                            <ChevronLeft size={20} strokeWidth={3} />
                        </button>
                        
                        <div className="font-black tracking-widest text-sm md:text-base text-neutral-400">
                            <span className="text-black">{currentPage.toString().padStart(2, '0')}</span> 
                            <span className="mx-2">/</span> 
                            {totalPages.toString().padStart(2, '0')}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-xl text-white hover:bg-neutral-800 disabled:opacity-30 disabled:bg-black transition-all flex items-center justify-center font-bold cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <ChevronRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
