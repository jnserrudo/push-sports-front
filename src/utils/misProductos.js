import { inventarioService } from '../services/inventarioService';
import { parseImagenes } from '../lib/supabaseStorage';

const varianteNombre = (v) => {
    const raw = v?.variante || {};
    const attrs = raw.atributos_valores && typeof raw.atributos_valores === 'object'
        ? Object.values(raw.atributos_valores).join(' / ')
        : '';
    return attrs || raw.sku_variante || 'Variante';
};

// Productos asignados a la sucursal (los del catálogo que nunca le llegaron no cuentan).
export const cargarMisProductos = async (sucursalId) => {
    const inv = await inventarioService.getBySucursal(sucursalId);
    return (inv || [])
        .filter(item => item.id_inventario)
        .map(item => {
            const prod = item.producto || {};
            const variantes = (item.variantes || []).map(v => ({
                nombre: varianteNombre(v),
                cantidad: v.cantidad_actual || 0,
            }));
            const usaVariantes = item.usa_desglose_variantes && variantes.length > 0;
            const stock = usaVariantes
                ? variantes.reduce((sum, v) => sum + v.cantidad, 0)
                : (item.cantidad_actual || 0);
            return {
                id: item.id_inventario,
                nombre: prod.nombre || '',
                marca: prod.marca?.nombre_marca || '',
                imagen: parseImagenes(prod.imagen_url)[0] || '',
                variantes: usaVariantes ? variantes : [],
                stock,
                publico: Number(prod.precio_venta_sugerido || 0),
                push: Number(prod.precio_pushsport || 0),
            };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
};
