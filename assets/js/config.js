/* Global runtime configuration. Keep operational identifiers in this file. */
window.FWP_CONFIG = Object.freeze({
  siteUrl: 'https://fwpchile.lat',
  locale: 'es-CL',
  currency: 'CLP',
  pixelId: '3974003632907236',
  whatsapp: {
    phone: '56936200521'
  },
  analytics: {
    ga4MeasurementId: '',
    clarityProjectId: ''
  },
  social: {
    facebook: '',
    instagram: ''
  },

  /* Precios de venta (iguales al precio lista del portal) y puntos de cada producto. */
  products: Object.freeze({
    renova: { name: 'RENÖVA+', price: 49990, points: 20, img: 'assets/img/productos/renova.webp' },
    liv:    { name: 'LIV',     price: 49990, points: 20, img: 'assets/img/productos/liv.webp' },
    '24b':  { name: '24B+',    price: 39990, regularPrice: 44990, points: 18, img: 'assets/img/productos/24b.webp' },
    eboost: { name: 'E-BOOST', price: 39990, points: 15, img: 'assets/img/productos/eboost.webp' },
    '24burn': { name: '24BURN', price: 35990, points: 18, img: 'assets/img/productos/24burn.webp' }
  }),

  /* Portal oficial de la compañía: solo compras mayoristas (desde 154 puntos). */
  portal: Object.freeze({
    url: 'https://portal.worldgen.vip/RobertoVega',
    sponsorName: 'Roberto Andrés Vega San Martin',
    sponsorId: '348677',
    shippingCLP: 6530,
    tiers: Object.freeze([
      { points: 154, discount: 35 },
      { points: 340, discount: 40 },
      { points: 800, discount: 50 }
    ])
  }),

  /* Oferta de bienvenida: cada visitante tiene `minutes` minutos desde que entra
     por primera vez para comprar y recibir el regalo. Cambia active a false para apagarla. */
  promo: Object.freeze({
    active: true,
    minutes: 30,
    gift: 'muestra de regalo'
  }),

  /* Sin descuentos (política de la compañía): los precios son siempre los de lista.
     En su lugar, cada compra suma beneficios según la cantidad de unidades (acumulativos). */
  packDiscounts: Object.freeze({}),
  valueAdds: Object.freeze([
    { minUnits: 1, items: ['Envío gratis a todo Chile', 'Guía de consumo PRO', 'Asesoría personalizada por WhatsApp'] },
    { minUnits: 2, items: ['Recetario saludable'] },
    { minUnits: 3, items: ['Minuta de alimentación referencial', 'Seguimiento de 30 días por WhatsApp'] }
  ]),

  /* Pago con Mercado Pago Checkout Pro: la función de Netlify crea el cobro por el monto exacto
     y Mercado Pago devuelve al cliente a Gracias.html. Requiere la variable MP_ACCESS_TOKEN en Netlify. */
  payments: Object.freeze({
    endpoint: '/.netlify/functions/crear-pago'
  }),

  /* Respaldo (solo si Checkout Pro no está activo): links fijos de Mercado Pago.
     Si un link queda vacío (''), el pedido se envía por WhatsApp. */
  mercadoPago: Object.freeze({
    renova: '',          // $49.990
    liv: '',             // $49.990
    '24b': '',           // $39.990
    eboost: '',          // $39.990
    '24burn': '',        // $35.990
    'proto-peso': '',      // LIV + 24BURN          $85.980
    'proto-energia': '',   // Energía Activa: E-BOOST + 24B+        $79.980
    'proto-belleza': '',   // LIV + RENÖVA+         $99.980
    'proto-mujer': '',     // LIV + RENÖVA+ + 24B+  $139.970
    'proto-reinicio': '',  // RENÖVA+ + LIV + 24BURN $135.970
    'proto-integral': ''   // Los 5 productos       $215.950
  })
});
