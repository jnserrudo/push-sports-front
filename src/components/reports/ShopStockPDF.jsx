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
    backgroundColor: BLACK,
    paddingHorizontal: 30,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBlock: { flexDirection: 'column' },
  logoMain: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1 },
  logoAccent: { color: CYAN },
  logoSub: { fontSize: 6, color: CYAN, letterSpacing: 3, marginTop: 3, textTransform: 'uppercase' },

  shopBlock: { alignItems: 'flex-end', flex: 1, paddingLeft: 20 },
  shopLabel: { fontSize: 6, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 },
  shopName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase', textAlign: 'right' },
  shopType: { fontSize: 6, color: CYAN, textTransform: 'uppercase', letterSpacing: 2, marginTop: 3 },

  infoStrip: { backgroundColor: CYAN, paddingHorizontal: 30, paddingVertical: 7, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoStripText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: BLACK, textTransform: 'uppercase', letterSpacing: 1 },

  metricBar: {
    flexDirection: 'row',
    backgroundColor: GRAY_LIGHT,
    borderBottomWidth: 3,
    borderBottomColor: BLACK,
  },
  metricCell: { flex: 1, padding: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB', alignItems: 'center' },
  metricLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 },
  metricValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: BLACK },
  metricSub: { fontSize: 6, color: CYAN, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  tableContainer: { paddingHorizontal: 30, paddingTop: 10, paddingBottom: 40 },
  tableHeader: { flexDirection: 'row', backgroundColor: BLACK, paddingVertical: 7, paddingHorizontal: 8, marginBottom: 1 },
  headerText: { fontSize: 7, color: '#FFFFFF', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 8, alignItems: 'center', backgroundColor: '#FFFFFF' },
  tableRowAlt: { backgroundColor: '#F9FAFB' },
  tableRowZero: { backgroundColor: '#FEF2F2' },

  imagesContainer: { flexDirection: 'column', gap: 8, width: '100%', alignItems: 'center' },
  imageWrapper: { width: 120, height: 120, borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  productImage: { width: '100%', height: '100%', objectFit: 'contain' },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 6, backgroundColor: GRAY_LIGHT, justifyContent: 'center', alignItems: 'center' },
  placeholderLetter: { fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#D1D5DB', textTransform: 'uppercase' },

  accentBar: { width: 3, backgroundColor: CYAN, borderRadius: 2, marginRight: 8, alignSelf: 'stretch' },
  rowMarca: { fontSize: 6, color: CYAN, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 3 },
  rowNombre: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  rowDescription: { fontSize: 6.5, color: GRAY_MID, marginBottom: 4, lineHeight: 1.3 },
  rowSabor: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 0.5 },

  stockCell: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  stockValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: BLACK },
  stockLabel: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  stockZero: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#DC2626' },

  priceLabel: { fontSize: 5.5, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  priceBase: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#B45309' },
  pricePush: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#005F7A' },
  pricePublic: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK },

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
  footerCenter: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: CYAN, textTransform: 'uppercase', letterSpacing: 1 },
  footerRight: { fontSize: 6, color: GRAY_MID, textTransform: 'uppercase', letterSpacing: 1 },
});

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price || 0);

const ShopStockPDF = ({ shopName, items, imageMap = {}, currentDate, showPushPrice = false, showBasePrice = false }) => {
  const itemsWithStock = items.filter(i => (Number(i.cantidad_actual) || 0) > 0);
  const totalUnidades = items.reduce((acc, curr) => acc + (Number(curr.cantidad_actual) || 0), 0);
  const totalProductos = items.length;
  const productosConStock = itemsWithStock.length;
  const valorizacionTotal = items.reduce(
    (acc, curr) => acc + (Number(curr.cantidad_actual) || 0) * (Number(curr.precio_venta_sugerido) || 0),
    0
  );

  const activePriceCols = (showPushPrice ? 1 : 0) + (showBasePrice ? 1 : 0);
  const colImg      = { width: activePriceCols > 0 ? '26%' : '30%', justifyContent: 'center', alignItems: 'center' };
  const colInfo     = { width: activePriceCols > 0 ? '30%' : '34%', paddingRight: 6 };
  const colStock    = { width: activePriceCols > 0 ? '12%' : '16%', alignItems: 'center' };
  const colBase     = showBasePrice ? { width: '12%', alignItems: 'flex-end' } : null;
  const colPush     = showPushPrice ? { width: '12%', alignItems: 'flex-end' } : null;
  const colPublic   = { width: activePriceCols > 0 ? '10%' : '12%', alignItems: 'flex-end' };

  return (
    <Document title={`Inventario_${shopName || 'Comercio'}_${currentDate}`}>
      <Page size="A4" style={styles.page}>

        <View style={styles.headerBand}>
          <View style={styles.brandBlock}>
            <Text style={styles.logoMain}>
              PUSH<Text style={styles.logoAccent}>SPORT</Text>
            </Text>
            <Text style={styles.logoSub}>INVENTARIO DE SUCURSAL</Text>
          </View>
          <View style={styles.shopBlock}>
            <Text style={styles.shopLabel}>Comercio</Text>
            <Text style={styles.shopName}>{shopName || 'SIN NOMBRE'}</Text>
            <Text style={styles.shopType}>STOCK ACTUAL REGISTRADO</Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <Text style={styles.infoStripText}>Stock actual al día de la fecha</Text>
          <Text style={styles.infoStripText}>Fecha: {currentDate}</Text>
        </View>

        <View style={styles.metricBar}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Productos listados</Text>
            <Text style={styles.metricValue}>{totalProductos}</Text>
            <Text style={styles.metricSub}>activos en sucursal</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>Con stock disponible</Text>
            <Text style={styles.metricValue}>{productosConStock}</Text>
            <Text style={styles.metricSub}>productos</Text>
          </View>
          <View style={[styles.metricCell, { borderRightWidth: 0 }]}>
            <Text style={styles.metricLabel}>Unidades en stock</Text>
            <Text style={styles.metricValue}>{totalUnidades}</Text>
            <Text style={styles.metricSub}>uds totales</Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={colImg}><Text style={styles.headerText}>Producto</Text></View>
            <View style={colInfo}><Text style={styles.headerText}>Descripción</Text></View>
            <View style={colStock}><Text style={styles.headerText}>Stock</Text></View>
            {showBasePrice && colBase && <View style={colBase}><Text style={styles.headerText}>P. Base</Text></View>}
            {showPushPrice && colPush && <View style={colPush}><Text style={styles.headerText}>P. Push</Text></View>}
            <View style={colPublic}><Text style={styles.headerText}>P. Público</Text></View>
          </View>

          {items.map((item, index) => {
            const prod = item.producto || item;
            const images = Array.isArray(imageMap[prod.id_producto]) ? imageMap[prod.id_producto] : (imageMap[prod.id_producto] ? [imageMap[prod.id_producto]] : []);
            const stock = Number(item.cantidad_actual) || 0;
            const hasStock = stock > 0;

            return (
              <View
                key={index}
                style={[styles.tableRow, index % 2 !== 0 && styles.tableRowAlt, !hasStock && styles.tableRowZero]}
                wrap={false}
              >
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

                <View style={{ ...colStock, ...styles.stockCell }}>
                  <Text style={hasStock ? styles.stockValue : styles.stockZero}>{stock}</Text>
                  <Text style={styles.stockLabel}>{hasStock ? 'uds' : 'SIN STOCK'}</Text>
                </View>

                {showBasePrice && colBase && (
                  <View style={colBase}>
                    <Text style={styles.priceLabel}>Base</Text>
                    <Text style={styles.priceBase}>
                      {item.costo_compra > 0 ? formatPrice(item.costo_compra) : (item.precio_base > 0 ? formatPrice(item.precio_base) : '—')}
                    </Text>
                  </View>
                )}

                {showPushPrice && colPush && (
                  <View style={colPush}>
                    <Text style={styles.priceLabel}>Push</Text>
                    <Text style={styles.pricePush}>
                      {item.precio_pushsport > 0 ? formatPrice(item.precio_pushsport) : '—'}
                    </Text>
                  </View>
                )}

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

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>PUSH SPORT — Inventario de {shopName}</Text>
          <Text style={styles.footerCenter}>{productosConStock} con stock · {totalUnidades} uds · {formatPrice(valorizacionTotal)}</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

export default ShopStockPDF;
