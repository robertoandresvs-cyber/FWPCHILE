(function (window, document) {
    'use strict';

    let cart = [];
    let currentContext = null;

    function fmt(n) {
        return '$' + Number(n).toLocaleString('es-CL');
    }

    function whatsappFloatBtn() {
        return document.querySelector('a[data-whatsapp-location="landing"]');
    }

    function renderCartBar() {
        let bar = document.getElementById('fwp-cart-bar');
        const fab = whatsappFloatBtn();
        if (!cart.length) {
            if (bar) bar.remove();
            if (fab) fab.classList.remove('!bottom-24');
            return;
        }
        const total = cart.reduce((s, i) => s + i.price, 0);
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'fwp-cart-bar';
            bar.className = 'fixed bottom-0 left-0 right-0 z-40 bg-[#020617]/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 font-sans';
            document.body.appendChild(bar);
        }
        bar.innerHTML =
            '<div class="text-xs text-gray-300"><span class="font-bold text-white">' + cart.length +
            '</span> producto' + (cart.length > 1 ? 's' : '') + ' &middot; <span class="font-bold text-fwp-green">' + fmt(total) +
            '</span></div>' +
            '<div class="flex items-center gap-3">' +
            '<button id="fwp-cart-clear" type="button" class="text-gray-500 text-xs underline">Vaciar</button>' +
            '<button id="fwp-cart-checkout" type="button" class="bg-fwp-green text-black text-xs font-black px-4 py-2.5 rounded-full">Finalizar por WhatsApp</button>' +
            '</div>';
        document.getElementById('fwp-cart-checkout').addEventListener('click', function () { openShippingModal({ type: 'cart' }); });
        document.getElementById('fwp-cart-clear').addEventListener('click', function () { cart = []; renderCartBar(); });
        if (fab) fab.classList.add('!bottom-24');
    }

    function addToCart(id, name, price, btn) {
        if (cart.some(function (i) { return i.id === id; })) return;
        cart.push({ id: id, name: name, price: price });
        renderCartBar();
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '✓ Agregado';
            btn.disabled = true;
            setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1500);
        }
    }

    function buildModal() {
        if (document.getElementById('fwp-shipping-modal')) return;
        const wrap = document.createElement('div');
        wrap.id = 'fwp-shipping-modal';
        wrap.className = 'fixed inset-0 z-[60] hidden items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans';
        wrap.innerHTML =
            '<div class="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full relative">' +
            '<button id="fwp-modal-close" type="button" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl leading-none">&times;</button>' +
            '<h3 class="text-lg font-black text-white mb-1">Un último paso antes de pagar</h3>' +
            '<p id="fwp-modal-summary" class="text-xs text-gray-400 mb-4"></p>' +
            '<div id="fwp-modal-error" class="hidden text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">Completa todos los campos para continuar.</div>' +
            '<form id="fwp-modal-form" class="space-y-3">' +
            '<input required id="fwp-m-name" placeholder="Nombre completo" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fwp-green">' +
            '<input required id="fwp-m-address" placeholder="Dirección" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fwp-green">' +
            '<input required id="fwp-m-comuna" placeholder="Comuna" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fwp-green">' +
            '<input required id="fwp-m-phone" placeholder="Teléfono" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fwp-green">' +
            '<label class="flex items-start gap-2 text-[11px] text-gray-300 bg-fwp-green/5 border border-fwp-green/20 rounded-xl px-3 py-2.5 cursor-pointer">' +
            '<input type="checkbox" id="fwp-m-subscribe" class="mt-0.5 accent-fwp-green">' +
            '<span><span class="font-bold text-fwp-green">Suscríbeme a reposición mensual</span> — recibe recordatorio y % preferencial cuando se acerque tu próxima compra.</span>' +
            '</label>' +
            '<button type="submit" class="w-full py-3 bg-fwp-green text-black font-black rounded-xl text-sm mt-2">Confirmar y continuar</button>' +
            '</form>' +
            '<p class="text-[10px] text-gray-500 mt-3 text-center">Tus datos se envían por WhatsApp solo para coordinar tu despacho.</p>' +
            '</div>';
        document.body.appendChild(wrap);
        document.getElementById('fwp-modal-close').addEventListener('click', closeModal);
        wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
        document.getElementById('fwp-modal-form').addEventListener('submit', onModalSubmit);
    }

    function openShippingModal(context) {
        buildModal();
        currentContext = context;
        const summary = document.getElementById('fwp-modal-summary');
        if (context.type === 'single') {
            summary.textContent = context.name + ' — ' + fmt(context.price);
        } else {
            const total = cart.reduce(function (s, i) { return s + i.price; }, 0);
            summary.textContent = cart.length + ' producto(s) — ' + fmt(total);
        }
        const modal = document.getElementById('fwp-shipping-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        window.FWP_ANALYTICS && window.FWP_ANALYTICS.track('InitiateCheckout', { context: context.type });
    }

    function closeModal() {
        const m = document.getElementById('fwp-shipping-modal');
        if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
        const err = document.getElementById('fwp-modal-error');
        if (err) err.classList.add('hidden');
    }

    function onModalSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('fwp-m-name').value.trim();
        const address = document.getElementById('fwp-m-address').value.trim();
        const comuna = document.getElementById('fwp-m-comuna').value.trim();
        const phone = document.getElementById('fwp-m-phone').value.trim();
        if (!name || !address || !comuna || !phone) {
            document.getElementById('fwp-modal-error').classList.remove('hidden');
            return;
        }

        let itemsText, total;
        if (currentContext.type === 'single') {
            itemsText = '• ' + currentContext.name + ' — ' + fmt(currentContext.price);
            total = currentContext.price;
        } else {
            itemsText = cart.map(function (i) { return '• ' + i.name + ' — ' + fmt(i.price); }).join('\n');
            total = cart.reduce(function (s, i) { return s + i.price; }, 0);
        }

        const formattedPhone = phone.startsWith('+') ? phone : ('+56 ' + phone);
        const wantsSubscription = document.getElementById('fwp-m-subscribe').checked;
        const message = '¡Hola FWP Chile! Quiero confirmar mi pedido:\n\n' + itemsText +
            '\n💰 *Total:* ' + fmt(total) +
            '\n\n👤 *Nombre:* ' + name +
            '\n📍 *Dirección:* ' + address +
            '\n🏡 *Comuna:* ' + comuna +
            '\n📞 *Teléfono:* ' + formattedPhone +
            (wantsSubscription ? '\n\n🔁 *Quiero suscribirme a reposición mensual*' : '') +
            (currentContext.type === 'single' ? '\n\nYa abrí el link de pago, quedo atento a la confirmación de mi despacho. 🚀' : '\n\n¿Me confirman el link de pago para este pedido combinado?');

        if (window.FWP_WHATSAPP) {
            window.FWP_WHATSAPP.open('checkout_modal', message, {
                total: total,
                type: currentContext.type
            });
        }

        if (currentContext.type === 'single' && currentContext.mpUrl) {
            window.open(currentContext.mpUrl, '_blank', 'noopener');
        }

        closeModal();
        if (currentContext.type === 'cart') { cart = []; renderCartBar(); }
        document.getElementById('fwp-modal-form').reset();
    }

    function bindBuyButtons() {
        document.querySelectorAll('[data-mp-checkout]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                openShippingModal({
                    type: 'single',
                    name: el.getAttribute('data-product-name'),
                    price: parseInt(el.getAttribute('data-product-price'), 10),
                    mpUrl: el.getAttribute('href')
                });
            });
        });
        document.querySelectorAll('[data-add-cart]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                addToCart(
                    el.getAttribute('data-product-id'),
                    el.getAttribute('data-product-name'),
                    parseInt(el.getAttribute('data-product-price'), 10),
                    el
                );
            });
        });
    }

    document.addEventListener('DOMContentLoaded', bindBuyButtons);
    window.FWP_CHECKOUT = Object.freeze({ addToCart: addToCart, openShippingModal: openShippingModal });
}(window, document));
