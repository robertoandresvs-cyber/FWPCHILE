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

  window.FWP_HELPERS = Object.freeze({ copyText, bindImageFallbacks });
}(window, document));
