(function (window, document) {
    'use strict';

    // Oferta de bienvenida: cuenta regresiva de 30 minutos por visitante (ver FWP_PROMO en helpers.js).
    // Si compra antes de que llegue a cero, su pedido incluye una muestra de regalo.

    function pad(x) { return x < 10 ? '0' + x : String(x); }

    function hideOffer() {
        document.querySelectorAll('[data-cycle]').forEach(function (el) { (el.parentElement || el).style.display = 'none'; });
        document.querySelectorAll('[data-cycle-until]').forEach(function (el) {
            var row = el.closest('div'); if (row) row.style.display = 'none';
        });
    }

    function tick() {
        var ms = window.FWP_PROMO ? window.FWP_PROMO.remainingMs() : 0;
        if (ms <= 0) { hideOffer(); return false; }
        var total = Math.ceil(ms / 1000);
        var time = pad(Math.floor(total / 60)) + ':' + pad(total % 60);
        document.querySelectorAll('[data-cycle-time]').forEach(function (el) { el.textContent = time; });
        document.querySelectorAll('[data-cycle-until]').forEach(function (el) { el.textContent = time + ' min'; });
        return true;
    }

    function start() {
        if (!tick()) return;
        var timer = window.setInterval(function () { if (!tick()) window.clearInterval(timer); }, 1000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}(window, document));
