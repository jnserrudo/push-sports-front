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

const PosComprobantePDF = ({ 
  venta, 
  fecha, 
  metodoPagoDoc, 
  detalles, 
  descuentoMonto, 
  totalVenta 
}) => {
  const sortedDetalles = [...detalles].sort((a,b) => (a.codigo || '').localeCompare(b.codigo || ''));

  const colCodigo = { width: '15%', justifyContent: 'center' };
  const colInfo = { width: '40%', paddingRight: 6 };
  const colCant = { width: '10%', alignItems: 'center' };
  const colPrecio = { width: '15%', alignItems: 'flex-end' };
  const colTotal = { width: '20%', alignItems: 'flex-end' };

  const idText = venta.id_venta ? String(venta.id_venta).toUpperCase() : 'N/A';

  return (
    <Document title={`Comprobante_Venta_${idText}`}>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerBand}>
          <View style={styles.brandBlock}>
            <Text style={styles.logoMain}>COMPROBANTE</Text>
            <Text style={styles.logoSub}>TICKET DE VENTA OFICIAL</Text>
          </View>
          <View style={styles.shopBlock}>
            <Text style={styles.shopLabel}>Sede de Venta</Text>
            <Text style={styles.shopName}>{venta.comercio?.nombre_comercio || 'Tienda Principal'}</Text>
            <Text style={styles.shopType}>ID: #{venta.id_venta}</Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <Text style={styles.infoStripText}>Fecha: {fecha}</Text>
          <Text style={styles.infoStripText}>Método de Pago: {metodoPagoDoc}</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={colCodigo}><Text style={styles.headerText}>Código</Text></View>
            <View style={colInfo}><Text style={styles.headerText}>Producto</Text></View>
            <View style={colCant}><Text style={styles.headerText}>Cant</Text></View>
            <View style={colPrecio}><Text style={styles.headerText}>P. Unit</Text></View>
            <View style={colTotal}><Text style={styles.headerText}>Subtotal</Text></View>
          </View>

          {sortedDetalles.map((prod, index) => {
            const lineTotal = prod.precio * prod.cantidad;
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
                <View style={colPrecio}>
                  <Text style={styles.priceLabel}>Cobrado</Text>
                  <Text style={styles.pricePublic}>{formatPrice(prod.precio)}</Text>
                </View>
                <View style={colTotal}>
                  <Text style={styles.priceLabel}>Neto</Text>
                  <Text style={styles.pricePublic}>{formatPrice(lineTotal)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.totalContainer}>
          {descuentoMonto > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento Aplicado</Text>
              <Text style={styles.totalValue}>-{formatPrice(descuentoMonto)}</Text>
            </View>
          )}
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total de Venta</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(totalVenta)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Comprobante de Venta</Text>
          <Text style={styles.footerCenter}>Gracias por su compra</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

export default PosComprobantePDF;
