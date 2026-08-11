import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const CYAN = '#00A3CC';
const BLACK = '#000000';
const GRAY_LIGHT = '#F3F4F6';
const GRAY_MID = '#6B7280';
const GRAY_DARK = '#1F2937';

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingHorizontal: 0, paddingBottom: 55, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },

  headerBand: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  brandBlock: { flexDirection: 'column' },
  logoMain: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: BLACK, letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1 },
  logoSub: { fontSize: 8, color: GRAY_MID, letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },

  shopBlock: { alignItems: 'flex-end', flex: 1, paddingLeft: 20 },
  shopLabel: { fontSize: 7, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  shopName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: BLACK, textTransform: 'uppercase', textAlign: 'right' },
  shopType: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  infoStrip: { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 30, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoStripText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: GRAY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 },

  metricBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metricCell: { flex: 1, padding: 15, borderRightWidth: 1, borderRightColor: '#E5E7EB', alignItems: 'center' },
  metricLabel: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  metricValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: BLACK },
  metricSub: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },

  tableContainer: { paddingHorizontal: 30, paddingTop: 15, paddingBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 8, paddingHorizontal: 8 },
  headerText: { fontSize: 7, color: GRAY_DARK, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', backgroundColor: '#FFFFFF' },
  tableRowAlt: { backgroundColor: '#FFFFFF' },
  
  rowCodigo: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  rowNombre: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  
  priceLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  pricePublic: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK },
  pricePush: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#005F7A' },

  totalContainer: { paddingHorizontal: 30, paddingTop: 10, paddingBottom: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 8 },
  totalLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: GRAY_DARK, textTransform: 'uppercase' },
  totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', paddingVertical: 10, backgroundColor: '#F9FAFB', paddingHorizontal: 12, marginTop: 6, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: BLACK },
  grandTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BLACK, textTransform: 'uppercase' },
  grandTotalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: BLACK },
  
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerLeft: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },
  footerCenter: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 },
  footerRight: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },
});

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price || 0);

const LiquidacionPDF = ({ row, viewMode = 'interno' }) => {
  const esSucursal = viewMode === 'sucursal';
  const productos = row.resumen_productos || [];
  const sortedProductos = [...productos].sort((a,b) => (a.codigo || '').localeCompare(b.codigo || ''));

  const idLiq = String(row.id_liquidacion).split('-')[0].toUpperCase();
  const fechaStr = new Date(row.fecha_cierre).toLocaleString('es-AR');

  // Anchos de columna según modo
  const colCodigo = { width: esSucursal ? '15%' : '12%', justifyContent: 'center' };
  const colInfo = { width: esSucursal ? '45%' : '38%', paddingRight: 6 };
  const colCant = { width: esSucursal ? '12%' : '10%', alignItems: 'center' };
  const colCobrado = { width: '15%', alignItems: 'flex-end' };
  const colPush = { width: esSucursal ? '18%' : '15%', alignItems: 'flex-end' };
  const colTotal = { width: esSucursal ? '10%' : '10%', alignItems: 'flex-end' };

  return (
    <Document title={`Liquidacion_${row.comercio_nombre}_${idLiq}`}>
      <Page size="A4" style={styles.page}>

        <View style={styles.headerBand}>
          <View style={styles.brandBlock}>
            <Text style={styles.logoMain}>{esSucursal ? 'COMPROBANTE' : 'INFORME'}</Text>
            <Text style={styles.logoSub}>{esSucursal ? 'COMPROBANTE DE LIQUIDACIÓN' : 'RECIBO OFICIAL DE LIQUIDACIÓN'}</Text>
          </View>
          <View style={styles.shopBlock}>
            <Text style={styles.shopLabel}>Sede Auditada</Text>
            <Text style={styles.shopName}>{row.comercio_nombre}</Text>
            <Text style={styles.shopType}>ID: #{idLiq}</Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <Text style={styles.infoStripText}>{esSucursal ? 'Detalle de lo abonado a la empresa' : 'Detalle de liquidación de ventas'}</Text>
          <Text style={styles.infoStripText}>Fecha de Cierre: {fechaStr}</Text>
        </View>

        <View style={styles.metricBar}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Ventas Incluidas</Text>
            <Text style={styles.metricValue}>{row.cant_ventas || 0}</Text>
            <Text style={styles.metricSub}>tickets procesados</Text>
          </View>
          {!esSucursal && (
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Volumen Bruto</Text>
              <Text style={styles.metricValue}>{formatPrice(row.total_bruto)}</Text>
              <Text style={styles.metricSub}>total recaudado</Text>
            </View>
          )}
          <View style={[styles.metricCell, { borderRightWidth: 0 }]}>
            <Text style={styles.metricLabel}>{esSucursal ? 'Total a Abonar' : 'Neto Liquidado'}</Text>
            <Text style={styles.metricValue}>{formatPrice(row.total_ventas_netas)}</Text>
            <Text style={styles.metricSub}>{esSucursal ? 'monto a cancelar' : 'a favor de la empresa'}</Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={colCodigo}><Text style={styles.headerText}>Código</Text></View>
            <View style={colInfo}><Text style={styles.headerText}>Producto</Text></View>
            <View style={colCant}><Text style={styles.headerText}>Cant</Text></View>
            {!esSucursal && (
              <View style={colCobrado}><Text style={styles.headerText}>P. Cobrado</Text></View>
            )}
            <View style={colPush}><Text style={styles.headerText}>{esSucursal ? 'P. Unitario' : 'P. Push'}</Text></View>
            <View style={colTotal}><Text style={styles.headerText}>{esSucursal ? 'Subtotal' : 'Total Neto'}</Text></View>
          </View>

          {sortedProductos.map((prod, index) => {
            const precioUnitarioCobrado = (prod.total_bruto || 0) / (prod.cantidad || 1);
            const precioUnitarioPush = (prod.total_neto || 0) / (prod.cantidad || 1);

            return (
              <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowAlt]} wrap={false}>
                <View style={colCodigo}>
                  <Text style={styles.rowCodigo}>{prod.codigo || '-'}</Text>
                </View>
                <View style={colInfo}>
                  <Text style={styles.rowNombre}>{prod.nombre}</Text>
                </View>
                <View style={colCant}>
                  <Text style={styles.rowNombre}>{prod.cantidad}</Text>
                </View>
                {!esSucursal && (
                  <View style={colCobrado}>
                    <Text style={styles.priceLabel}>Uni</Text>
                    <Text style={styles.pricePublic}>{formatPrice(precioUnitarioCobrado)}</Text>
                  </View>
                )}
                <View style={colPush}>
                  <Text style={styles.priceLabel}>Uni</Text>
                  <Text style={styles.pricePush}>{formatPrice(precioUnitarioPush)}</Text>
                </View>
                <View style={colTotal}>
                  <Text style={styles.priceLabel}>Subt</Text>
                  <Text style={styles.pricePush}>{formatPrice(prod.total_neto)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.totalContainer}>
          {!esSucursal && row.desglose_metodo_pago && Object.entries(row.desglose_metodo_pago).map(([metodo, total], i) => (
            <View key={i} style={styles.totalRow}>
              <Text style={styles.totalLabel}>Recaudado {metodo}</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          ))}

          {!esSucursal && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Volumen Bruto (Todas las ventas)</Text>
              <Text style={styles.totalValue}>{formatPrice(row.total_bruto)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>{esSucursal ? 'Total a Abonar' : 'Neto Liquidado'}</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(row.total_ventas_netas)}</Text>
          </View>
          {row.diferencia !== 0 && (
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>{row.diferencia > 0 ? 'Sobrante de Caja' : 'Faltante de Caja'}</Text>
              <Text style={[styles.grandTotalValue, { color: row.diferencia > 0 ? '#008000' : '#DC2626' }]}>
                {row.diferencia > 0 ? '+' : ''}{formatPrice(row.diferencia)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Recibo de Liquidación</Text>
          <Text style={styles.footerCenter}>Generado automáticamente por el sistema</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

export default LiquidacionPDF;
