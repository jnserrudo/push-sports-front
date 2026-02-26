import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  XCircle,
  Plus
} from 'lucide-react';

const DataTable = ({ 
    columns, 
    data, 
    searchPlaceholder = "BUSCAR REGISTROS...",
    onAdd,
    addLabel = "NUEVO REGISTRO",
    onEdit,
    onDelete,
    onView
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
        <div className="bg-white rounded-3xl md:rounded-[3rem] p-4 md:p-10 shadow-premium border border-neutral-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* Toolbar Principal */}
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-6 md:gap-12 mb-8 md:mb-16">
                <div className="relative flex-1 max-w-2xl group">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-neutral-400 ml-4 md:ml-8 mb-4 md:mb-6 block text-label-caps">Búsqueda Avanzada</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-6 md:pl-10 flex items-center pointer-events-none text-neutral-300 group-focus-within:text-brand-cyan transition-colors">
                            <Search size={24} md:size={32} />
                        </div>
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input-premium pl-16 md:pl-24 pr-10 md:pr-14 py-4 md:py-10 text-xs md:text-base uppercase tracking-widest h-14 md:h-24"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 text-neutral-300 hover:text-red-500 transition-all"
                            >
                                <XCircle size={24} md:size={32} />
                            </button>
                        )}
                    </div>
                </div>

                {onAdd && (
                    <button 
                        onClick={onAdd}
                        className="btn-cyan h-16 md:h-24 px-8 md:px-16 flex items-center justify-center gap-4 md:gap-6 group shadow-glow"
                    >
                        <Plus size={24} md:size={32} className="group-hover:rotate-90 transition-transform" />
                        <span className="font-black tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm uppercase whitespace-nowrap">{addLabel}</span>
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="rounded-2xl md:rounded-[2.5rem] border border-neutral-100 overflow-hidden bg-white shadow-xl relative z-10">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-full md:min-w-[800px]">
                        <thead>
                            <tr className="bg-neutral-50 text-neutral-900 uppercase text-[9px] md:text-xs tracking-[0.3em] md:tracking-[0.4em] font-black border-b border-neutral-100">
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`p-4 md:p-10 ${col.accessor ? 'cursor-pointer hover:bg-brand-cyan/5 transition-colors' : ''} ${idx > 2 ? 'hidden sm:table-cell' : ''}`}
                                        onClick={() => col.accessor && handleSort(col.accessor)}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {col.header}
                                            {renderSortIcon(col)}
                                        </div>
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th className="p-4 md:p-10 text-right text-neutral-500 font-black tracking-[0.3em] md:tracking-[0.5em] uppercase">Control</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-neutral-900">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="p-12 md:p-24 text-center">
                                        <div className="flex flex-col items-center gap-4 md:gap-6 text-neutral-200 italic">
                                            <Filter size={40} md:size={60} className="opacity-20" />
                                            <p className="font-extrabold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs text-neutral-400">Sin registros</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="group hover:bg-brand-cyan/[0.05] transition-all font-black border-b-2 md:border-b-4 border-neutral-50 last:border-0 text-[10px] md:text-sm">
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`p-4 md:p-10 uppercase tracking-tighter text-neutral-900 font-black ${colIdx > 2 ? 'hidden sm:table-cell' : ''}`}>
                                                {col.render ? col.render(row) : <span className="tracking-widest">{row[col.accessor]}</span>}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || onView) && (
                                            <td className="p-4 md:p-10 text-right space-x-2 md:space-x-4 whitespace-nowrap">
                                                {onView && (
                                                    <button onClick={() => onView(row)} className="px-3 md:px-10 py-2 md:py-4 text-[8px] md:text-[10px] uppercase font-black tracking-widest text-neutral-900 bg-white border-2 md:border-4 border-neutral-900 rounded-xl md:rounded-2xl hover:bg-neutral-900 hover:text-white transition-all">
                                                        Detalle
                                                    </button>
                                                )}
                                                 {onEdit && (
                                                     <button onClick={() => onEdit(row)} className="px-3 md:px-10 py-2 md:py-4 text-[8px] md:text-[10px] uppercase font-black tracking-widest text-brand-cyan bg-white border-2 md:border-4 border-brand-cyan rounded-xl md:rounded-2xl hover:bg-brand-cyan hover:text-black transition-all">
                                                         Edit
                                                     </button>
                                                 )}
                                                 {onDelete && (
                                                     <button onClick={() => onDelete(row)} className="px-3 md:px-10 py-2 md:py-4 text-[8px] md:text-[10px] uppercase font-black tracking-widest text-red-600 bg-white border-2 md:border-4 border-red-600 rounded-xl md:rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                                                         Del
                                                     </button>
                                                 )}
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
            <div className="mt-8 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                <div className="flex items-center gap-4 md:gap-6">
                     <div className="p-4 md:p-6 bg-neutral-900 border-2 border-neutral-900 rounded-2xl md:rounded-[1.5rem] shadow-xl">
                          <Activity size={24} md:size={32} className="text-brand-cyan" />
                     </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-xs font-black text-neutral-400 uppercase tracking-[0.3em] md:tracking-[0.4em]">SINCRONIZACIÓN</span>
                        <span className="font-black text-sm md:text-base uppercase tracking-widest text-neutral-900 mt-1 md:mt-2">
                            {processedData.length} REGISTROS
                        </span>
                    </div>
                </div>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-6 md:gap-10">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-14 h-14 md:w-20 md:h-20 bg-white border-2 md:border-4 border-neutral-100 rounded-2xl md:rounded-[2rem] text-neutral-300 hover:text-black hover:border-black disabled:opacity-20 transition-all flex items-center justify-center shadow-lg"
                        >
                            <ChevronLeft size={24} md:size={32} />
                        </button>
                        
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-neutral-400 mb-1 md:mb-2">SECTOR</span>
                            <div className="font-black tracking-tighter text-2xl md:text-4xl">
                                <span className="text-brand-cyan">{currentPage.toString().padStart(2, '0')}</span> 
                                <span className="mx-2 md:mx-4 text-neutral-100">/</span> 
                                {totalPages.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-14 h-14 md:w-20 md:h-20 bg-white border-2 md:border-4 border-neutral-100 rounded-2xl md:rounded-[2rem] text-neutral-300 hover:text-black hover:border-black disabled:opacity-20 transition-all flex items-center justify-center shadow-lg"
                        >
                            <ChevronRight size={24} md:size={32} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
