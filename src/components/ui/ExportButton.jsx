import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ExportButton = ({ 
    data, 
    filename = 'export', 
    format = 'xlsx',
    className = ''
}) => {
    const handleExport = () => {
        if (!data || data.length === 0) {
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.${format}`);
    };
    
    return (
        <button
            onClick={handleExport}
            disabled={!data || data.length === 0}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider ${className}`}
            title={`Exportar a ${format.toUpperCase()}`}
        >
            <Download size={16} />
            Exportar {format.toUpperCase()}
        </button>
    );
};
