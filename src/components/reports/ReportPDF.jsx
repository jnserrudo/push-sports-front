import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

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

  headerRight: { alignItems: 'flex-end' },
  headerLabel: { fontSize: 7, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  headerDate: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK },
  headerType: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  infoStrip: { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 30, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoStripText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: GRAY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoStripSub: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },

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

  tableContainer: { paddingHorizontal: 30, paddingTop: 15, paddingBottom: 40 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 8, paddingHorizontal: 8 },
  headerText: { fontSize: 7, color: GRAY_DARK, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', backgroundColor: '#FFFFFF' },
  tableRowAlt: { backgroundColor: '#FFFFFF' },

  imagesContainer: { flexDirection: 'column', gap: 8, width: '100%', alignItems: 'center' },
  imageWrapper: { width: 90, height: 90, borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  productImage: { width: '100%', height: '100%', objectFit: 'contain' },
  imagePlaceholder: { width: 90, height: 90, borderRadius: 6, backgroundColor: GRAY_LIGHT, justifyContent: 'center', alignItems: 'center' },
  placeholderLetter: { fontSize: 40, fontFamily: 'Helvetica-Bold', color: '#D1D5DB', textTransform: 'uppercase' },

  rowCodigo: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  accentBar: { width: 3, backgroundColor: '#E5E7EB', borderRadius: 2, marginRight: 8, alignSelf: 'stretch' },
  rowMarca: { fontSize: 6, color: GRAY_DARK, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 3 },
  rowNombre: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  rowDescription: { fontSize: 7, color: GRAY_MID, marginBottom: 4, lineHeight: 1.3 },
  rowSabor: { fontSize: 6.5, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 0.5 },

  priceLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  pricePush: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#005F7A' },
  pricePublic: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK },

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
  footerRight: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },
  pageNum: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },
});

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price || 0);

const ReportPDF = ({ products, imageMap = {}, currentDate, showPushPrice = true }) => {
  const activeProducts = products.filter(p => p.activo !== false);
  const avgPrice = activeProducts.length > 0
    ? activeProducts.reduce((a, p) => a + Number(p.precio_venta_sugerido || 0), 0) / activeProducts.length
    : 0;
  const marcasUnicas = [...new Set(activeProducts.map(p => p.marca?.nombre_marca).filter(Boolean))].length;

  const colCodigo   = { width: '12%', justifyContent: 'center', alignItems: 'center' };
  const colImg      = { width: showPushPrice ? '22%' : '26%', justifyContent: 'center', alignItems: 'center' };
  const colInfo     = { width: showPushPrice ? '34%' : '42%', paddingRight: 8 };
  const colPush     = showPushPrice ? { width: '16%', alignItems: 'flex-end' } : null;
  const colPublic   = { width: showPushPrice ? '16%' : '20%', alignItems: 'flex-end' };

  return (
    <Document title={`Reporte PushSport — ${currentDate}`}>
      <Page size="A4" style={styles.page}>

        <View style={styles.headerBand}>
          <View style={styles.brandBlock}>
            <Text style={styles.logoMain}>CATÁLOGO</Text>
            <Text style={styles.logoSub}>LISTA DE PRECIOS GLOBAL</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Fecha de Emisión</Text>
            <Text style={styles.headerDate}>{currentDate}</Text>
            <Text style={styles.headerType}>
              {showPushPrice ? 'PRECIO PÚBLICO + PRECIO PUSH' : 'SOLO PRECIO PÚBLICO'}
            </Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <Text style={styles.infoStripText}>Lista de precios para distribución a comercios</Text>
          <Text style={styles.infoStripSub}>{activeProducts.length} productos · {marcasUnicas} marcas</Text>
        </View>

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

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={colCodigo}><Text style={styles.headerText}>Código</Text></View>
            <View style={colImg}><Text style={styles.headerText}>Producto</Text></View>
            <View style={colInfo}><Text style={styles.headerText}>Descripción</Text></View>
            {showPushPrice && colPush && <View style={colPush}><Text style={styles.headerText}>P. Push</Text></View>}
            <View style={colPublic}><Text style={styles.headerText}>P. Público</Text></View>
          </View>

          {activeProducts.map((prod, idx) => {
            const images = Array.isArray(imageMap[prod.id_producto]) ? imageMap[prod.id_producto] : (imageMap[prod.id_producto] ? [imageMap[prod.id_producto]] : []);
            
            return (
            <View
              key={prod.id_producto}
              style={[styles.tableRow, idx % 2 !== 0 && styles.tableRowAlt]}
              wrap={false}
            >
              <View style={colCodigo}>
                <Text style={styles.rowCodigo}>{prod.codigo_producto?.codigo || '-'}</Text>
              </View>

              <View style={colImg}>
                {images.length > 0 ? (
                  <View style={styles.imagesContainer}>
                    {images.map((img, i) => (
                      <View key={i} style={styles.imageWrapper}>
                        <Image src={img} style={styles.productImage} />
                      </View>
                    ))}
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
                  {prod.descripcion && (
                    <Text style={styles.rowDescription}>{prod.descripcion}</Text>
                  )}
                  {prod.atributos && Object.entries(prod.atributos).map(([key, values]) => {
                    if (!values || values.length === 0) return null;
                    const displayKey = key.toUpperCase();
                    const displayValues = Array.isArray(values) ? values.join(' · ') : values;
                    return (
                      <Text key={key} style={styles.rowSabor}>
                        {displayKey}: {displayValues}
                      </Text>
                    );
                  })}
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
          )})}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Catálogo Global · precios para comercios</Text>
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
