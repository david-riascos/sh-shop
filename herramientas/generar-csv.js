// Genera datos/productos-shopify.csv (formato de importacion de productos de Shopify)
// a partir de datos/productos.json. Sin dependencias: solo Node.
//   node herramientas/generar-csv.js
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ENTRADA = path.join(RAIZ, 'datos', 'productos.json');
const SALIDA = path.join(RAIZ, 'datos', 'productos-shopify.csv');

const COLUMNAS = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Alt Text',
  'SEO Title', 'SEO Description', 'Variant Weight Unit', 'Status',
];

/** Escapa un valor para CSV (comillas dobles, comas y saltos de linea). */
const csv = (valor) => {
  const texto = valor === undefined || valor === null ? '' : String(valor);
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

/** "Camiseta Basica Blanca" -> "camiseta-basica-blanca" */
const handle = (nombre) =>
  nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Reparte el stock entre las variantes; lo que sobra va a la primera. */
const repartirStock = (total, variantes) => {
  const base = Math.floor(total / variantes);
  return Array.from({ length: variantes }, (_, i) => (i === 0 ? base + (total - base * variantes) : base));
};

const { productos } = JSON.parse(fs.readFileSync(ENTRADA, 'utf8'));
const filas = [COLUMNAS.join(',')];

for (const p of productos) {
  const h = handle(p.nombre);
  const unica = p.tallas.length === 1 && p.tallas[0].toLowerCase() === 'unica';
  const enOferta = p.precio_oferta !== undefined && p.precio_oferta < p.precio;
  const stocks = repartirStock(p.stock, p.tallas.length);

  p.tallas.forEach((talla, i) => {
    const primera = i === 0;
    const fila = {
      Handle: h,
      // Solo la primera fila de cada producto lleva los datos generales.
      Title: primera ? p.nombre : '',
      'Body (HTML)': primera ? `<p>${p.descripcion}</p>` : '',
      Vendor: primera ? 'Laboratorio de Stacks' : '',
      Type: primera ? p.categoria : '',
      Tags: primera ? `${p.categoria}, ficticio` : '',
      Published: primera ? 'TRUE' : '',
      // Un producto sin opciones reales usa la convencion de Shopify "Title / Default Title".
      'Option1 Name': unica ? 'Title' : 'Talla',
      'Option1 Value': unica ? 'Default Title' : talla,
      'Variant SKU': p.tallas.length > 1 ? `${p.sku}-${talla.replace(/\s+/g, '')}` : p.sku,
      'Variant Grams': 300,
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': stocks[i],
      'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': enOferta ? p.precio_oferta : p.precio,
      'Variant Compare At Price': enOferta ? p.precio : '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'FALSE',
      'Image Src': '',
      'Image Alt Text': '',
      'SEO Title': primera ? p.nombre : '',
      'SEO Description': primera ? p.descripcion : '',
      'Variant Weight Unit': 'g',
      Status: primera ? 'active' : '',
    };
    filas.push(COLUMNAS.map((c) => csv(fila[c])).join(','));
  });
}

fs.writeFileSync(SALIDA, filas.join('\n') + '\n', 'utf8');
console.log(`Productos: ${productos.length} | filas (variantes): ${filas.length - 1} | archivo: ${path.relative(RAIZ, SALIDA)}`);
