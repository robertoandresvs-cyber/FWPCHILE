(function (window, document) {
    'use strict';

    const canvas = document.getElementById('fwp-particles');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // se queda con el fondo estático (glow + grid), sin animar

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, particles = [];
    let running = false;
    let rafId = null;

    // Menos partículas en pantallas chicas para no gastar batería/CPU en celulares.
    function particleCount() {
        const area = window.innerWidth * window.innerHeight;
        return Math.max(18, Math.min(55, Math.round(area / 22000)));
    }

    const COLORS = ['37,99,235', '34,197,94']; // fwp-blue, fwp-green (rgb)
    const LINK_DIST = 130;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    }

    function makeParticles() {
        const count = particleCount();
        particles = new Array(count).fill(0).map(function () {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                color: COLORS[Math.random() < 0.5 ? 0 : 1]
            };
        });
    }

    function step() {
        if (!running) return;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.strokeStyle = 'rgba(' + p.color + ',' + (0.15 * (1 - dist / LINK_DIST)) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
        }
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.fillStyle = 'rgba(' + p.color + ',0.6)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }

        rafId = window.requestAnimationFrame(step);
    }

    function start() {
        if (running) return;
        running = true;
        rafId = window.requestAnimationFrame(step);
    }
    function stop() {
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
    }

    function init() {
        resize();
        makeParticles();
        start();
    }

    window.addEventListener('resize', function () {
        resize();
        makeParticles();
    });

    // Pausa el efecto cuando el hero no está visible (scroll) o la pestaña está en segundo plano.
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) start(); else stop();
            });
        }, { threshold: 0.05 });
        observer.observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}(window, document));
