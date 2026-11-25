// Crea un cobro de Mercado Pago (Checkout Pro) por el monto exacto del pedido.
// Configuración en Netlify → Site configuration → Environment variables:
//   MP_ACCESS_TOKEN = Access Token de PRODUCCIÓN de tu aplicación de Mercado Pago (empieza con APP_USR-)
// Los precios se calculan aquí (no se confía en el navegador). Mantenerlos iguales a assets/js/config.js.

const PRODUCTS = {
  renova: { name: 'RENÖVA+', price: 49990 },
  liv: { name: 'LIV', price: 49990 },
  '24b': { name: '24B+', price: 39990 },
  eboost: { name: 'E-BOOST', price: 39990 },
  '24burn': { name: '24BURN', price: 35990 }
};
const PACK_DISCOUNTS = {}; // sin descuentos: política de la compañía
const MAX_UNITS = 7; // venta directa: 1 a 7 unidades (desde 8 es mayorista en el portal)

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método no permitido' });
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return json(503, { error: 'Checkout Pro no configurado' });

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch (_) { return json(400, { error: 'Pedido inválido' }); }

  const merged = {};
  for (const it of Array.isArray(payload.items) ? payload.items : []) {
    if (!it || !PRODUCTS[it.key]) continue;
    const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
    merged[it.key] = (merged[it.key] || 0) + qty;
  }
  const lines = Object.entries(merged).map(([key, qty]) => ({ key, qty }));
  const units = lines.reduce((s, l) => s + l.qty, 0);
  if (!lines.length) return json(400, { error: 'Pedido vacío' });
  if (units > MAX_UNITS) return json(400, { error: 'Desde 8 unidades la compra es mayorista en el portal' });

  let items;
  if (lines.length === 1 && PACK_DISCOUNTS[lines[0].qty]) {
    const { key, qty } = lines[0];
    items = [{ id: key, title: `${PRODUCTS[key].name} x${qty} (pack)`, quantity: 1, unit_price: PRODUCTS[key].price * qty - PACK_DISCOUNTS[qty], currency_id: 'CLP' }];
  } else {
    items = lines.map(({ key, qty }) => ({ id: key, title: PRODUCTS[key].name, quantity: qty, unit_price: PRODUCTS[key].price, currency_id: 'CLP' }));
  }

  const site = process.env.URL || 'https://fwpchile.lat';
  const reference = `FWP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const back = `${site}/Gracias.html`;

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items,
      external_reference: reference,
      back_urls: { success: back, pending: back, failure: `${site}/` },
      auto_return: 'approved',
      statement_descriptor: 'FWPCHILE',
      metadata: { regalo: payload.gift ? 'muestra' : 'no' }
    })
  });
  if (!res.ok) return json(502, { error: 'Mercado Pago no respondió', detail: (await res.text()).slice(0, 300) });
  const pref = await res.json();
  return json(200, { url: pref.init_point, reference });
};
