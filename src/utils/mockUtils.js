export const generateUUID = () => {
    // Basic UUID generator for mock frontend usage.
    // In production, the DB will assign realistic UUIDv4s.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const defaultActivo = true;

// Mapped factor for movements (Inventario)
export const TIPO_MOVIMIENTO = {
    VENTA: { id: 1, nombre: 'Venta', factor: -1 },
    INGRESO: { id: 2, nombre: 'Ingreso', factor: 1 },
    MERMA: { id: 3, nombre: 'Merma', factor: -1 }
};
