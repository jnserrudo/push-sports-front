// src/services/enviosService.js
// Mock data de envíos y su lógica
let mockEnvios = [
    { id: 1, sucursal_id: 1, sucursal_nombre: "Sede Centro", producto_id: 1, producto_nombre: "Whey Protein 1kg Vainilla", cantidad: 10, fecha: "2026-02-22T08:00:00Z" }
];

export const enviosService = {
    getAll: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockEnvios]);
            }, 500);
        });
    },

    crearEnvio: async (sucursalId, productoId, cantidad, sucursalesList, productosList) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const sucursalNombre = sucursalesList.find(s => String(s.id) === String(sucursalId))?.nombre || "Desconocida";
                const productoNombre = productosList.find(p => String(p.id) === String(productoId))?.nombre || "Desconocido";

                const nuevoEnvio = {
                    id: Date.now(),
                    sucursal_id: sucursalId,
                    sucursal_nombre: sucursalNombre,
                    producto_id: productoId,
                    producto_nombre: productoNombre,
                    cantidad: Number(cantidad),
                    fecha: new Date().toISOString()
                };
                mockEnvios.push(nuevoEnvio);
                
                // NOTA: En un caso real, esto impacta en la tabla intermedia stock_sucursal sumando "cantidad" al producto en la sucursal.
                
                resolve(nuevoEnvio);
            }, 800);
        });
    }
};
