# sh-shop

**Fictional e-commerce catalog and Shopify CSV import pipeline**, built as a hands-on learning
project for mastering Shopify's product/variant data model. Shopify itself is a cloud service —
nothing here installs or runs it locally. This repo only holds what gets prepared *before* it
reaches a real store: a source catalog and the CSV Shopify expects on import.

> ⚠️ **All content is fictional and for educational purposes only.** No real products, prices or
> brands are involved.

## Tabla de contenido

- [Qué contiene](#qué-contiene)
- [Catálogo](#catálogo)
- [Regenerar el CSV](#regenerar-el-csv)
- [Crear la tienda en Shopify](#crear-la-tienda-en-shopify)
- [Notas y limitaciones](#notas-y-limitaciones)
- [Autor](#autor)

## Qué contiene

| Archivo | Para qué sirve |
|---|---|
| [`datos/productos.json`](datos/productos.json) | Catálogo fuente: 16 productos ficticios, precios en COP. |
| [`datos/productos-shopify.csv`](datos/productos-shopify.csv) | Lo que se importa en Shopify: 16 productos, 36 variantes (una por talla). |
| [`herramientas/generar-csv.js`](herramientas/generar-csv.js) | Regenera el CSV desde el JSON. Sin dependencias, solo Node. |

## Catálogo

16 productos ficticios en 5 categorías (Camisas, Gorras, Cadenas, Buzos, Accesorios), con precios en
pesos colombianos (COP). El catálogo incluye a propósito varios casos límite, para practicar
distintos escenarios del modelo de datos de Shopify:

- **Variantes por talla** (`S/M/L/XL`, largos de cadena, etc.) vs. productos de **talla única**
  (usan la convención de Shopify `Title / Default Title`).
- Un producto **en oferta** (`precio_oferta` < `precio` → se exporta como *Compare At Price*).
- Un producto **agotado** (`stock: 0`), para probar ese estado en Shopify.
- El stock de cada producto se reparte entre sus variantes; la suma coincide con el catálogo original.

## Regenerar el CSV

```bash
node herramientas/generar-csv.js
```

Sin dependencias: lee `datos/productos.json`, arma una fila por variante con las columnas que Shopify
espera en su plantilla de importación de productos, y escribe `datos/productos-shopify.csv`. Es
determinista y seguro de volver a correr cuantas veces haga falta. Si cambias el catálogo (agregar
producto, tallas, precios), vuelve a ejecutarlo para actualizar el CSV.

## Crear la tienda en Shopify

> Las pantallas de Shopify cambian con frecuencia; si algún nombre no coincide, busca el equivalente.
> Esta guía no se pudo comprobar contra Shopify desde aquí.

1. **Crear una cuenta de desarrollo gratuita:** en el programa *Shopify Partners* puedes crear una
   *development store* (tienda de pruebas). No necesitas tarjeta ni vender nada real.
2. **Moneda:** en *Configuración > Detalles de la tienda* elige **Peso colombiano (COP)** ANTES de
   importar, porque el CSV trae los precios en pesos (por ejemplo `129000`).
3. **Importar productos:** *Productos > Importar* y sube `datos/productos-shopify.csv`.
   Si Shopify se queja de alguna columna, descarga su plantilla actual desde esa misma pantalla y
   ajusta `COLUMNAS` en `herramientas/generar-csv.js`.
4. **Colecciones:** crea colecciones automáticas por *tipo de producto* (Camisas, Gorras, Cadenas,
   Buzos, Accesorios). El CSV ya trae el campo `Type`.
5. **Tema:** cualquier tienda incluye el tema gratuito *Dawn*; no hace falta descargar nada.
6. **Pagos:** deja la tienda **sin pasarelas reales**. En una tienda de desarrollo puedes usar la
   pasarela de prueba (*Bogus Gateway*) para simular pedidos. Nunca escribas tarjetas reales.
7. **Imágenes:** el CSV no trae imágenes (`Image Src` vacío). Puedes subir fotos de prueba a mano.

## Notas y limitaciones

- El CLI moderno de Shopify (para temas y apps) pide Node 18 o superior; la importación por CSV no
  lo necesita, así que no es un bloqueante para este flujo.
- Los tamaños son **variantes** reales de Shopify, no un simple texto en el título del producto.
- Este repositorio no depende de ningún otro proyecto ni servicio externo.

## Autor

**David Riascos** ([@david-riascos](https://github.com/david-riascos)) — proyecto de práctica
personal para aprender el flujo de catálogo → importación → tienda en Shopify.
