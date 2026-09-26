function trackPurchaseFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const value = Number.parseFloat(params.get('val')) || 99980;
    const transactionId = params.get('transaction_id') || params.get('order_id') || params.get('reference') || '';
    const storageKey = `fwp-purchase:${transactionId || `${value}:${window.location.pathname}`}`;
    if (sessionStorage.getItem(storageKey)) return;
    const eventId = FWP_ANALYTICS.track('Purchase', {
        value,
        currency: FWP_CONFIG.currency,
        transaction_id: transactionId || undefined
    }, { dedupeKey: storageKey });
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
