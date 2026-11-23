(function (window, document) {
    'use strict';

    // Flujo de compra directa: el cliente va directo a pagar.
    // Los datos de despacho se piden DESPUÉS del pago, en Gracias.html.
    // Orden de pago: 1) Checkout Pro (función de Netlify, monto exacto)
    //                2) link fijo de Mercado Pago en config.js
    //                3) pedido por WhatsApp

    const ORDER_KEY = 'fwp-last-order';
    let cart = []; // { key, qty }
    let busy = false;

    const cfg = function () { return window.FWP_CONFIG || {}; };
    function fmt(n) { return '$' + Math.round(Number(n)).toLocaleString('es-CL'); }

    function normalize(items) {
        const products = cfg().products || {};
        const merged = {};
        (items || []).forEach(function (it) {
            if (!it || !products[it.key]) return;
            const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
            merged[it.key] = (merged[it.key] || 0) + qty;
        });
        return Object.keys(merged).map(function (key) { return { key: key, qty: merged[key] }; });
    }

    // Misma regla que netlify/functions/crear-pago.js
    function orderTotal(items) {
        const products = cfg().products;
        const discounts = cfg().packDiscounts || {};
        let total = items.reduce(function (s, it) { return s + products[it.key].price * it.qty; }, 0);
        if (items.length === 1 && discounts[items[0].qty]) total -= discounts[items[0].qty];
        return total;
    }

    function describe(items) {
        const products = cfg().products;
        return items.map(function (it) { return it.qty + ' x ' + products[it.key].name; });
    }

    function saveOrder(order) {
        try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch (_) { /* sin almacenamiento */ }
    }

    function whatsappOrder(order, transfer) {
        const lines = describe(order.items).map(function (l) { return '• ' + l; }).join('\n');
        const message = '¡Hola FWP Chile! Quiero hacer este pedido' + (transfer ? ' y pagar por transferencia' : '') + ':\n\n' + lines +
            '\n💰 *Total:* ' + fmt(order.total) +
            (order.gift ? '\n🎁 Compré dentro de los 30 min: incluye ' + order.giftLabel : '') +
            (transfer ? '\n\n¿Me envías los datos de transferencia?' : '\n\n¿Me envías el link de pago?');
        if (window.FWP_WHATSAPP) window.FWP_WHATSAPP.open('pedido_directo', message, { total: order.total });
    }

    function fixedLink(items, linkKey) {
        const links = cfg().mercadoPago || {};
        if (linkKey && links[linkKey]) return links[linkKey];
        if (items.length === 1 && items[0].qty === 1 && links[items[0].key]) return links[items[0].key];
        return '';
    }

    function buildOrder(rawItems, opts) {
        const items = normalize(rawItems);
        if (!items.length) return null;
        const promo = window.FWP_PROMO;
        return {
            items: items,
            total: orderTotal(items),
            label: opts.label || '',
            linkKey: opts.linkKey || '',
            gift: !!(promo && promo.isActive()),
            giftLabel: promo ? promo.giftLabel() : '',
            createdAt: Date.now()
        };
    }

    async function payNow(order) {
        if (busy) return;
        saveOrder(order);
        window.FWP_ANALYTICS && window.FWP_ANALYTICS.track('AddPaymentInfo', { value: order.total, currency: 'CLP', method: 'mercadopago' });

        busy = true;
        document.body.style.cursor = 'progress';
        setPayButton('Conectando con Mercado Pago…', true);
        try {
            const endpoint = (cfg().payments || {}).endpoint;
            if (endpoint) {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: order.items, gift: order.gift, label: order.label })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.url) {
                        if (data.reference) { order.reference = data.reference; saveOrder(order); }
                        window.location.href = data.url; // misma pestaña: no lo bloquea el navegador
                        return;
                    }
                }
            }
        } catch (_) {
            /* sin Checkout Pro: se usa el respaldo */
        } finally {
            busy = false;
            document.body.style.cursor = '';
        }

        const link = fixedLink(order.items, order.linkKey);
        if (link) { window.location.href = link; return; }
        // Respaldo final: Mercado Pago no está disponible, el pedido sigue por WhatsApp.
        closeOverlay();
        whatsappOrder(order);
    }

    // ---- Pantalla de pago (método, resumen, términos) ----
    let currentOrder = null;
    let method = 'mp';

    function injectStyles() {
        if (document.getElementById('fwp-co-style')) return;
        const st = document.createElement('style');
        st.id = 'fwp-co-style';
        st.textContent = `
.fwp-co{position:fixed;inset:0;z-index:70;background:rgba(2,6,23,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,system-ui,sans-serif}
.fwp-co[hidden]{display:none}
.fwp-co-card{background:#fff;color:#0f172a;border-radius:24px;width:100%;max-width:980px;max-height:92vh;overflow:auto;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.5)}
.fwp-co-back{background:none;border:0;color:#0f172a;font-size:15px;cursor:pointer;padding:0;margin-bottom:18px;display:inline-flex;gap:8px;align-items:center}
.fwp-co-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:28px;align-items:start}
.fwp-co h3{font-size:20px;font-weight:800;margin:0 0 4px}
.fwp-co .muted{color:#64748b;font-size:14px;margin:0 0 18px}
.fwp-co-methods{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.fwp-co-method{position:relative;border:1.5px solid #e2e8f0;border-radius:16px;padding:18px 14px 14px;cursor:pointer;text-align:center;background:#f8fafc;transition:all .2s}
.fwp-co-method.is-active{border-color:#0f172a;background:#fff;box-shadow:0 4px 18px rgba(15,23,42,.08)}
.fwp-co-method input{position:absolute;top:14px;left:14px;width:18px;height:18px;accent-color:#0f172a}
.fwp-co-logo{height:30px;display:flex;align-items:center;justify-content:center;margin:6px 0 8px;font-size:24px}
.fwp-co-logo img{max-height:30px;max-width:120px}
.fwp-co-logo-mp{height:44px;margin:0 0 6px}
.fwp-co-logo-mp img{max-height:none;max-width:none;height:64px;width:auto}
.fwp-co-pay.is-mp{background:#0a0080;display:flex;align-items:center;justify-content:center;gap:2px;padding:10px 16px;min-height:56px}
.fwp-co-pay.is-mp:hover:not(:disabled){background:#14139a}
.fwp-co-pay.is-mp:disabled{background:#0a0080;opacity:.4}
.fwp-co-pay.is-mp img{height:46px;width:auto;margin:-6px -8px -6px -4px}
.fwp-co-mname{font-weight:700;font-size:15px}
.fwp-co-msub{color:#64748b;font-size:12px;margin-top:2px}
.fwp-co-chips{border-top:1px solid #e2e8f0;margin-top:12px;padding-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.fwp-co-chip{font-size:10px;font-weight:800;letter-spacing:.04em;border:1px solid #cbd5e1;border-radius:6px;padding:2px 6px;color:#334155}
.fwp-co-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;border-radius:14px;padding:14px 16px;font-size:13px;line-height:1.5}
.fwp-co-info strong{display:block;margin-bottom:2px}
.fwp-co-summary{border:1px solid #e2e8f0;border-radius:20px;padding:22px}
.fwp-co-summary h4{font-size:16px;font-weight:800;margin:0 0 14px}
.fwp-co-row{display:flex;justify-content:space-between;gap:12px;font-size:14px;margin:8px 0;color:#334155}
.fwp-co-row b{color:#0f172a}
.fwp-co-row small{display:block;color:#94a3b8;font-size:12px}
.fwp-co-green{color:#16a34a !important}
.fwp-co-sep{border-top:1px solid #e2e8f0;margin:12px 0}
.fwp-co-total{display:flex;justify-content:space-between;font-size:20px;font-weight:800;color:#0f172a;margin-top:6px}
.fwp-co-gift{background:#fffbeb;border:1px solid #fde68a;color:#92400e;border-radius:10px;padding:8px 10px;font-size:12px;margin-top:10px}
.fwp-co-terms{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#334155;margin:16px 0 12px;cursor:pointer}
.fwp-co-terms input{width:18px;height:18px;margin-top:1px;accent-color:#16a34a;flex-shrink:0}
.fwp-co-terms a{color:#1d4ed8;font-weight:700;text-decoration:none}
.fwp-co-pay{width:100%;border:0;border-radius:14px;padding:16px;font-size:16px;font-weight:800;color:#fff;background:#16a34a;cursor:pointer;transition:all .2s}
.fwp-co-pay:disabled{background:#86efac;cursor:not-allowed}
.fwp-co-badges{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;font-size:11px;color:#64748b;margin-top:14px}
.fwp-co-termsview h4{font-size:14px;font-weight:800;margin:16px 0 4px}
.fwp-co-termsview p{font-size:13px;line-height:1.6;color:#334155;margin:0 0 8px}
@media (max-width:760px){.fwp-co-card{padding:20px;border-radius:20px}.fwp-co-grid{grid-template-columns:1fr}.fwp-co-methods{grid-template-columns:1fr 1fr}}`;
        document.head.appendChild(st);
    }

    function buildOverlay() {
        let el = document.getElementById('fwp-co');
        if (el) return el;
        injectStyles();
        el = document.createElement('div');
        el.id = 'fwp-co';
        el.className = 'fwp-co';
        el.hidden = true;
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Pago');
        el.innerHTML = `
<div class="fwp-co-card">
  <div id="fwp-co-payview">
    <button type="button" class="fwp-co-back" data-co="close">← Volver</button>
    <div class="fwp-co-grid">
      <div>
        <h3>Elige tu método de pago</h3>
        <p class="muted">Tus datos se procesan de forma cifrada.</p>
        <div class="fwp-co-methods">
          <label class="fwp-co-method is-active" data-method="mp">
            <input type="radio" name="fwp-co-method" value="mp" checked>
            <div class="fwp-co-logo fwp-co-logo-mp"><img src="assets/img/mercadopago.svg" alt="Mercado Pago" data-co-logo><span class="fwp-co-mname" data-co-logo-fallback hidden>Mercado Pago</span></div>
            <div class="fwp-co-msub">Cobro en CLP</div>
            <div class="fwp-co-chips"><span class="fwp-co-chip">VISA</span><span class="fwp-co-chip">MASTERCARD</span><span class="fwp-co-chip">DÉBITO</span></div>
          </label>
          <label class="fwp-co-method" data-method="wa">
            <input type="radio" name="fwp-co-method" value="wa">
            <div class="fwp-co-logo" style="color:#25D366"><i class="fab fa-whatsapp"></i></div>
            <div class="fwp-co-mname">Transferencia</div>
            <div class="fwp-co-msub">Coordina tu pago por WhatsApp</div>
            <div class="fwp-co-chips"><span class="fwp-co-chip">TRANSFERENCIA</span><span class="fwp-co-chip">WHATSAPP</span></div>
          </label>
        </div>
        <div class="fwp-co-info" id="fwp-co-info"></div>
      </div>
      <div>
        <div class="fwp-co-summary">
          <h4>Resumen de compra</h4>
          <div id="fwp-co-lines"></div>
        </div>
        <label class="fwp-co-terms">
          <input type="checkbox" id="fwp-co-accept">
          <span>He leído y acepto los <a href="#" data-co="terms">términos y condiciones</a></span>
        </label>
        <button type="button" id="fwp-co-pay" class="fwp-co-pay" disabled>Pagar</button>
        <div class="fwp-co-badges"><span>🔒 Pago seguro</span><span>🚚 Envío gratis</span><span>↩️ Devolución 10 días</span></div>
      </div>
    </div>
  </div>
  <div id="fwp-co-termsview" class="fwp-co-termsview" hidden>
    <button type="button" class="fwp-co-back" data-co="back">← Volver al pago</button>
    <h3 id="fwp-co-terms-title">Términos y Condiciones</h3>
    <div id="fwp-co-terms-body"></div>
    <button type="button" class="fwp-co-pay" data-co="accept" style="margin-top:16px">Acepto los términos y condiciones</button>
  </div>
</div>`;
        document.body.appendChild(el);

        const logo = el.querySelector('[data-co-logo]');
        logo.addEventListener('error', function () { logo.remove(); el.querySelector('[data-co-logo-fallback]').hidden = false; });

        el.addEventListener('click', function (e) {
            if (e.target === el) { closeOverlay(); return; }
            const action = e.target.closest('[data-co]');
            if (action) {
                e.preventDefault();
                const a = action.getAttribute('data-co');
                if (a === 'close') closeOverlay();
                if (a === 'terms') showTerms(true);
                if (a === 'back') showTerms(false);
                if (a === 'accept') { document.getElementById('fwp-co-accept').checked = true; showTerms(false); refreshPay(); }
            }
        });
        el.querySelectorAll('input[name="fwp-co-method"]').forEach(function (r) {
            r.addEventListener('change', function () { method = r.value; refreshMethod(); });
        });
        document.getElementById('fwp-co-accept').addEventListener('change', refreshPay);
        document.getElementById('fwp-co-pay').addEventListener('click', function () {
            if (!currentOrder || !document.getElementById('fwp-co-accept').checked) return;
            if (method === 'wa') {
                saveOrder(currentOrder);
                closeOverlay();
                whatsappOrder(currentOrder, true);
                return;
            }
            payNow(currentOrder);
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !el.hidden) closeOverlay(); });
        return el;
    }

    function setPayButton(text, disabled, withLogo) {
        const btn = document.getElementById('fwp-co-pay');
        if (!btn) return;
        btn.classList.toggle('is-mp', method === 'mp');
        btn.innerHTML = '';
        btn.appendChild(document.createTextNode(text));
        if (withLogo) {
            const img = document.createElement('img');
            img.src = 'assets/img/mercadopago-blanco.svg';
            img.alt = 'Mercado Pago';
            img.addEventListener('error', function () { img.replaceWith(document.createTextNode(' Mercado Pago')); });
            btn.appendChild(img);
        }
        btn.disabled = disabled;
    }

    function refreshPay() {
        if (!currentOrder || !document.getElementById('fwp-co-accept')) return;
        const ok = document.getElementById('fwp-co-accept').checked;
        if (method === 'wa') setPayButton('Enviar pedido por WhatsApp', !ok, false);
        else setPayButton('Pagar ' + fmt(currentOrder.total) + ' con', !ok, true);
    }

    function refreshMethod() {
        document.querySelectorAll('#fwp-co .fwp-co-method').forEach(function (m) {
            m.classList.toggle('is-active', m.getAttribute('data-method') === method);
        });
        document.getElementById('fwp-co-info').innerHTML = method === 'wa'
            ? '<strong>💬 Pago por transferencia</strong>Te envío los datos de transferencia por WhatsApp y despacho tu pedido apenas se confirme el pago.'
            : '<strong>🔒 Pago seguro con Mercado Pago</strong>Al continuar serás redirigido al checkout oficial de Mercado Pago para pagar con tarjeta de crédito, débito o saldo. Tus datos de tarjeta no se procesan en esta pantalla.';
        refreshPay();
    }

    function showTerms(show) {
        const terms = window.FWP_TERMS || { title: 'Términos y Condiciones', html: '<p>Escríbenos por WhatsApp para recibir los términos y condiciones.</p>' };
        document.getElementById('fwp-co-terms-title').textContent = terms.title;
        document.getElementById('fwp-co-terms-body').innerHTML = terms.html;
        document.getElementById('fwp-co-payview').hidden = show;
        document.getElementById('fwp-co-termsview').hidden = !show;
        document.querySelector('#fwp-co .fwp-co-card').scrollTop = 0;
    }

    function renderSummary(order) {
        const products = cfg().products;
        const discounts = cfg().packDiscounts || {};
        const subtotal = order.items.reduce(function (s, it) { return s + products[it.key].price * it.qty; }, 0);
        let html = order.items.map(function (it) {
            return '<div class="fwp-co-row"><span><b>' + products[it.key].name + '</b><small>×' + it.qty + '</small></span><span>' + fmt(products[it.key].price * it.qty) + '</span></div>';
        }).join('');
        html += '<div class="fwp-co-sep"></div>';
        html += '<div class="fwp-co-row"><span>Subtotal</span><span>' + fmt(subtotal) + '</span></div>';
        if (order.items.length === 1 && discounts[order.items[0].qty]) {
            html += '<div class="fwp-co-row fwp-co-green"><span>Descuento pack x' + order.items[0].qty + '</span><span>-' + fmt(discounts[order.items[0].qty]) + '</span></div>';
        }
        html += '<div class="fwp-co-row fwp-co-green"><span>Envío a todo Chile</span><span>Gratis</span></div>';
        html += '<div class="fwp-co-sep"></div>';
        html += '<div class="fwp-co-total"><span>Total</span><span>' + fmt(order.total) + '</span></div>';
        html += '<div class="fwp-co-row" style="font-size:12px;margin-top:2px"><span>IVA incluido</span><span></span></div>';
        if (order.gift) html += '<div class="fwp-co-gift">🎁 Compraste dentro de los 30 minutos: tu pedido incluye una <b>' + order.giftLabel + '</b>.</div>';
        document.getElementById('fwp-co-lines').innerHTML = html;
    }

    function openOverlay(order) {
        const el = buildOverlay();
        currentOrder = order;
        method = 'mp';
        el.querySelector('input[value="mp"]').checked = true;
        document.getElementById('fwp-co-accept').checked = false;
        showTerms(false);
        renderSummary(order);
        refreshMethod();
        el.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        const el = document.getElementById('fwp-co');
        if (el) el.hidden = true;
        document.body.style.overflow = '';
    }

    function checkout(rawItems, options) {
        const order = buildOrder(rawItems, options || {});
        if (!order) return;
        window.FWP_ANALYTICS && window.FWP_ANALYTICS.track('InitiateCheckout', {
            value: order.total, currency: 'CLP', num_items: order.items.reduce(function (s, i) { return s + i.qty; }, 0),
            content_ids: order.items.map(function (i) { return i.key; })
        });
        openOverlay(order);
    }

    function openTerms() {
        if (!window.FWP_TERMS) return false;
        buildOverlay();
        showTerms(true);
        document.getElementById('fwp-co').hidden = false;
        document.body.style.overflow = 'hidden';
        return true;
    }

    // ---- Carrito "Agregar a mi pedido" (Index) ----
    function renderCartBar() {
        let bar = document.getElementById('fwp-cart-bar');
        if (!cart.length) { if (bar) bar.remove(); return; }
        const items = normalize(cart);
        const units = items.reduce(function (s, i) { return s + i.qty; }, 0);
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'fwp-cart-bar';
            bar.className = 'fixed bottom-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 font-sans';
            bar.style.zIndex = '55';
            document.body.appendChild(bar);
        }
        bar.innerHTML =
            '<div class="text-xs text-gray-300"><span class="font-bold text-white">' + units +
            '</span> producto' + (units > 1 ? 's' : '') + ' &middot; <span class="font-bold text-fwp-green">' + fmt(orderTotal(items)) + '</span></div>' +
            '<div class="flex items-center gap-3">' +
            '<button id="fwp-cart-clear" type="button" class="text-gray-500 text-xs underline">Vaciar</button>' +
            '<button id="fwp-cart-checkout" type="button" class="bg-fwp-green text-black text-xs font-black px-4 py-2.5 rounded-full">Pagar pedido</button>' +
            '</div>';
        document.getElementById('fwp-cart-checkout').addEventListener('click', function () { checkout(cart, { label: 'carrito' }); });
        document.getElementById('fwp-cart-clear').addEventListener('click', clearCart);
    }

    function clearCart() { cart = []; renderCartBar(); }

    function addToCart(key, btn) {
        cart.push({ key: key, qty: 1 });
        renderCartBar();
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '✓ Agregado';
            btn.disabled = true;
            setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1200);
        }
    }

    function bind() {
        // Botones de compra: data-items="renova" o "liv,24burn"; data-link-key para link fijo de respaldo.
        document.querySelectorAll('[data-buy-items]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                const items = el.getAttribute('data-buy-items').split(',').map(function (k) { return { key: k.trim(), qty: 1 }; });
                checkout(items, { label: el.getAttribute('data-buy-label') || '', linkKey: el.getAttribute('data-link-key') || '' });
            });
        });
        document.querySelectorAll('[data-add-cart]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                addToCart(el.getAttribute('data-product-id'), el);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', bind);
    // Si el cliente vuelve atrás desde Mercado Pago, el botón de pago queda listo otra vez.
    window.addEventListener('pageshow', function () { busy = false; document.body.style.cursor = ''; refreshPay(); });
    window.FWP_CHECKOUT = Object.freeze({ checkout: checkout, openTerms: openTerms, orderTotal: function (items) { return orderTotal(normalize(items)); }, addToCart: addToCart, clearCart: clearCart });
}(window, document));
