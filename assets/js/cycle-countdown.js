(function (window, document) {
    'use strict';

    // Ciclos del bono: del 1 al 15 y del 16 al último día del mes (hora de Chile).
    var TZ = 'America/Santiago';
    var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    function nowInChile() {
        try {
            var parts = new Intl.DateTimeFormat('en-CA', {
                timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).formatToParts(new Date());
            var o = {};
            parts.forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
            if (o.hour === 24) o.hour = 0;
            return o;
        } catch (e) {
            var d = new Date();
            return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() };
        }
    }

    function pad(x) { return x < 10 ? '0' + x : String(x); }

    function tick() {
        var n = nowInChile();
        var lastDay = new Date(Date.UTC(n.year, n.month, 0)).getUTCDate();
        var endDay = n.day <= 15 ? 15 : lastDay;
        var nowMs = Date.UTC(n.year, n.month - 1, n.day, n.hour, n.minute, n.second);
        var endMs = Date.UTC(n.year, n.month - 1, endDay, 23, 59, 59);
        var diff = Math.max(0, Math.floor((endMs - nowMs) / 1000));
        var d = Math.floor(diff / 86400);
        var h = Math.floor((diff % 86400) / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        var time = d + 'd ' + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
        var until = 'hasta el ' + endDay + ' de ' + MONTHS[n.month - 1];

        document.querySelectorAll('[data-cycle-time]').forEach(function (el) { el.textContent = time; });
        document.querySelectorAll('[data-cycle-until]').forEach(function (el) { el.textContent = until; });
    }

    function start() {
        var cfg = window.FWP_CONFIG && window.FWP_CONFIG.promo;
        if (cfg && cfg.active === false) {
            // Sin promoción activa: se ocultan la cuenta regresiva y las líneas de "dosis extra de regalo".
            document.querySelectorAll('[data-cycle]').forEach(function (el) { (el.parentElement || el).style.display = 'none'; });
            document.querySelectorAll('[data-cycle-until]').forEach(function (el) {
                var row = el.closest('div'); if (row) row.style.display = 'none';
            });
            return;
        }
        tick();
        window.setInterval(function () { if (!document.hidden) tick(); }, 1000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}(window, document));
