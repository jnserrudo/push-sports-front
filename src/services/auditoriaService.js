// src/services/auditoriaService.js
// Mock data inicial
let mockTransacciones = [
    { id: 1, tipo: "LIQUIDACION", descripcion: "Mili liquidó Sede Centro por $45,000 netos.", usuario: "Mili Admin", fecha: "2026-02-20T10:05:00Z" },
    { id: 2, tipo: "VENTA", descripcion: "Pedro vendió 2x Whey Protein en Sede Centro.", usuario: "Pedro Vendedor", fecha: "2026-02-21T18:20:00Z" },
    { id: 3, tipo: "ENVIO", descripcion: "Mili envió 10x Creatina a Sede Norte.", usuario: "Mili Admin", fecha: "2026-02-22T09:15:00Z" }
];

export const auditoriaService = {
    getAll: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                // Ordenar por fecha descendente
                const sorted = [...mockTransacciones].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
                resolve(sorted);
            }, 600);
        });
    },

    // Esta función no se expone en UI directamente, es para uso de otros servicios internamente
    logAction: (tipo, descripcion, usuario) => {
        mockTransacciones.push({
            id: Date.now(),
            tipo,
            descripcion,
            usuario,
            fecha: new Date().toISOString()
        });
    }
};
