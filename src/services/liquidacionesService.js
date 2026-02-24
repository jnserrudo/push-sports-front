// src/services/liquidacionesService.js
// Mock data inicial
let mockLiquidaciones = [
    { id: 1, sucursal_id: 1, sucursal_nombre: "Sede Centro", total_vendido: 50000, comision_porcentaje: 10, monto_comision: 5000, neto_pagado: 45000, fecha: "2026-02-20T10:00:00Z" },
    { id: 2, sucursal_id: 2, sucursal_nombre: "Sede Norte", total_vendido: 13333, comision_porcentaje: 10, monto_comision: 1333, neto_pagado: 12000, fecha: "2026-02-21T15:30:00Z" }
];

export const liquidacionesService = {
    // Para ver el historial de liquidaciones
    getHistorial: async (sucursalId = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let data = mockLiquidaciones;
                if(sucursalId) {
                    data = data.filter(l => l.sucursal_id === sucursalId);
                }
                resolve([...data]);
            }, 500);
        });
    },

    // Para liquidar una sucursal específica (pone el saldo de la sucursal_id a 0 en sucursales_service e inserta en historial)
    liquidarSucursal: async (sucursalId, totalVendido, comisionPorcentaje, netoPagado) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const nuevaLiq = {
                    id: Date.now(),
                    sucursal_id: sucursalId,
                    sucursal_nombre: `Sucursal #${sucursalId}`, // idealmente vendría del join
                    total_vendido: totalVendido,
                    comision_porcentaje: comisionPorcentaje,
                    monto_comision: totalVendido - netoPagado,
                    neto_pagado: netoPagado,
                    fecha: new Date().toISOString()
                };
                mockLiquidaciones.push(nuevaLiq);
                // NOTA: Acá también deberíamos llamar a un update sobre sucursalesService para poner saldo_pendiente = 0
                resolve(nuevaLiq);
            }, 800);
        });
    }
};
