(function (window, document) {
  'use strict';

  const config = window.FWP_CONFIG;
  const sentEvents = new Set();
  const standardEvents = new Set([
    'PageView', 'ViewContent', 'Lead', 'Contact', 'InitiateCheckout',
    'CompleteRegistration', 'Purchase'
  ]);
  const ga4EventNames = Object.freeze({
    ViewContent: 'view_item',
    Lead: 'generate_lead',
    Contact: 'contact',
    InitiateCheckout: 'begin_checkout',
    CompleteRegistration: 'sign_up',
    Purchase: 'purchase',
    WhatsAppClick: 'whatsapp_click',
    Scroll50: 'scroll_50',
    Scroll75: 'scroll_75',
    TimeOnPage30: 'time_on_page_30'
  });

  function eventId(name) {
    const entropy = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `${name.toLowerCase()}-${entropy}`;
  }

  function loadMetaPixel() {
    if (!config.pixelId || window.fbq) return;
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    fbq('init', config.pixelId);
    fbq('track', 'PageView');
  }

  function loadGa4() {
    const id = config.analytics.ga4MeasurementId;
    if (!id) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: true });
  }

  function loadClarity() {
    const projectId = config.analytics.clarityProjectId;
    if (!projectId || window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = `https://www.clarity.ms/tag/${i}`;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    }(window, document, 'clarity', 'script', projectId));
  }

  function track(name, parameters, options) {
    const data = Object.assign({}, parameters || {});
    const settings = Object.assign({ dedupeKey: '', eventId: eventId(name) }, options || {});
    if (settings.dedupeKey) {
      if (sentEvents.has(settings.dedupeKey)) return settings.eventId;
      sentEvents.add(settings.dedupeKey);
    }
    if (typeof window.fbq === 'function') {
      const method = standardEvents.has(name) ? 'track' : 'trackCustom';
      window.fbq(method, name, data, { eventID: settings.eventId });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', ga4EventNames[name] || name, Object.assign({}, data, { event_id: settings.eventId }));
    }
    return settings.eventId;
  }

  function trackScrollAndTime() {
    const milestones = [50, 75];
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const percent = (window.scrollY / total) * 100;
      milestones.forEach(function (milestone) {
        if (percent >= milestone) track(`Scroll${milestone}`, { percent: milestone }, { dedupeKey: `scroll-${milestone}` });
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.setTimeout(function () {
      track('TimeOnPage30', { seconds: 30 }, { dedupeKey: 'time-on-page-30' });
    }, 30000);
  }

  window.FWP_ANALYTICS = Object.freeze({ eventId, track });
  loadMetaPixel();
  loadGa4();
  loadClarity();
  trackScrollAndTime();
}(window, document));
