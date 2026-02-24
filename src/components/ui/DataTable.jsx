import React, { useState } from 'react';
import { 
  SearchNormal1, 
  ArrowDown, 
  ArrowUp, 
  ArrowSwapHorizontal, 
  ArrowLeft2, 
  ArrowRight2,
  FilterSearch,
  CloseCircle,
  Add
} from 'iconsax-react';

const DataTable = ({ 
    columns, 
    data, 
    searchPlaceholder = "Buscar registros...",
    onAdd,
    addLabel = "Nuevo Registro",
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
        if (sortConfig.key !== col.accessor) return <ArrowSwapHorizontal size={14} className="ml-2 opacity-20" />;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp size={14} className="ml-2 text-brand-cyan" variant="Bold" /> 
            : <ArrowDown size={14} className="ml-2 text-brand-cyan" variant="Bold" />;
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-premium border border-neutral-100 relative overflow-hidden">
            
            {/* Toolbar Principal */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-end gap-8 mb-10">
                <div className="relative flex-1 max-w-xl group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300 ml-4 mb-2.5 block">Explorar Base de Datos</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-300 group-focus-within:text-brand-cyan transition-colors">
                            <SearchNormal1 size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input-premium pl-12 pr-10 py-3.5 text-xs shadow-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-neutral-900 transition-colors"
                            >
                                <CloseCircle size={18} variant="Bold" />
                            </button>
                        )}
                    </div>
                </div>

                {onAdd && (
                    <button 
                        onClick={onAdd}
                        className="btn-cyan py-3.5 px-8 flex items-center gap-2 group h-12"
                    >
                        <Add size={18} variant="Bold" className="group-hover:rotate-90 transition-transform" />
                        <span className="font-bold tracking-widest text-[11px] uppercase">{addLabel}</span>
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="rounded-2xl border border-neutral-100 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-neutral-50/50 text-neutral-400 uppercase text-[9px] tracking-[0.2em] font-bold border-b border-neutral-100">
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx} 
                                    className={`p-6 ${col.accessor ? 'cursor-pointer hover:bg-neutral-100 transition-colors' : ''}`}
                                    onClick={() => col.accessor && handleSort(col.accessor)}
                                >
                                    <div className="flex items-center">
                                        {col.header}
                                        {renderSortIcon(col)}
                                    </div>
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <th className="p-6 text-right opacity-30">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-24 text-center">
                                    <div className="flex flex-col items-center gap-4 text-neutral-200">
                                        <FilterSearch size={64} variant="Bulk" />
                                        <p className="font-bold uppercase tracking-widest text-[10px]">Sin resultados encontrados</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-all font-medium">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="p-6 text-xs text-neutral-600">
                                            {col.render ? col.render(row) : <span className="uppercase tracking-tight">{row[col.accessor]}</span>}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || onView) && (
                                        <td className="p-6 text-right space-x-1 whitespace-nowrap">
                                            {onView && (
                                                <button onClick={() => onView(row)} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-neutral-100 hover:shadow-sm">
                                                    Ver
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:border-brand-cyan hover:text-brand-cyan transition-all shadow-sm">
                                                    Editar
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row)} className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-white bg-neutral-900 border border-neutral-900 rounded-lg hover:bg-red-500 hover:border-red-500 transition-all shadow-sm">
                                                    Eliminar
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

            {/* Pagination */}
            <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="bg-neutral-50 px-5 py-2 rounded-full border border-neutral-100 font-bold uppercase text-[9px] tracking-widest text-neutral-400">
                    Total: <span className="text-neutral-900">{processedData.length} Registros</span>
                </div>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:border-brand-cyan disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                        >
                            <ArrowLeft2 size={20} variant="Bold" />
                        </button>
                        
                        <div className="px-6 py-3 font-bold text-xs tabular-nums text-neutral-400">
                            Página <span className="text-neutral-900">{currentPage}</span> / {totalPages}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:border-brand-cyan disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                        >
                            <ArrowRight2 size={20} variant="Bold" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
