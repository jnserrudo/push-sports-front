const fs = require('fs');
const crypto = require('crypto');

// Generate static UUIDs for linking
const sucursalCentroId = crypto.randomUUID();
const sucursalNorteId = crypto.randomUUID();

const adminUserId = crypto.randomUUID();
const encargadoUserId = crypto.randomUUID();
const vendedorUserId = crypto.randomUUID();

const ean101Id = crypto.randomUUID();
const ean102Id = crypto.randomUUID();
const ean103Id = crypto.randomUUID();

const provider1Id = crypto.randomUUID();
const provider2Id = crypto.randomUUID();

const mockData = {
    sucursales: [
        { id_comercio: sucursalCentroId, nombre: "Sede Centro", id_tipo_comercio: 1, direccion: "Dean Funes 123", latitud: -24.7821, longitud: -65.4125, imagen_url: "", saldo_acumulado_mili: 0, activo: true },
        { id_comercio: sucursalNorteId, nombre: "Sede Norte", id_tipo_comercio: 1, direccion: "Av. Bolivia 200", latitud: -24.7500, longitud: -65.4000, imagen_url: "", saldo_acumulado_mili: 0, activo: true }
    ],
    usuarios: [
        { id_usuario: adminUserId, nombre: "Admin", apellido: "Sistema", email: "admin@pushsports.com", id_rol: 1, id_comercio_asignado: null, activo: true },
        { id_usuario: encargadoUserId, nombre: "Encargado", apellido: "Local", email: "encargado@pushsports.com", id_rol: 2, id_comercio_asignado: sucursalCentroId, activo: true },
        { id_usuario: vendedorUserId, nombre: "Pedro", apellido: "Sánchez", email: "pedro@pushsports.com", id_rol: 3, id_comercio_asignado: sucursalCentroId, activo: true }
    ],
    proveedores: [
        { id_proveedor: provider1Id, nombre_proveedor: "Suples Mayorista SRL", telefono: "3875111222", razon_social: "Suples SRL", cuit: "30-11111111-2", activo: true },
        { id_proveedor: provider2Id, nombre_proveedor: "Gentech Oficial", telefono: "1141112222", razon_social: "Gentech SA", cuit: "30-22222222-3", activo: true }
    ],
    productos: [
        { id_producto: ean101Id, nombre: "100% Whey Protein - Vainilla", codigo_barras: "779123456001", id_categoria: 1, id_marca: 1, id_proveedor: provider1Id, precio_venta_sugerido: 18500, costo_compra: 12000, imagen_url: "", activo: true },
        { id_producto: ean102Id, nombre: "Creatina Monohidrato 300g", codigo_barras: "779123456002", id_categoria: 2, id_marca: 2, id_proveedor: provider2Id, precio_venta_sugerido: 25000, costo_compra: 18000, imagen_url: "", activo: true },
        { id_producto: ean103Id, nombre: "Isolate Protein - Chocolate", codigo_barras: "779123456003", id_categoria: 1, id_marca: 3, id_proveedor: provider1Id, precio_venta_sugerido: 32000, costo_compra: 22000, imagen_url: "", activo: false }
    ],
    categorias: [
        { id_categoria: 1, nombre: "Proteínas", descripcion: "Suplementos para recuperación y aumento" },
        { id_categoria: 2, nombre: "Aminoácidos", descripcion: "BCAA, Creatinas, Glutaminas" }
    ],
    marcas: [
        { id_marca: 1, nombre_marca: "Ena Sport" },
        { id_marca: 2, nombre_marca: "Star Nutrition" },
        { id_marca: 3, nombre_marca: "Gentech" }
    ],
    inventario: [
        { id_inventario: crypto.randomUUID(), id_comercio: sucursalCentroId, id_producto: ean101Id, cantidad_actual: 15, stock_minimo_alerta: 5, comision_pactada_porcentaje: 10 },
        { id_inventario: crypto.randomUUID(), id_comercio: sucursalCentroId, id_producto: ean102Id, cantidad_actual: 0, stock_minimo_alerta: 10, comision_pactada_porcentaje: 12 },
        { id_inventario: crypto.randomUUID(), id_comercio: sucursalNorteId, id_producto: ean101Id, cantidad_actual: 8, stock_minimo_alerta: 5, comision_pactada_porcentaje: 10 }
    ]
};

console.log("UUIDs generated. Copying these for auth fallback mapping:");
console.log("SUPER_ADMIN:", adminUserId);
console.log("ADMIN_SUCU:", encargadoUserId);
console.log("VENDEDOR:", vendedorUserId);
console.log("SUCURSAL_CENTRO:", sucursalCentroId);

fs.writeFileSync('mockDataNew.json', JSON.stringify(mockData, null, 2));
