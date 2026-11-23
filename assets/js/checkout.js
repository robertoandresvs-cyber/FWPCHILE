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

    function whatsappOrder(order) {
        const lines = describe(order.items).map(function (l) { return '• ' + l; }).join('\n');
        const message = '¡Hola FWP Chile! Quiero hacer este pedido:\n\n' + lines +
            '\n💰 *Total:* ' + fmt(order.total) +
            (order.gift ? '\n🎁 Compré dentro de los 30 min: incluye ' + order.giftLabel : '') +
            '\n\n¿Me envías el link de pago?';
        if (window.FWP_WHATSAPP) window.FWP_WHATSAPP.open('pedido_directo', message, { total: order.total });
    }

    function fixedLink(items, linkKey) {
        const links = cfg().mercadoPago || {};
        if (linkKey && links[linkKey]) return links[linkKey];
        if (items.length === 1 && items[0].qty === 1 && links[items[0].key]) return links[items[0].key];
        return '';
    }

    async function checkout(rawItems, options) {
        if (busy) return;
        const opts = options || {};
        const items = normalize(rawItems);
        if (!items.length) return;

        const promo = window.FWP_PROMO;
        const order = {
            items: items,
            total: orderTotal(items),
            label: opts.label || '',
            gift: !!(promo && promo.isActive()),
            giftLabel: promo ? promo.giftLabel() : '',
            createdAt: Date.now()
        };
        saveOrder(order);

        window.FWP_ANALYTICS && window.FWP_ANALYTICS.track('InitiateCheckout', {
            value: order.total, currency: 'CLP', num_items: items.reduce(function (s, i) { return s + i.qty; }, 0),
            content_ids: items.map(function (i) { return i.key; })
        });

        busy = true;
        document.body.style.cursor = 'progress';
        try {
            const endpoint = (cfg().payments || {}).endpoint;
            if (endpoint) {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: items, gift: order.gift, label: order.label })
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

        const link = fixedLink(items, opts.linkKey);
        if (link) { window.location.href = link; return; }
        whatsappOrder(order);
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
    window.FWP_CHECKOUT = Object.freeze({ checkout: checkout, orderTotal: function (items) { return orderTotal(normalize(items)); }, addToCart: addToCart, clearCart: clearCart });
}(window, document));
