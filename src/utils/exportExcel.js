import * as XLSX from 'xlsx';
import { toast } from '../store/toastStore';

export const exportToExcel = (rows, filename) => {
    if (!rows || rows.length === 0) {
        toast.error('No hay datos para exportar');
        return false;
    }

    try {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        const safeName = String(filename || 'export').replace(/[\\/:*?"<>|]/g, '_');
        XLSX.writeFile(wb, `${safeName}.xlsx`);
        return true;
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        toast.error('Error al exportar Excel');
        return false;
    }
};
