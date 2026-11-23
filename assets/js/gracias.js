function trackPurchaseFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // Si Mercado Pago informa un estado y no es aprobado, no se registra la compra.
    // Solo se registra la compra si Mercado Pago confirma el pago (estado aprobado o id de pago).
    const status = (params.get('collection_status') || params.get('status') || '').toLowerCase();
    const paymentRef = params.get('payment_id') || params.get('collection_id');
    if (status && status !== 'approved' && status !== 'success') return;
    if (!status && !paymentRef) return;

    // El monto viene en la URL (?val=). Si falta, se envía la compra sin monto en vez de inventar uno.
    const rawValue = Number.parseFloat(params.get('val'));
    const hasValue = Number.isFinite(rawValue) && rawValue > 0;

    const transactionId = params.get('payment_id') || params.get('collection_id') || params.get('transaction_id') ||
        params.get('order_id') || params.get('merchant_order_id') || params.get('reference') || '';
    const storageKey = `fwp-purchase:${transactionId || `${hasValue ? rawValue : 'sin-monto'}:${window.location.pathname}`}`;
    if (sessionStorage.getItem(storageKey)) return;

    const data = { currency: FWP_CONFIG.currency };
    if (hasValue) data.value = rawValue;
    if (transactionId) data.transaction_id = transactionId;

    const eventId = FWP_ANALYTICS.track('Purchase', data, { dedupeKey: storageKey });
    sessionStorage.setItem(storageKey, eventId);
}

function handleShippingSubmit(event) {
            event.preventDefault();

            // Ocultar cualquier error anterior
            document.getElementById('validation-error-alert').classList.add('hidden');

            // Capturar datos del DOM
            const name = document.getElementById('fullName').value.trim();
            const address = document.getElementById('address').value.trim();
            const comuna = document.getElementById('comuna').value.trim();
            const phoneInput = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim() || 'No proporcionado';

            // Formatear el teléfono
            const formattedPhone = phoneInput.startsWith('+') ? phoneInput : `+56 ${phoneInput}`;

            // Validar campos obligatorios
            if (!name || !address || !comuna || !phoneInput) {
                document.getElementById('validation-error-alert').classList.remove('hidden');
                return;
            }

            FWP_ANALYTICS.track('CompleteRegistration', { form: 'shipping' }, { dedupeKey: 'shipping-registration' });

            // Generar el mensaje de WhatsApp estructurado con jerarquía visual de alto nivel
            const whatsappMessage = `¡Hola FWP Chile! He completado mi pago. Aquí tienes mis datos de envío para activar mi despacho prioritario:

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
            trackPurchaseFromUrl();
            document.getElementById('fwp-shipping-form').addEventListener('submit', handleShippingSubmit);
            FWP_WHATSAPP.bindLinks();
            FWP_HELPERS.bindImageFallbacks();
        });
