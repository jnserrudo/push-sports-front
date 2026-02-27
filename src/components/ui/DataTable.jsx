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
    variant // pass 'minimal' for compact layout (no outer shadow/rounded)
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
        <div className="bg-transparent md:bg-white rounded-none md:rounded-[3rem] p-0 md:p-10 md:shadow-premium md:border border-neutral-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* Toolbar Principal */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-12 mb-4 md:mb-16">
                <div className="relative flex-1 group w-full min-w-0">
                    <label className="hidden md:block text-sm font-black uppercase tracking-[0.5em] text-neutral-600 ml-8 mb-6 block text-label-caps">Búsqueda Avanzada</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-10 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-cyan transition-colors">
                            <Search size={18} className="md:w-8 md:h-8" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input-premium pl-10 md:pl-24 pr-8 md:pr-14 h-10 md:h-24 w-full text-[10px] sm:text-xs md:text-base font-black text-black uppercase tracking-widest rounded-xl md:rounded-[2rem] border-2 md:border-[3px] border-black focus:border-brand-cyan focus:bg-white bg-neutral-50 transition-all placeholder:text-neutral-400"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-1.5 md:p-2 text-neutral-400 hover:text-red-500 transition-all"
                            >
                                <XCircle size={16} className="md:w-8 md:h-8" />
                            </button>
                        )}
                    </div>
                </div>

                {onAdd && (
                    <button 
                        onClick={onAdd}
                        className="bg-black text-white border-2 border-black hover:bg-brand-cyan hover:text-black h-10 w-10 sm:w-auto md:h-24 px-0 sm:px-6 md:px-16 flex items-center justify-center gap-0 sm:gap-2 md:gap-6 group flex-shrink-0 rounded-xl md:rounded-[2rem] transition-colors"
                        title={addLabel}
                    >
                        <Plus size={20} className="md:w-8 md:h-8 group-hover:rotate-90 transition-transform" strokeWidth={3} />
                        <span className="hidden sm:inline font-black tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm uppercase whitespace-nowrap">{addLabel}</span>
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="rounded-xl md:rounded-[2.5rem] border-2 md:border-[3px] border-black overflow-hidden bg-white shadow-md md:shadow-xl relative z-10 w-full mb-3 md:mb-0">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-full md:min-w-[800px]">
                        <thead>
                            <tr className="bg-black text-brand-cyan uppercase text-[7px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] font-black border-b-2 border-black">
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`px-2 md:px-3 py-2.5 md:p-10 ${col.accessor ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''} ${idx > 1 ? 'hidden sm:table-cell' : ''}`}
                                        onClick={() => col.accessor && handleSort(col.accessor)}
                                    >
                                        <div className="flex items-center gap-1.5 md:gap-3 leading-none">
                                            {col.header}
                                            {renderSortIcon(col)}
                                        </div>
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th className="px-2 py-2.5 md:p-10 text-right text-white font-black tracking-[0.2em] md:tracking-[0.5em] uppercase">Control</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-black">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="p-8 md:p-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-16 h-16 md:w-24 md:h-24 bg-neutral-100 rounded-[1.5rem] flex items-center justify-center">
                                                {searchTerm
                                                    ? <Search className="text-neutral-300 w-8 h-8 md:w-12 md:h-12" />
                                                    : <Database className="text-neutral-300 w-8 h-8 md:w-12 md:h-12" />
                                                }
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-[10px] md:text-sm font-black text-neutral-400 uppercase tracking-widest">
                                                    {searchTerm ? 'Sin resultados para tu búsqueda' : 'No hay registros aún'}
                                                </span>
                                                {!searchTerm && onAdd && (
                                                    <button onClick={onAdd} className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest hover:underline">
                                                        + Agregar primer registro
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className={`group hover:bg-neutral-50 transition-all border-b border-neutral-200 last:border-0 text-[10px] md:text-sm ${
                                        row.activo === false ? 'opacity-50' : 'bg-white'
                                    }`}>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-2 py-2 md:p-10 uppercase tracking-tighter text-black font-black align-middle ${colIdx > 1 ? 'hidden sm:table-cell' : ''}`}>
                                                {col.render ? col.render(row) : <span className="tracking-widest">{row[col.accessor]}</span>}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || onView) && (
                                            <td className="px-2 py-2 md:p-10 text-right align-middle">
                                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                                    {onView && (
                                                        <button
                                                            onClick={() => onView(row)}
                                                            title="Ver detalle"
                                                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-neutral-500 bg-neutral-100 hover:bg-neutral-200 hover:text-black transition-all"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(row)}
                                                            title="Editar"
                                                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-white bg-black hover:bg-brand-cyan hover:text-black transition-all"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(row)}
                                                            title="Desactivar"
                                                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-white bg-red-500 hover:bg-red-700 transition-all"
                                                        >
                                                            <Trash2 size={14} />
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
            <div className="mt-0 md:mt-16 flex items-center justify-between gap-2 md:gap-12 bg-black md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none">
                <div className="flex items-center gap-2 md:gap-6 bg-transparent w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2 md:gap-6">
                         <div className="p-2 md:p-6 bg-transparent md:bg-neutral-900 border-0 md:border-2 border-neutral-900 rounded-md md:rounded-[1.5rem] md:shadow-xl hidden sm:block">
                              <Activity className="text-brand-cyan md:w-8 md:h-8" strokeWidth={3} size={16} />
                         </div>
                        <div className="flex flex-col ml-2 sm:ml-0">
                            <span className="text-[6px] md:text-xs font-black text-neutral-400 uppercase tracking-[0.3em] md:tracking-[0.4em] leading-none">TOTAL MÓDULO</span>
                            <span className="font-black text-[9px] md:text-base uppercase tracking-widest text-white md:text-neutral-900 mt-1 md:mt-2 leading-none">
                                {processedData.length} FILAS
                            </span>
                        </div>
                    </div>
                </div>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 md:gap-10 pr-2 md:pr-0">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 md:w-20 md:h-20 bg-neutral-800 md:bg-white border-0 md:border-4 border-neutral-100 rounded-lg md:rounded-[2rem] text-white md:text-neutral-400 hover:bg-neutral-700 md:hover:text-black hover:border-black disabled:opacity-20 transition-all flex items-center justify-center md:shadow-lg"
                        >
                            <ChevronLeft size={14} md:size={32} strokeWidth={3} />
                        </button>
                        
                        <div className="flex flex-col items-center min-w-[2.5rem]">
                            <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.5em] text-neutral-400 mb-2">SECTOR</span>
                            <div className="font-black tracking-tighter text-xs md:text-4xl text-white md:text-black leading-none">
                                <span className="text-brand-cyan">{currentPage.toString().padStart(2, '0')}</span> 
                                <span className="mx-1 md:mx-4 text-neutral-600 md:text-neutral-200">/</span> 
                                {totalPages.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 md:w-20 md:h-20 bg-neutral-800 md:bg-white border-0 md:border-4 border-neutral-100 rounded-lg md:rounded-[2rem] text-white md:text-neutral-400 hover:bg-brand-cyan hover:text-black md:hover:border-black disabled:opacity-20 transition-all flex items-center justify-center md:shadow-lg"
                        >
                            <ChevronRight size={14} md:size={32} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
