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

  stockCell: { flexDirection: 'column', gap: 2 },
  stockLine: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  stockDot: { width: 4, height: 4, borderRadius: 2 },
  stockLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  stockVal: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY_DARK },
  stockTotalLine: { flexDirection: 'row', alignItems: 'center', gap: 3, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 2, marginTop: 1 },
  stockTotalVal: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BLACK },

  priceLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  priceBase: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#B45309' },
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
  footerCenter: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 },
  footerRight: { fontSize: 7, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },
});

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price || 0);

const ShopReportPDF = ({ shopName, items, imageMap = {}, currentDate, showPushPrice = false, showBasePrice = false, reportNumber = '' }) => {
  const totalUnidades = items.reduce((acc, curr) => acc + (Number(curr.cantidadDejada) || 0), 0);
  const totalProductos = items.length;
  const stockTotalActual = items.reduce(
    (acc, curr) => acc + (Number(curr.stockAnterior) || 0) + (Number(curr.cantidadDejada) || 0),
    0
  );

  const activePriceCols = (showPushPrice ? 1 : 0) + (showBasePrice ? 1 : 0);
  const colCodigo   = { width: '12%', justifyContent: 'center', alignItems: 'center' };
  const colImg      = { width: activePriceCols > 0 ? '16%' : '20%', justifyContent: 'center', alignItems: 'center' };
  const colInfo     = { width: activePriceCols > 0 ? '24%' : '28%', paddingRight: 6 };
  const colDetalle  = { width: activePriceCols > 0 ? '13%' : '14%', paddingRight: 4 };
  const colBase     = showBasePrice ? { width: '12%', alignItems: 'flex-end' } : null;
  const colPush     = showPushPrice ? { width: '12%', alignItems: 'flex-end' } : null;
  const colPublic   = { width: activePriceCols > 0 ? '11%' : '16%', alignItems: 'flex-end' };

  return (
    <Document title={`Reporte_${shopName || 'Comercio'}_${currentDate}`}>
      <Page size="A4" style={styles.page}>

        {/* Top Header */}
        <View style={styles.headerBand}>
          <View style={styles.brandBlock}>
            <Text style={styles.logoMain}>INFORME</Text>
            <Text style={styles.logoSub}>LISTA DE PRECIOS</Text>
          </View>
          <View style={styles.shopBlock}>
            <Text style={styles.shopLabel}>Comercio Destino</Text>
            <Text style={styles.shopName}>{shopName || 'SIN NOMBRE'}</Text>
            {reportNumber ? (
              <Text style={styles.shopType}>N° {reportNumber}</Text>
            ) : (
              <Text style={styles.shopType}>
                {showPushPrice ? 'CON PRECIO PUSH INCLUIDO' : 'PRECIOS PÚBLICOS'}
              </Text>
            )}
          </View>
        </View>

        {/* Info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.infoStripText}>Productos a entregar en esta visita</Text>
          <Text style={styles.infoStripText}>Fecha: {currentDate}</Text>
        </View>

        {/* ── Metric Bar ── */}
        <View style={styles.metricBar}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Productos a entregar</Text>
            <Text style={styles.metricValue}>{totalProductos}</Text>
            <Text style={styles.metricSub}>en esta visita</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Unidades a dejar</Text>
            <Text style={styles.metricValue}>{totalUnidades}</Text>
            <Text style={styles.metricSub}>total de la visita</Text>
          </View>
          <View style={[styles.metricCell, { borderRightWidth: 0 }]}>
            <Text style={styles.metricLabel}>Stock Post-Visita</Text>
            <Text style={styles.metricValue}>{stockTotalActual}</Text>
            <Text style={styles.metricSub}>uds proyectadas</Text>
          </View>
        </View>

        {/* ── Table ── */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={colCodigo}><Text style={styles.headerText}>Código</Text></View>
            <View style={colImg}><Text style={styles.headerText}>Producto</Text></View>
            <View style={colInfo}><Text style={styles.headerText}>Descripción</Text></View>
            <View style={colDetalle}><Text style={styles.headerText}>Entrega</Text></View>
            {showBasePrice && colBase && <View style={colBase}><Text style={styles.headerText}>P. Base</Text></View>}
            {showPushPrice && colPush && <View style={colPush}><Text style={styles.headerText}>P. Push</Text></View>}
            <View style={colPublic}><Text style={styles.headerText}>P. Público</Text></View>
          </View>

          {items.map((item, index) => {
            const prod = item.producto;
            const images = Array.isArray(imageMap[prod.id_producto]) ? imageMap[prod.id_producto] : (imageMap[prod.id_producto] ? [imageMap[prod.id_producto]] : []);
            const stockAnterior = Number(item.stockAnterior) || 0;
            const cantidadDejada = Number(item.cantidadDejada) || 0;
            const totalStock = stockAnterior + cantidadDejada;

            return (
              <View
                key={index}
                style={[styles.tableRow, index % 2 !== 0 && styles.tableRowAlt]}
                wrap={false}
              >
                {/* Codigo */}
                <View style={colCodigo}>
                  <Text style={styles.rowCodigo}>{prod.codigo_producto?.codigo || '-'}</Text>
                </View>

                {/* Image */}
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

                {/* Product info */}
                <View style={{ ...colInfo, flexDirection: 'row' }}>
                  <View style={styles.accentBar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowMarca}>{prod.marca?.nombre_marca || 'GENERAL'}</Text>
                    <Text style={styles.rowNombre}>{prod.nombre}</Text>
                    {prod.descripcion && (
                      <Text style={styles.rowDescription}>{prod.descripcion}</Text>
                    )}
                    {/* Mostrar todos los atributos del producto */}
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

                {/* Entrega / Stock detail */}
                <View style={{ ...colDetalle, ...styles.stockCell }}>
                  <View style={styles.stockLine}>
                    <View style={[styles.stockDot, { backgroundColor: GRAY_MID }]} />
                    <Text style={styles.stockLabel}>Stock </Text>
                    <Text style={styles.stockVal}>{stockAnterior}</Text>
                  </View>
                  <View style={styles.stockLine}>
                    <View style={[styles.stockDot, { backgroundColor: CYAN }]} />
                    <Text style={styles.stockLabel}>A dejar </Text>
                    <Text style={[styles.stockVal, { color: CYAN }]}>{cantidadDejada}</Text>
                  </View>
                  <View style={styles.stockTotalLine}>
                    <View style={[styles.stockDot, { backgroundColor: BLACK }]} />
                    <Text style={styles.stockLabel}>Nuevo </Text>
                    <Text style={styles.stockTotalVal}>{totalStock}</Text>
                  </View>
                </View>

                {/* P. Base */}
                {showBasePrice && colBase && (
                  <View style={colBase}>
                    <Text style={styles.priceLabel}>Base</Text>
                    <Text style={styles.priceBase}>
                      {item.precio_base > 0 ? formatPrice(item.precio_base) : '—'}
                    </Text>
                  </View>
                )}

                {/* P. Push */}
                {showPushPrice && colPush && (
                  <View style={colPush}>
                    <Text style={styles.priceLabel}>Push</Text>
                    <Text style={styles.pricePush}>
                      {item.precio_pushsport > 0 ? formatPrice(item.precio_pushsport) : '—'}
                    </Text>
                  </View>
                )}

                {/* P. Público */}
                <View style={colPublic}>
                  <Text style={styles.priceLabel}>Público</Text>
                  <Text style={styles.pricePublic}>
                    {item.precio_venta_sugerido > 0 ? formatPrice(item.precio_venta_sugerido) : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Catálogo de {shopName}</Text>
          <Text style={styles.footerCenter}>{totalProductos} productos · {totalUnidades} uds a entregar</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

export default ShopReportPDF;
