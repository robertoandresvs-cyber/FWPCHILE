(function (window, document) {
    'use strict';

    // Despacho del día: pedidos con pago aprobado de lunes a viernes entre 06:00 y 13:00 (hora de Chile) salen HOY.
    // Fuera de ese horario se muestra cuándo sale el pedido y vuelve el contador de 30 min con muestra de regalo.
    // Ajusta horario y feriados en FWP_CONFIG.dispatch (config.js).

    var cfg = (window.FWP_CONFIG && window.FWP_CONFIG.dispatch) || { tz: 'America/Santiago', days: [1, 2, 3, 4, 5], start: 6, cutoff: 13, holidays: [] };
    var DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    function pad(x) { return x < 10 ? '0' + x : String(x); }

    // Hora actual en Chile, sin depender del reloj ni la zona del visitante más que para los milisegundos.
    function chileNow() {
        var parts = {};
        new Intl.DateTimeFormat('en-CA', { timeZone: cfg.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short' })
            .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
        var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
        return { date: parts.year + '-' + parts.month + '-' + parts.day, y: +parts.year, m: +parts.month, d: +parts.day, wd: wd, h: +parts.hour % 24, min: +parts.minute, s: +parts.second };
    }

    function isDispatchDay(dateStr, wd) {
        return cfg.days.indexOf(wd) !== -1 && (cfg.holidays || []).indexOf(dateStr) === -1;
    }

    function addDays(y, m, d, n) {
        var t = new Date(Date.UTC(y, m - 1, d + n));
        return { date: t.toISOString().slice(0, 10), wd: t.getUTCDay() };
    }

    function nextDispatchLabel(now) {
        for (var i = 1; i <= 10; i++) {
            var n = addDays(now.y, now.m, now.d, i);
            if (isDispatchDay(n.date, n.wd)) return i === 1 ? 'mañana a primera hora' : 'el ' + DAY_NAMES[n.wd] + ' a primera hora';
        }
        return 'el próximo día hábil';
    }

    function state() {
        var now = chileNow();
        var secs = now.h * 3600 + now.min * 60 + now.s;
        if (isDispatchDay(now.date, now.wd)) {
            if (secs >= cfg.start * 3600 && secs < cfg.cutoff * 3600) return { mode: 'today', left: cfg.cutoff * 3600 - secs };
            if (secs < cfg.start * 3600) return { mode: 'later', label: 'hoy a primera hora' };
        }
        return { mode: 'later', label: nextDispatchLabel(now) };
    }

    function fmt(left) {
        var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
        return (h ? h + ' h ' : '') + pad(m) + ' min ' + pad(s) + ' s';
    }

    var cycleHidden = false;
    function render() {
        var st = state();
        var today = st.mode === 'today';
        document.querySelectorAll('[data-dispatch]').forEach(function (el) {
            el.classList.toggle('is-today', today);
            el.innerHTML = today
                ? '<span class="dsp-ico">🚚</span><span>Compra en las próximas <b class="dsp-time">' + fmt(st.left) + '</b> y lo despacho <b>HOY</b></span>'
                : '<span class="dsp-ico">📦</span><span>Pide ahora y sale <b>' + st.label + '</b></span>';
            el.hidden = false;
        });
        document.querySelectorAll('[data-exit-time]').forEach(function (el) { el.textContent = today ? fmt(st.left) : ''; });
        // Un solo contador a la vez: en horario de despacho se oculta el de 30 min.
        if (today && !cycleHidden) {
            document.querySelectorAll('[data-cycle]').forEach(function (el) { el.style.display = 'none'; });
            cycleHidden = true;
        } else if (!today && cycleHidden) {
            document.querySelectorAll('[data-cycle]').forEach(function (el) { el.style.display = ''; });
            cycleHidden = false;
        }
        return st;
    }

    // Ventana al intentar salir: una sola vez por visita y solo dentro del horario de despacho del día.
    var EXIT_KEY = 'fwp-exit-shown';
    function exitShown() { try { return sessionStorage.getItem(EXIT_KEY) === '1'; } catch (e) { return false; } }
    function markExit() { try { sessionStorage.setItem(EXIT_KEY, '1'); } catch (e) { /* sin almacenamiento */ } }

    function lastPackTarget() {
        var packs = document.querySelectorAll('.pf-packs');
        var best = null, bestDist = Infinity;
        packs.forEach(function (p) {
            var r = p.getBoundingClientRect(), dist = Math.abs(r.top);
            if (dist < bestDist) { bestDist = dist; best = p; }
        });
        return best || document.getElementById('productos') || document.getElementById('diagnostico');
    }

    function showExit() {
        if (exitShown() || state().mode !== 'today' || document.getElementById('fwp-co-open')) return;
        var co = document.getElementById('fwp-co');
        if (co && co.offsetParent !== null) return; // ya está pagando
        markExit();
        var target = lastPackTarget();
        var box = document.createElement('div');
        box.className = 'exit-pop';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', 'Despacho de hoy');
        box.innerHTML = '<div class="exit-card">' +
            '<button type="button" class="exit-x" aria-label="Cerrar">×</button>' +
            '<div class="exit-truck">🚚</div>' +
            '<h3>¡Espera! Si compras antes de las ' + cfg.cutoff + ':00 tu pedido sale <span>HOY</span></h3>' +
            '<p class="exit-count">Te quedan <b data-exit-time>' + fmt(state().left) + '</b></p>' +
            '<p class="exit-note">Válido para pagos aprobados de lunes a viernes antes de las ' + cfg.cutoff + ':00 (hora de Chile).</p>' +
            '<button type="button" class="exit-go">Volver a mi pack</button>' +
            '<button type="button" class="exit-no">No, gracias</button>' +
            '</div>';
        document.body.appendChild(box);
        var close = function () { box.remove(); };
        box.querySelector('.exit-x').onclick = close;
        box.querySelector('.exit-no').onclick = close;
        box.addEventListener('click', function (e) { if (e.target === box) close(); });
        document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
        box.querySelector('.exit-go').onclick = function () {
            close();
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        box.querySelector('.exit-go').focus();
        if (window.FWP_ANALYTICS) window.FWP_ANALYTICS.track('ExitOfferShown', { type: 'despacho_hoy' });
    }

    function bindExit() {
        var armedAt = Date.now() + 8000; // no molestar en los primeros segundos
        // Computador: el mouse sale por arriba (hacia la barra de pestañas).
        document.addEventListener('mouseout', function (e) {
            if (Date.now() < armedAt || e.relatedTarget || e.clientY > 12) return;
            showExit();
        });
        // Celular: después de recorrer la página, un desplazamiento rápido hacia arriba suele anticipar la salida.
        var maxY = 0, lastY = window.scrollY, lastT = Date.now();
        window.addEventListener('scroll', function () {
            var y = window.scrollY, t = Date.now();
            maxY = Math.max(maxY, y);
            var speed = (lastY - y) / Math.max(1, t - lastT);
            if (t > armedAt + 12000 && maxY > window.innerHeight * 2 && speed > 2.2 && y < maxY * 0.5) showExit();
            lastY = y; lastT = t;
        }, { passive: true });
    }

    function start() {
        if (!document.querySelector('[data-dispatch]')) return;
        render();
        window.setInterval(render, 1000);
        bindExit();
    }

    window.FWP_DISPATCH = Object.freeze({ state: state });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}(window, document));
