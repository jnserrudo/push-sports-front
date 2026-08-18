import { toast } from '../store/toastStore';

const IMAGE_SIZE = 48;
const ROW_HEIGHT = 52;
const IMAGE_COL_WIDTH = 10;

const fetchImageAsPng = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 96, 96);
    const scale = Math.min(96 / bitmap.width, 96 / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (96 - w) / 2, (96 - h) / 2, w, h);
    bitmap.close?.();
    const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    });
    return pngBlob.arrayBuffer();
};

export const exportToExcel = async (rows, filename) => {
    if (!rows || rows.length === 0) {
        toast.error('No hay datos para exportar');
        return false;
    }

    try {
        const hasImages = rows.some((r) => r && r._imageUrl);
        if (hasImages) toast.info('Generando Excel…');

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Datos');

        const headers = Object.keys(rows[0]).filter((k) => k !== '_imageUrl');
        const columns = hasImages
            ? [{ header: 'Foto', key: '_foto', width: IMAGE_COL_WIDTH }, ...headers.map((h) => ({ header: h, key: h, width: 18 }))]
            : headers.map((h) => ({ header: h, key: h, width: 18 }));
        sheet.columns = columns;

        rows.forEach((row) => {
            const data = {};
            headers.forEach((h) => { data[h] = row[h] ?? ''; });
            if (hasImages) data._foto = '';
            const added = sheet.addRow(data);
            if (hasImages) added.height = ROW_HEIGHT;
        });

        if (hasImages) {
            const cache = new Map();
            for (let i = 0; i < rows.length; i += 1) {
                const url = rows[i]._imageUrl;
                if (!url) continue;
                try {
                    let buffer = cache.get(url);
                    if (!buffer) {
                        buffer = await fetchImageAsPng(url);
                        cache.set(url, buffer);
                    }
                    const imageId = workbook.addImage({ buffer, extension: 'png' });
                    // Excel rows are 1-based; row 1 is header
                    sheet.addImage(imageId, {
                        tl: { col: 0, row: i + 1 },
                        ext: { width: IMAGE_SIZE, height: IMAGE_SIZE },
                    });
                } catch (err) {
                    console.warn('No se pudo incrustar imagen:', url, err);
                }
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const safeName = String(filename || 'export').replace(/[\\/:*?"<>|]/g, '_');
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `${safeName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        return true;
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        toast.error('Error al exportar Excel');
        return false;
    }
};
