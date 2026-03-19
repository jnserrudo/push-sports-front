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

    const processedData = React.useMemo(() => {
        let filtered = data.filter(item => {
            if (!searchTerm) return true;
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
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
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-neutral-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Ambient Accent (Subtle) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-3xl pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />

            {/* Toolbar Principal */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-8 mb-6 md:mb-10 relative z-10">
                <div className="relative flex-1 group w-full min-w-0">
                    <label className="hidden md:block text-xs font-black uppercase tracking-[0.3em] text-neutral-400 mb-2 ml-2">Explorador de Datos</label>
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
                            className="w-full pl-12 md:pl-16 pr-10 md:pr-14 h-12 md:h-16 bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-cyan focus:bg-white text-neutral-900 text-sm md:text-base font-bold tracking-widest uppercase rounded-xl md:rounded-2xl transition-all outline-none placeholder:text-neutral-400 shadow-inner"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition-all bg-white rounded-full p-1"
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
                            className="w-full md:w-auto bg-black text-white px-6 md:px-10 h-12 md:h-16 flex items-center justify-center gap-3 group rounded-xl md:rounded-2xl transition-all hover:bg-brand-cyan hover:text-black hover:shadow-lg hover:-translate-y-0.5"
                            title={addLabel}
                        >
                            <Plus size={20} className="md:w-5 md:h-5 transition-transform group-hover:rotate-90" strokeWidth={3} />
                            <span className="font-black tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm uppercase whitespace-nowrap">{addLabel}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Table Area */}
            <div className="rounded-xl md:rounded-3xl border border-neutral-200 overflow-hidden bg-white shadow-sm relative z-10 w-full mb-4">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-full md:min-w-[800px]">
                        <thead>
                            <tr className="bg-neutral-50/50 text-neutral-500 text-xs md:text-sm font-semibold border-b border-neutral-200">
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`px-4 md:px-8 py-3 md:py-5 whitespace-nowrap ${col.accessor ? 'cursor-pointer hover:bg-neutral-100 transition-colors' : ''} ${idx > 1 ? 'hidden sm:table-cell' : ''}`}
                                        onClick={() => col.accessor && handleSort(col.accessor)}
                                    >
                                        <div className="flex items-center gap-2 leading-none">
                                            {col.header}
                                            {renderSortIcon(col)}
                                        </div>
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th className="px-4 md:px-8 py-3 md:py-5 text-right font-semibold">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} className="p-0 border-0">
                                        <div className="flex flex-col items-center justify-center p-10 md:p-24 w-full min-h-[300px] text-center bg-white border-transparent">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-50 rounded-2xl flex items-center justify-center shadow-inner border border-neutral-100 mb-6 transition-all duration-300 hover:scale-105">
                                                {searchTerm
                                                    ? <Search className="text-neutral-300 w-8 h-8 md:w-10 md:h-10" />
                                                    : <EmptyIcon className="text-neutral-300 w-8 h-8 md:w-10 md:h-10" />
                                                }
                                            </div>
                                            <div className="w-full max-w-md mx-auto space-y-3 flex flex-col items-center justify-center">
                                                <h4 className="text-lg md:text-xl font-bold text-neutral-800 leading-normal text-center w-full">
                                                    {searchTerm ? 'No se encontraron resultados' : emptyTitle}
                                                </h4>
                                                <p className="text-sm text-neutral-500 leading-relaxed text-center w-full">
                                                    {searchTerm 
                                                        ? 'No pudimos encontrar datos que coincidan con tu búsqueda. Intenta ajustar los filtros o el término.'
                                                        : emptySubtitle}
                                                </p>
                                                {!searchTerm && onAdd && (
                                                    <div className="pt-6 flex justify-center w-full">
                                                        <button 
                                                            onClick={onAdd} 
                                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-black rounded-xl hover:bg-brand-cyan hover:text-black hover:-translate-y-0.5 transition-all w-full md:w-auto shadow-md"
                                                        >
                                                            <Plus size={18} strokeWidth={2.5} />
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
                                    <tr key={rowIdx} className={`group hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors text-sm text-neutral-700 ${
                                        row.activo === false ? 'opacity-50 grayscale' : 'bg-white'
                                    }`}>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-4 py-4 md:px-8 md:py-6 align-middle ${colIdx > 1 ? 'hidden sm:table-cell' : ''} ${colIdx === 0 ? 'text-black font-black' : ''}`}>
                                                {col.render ? col.render(row) : <span className="text-neutral-600">{row[col.accessor] ?? '—'}</span>}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || onView) && (
                                            <td className="px-4 py-4 md:px-8 md:py-6 text-right align-middle">
                                                <div className="flex items-center justify-end gap-2">
                                                    {onView && (
                                                        <button
                                                            onClick={() => onView(row)}
                                                            title="Inspeccionar"
                                                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan hover:text-black transition-all"
                                                        >
                                                            <Eye size={18} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(row)}
                                                            title="Modificar"
                                                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-neutral-500 bg-neutral-100 border border-neutral-200 hover:bg-black hover:text-white hover:border-black transition-all"
                                                        >
                                                            <Pencil size={18} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(row)}
                                                            title="Eliminar"
                                                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-red-500 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={18} strokeWidth={2.5} />
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
                <div className="flex items-center gap-3 md:gap-4 px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
                     <div className="w-8 h-8 md:w-10 md:h-10 bg-white border border-neutral-200 rounded-lg flex items-center justify-center shadow-sm">
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
                    <div className="flex items-center gap-4 md:gap-6 bg-white border border-neutral-200 p-2 rounded-2xl shadow-sm">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 md:w-12 md:h-12 bg-neutral-50 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-neutral-50 transition-all flex items-center justify-center border border-neutral-200 cursor-pointer"
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
