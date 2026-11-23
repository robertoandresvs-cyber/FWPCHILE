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
    renova: { name: 'RENÖVA+', price: 49990, points: 20, img: 'MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png' },
    liv:    { name: 'LIV',     price: 49990, points: 20, img: 'MOCKUP%20Productos/MOCKUP_LIV.png' },
    '24b':  { name: '24B+',    price: 39990, points: 18, img: 'MOCKUP%20Productos/MOCKUP_24B.png' },
    eboost: { name: 'E-BOOST', price: 39990, points: 15, img: 'MOCKUP%20Productos/MOCKUP_EBOOST.png' },
    '24burn': { name: '24BURN', price: 35990, points: 18, img: 'MOCKUP%20Productos/MOCKUP_24BURN.png' }
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

  /* Promoción del ciclo (dosis extra de regalo + cuenta regresiva).
     Cambia a false cuando la compañía no tenga promoción activa. */
  promo: Object.freeze({
    active: true
  }),

  /* Links de pago de Mercado Pago para venta directa (1 a 7 unidades).
     Pega aquí cada link nuevo creado con el precio actualizado.
     Si un link queda vacío (''), el botón abre el pedido por WhatsApp. */
  mercadoPago: Object.freeze({
    renova: '',          // $49.990
    liv: '',             // $49.990
    '24b': '',           // $39.990
    eboost: '',          // $39.990
    '24burn': '',        // $35.990
    'proto-peso': '',      // LIV + 24BURN          $85.980
    'proto-energia': '',   // E-BOOST + 24B+        $79.980
    'proto-belleza': '',   // LIV + RENÖVA+         $99.980
    'proto-mujer': '',     // LIV + RENÖVA+ + 24B+  $139.970
    'proto-reinicio': '',  // RENÖVA+ + LIV + 24BURN $135.970
    'proto-integral': ''   // Los 5 productos       $215.950
  })
});
