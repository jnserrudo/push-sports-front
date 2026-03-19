import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const CYAN = '#00A3CC';
const BLACK = '#000000';
const GRAY_LIGHT = '#F3F4F6';
const GRAY_MID = '#6B7280';
const GRAY_DARK = '#1F2937';

const styles = StyleSheet.create({
  page: { padding: 0, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },

  // Cover/Header band
  headerBand: {
    backgroundColor: BLACK,
    paddingHorizontal: 30,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoMain: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1 },
  logoAccent: { color: CYAN },
  logoSub: { fontSize: 7, color: CYAN, letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' },
  headerRight: { alignItems: 'flex-end' },
  headerLabel: { fontSize: 6, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 },
  headerDate: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  headerType: { fontSize: 7, color: CYAN, textTransform: 'uppercase', letterSpacing: 2, marginTop: 3 },

  // Info strip below header
  infoStrip: { backgroundColor: CYAN, paddingHorizontal: 30, paddingVertical: 7, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoStripText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: BLACK, textTransform: 'uppercase', letterSpacing: 1 },
  infoStripSub: { fontSize: 6, color: BLACK, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 },

  // Metric bar
  metricBar: { flexDirection: 'row', backgroundColor: GRAY_LIGHT, borderBottomWidth: 3, borderBottomColor: BLACK },
  metricCell: { flex: 1, padding: 14, borderRightWidth: 1, borderRightColor: '#E5E7EB', alignItems: 'center' },
  metricLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  metricValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: BLACK },
  metricSub: { fontSize: 6, color: CYAN, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  // Table
  tableContainer: { paddingHorizontal: 30, paddingTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: BLACK, paddingVertical: 7, paddingHorizontal: 8, marginBottom: 1 },
  headerText: { fontSize: 7, color: '#FFFFFF', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 8, alignItems: 'center', backgroundColor: '#FFFFFF' },
  tableRowAlt: { backgroundColor: '#F9FAFB' },

  // Image
  imageWrapper: { width: 120, height: 120, borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  productImage: { width: '125%', height: '125%', objectFit: 'cover' },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 6, backgroundColor: GRAY_LIGHT, justifyContent: 'center', alignItems: 'center' },
  placeholderLetter: { fontSize: 48, fontFamily: 'Helvetica-Bold', color: '#D1D5DB', textTransform: 'uppercase' },

  // Row text
  rowMarca: { fontSize: 6, color: CYAN, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 3 },
  rowNombre: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  rowSabor: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 0.5 },
  pricePush: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#005F7A' },
  pricePublic: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BLACK },
  priceLabel: { fontSize: 5.5, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  footerLeft: { fontSize: 6.5, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1.5 },
  footerRight: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: GRAY_DARK, textTransform: 'uppercase', letterSpacing: 1 },
  pageNum: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },

  // Cyan accent bar on left of row
  accentBar: { width: 3, backgroundColor: CYAN, borderRadius: 2, marginRight: 8, alignSelf: 'stretch' },
});

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price || 0);

const ReportPDF = ({ products, imageMap = {}, currentDate, showPushPrice = true }) => {
  const activeProducts = products.filter(p => p.activo !== false);
  const avgPrice = activeProducts.length > 0
    ? activeProducts.reduce((a, p) => a + Number(p.precio_venta_sugerido || 0), 0) / activeProducts.length
    : 0;
  const marcasUnicas = [...new Set(activeProducts.map(p => p.marca?.nombre_marca).filter(Boolean))].length;

  // Column widths
  const colImg      = { width: showPushPrice ? '34%' : '38%', justifyContent: 'center', alignItems: 'center' };
  const colInfo     = { width: showPushPrice ? '34%' : '42%', paddingRight: 8 };
  const colPush     = showPushPrice ? { width: '16%', alignItems: 'flex-end' } : null;
  const colPublic   = { width: showPushPrice ? '16%' : '20%', alignItems: 'flex-end' };

  return (
    <Document title={`Reporte PushSport — ${currentDate}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Header Band ── */}
        <View style={styles.headerBand}>
          <View>
            <Text style={styles.logoMain}>
              PUSH<Text style={styles.logoAccent}>SPORT</Text>
            </Text>
            <Text style={styles.logoSub}>LISTA DE PRECIOS PARA COMERCIOS</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Fecha de Emisión</Text>
            <Text style={styles.headerDate}>{currentDate}</Text>
            <Text style={styles.headerType}>
              {showPushPrice ? 'PRECIO PÚBLICO + PRECIO PUSH' : 'SOLO PRECIO PÚBLICO'}
            </Text>
          </View>
        </View>

        {/* Info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.infoStripText}>Lista de precios para distribución a comercios</Text>
          <Text style={styles.infoStripSub}>{activeProducts.length} productos · {marcasUnicas} marcas</Text>
        </View>

        {/* ── Metric Bar ── */}
        <View style={styles.metricBar}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Productos</Text>
            <Text style={styles.metricValue}>{activeProducts.length}</Text>
            <Text style={styles.metricSub}>en esta lista</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Marcas</Text>
            <Text style={styles.metricValue}>{marcasUnicas}</Text>
            <Text style={styles.metricSub}>incluidas</Text>
          </View>
          <View style={[styles.metricCell, { borderRightWidth: 0 }]}>
            <Text style={styles.metricLabel}>Precio Público Prom.</Text>
            <Text style={styles.metricValue}>{formatPrice(avgPrice)}</Text>
            <Text style={styles.metricSub}>precio al público</Text>
          </View>
        </View>

        {/* ── Table ── */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={colImg}><Text style={styles.headerText}>Producto</Text></View>
            <View style={colInfo}><Text style={styles.headerText}>Descripción</Text></View>
            {showPushPrice && colPush && <View style={colPush}><Text style={styles.headerText}>P. Push</Text></View>}
            <View style={colPublic}><Text style={styles.headerText}>P. Público ★</Text></View>
          </View>

          {activeProducts.map((prod, idx) => (
            <View
              key={prod.id_producto}
              style={[styles.tableRow, idx % 2 !== 0 && styles.tableRowAlt]}
              wrap={false}
            >
              <View style={colImg}>
                {imageMap[prod.id_producto] ? (
                  <View style={styles.imageWrapper}>
                    <Image src={imageMap[prod.id_producto]} style={styles.productImage} />
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderLetter}>{(prod.nombre || '?').charAt(0)}</Text>
                  </View>
                )}
              </View>

              <View style={{ ...colInfo, flexDirection: 'row' }}>
                <View style={styles.accentBar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowMarca}>{prod.marca?.nombre_marca || 'GENERAL'}</Text>
                  <Text style={styles.rowNombre}>{prod.nombre}</Text>
                  {prod.atributos?.sabores && prod.atributos.sabores.length > 0 && (
                    <Text style={styles.rowSabor}>{prod.atributos.sabores.join(' · ')}</Text>
                  )}
                </View>
              </View>

              {showPushPrice && colPush && (
                <View style={colPush}>
                  <Text style={styles.priceLabel}>Push</Text>
                  <Text style={styles.pricePush}>
                    {prod.precio_pushsport > 0 ? formatPrice(prod.precio_pushsport) : '—'}
                  </Text>
                </View>
              )}

              <View style={colPublic}>
                <Text style={styles.priceLabel}>Público</Text>
                <Text style={styles.pricePublic}>
                  {prod.precio_venta_sugerido > 0 ? formatPrice(prod.precio_venta_sugerido) : '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>PUSH SPORT — Lista de precios para comercios</Text>
          <Text
            style={styles.pageNum}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} / ${totalPages}`}
          />
          <Text style={styles.footerRight}>{currentDate}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default ReportPDF;
