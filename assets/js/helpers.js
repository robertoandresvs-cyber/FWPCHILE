(function (window, document) {
  'use strict';

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const element = document.createElement('textarea');
    element.value = text;
    element.setAttribute('readonly', '');
    element.style.position = 'fixed';
    element.style.opacity = '0';
    document.body.appendChild(element);
    element.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(element);
    return copied;
  }

  function bindImageFallbacks() {
    document.addEventListener('error', function (event) {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || !image.dataset.fallbackSrc) return;
      if (image.src === image.dataset.fallbackSrc) return;
      image.src = image.dataset.fallbackSrc;
      if (image.dataset.fallbackRemoveClass) image.classList.remove(image.dataset.fallbackRemoveClass);
    }, true);
  }

  // Oferta de bienvenida: cada visitante tiene N minutos desde su primera visita para recibir una muestra de regalo.
  const OFFER_KEY = 'fwp-offer-start';
  function offerStart() {
    try {
      let start = parseInt(localStorage.getItem(OFFER_KEY), 10);
      if (!Number.isFinite(start)) { start = Date.now(); localStorage.setItem(OFFER_KEY, String(start)); }
      return start;
    } catch (_) {
      if (!window.__fwpOfferStart) window.__fwpOfferStart = Date.now();
      return window.__fwpOfferStart;
    }
  }
  function offerRemainingMs() {
    const promo = (window.FWP_CONFIG && window.FWP_CONFIG.promo) || {};
    if (promo.active === false) return 0;
    const minutes = promo.minutes || 30;
    return Math.max(0, offerStart() + minutes * 60000 - Date.now());
  }

  window.FWP_HELPERS = Object.freeze({ copyText, bindImageFallbacks });
  window.FWP_PROMO = Object.freeze({
    remainingMs: offerRemainingMs,
    isActive: function () { return offerRemainingMs() > 0; },
    giftLabel: function () { return ((window.FWP_CONFIG && window.FWP_CONFIG.promo) || {}).gift || 'muestra de regalo'; }
  });
}(window, document));
