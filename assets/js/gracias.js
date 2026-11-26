function readLastOrder() {
    try { return JSON.parse(localStorage.getItem('fwp-last-order') || 'null'); } catch (_) { return null; }
}

function paymentStatus() {
    const params = new URLSearchParams(window.location.search);
    const status = (params.get('collection_status') || params.get('status') || '').toLowerCase();
    const paymentId = params.get('payment_id') || params.get('collection_id') || '';
    return { status, paymentId, reference: params.get('external_reference') || '' };
}

function fmtCLP(n) { return '$' + Math.round(Number(n)).toLocaleString('es-CL'); }

function orderLines(order) {
    if (!order || !Array.isArray(order.items)) return [];
    return order.items.map((it) => `${it.qty} x ${(FWP_CONFIG.products[it.key] || { name: it.key }).name}`);
}

function renderPaymentState() {
    const { status } = paymentStatus();
    const order = readLastOrder();
    const badge = document.getElementById('pay-status-badge');
    const text = document.getElementById('pay-status-text');
    if (status === 'pending' || status === 'in_process') {
        badge.innerText = 'Paso 1: Pago en proceso';
        text.innerHTML = 'Tu pago está siendo procesado por Mercado Pago. Completa tus datos y te confirmamos el despacho apenas se acredite.';
    } else if (status !== 'approved' && status !== 'success') {
        badge.innerText = 'Paso 1: Datos de despacho';
        text.innerHTML = 'Completa tus datos para coordinar el <strong class="text-white">despacho gratis</strong> de tu pedido.';
    }
    if (order && Date.now() - order.createdAt < 3 * 24 * 3600 * 1000) {
        const box = document.getElementById('order-summary');
        box.innerHTML = '<strong class="text-white">Tu pedido:</strong><br>' + orderLines(order).join('<br>') + `<br><strong class="text-white">Total: ${fmtCLP(order.total)}</strong>`;
        box.classList.remove('hidden');
        if (order.gift) document.getElementById('gift-notice').classList.remove('hidden');
    }
}

function orderUnits(order) {
    return order && order.items ? order.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0) : 0;
}

function renderEbooks() {
    const box = document.getElementById('ebooks-box');
    if (!box || !FWP_CONFIG.ebooks) return;
    const { status } = paymentStatus();
    const order = readLastOrder();
    const units = orderUnits(order);
    const list = FWP_CONFIG.ebooks.filter((e) => units >= e.minUnits);
    if (!list.length) return;
    const approved = status === 'approved' || status === 'success';
    const cards = list.map((e) => `
        <div class="eb-card">
            <img src="${e.cover}" alt="Portada ${e.title}" width="90" height="127" loading="lazy">
            <div class="eb-info">
                <strong>${e.title}</strong><span>${e.sub}</span>
                ${approved ? `<div class="eb-btns"><a href="${e.mobile}" download class="eb-dl">Descargar para celular</a><a href="${e.a4}" download class="eb-a4">Versión para imprimir (A4)</a></div>`
                : `<em>Te lo enviamos por WhatsApp apenas se confirme tu pago.</em>`}
            </div>
        </div>`).join('');
    box.innerHTML = `<span class="eb-kicker">🎁 Tus regalos digitales</span>${cards}`;
    box.classList.remove('hidden');
}

function trackPurchaseFromUrl() {
    // Solo se registra la compra si Mercado Pago confirma el pago aprobado.
    const { status, paymentId, reference } = paymentStatus();
    if (status !== 'approved' && status !== 'success') return;
    const order = readLastOrder();

    const transactionId = paymentId || reference || '';
    const storageKey = `fwp-purchase:${transactionId || 'sin-id:' + window.location.search}`;
    if (sessionStorage.getItem(storageKey)) return;

    const data = { currency: FWP_CONFIG.currency };
    if (order && order.total > 0) {
        data.value = order.total;
        data.content_ids = order.items.map((it) => it.key);
        data.num_items = order.items.reduce((sum, it) => sum + it.qty, 0);
    }
    if (transactionId) data.transaction_id = transactionId;

    const eventId = FWP_ANALYTICS.track('Purchase', data, { dedupeKey: storageKey });
    sessionStorage.setItem(storageKey, eventId);
}

// Región → comuna (listas dependientes)
        function initComunas() {
            const regionSel = document.getElementById('region');
            const comunaSel = document.getElementById('comuna');
            if (!regionSel || !comunaSel || !window.FWP_REGIONES) return;
            regionSel.insertAdjacentHTML('beforeend', FWP_REGIONES.map((r, i) => `<option value="${i}">${r.n}</option>`).join(''));
            regionSel.addEventListener('change', () => {
                const r = FWP_REGIONES[regionSel.value];
                if (!r) {
                    comunaSel.innerHTML = '<option value="">Primero elige la región</option>';
                    comunaSel.disabled = true;
                    return;
                }
                const comunas = [...r.c].sort((x, y) => x.localeCompare(y, 'es'));
                comunaSel.innerHTML = '<option value="">Elige tu comuna</option>' + comunas.map((c) => `<option>${c}</option>`).join('');
                comunaSel.disabled = false;
                if (comunas.length === 1) comunaSel.value = comunas[0];
                else comunaSel.focus();
            });
        }
        function selectedLocation() {
            const r = window.FWP_REGIONES && FWP_REGIONES[document.getElementById('region').value];
            const c = document.getElementById('comuna').value;
            if (!r || !c) return '';
            return `${c}, Región ${r.n === 'Metropolitana' ? 'Metropolitana' : 'de ' + r.n}`;
        }
        document.addEventListener('DOMContentLoaded', initComunas);

        function handleShippingSubmit(event) {
            event.preventDefault();

            // Ocultar cualquier error anterior
            document.getElementById('validation-error-alert').classList.add('hidden');

            // Capturar datos del DOM
            const name = document.getElementById('fullName').value.trim();
            const address = document.getElementById('address').value.trim();
            const comuna = selectedLocation();
            const phoneInput = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim() || 'No proporcionado';

            // Formatear el teléfono
            const formattedPhone = phoneInput.startsWith('+') ? phoneInput : `+56 ${phoneInput}`;

            // Validar campos obligatorios
            if (!name || !address || !comuna || !phoneInput) {
                if (!comuna) document.getElementById(document.getElementById('region').value ? 'comuna' : 'region').focus();
                document.getElementById('validation-error-alert').classList.remove('hidden');
                return;
            }

            FWP_ANALYTICS.track('CompleteRegistration', { form: 'shipping' }, { dedupeKey: 'shipping-registration' });

            // Generar el mensaje de WhatsApp estructurado con jerarquía visual de alto nivel
            const order = readLastOrder();
            const { status, paymentId, reference } = paymentStatus();
            const paid = status === 'approved' || status === 'success';
            const lines = orderLines(order);
            const orderText = lines.length ? `\n🛒 *Pedido:*\n${lines.map((l) => '• ' + l).join('\n')}\n💰 *Total:* ${fmtCLP(order.total)}\n` : '';
            const giftText = order && order.gift ? '🎁 Compré dentro de los 30 min: incluye muestra de regalo\n' : '';
            const ebookList = (FWP_CONFIG.ebooks || []).filter((e) => orderUnits(order) >= e.minUnits).map((e) => e.title);
            const ebookText = (orderUnits(order) >= 2 ? '🎁 *Batidor recargable USB-C de regalo*\n' : '') + (ebookList.length ? `📚 *Ebooks de regalo:* ${ebookList.join(' + ')}\n` : '');
            const payText = paymentId ? `🧾 *Pago Mercado Pago:* ${paymentId}${reference ? ' (' + reference + ')' : ''}\n` : '';
            const whatsappMessage = `¡Hola FWP Chile! ${paid ? 'He completado mi pago.' : 'Quiero coordinar mi pedido.'} Aquí tienes mis datos de envío:
${orderText}${giftText}${ebookText}${payText}
👤 *Nombre:* ${name}
📍 *Dirección:* ${address}
🏡 *Comuna:* ${comuna}
📞 *Teléfono:* ${formattedPhone}
📧 *Correo:* ${email}

Quedo atento a la confirmación de mi despacho prioritario. 🚀`;

            const whatsappUrl = FWP_WHATSAPP.toUrl(whatsappMessage);

            FWP_HELPERS.copyText(whatsappMessage).catch(() => {});

            // Poblar dinámicamente los datos en el ticket virtual
            document.getElementById('ticket-name').innerText = name;
            document.getElementById('ticket-address').innerText = address;
            document.getElementById('ticket-comuna').innerText = comuna;
            document.getElementById('ticket-phone').innerText = formattedPhone;
            document.getElementById('ticket-email').innerText = email;

            // Configurar el enlace del botón de chat en el paso de éxito
            document.getElementById('whatsapp-direct-link').setAttribute('href', whatsappUrl);

            // Transicionar de pantallas de forma suave
            document.getElementById('step-form-delivery').classList.add('hidden');
            const successContainer = document.getElementById('step-success-delivery');
            successContainer.classList.remove('hidden');

            FWP_WHATSAPP.open('shipping_form', whatsappMessage, { email_provided: email !== 'No proporcionado' });
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderPaymentState();
            renderEbooks();
            trackPurchaseFromUrl();
            document.getElementById('fwp-shipping-form').addEventListener('submit', handleShippingSubmit);
            FWP_WHATSAPP.bindLinks();
            FWP_HELPERS.bindImageFallbacks();
        });
