(function (window) {
  'use strict';

  function toUrl(message) {
    return `https://wa.me/${window.FWP_CONFIG.whatsapp.phone}?text=${encodeURIComponent(message || '')}`;
  }

  function openWhatsApp(location, message, eventData) {
    const payload = Object.assign({ location: location || 'unknown' }, eventData || {});
    window.FWP_ANALYTICS.track('Contact', payload, { dedupeKey: `contact-${payload.location}` });
    window.FWP_ANALYTICS.track('Lead', payload, { dedupeKey: `lead-${payload.location}` });
    window.FWP_ANALYTICS.track('WhatsAppClick', payload);
    const url = toUrl(message);
    window.open(url, '_blank', 'noopener');
    return url;
  }

  function decodeMessageFromHref(href) {
    try { return new URL(href, window.location.href).searchParams.get('text') || ''; }
    catch (_) { return ''; }
  }

  function messageFromLink(link) {
    if (link.dataset.whatsappMessage) {
      try { return decodeURIComponent(link.dataset.whatsappMessage); }
      catch (_) { return link.dataset.whatsappMessage; }
    }
    return decodeMessageFromHref(link.href);
  }

  function bindLinks() {
    document.addEventListener('click', function (event) {
      const link = event.target.closest('a[data-whatsapp-message], a[href*="wa.me"]');
      if (!link) return;
      event.preventDefault();
      openWhatsApp(link.dataset.whatsappLocation || link.id || 'whatsapp_link', messageFromLink(link));
    });
  }

  window.FWP_WHATSAPP = Object.freeze({ toUrl, open: openWhatsApp, bindLinks });
}(window));
