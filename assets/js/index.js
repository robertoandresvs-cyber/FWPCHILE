// Manejador global de carga fallida para imagen RENÖVA+
        function handleRenovaError(img) {
            if (img.dataset.attempt !== 'local') {
                img.dataset.attempt = 'local';
                img.src = 'MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png';
                return;
            }
            img.removeAttribute('data-image-fallback');
            img.src = 'https://placehold.co/110x150/0f172a/9b2c86?text=RENOVA%2B';
        }

        // Lógica de la caja sorpresa del Embajador
        function openAmbassadorGift() {
            document.getElementById('gift-closed').classList.add('hidden');
            document.getElementById('gift-opened').classList.remove('hidden');
        }

        // Buscador de beneficios del Ecosistema: recomienda productos, rutina PRO y protocolo.
        const FINDER_BENEFITS = [
            { key: 'energia', icon: '⚡', label: 'Más energía durante el día', products: ['eboost'] },
            { key: 'enfoque', icon: '🎯', label: 'Enfoque y concentración', products: ['eboost'] },
            { key: 'descanso', icon: '🌙', label: 'Descansar mejor', products: ['24b'] },
            { key: 'digestion', icon: '🌿', label: 'Digestión liviana, menos hinchazón', products: ['liv'] },
            { key: 'peso', icon: '🔥', label: 'Apoyar el control de peso', products: ['24burn', 'liv'] },
            { key: 'piel', icon: '✨', label: 'Piel, cabello y uñas', products: ['renova'] },
            { key: 'articulaciones', icon: '🦴', label: 'Articulaciones y movilidad', products: ['renova'] },
            { key: 'integral', icon: '🌐', label: 'Bienestar integral', products: ['renova', 'liv', 'eboost', '24burn', '24b'] }
        ];
        const FINDER_PRODUCTS = {
            renova: { color: '#c084fc', page: 'renova.html', slot: 'manana', when: 'Mañana, en ayunas',
                desc: 'Colágeno hidrolizado Peptan® con resveratrol, Q10, vitaminas y minerales para nutrir piel, cabello, uñas y articulaciones desde el interior.',
                tip: '1 sachet (15 g) al día en agua fría o tibia, idealmente en ayunas. La constancia es clave: los cambios en piel y cabello se notan con semanas de uso.' },
            liv: { color: '#4ade80', page: 'liv.html', slot: 'manana', when: 'Mañana, en ayunas',
                desc: 'Fibras solubles y probióticos que apoyan tu equilibrio digestivo, ayudan a reducir la sensación de hinchazón y favorecen un tránsito regular.',
                tip: '1 sachet al día en agua; muchos clientes lo prefieren en la mañana en ayunas. Acompáñalo con buena hidratación durante el día.' },
            eboost: { color: '#fb923c', page: 'eboost.html', slot: 'manana', when: 'Mañana o antes de tu jornada',
                desc: 'Activador con aminoácidos (BCAAs) sabor mandarina para mantener el enfoque y una energía limpia durante tu jornada.',
                tip: '1 sachet al día en agua, en la mañana o antes de tu jornada más exigente. Evítalo en la noche para no interferir con tu descanso.' },
            '24burn': { color: '#a3e635', page: '24burn.html', slot: 'dia', when: 'Durante el día',
                desc: 'Té verde, Panax Ginseng y L-Carnitina para apoyar tu metabolismo todos los días, con 0 g de azúcar y 0 g de grasas.',
                tip: '1 scoop al día en agua, fría o caliente como un té. Tómalo durante el día: es un termogénico diurno. Súmale movimiento diario para potenciar tu rutina.' },
            '24b': { color: '#34d399', page: '24b.html', slot: 'noche', when: 'Noche, antes de dormir',
                desc: 'Soporte nocturno sabor limón para acompañar tu rutina de descanso y ayudarte a armonizar tu ritmo circadiano.',
                tip: '1 sachet en agua antes de dormir. Combínalo con horarios regulares y menos pantallas en la noche.' }
        };
        const FINDER_PROTOCOLS = [
            { key: 'proto-peso', id: 'protocol-detox', name: '🔥 Pérdida de Peso Inteligente', products: ['liv', '24burn'] },
            { key: 'proto-energia', id: 'protocol-energy', name: '⚡ Energía 24/7', products: ['eboost', '24b'] },
            { key: 'proto-belleza', id: 'protocol-beauty', name: '✨ Belleza desde Adentro', products: ['liv', 'renova'] },
            { key: 'proto-mujer', id: 'protocol-women', name: '💜 Mujer +35', products: ['liv', 'renova', '24b'] },
            { key: 'proto-reinicio', id: 'protocol-men', name: '🌱 Reinicio 30 Días', products: ['renova', 'liv', '24burn'] },
            { key: 'proto-integral', id: 'protocol-integral', name: '🌿 Bienestar Integral', products: ['renova', 'liv', 'eboost', '24burn', '24b'] }
        ];
        const FINDER_ORDER = ['renova', 'liv', 'eboost', '24burn', '24b'];
        const finderSelected = new Set();
        const finderFmt = (n) => '$' + Math.round(n).toLocaleString('es-CL');

        function finderState() {
            const products = FINDER_ORDER.filter((k) => FINDER_BENEFITS.some((b) => finderSelected.has(b.key) && b.products.includes(k)));
            const total = products.reduce((sum, k) => sum + FWP_CONFIG.products[k].price, 0);
            const exact = FINDER_PROTOCOLS.find((p) => p.products.length === products.length && products.every((k) => p.products.includes(k))) || null;
            const containing = FINDER_PROTOCOLS
                .filter((p) => products.length && products.every((k) => p.products.includes(k)))
                .sort((x, y) => x.products.length - y.products.length)[0] || null;
            return { products, total, exact, suggested: exact || containing };
        }

        function renderFinder() {
            const grid = document.getElementById('finder-benefits');
            if (!grid) return;
            grid.innerHTML = FINDER_BENEFITS.map((b) => {
                const on = finderSelected.has(b.key);
                return `<button type="button" data-action="finderToggle('${b.key}')" aria-pressed="${on}" class="p-4 rounded-2xl border text-left transition-all" style="border-color:${on ? '#22c55e' : 'rgba(255,255,255,.08)'};background:${on ? 'rgba(34,197,94,.12)' : 'rgba(0,0,0,.4)'}">
                        <span class="text-2xl block mb-1">${b.icon}</span>
                        <span class="text-xs font-bold text-white block leading-tight">${b.label}</span>
                    </button>`;
            }).join('');

            const st = finderState();
            const empty = !st.products.length;
            document.getElementById('finder-empty').classList.toggle('hidden', !empty);
            document.getElementById('finder-result').classList.toggle('hidden', empty);
            if (empty) return;

            document.getElementById('finder-products').innerHTML = st.products.map((k) => {
                const p = FWP_CONFIG.products[k];
                const info = FINDER_PRODUCTS[k];
                const tags = FINDER_BENEFITS.filter((b) => finderSelected.has(b.key) && b.products.includes(k))
                    .map((b) => `<span class="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-300">${b.icon} ${b.label}</span>`).join(' ');
                return `<div class="p-4 rounded-2xl bg-black/40 border border-white/5" style="border-left:3px solid ${info.color}">
                        <div class="flex justify-between items-start gap-3 mb-2">
                            <div class="flex items-center gap-3">
                                <img src="${p.img}" alt="${p.name}" class="object-contain shrink-0" style="height:56px;width:46px">
                                <div>
                                    <a href="${info.page}" class="text-sm font-black text-white hover:text-white">${p.name}</a>
                                    <span class="text-[11px] text-gray-400 block">${info.when}</span>
                                </div>
                            </div>
                            <span class="text-sm font-black text-white font-mono shrink-0">${finderFmt(p.price)}</span>
                        </div>
                        <p class="text-xs text-gray-400 leading-relaxed mb-2">${info.desc}</p>
                        <div class="flex flex-wrap gap-1.5 mb-2">${tags}</div>
                        <p class="text-[11px] text-gray-300 bg-white/5 rounded-xl p-3"><strong class="text-emerald-400">Recomendación PRO:</strong> ${info.tip}</p>
                    </div>`;
            }).join('');

            const slots = [['manana', '☀️ Mañana'], ['dia', '🌤️ Durante el día'], ['noche', '🌙 Noche']];
            document.getElementById('finder-routine').innerHTML = slots.map(([slot, label]) => {
                const names = st.products.filter((k) => FINDER_PRODUCTS[k].slot === slot).map((k) => FWP_CONFIG.products[k].name);
                if (!names.length) return '';
                return `<div class="flex justify-between gap-3 text-xs p-3 rounded-xl bg-black/25 border border-white/5"><span class="text-gray-400">${label}</span><span class="text-white font-bold text-right">${names.join(' + ')}</span></div>`;
            }).join('');

            document.getElementById('finder-count').innerText = `${st.products.length} producto${st.products.length === 1 ? '' : 's'} · 30 días`;
            document.getElementById('finder-total').innerText = finderFmt(st.total);

            const proto = document.getElementById('finder-protocol');
            if (st.suggested) {
                const extra = st.suggested.products.filter((k) => !st.products.includes(k)).map((k) => FWP_CONFIG.products[k].name);
                proto.innerHTML = st.exact
                    ? `Tu rutina corresponde al protocolo <strong class="text-white">${st.suggested.name}</strong>. <button type="button" data-action="scrollToProtocolDirect('${st.suggested.id}')" class="text-emerald-400 font-bold underline">Ver protocolo</button>`
                    : `Para un resultado más completo, mira el protocolo <strong class="text-white">${st.suggested.name}</strong>, que suma ${extra.join(' + ')}. <button type="button" data-action="scrollToProtocolDirect('${st.suggested.id}')" class="text-emerald-400 font-bold underline">Ver protocolo</button>`;
                proto.classList.remove('hidden');
            } else {
                proto.classList.add('hidden');
            }

            const goals = FINDER_BENEFITS.filter((b) => finderSelected.has(b.key)).map((b) => b.label.toLowerCase()).join(', ');
            const msg = `¡Hola Roberto! Usé el buscador de beneficios de tu página. Busco: ${goals}.\n\nMe recomendó: ${st.products.map((k) => FWP_CONFIG.products[k].name).join(' + ')} (${finderFmt(st.total)}).\n\n¿Me asesoras para elegir bien?`;
            document.getElementById('finder-whatsapp').setAttribute('data-whatsapp-message', encodeURIComponent(msg));
        }

        function scrollToProtocolDirect(id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function finderToggle(key) {
            if (finderSelected.has(key)) finderSelected.delete(key); else finderSelected.add(key);
            renderFinder();
            if (finderSelected.size) FWP_ANALYTICS.track('FinderSelect', { benefit: key, selected: finderSelected.size });
        }

        function finderReset() { finderSelected.clear(); renderFinder(); }

        function finderOrder() {
            const st = finderState();
            if (!st.products.length || !window.FWP_CHECKOUT) return;
            FWP_CHECKOUT.checkout(st.products.map((k) => ({ key: k, qty: 1 })), {
                label: st.exact ? 'Protocolo ' + st.exact.name.replace(/^\S+\s/, '') : 'Rutina recomendada',
                linkKey: st.exact ? st.exact.key : ''
            });
        }

        // Testimonial Lightbox
        function openTestimonialLightbox(el) {
            const imgSrc = el.querySelector('img').src;
            document.getElementById('lightbox-img').src = imgSrc;
            document.getElementById('testimonialLightbox').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeTestimonialLightbox() {
            document.getElementById('testimonialLightbox').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        // Simulador de puntos del portal mayorista (reglas en config.js)
        const SIM_ORDER = ['renova', 'liv', '24b', 'eboost', '24burn'];
        const simQty = { renova: 0, liv: 0, '24b': 0, eboost: 0, '24burn': 0 };
        const simFmt = (n) => '$' + Math.round(n).toLocaleString('es-CL');

        function simTotals() {
            const products = FWP_CONFIG.products;
            const portal = FWP_CONFIG.portal;
            let points = 0, list = 0, units = 0;
            SIM_ORDER.forEach((key) => {
                points += simQty[key] * products[key].points;
                list += simQty[key] * products[key].price;
                units += simQty[key];
            });
            let tier = null, next = portal.tiers[0];
            portal.tiers.forEach((t, i) => { if (points >= t.points) { tier = t; next = portal.tiers[i + 1] || null; } });
            const discount = tier ? tier.discount : 0;
            const subtotal = Math.round(list * (1 - discount / 100));
            const shipping = units > 0 ? portal.shippingCLP : 0;
            return { points, list, units, tier, next, discount, subtotal, shipping, total: subtotal + shipping };
        }

        function renderSimulator() {
            const list = document.getElementById('sim-products');
            if (!list) return;
            const products = FWP_CONFIG.products;
            list.innerHTML = SIM_ORDER.map((key) => {
                const p = products[key];
                return `
                    <div class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/5">
                        <div class="flex items-center gap-3">
                            <img src="${p.img}" alt="${p.name}" class="object-contain shrink-0" style="height:52px;width:44px">
                            <div class="text-left">
                                <span class="text-sm font-black text-white block">${p.name}</span>
                                <span class="text-[11px] text-gray-400 font-mono">${simFmt(p.price)} · ${p.points} pts</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button type="button" data-action="simSub('${key}')" aria-label="Quitar ${p.name}" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-black">−</button>
                            <span class="w-8 text-center font-black text-white font-mono" aria-live="polite">${simQty[key]}</span>
                            <button type="button" data-action="simAdd('${key}')" aria-label="Agregar ${p.name}" class="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black">+</button>
                        </div>
                    </div>`;
            }).join('');

            const t = simTotals();
            const goal = t.next ? t.next.points : (t.tier ? t.tier.points : FWP_CONFIG.portal.tiers[0].points);
            const pct = Math.min(100, Math.round((t.points / goal) * 100));
            const bar = document.getElementById('sim-progress-bar');
            bar.style.width = pct + '%';
            bar.style.background = t.tier ? '#22c55e' : '#f59e0b';
            document.getElementById('sim-points').innerText = `${t.points} / ${goal} pts`;

            let msg;
            if (!t.tier) {
                const missing = FWP_CONFIG.portal.tiers[0].points - t.points;
                msg = t.points === 0
                    ? 'Agrega productos para ver tu descuento. Mínimo mayorista: 154 pts (ej: 8 RENÖVA+).'
                    : `Te faltan ${missing} pts para acceder al 35% de descuento mayorista.`;
            } else if (t.next) {
                msg = `¡${t.discount}% de descuento alcanzado! Suma ${t.next.points - t.points} pts más para llegar al ${t.next.discount}%.`;
            } else {
                msg = `¡Alcanzaste el descuento máximo del ${t.discount}%!`;
            }
            document.getElementById('sim-message').innerText = msg;

            document.getElementById('sim-units').innerText = `${t.units} unidad${t.units === 1 ? '' : 'es'}`;
            document.getElementById('sim-list').innerText = simFmt(t.list);
            document.getElementById('sim-discount-label').innerText = `Descuento (${t.discount}%)`;
            document.getElementById('sim-discount').innerText = '-' + simFmt(t.list - t.subtotal);
            document.getElementById('sim-shipping').innerText = simFmt(t.shipping);
            document.getElementById('sim-total').innerText = simFmt(t.total);

            const resale = document.getElementById('sim-resale');
            if (t.tier) {
                const gain = t.list - t.total;
                resale.classList.remove('hidden');
                document.getElementById('sim-resale-value').innerText = `${simFmt(gain)} (+${Math.round((gain / t.total) * 100)}%)`;
            } else {
                resale.classList.add('hidden');
            }

            document.querySelectorAll('[data-sim-tier]').forEach((el) => {
                const active = t.tier && String(t.tier.discount) === el.getAttribute('data-sim-tier');
                el.style.borderColor = active ? '#22c55e' : '';
                el.style.boxShadow = active ? '0 0 25px rgba(34,197,94,.25)' : '';
            });

            const portalBtn = document.getElementById('sim-portal-btn');
            portalBtn.style.opacity = t.tier ? '1' : '.55';
            const items = SIM_ORDER.filter((k) => simQty[k] > 0).map((k) => `• ${simQty[k]} x ${FWP_CONFIG.products[k].name}`).join('\n');
            const waMsg = items
                ? `¡Hola Roberto! Armé este pedido mayorista en tu página:\n\n${items}\n\n⭐ ${t.points} pts · ${t.discount}% de descuento\n💰 Total estimado: ${simFmt(t.total)} (envío incluido)\n\n¿Me ayudas a completarlo en el portal?`
                : '¡Hola Roberto! Quiero información sobre la compra mayorista FWP.';
            document.getElementById('sim-whatsapp-btn').setAttribute('data-whatsapp-message', encodeURIComponent(waMsg));
        }

        function simAdd(key) { if (key in simQty) { simQty[key] = Math.min(99, simQty[key] + 1); renderSimulator(); } }
        function simSub(key) { if (key in simQty) { simQty[key] = Math.max(0, simQty[key] - 1); renderSimulator(); } }
        function simReset() { Object.keys(simQty).forEach((k) => { simQty[k] = 0; }); renderSimulator(); }
        function simPreset(units) {
            Object.keys(simQty).forEach((k) => { simQty[k] = 0; });
            simQty.renova = parseInt(units, 10) || 0;
            renderSimulator();
        }

        function initSimulator() {
            const portalBtn = document.getElementById('sim-portal-btn');
            if (!portalBtn) return;
            portalBtn.setAttribute('href', FWP_CONFIG.portal.url);
            portalBtn.addEventListener('click', () => {
                const t = simTotals();
                FWP_ANALYTICS.track('InitiateCheckout', { content_type: 'portal_mayorista', num_items: t.units, value: t.total, currency: 'CLP' });
                FWP_ANALYTICS.track('PortalClick', { points: t.points, discount: t.discount });
            });
            simPreset('8');
        }

        // Interruptor de propuesta de valor (Consumo vs Emprende)
        function switchPartnerTab(profile) {
            const btnConsume = document.getElementById("tab-consume");
            const btnEmprende = document.getElementById("tab-emprende");
            const infoConsume = document.getElementById("partner-info-consume");
            const infoEmprende = document.getElementById("partner-info-emprende");
            const indicator = document.getElementById("pack-badge-indicator");
            const dynamicImg = document.getElementById("partner-dynamic-image");

            dynamicImg.style.opacity = 0;

            setTimeout(() => {
                if (profile === "consume") {
                    btnConsume.className = "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 text-white bg-emerald-600 shadow-md";
                    btnEmprende.className = "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 text-gray-400 hover:text-white";
                    infoConsume.classList.remove("hidden");
                    infoEmprende.classList.add("hidden");
                    indicator.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse";
                    
                    dynamicImg.src = "MOCKUP%20Productos/Consume%20Inteligente.png";
                } else {
                    btnEmprende.className = "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 text-white bg-blue-600 shadow-md";
                    btnConsume.className = "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 text-gray-400 hover:text-white";
                    infoEmprende.classList.remove("hidden");
                    infoConsume.classList.add("hidden");
                    indicator.className = "w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse";
                    
                    dynamicImg.src = "MOCKUP%20Productos/Emprende.png";
                }
                dynamicImg.style.opacity = 1;
            }, 150);
        }

        const LEGAL_DATA = {
            terminos: {
                title: "Términos y Condiciones",
                content: `
                    <p class="text-xs text-gray-400 mb-4 font-mono">Última actualización: 18 de julio de 2026</p>
                    <p>Estos Términos y Condiciones regulan el uso del sitio web y la compra de productos en fwpchile.lat, operado por una persona natural en Chile. Al navegar o comprar en este sitio, aceptas estos términos.</p>
                    <p><strong>Identificación del vendedor:</strong> por motivos de privacidad, los datos de identificación completos (nombre y RUT) no se publican en el sitio, pero serán proporcionados sin inconveniente a las autoridades competentes (SERNAC, Servicio de Impuestos Internos y tribunales de justicia) o a quien la ley faculte para requerirlos. Para cualquier gestión, escríbenos a robertoandresvs@gmail.com o por WhatsApp al +56 9 3620 0521.</p>
                `
            },
            privacidad: {
                title: "Política de Privacidad",
                content: `
                    <p class="text-xs text-gray-400 mb-4 font-mono">Última actualización: 18 de julio de 2026</p>
                    <p>En fwpchile.lat, operada por una persona natural en Chile, respetamos tu privacidad y protegemos tus datos personales conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y demás normativa chilena aplicable.</p>
                `
            },
            devoluciones: {
                title: "Política de Devoluciones y Reembolsos",
                content: `
                    <p class="text-xs text-gray-400 mb-4 font-mono">Última actualización: 6 de noviembre de 2026</p>
                    <p>En fwpchile.lat queremos que compres con confianza. Aquí explicamos cómo funcionan las devoluciones y los reembolsos, respetando la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</p>
                    <p><strong>Devolución en 10 días.</strong> Al tratarse de una compra a distancia, puedes poner término a tu compra dentro de 10 días corridos contados desde que recibes el producto, conforme al artículo 3° bis de la Ley N° 19.496. Como se trata de suplementos alimenticios de uso personal, la devolución aplica solo si el envase se encuentra sellado y sin abrir.</p>
                    <p><strong>Cómo solicitarla.</strong> Escríbenos por WhatsApp dentro del plazo, indicando tu nombre y tu pedido, y coordinamos contigo la devolución y el reembolso.</p>
                    <p><strong>Productos con defectos.</strong> Si tu pedido llega dañado, incompleto o con algún defecto, escríbenos de inmediato: esos casos se rigen por la garantía legal de la Ley N° 19.496, aunque el envase ya esté abierto.</p>
                    <p>Esta política no limita ninguno de los derechos que la ley te reconoce como consumidor.</p>
                `
            },
            envios: {
                title: "Política de Envíos",
                content: `
                    <p class="text-xs text-gray-400 mb-4 font-mono">Última actualización: 18 de julio de 2026</p>
                    <p>En las compras directas en fwpchile.lat (1 a 7 unidades), el envío es gratis a todo Chile. A continuación detallamos cómo funcionan nuestros despachos.</p>
                    <p>Los pedidos se procesan dentro de las primeras 24 horas hábiles y se despachan de forma prioritaria de norte a sur.</p>
                    <p><strong>Compras mayoristas en el portal oficial.</strong> Los pedidos mayoristas (desde 154 puntos) se pagan y despachan directamente desde el portal oficial de la compañía, que aplica su propio costo de envío (referencial: $6.530) y sus propias condiciones de despacho.</p>
                `
            }
        };

        function toggleMobileMenu() {
            const menu = document.getElementById("mobile-menu");
            menu.classList.toggle("hidden");
        }

        function openLegalModal(policyKey) {
            const modal = document.getElementById('legalModal');
            const title = document.getElementById('legalModalTitle');
            const content = document.getElementById('legalModalContent');
            
            if (LEGAL_DATA[policyKey]) {
                title.innerText = LEGAL_DATA[policyKey].title;
                content.innerHTML = LEGAL_DATA[policyKey].content;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; 
            }
        }

        function closeLegalModal() {
            const modal = document.getElementById('legalModal');
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto'; 
        }

        function reveal() {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 150;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        window.addEventListener("scroll", reveal);

        window.addEventListener("scroll", function() {
            var navbar = document.getElementById("navbar");
            if (window.scrollY > 50) {
                navbar.classList.add("bg-slate-900/80", "backdrop-blur-md", "shadow-lg");
                navbar.classList.remove("bg-transparent");
            } else {
                navbar.classList.remove("bg-slate-900/80", "backdrop-blur-md", "shadow-lg");
                navbar.classList.add("bg-transparent");
            }
        });

        // Filtrado de Testimonios
        function filterTestimonials(category) {
            const items = document.querySelectorAll('.testimonial-item');
            const buttons = document.querySelectorAll('#testimonios button');

            buttons.forEach(btn => {
                if(btn.innerText.toLowerCase().includes(category) || (category === 'all' && btn.innerText === 'Todos') || (category === 'renova' && btn.innerText.includes('RENÖVA+'))) {
                    btn.classList.remove('text-gray-400');
                    btn.classList.add('bg-white/10', 'text-white');
                } else {
                    btn.classList.add('text-gray-400');
                    btn.classList.remove('bg-white/10', 'text-white');
                }
            });

            items.forEach(item => {
                if (category === 'all') {
                    item.classList.remove('hidden');
                } else if (item.classList.contains(category)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
            
            setTimeout(reveal, 50);
        }

        // Selección de Objetivos para filtrar protocolos
        function selectObjective(objectiveKey) {
            const cards = document.querySelectorAll('.protocol-card');
            const container = document.getElementById('reset-filter-container');
            const badge = document.getElementById('filter-badge');
            
            cards.forEach(card => {
                const categories = card.getAttribute('data-categories').split(' ');
                if (categories.includes(objectiveKey)) {
                    card.classList.remove('dimmed');
                    card.classList.add('highlighted');
                } else {
                    card.classList.remove('highlighted');
                    card.classList.add('dimmed');
                }
            });

            container.classList.remove('hidden');
            let objectiveName = '';
            if (objectiveKey === 'peso') objectiveName = 'Quiero bajar de peso y desinflamarme 🔥';
            if (objectiveKey === 'energia') objectiveName = 'Quiero tener más energía y enfoque ⚡';
            if (objectiveKey === 'belleza') objectiveName = 'Quiero mejorar mi piel, cabello y uñas ✨';
            if (objectiveKey === 'integral') objectiveName = 'Quiero un bienestar y salud integral 🌿';
            
            badge.innerText = `Recomendación: ${objectiveName}`;
            badge.classList.remove('bg-fwp-green/10', 'text-fwp-green');
            badge.classList.add('bg-blue-500/10', 'text-blue-400');

            document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
        }

        function resetFilters() {
            const cards = document.querySelectorAll('.protocol-card');
            const container = document.getElementById('reset-filter-container');
            const badge = document.getElementById('filter-badge');

            cards.forEach(card => {
                card.classList.remove('highlighted', 'dimmed');
            });

            container.classList.add('hidden');
            badge.innerText = 'Ecosistema de Longevidad';
            badge.classList.remove('bg-blue-500/10', 'text-blue-400');
            badge.classList.add('bg-fwp-green/10', 'text-fwp-green');
        }
        
        document.addEventListener("DOMContentLoaded", () => {
            initSimulator();
            renderFinder();
            filterTestimonials('all'); 
            reveal(); 
            FWP_WHATSAPP.bindLinks();
            const productSection = document.getElementById('productos');
            if (productSection && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    if (!entries.some((entry) => entry.isIntersecting)) return;
                    FWP_ANALYTICS.track('ViewContent', { content_name: 'protocolos_fwp' }, { dedupeKey: 'view-protocols' });
                    observer.disconnect();
                }, { threshold: 0.25 });
                observer.observe(productSection);
            }
        });

        const ACTIONS = {
            openAmbassadorGift,
            finderToggle,
            finderReset,
            finderOrder,
            selectObjective,
            resetFilters,
            switchPartnerTab,
            simAdd,
            simSub,
            simReset,
            simPreset,
            filterTestimonials,
            openTestimonialLightbox,
            closeTestimonialLightbox,
            scrollToProtocolDirect,
            openLegalModal,
            closeLegalModal,
            toggleMobileMenu
        };

        function runAction(action, element) {
            if (action === 'window.scrollTo(0,0)') {
                window.scrollTo(0, 0);
                return;
            }
            const objectMatch = action.match(/^(nextQuizStep|finishQuiz)\((?:([0-9]+),\s*)?\{(goal|symptom|activity):\s*'([^']+)'\}\)$/);
            if (objectMatch) {
                const fn = ACTIONS[objectMatch[1]];
                const payload = { [objectMatch[3]]: objectMatch[4] };
                if (objectMatch[2]) fn(Number(objectMatch[2]), payload);
                else fn(payload);
                return;
            }
            const thisMatch = action.match(/^(openTestimonialLightbox)\(this\)$/);
            if (thisMatch) {
                ACTIONS[thisMatch[1]](element);
                return;
            }
            const stringMatch = action.match(/^([A-Za-z][A-Za-z0-9]*)\('([^']*)'\)$/);
            if (stringMatch && ACTIONS[stringMatch[1]]) {
                ACTIONS[stringMatch[1]](stringMatch[2]);
                return;
            }
            const emptyMatch = action.match(/^([A-Za-z][A-Za-z0-9]*)\(\)$/);
            if (emptyMatch && ACTIONS[emptyMatch[1]]) ACTIONS[emptyMatch[1]]();
        }

        document.addEventListener('click', (event) => {
            const element = event.target.closest('[data-action]');
            if (!element) return;
            const href = element.getAttribute('href') || '';
            if (!href.startsWith('#') || href === '#') event.preventDefault();
            runAction(element.dataset.action, element);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const element = event.target.closest('[data-action]');
            if (!element || element.matches('button, a')) return;
            event.preventDefault();
            runAction(element.dataset.action, element);
        });

        document.addEventListener('error', (event) => {
            const image = event.target;
            if (!(image instanceof HTMLImageElement)) return;
            if (image.dataset.imageFallback === 'renova') {
                handleRenovaError(image);
                return;
            }
            const fallback = image.dataset.fallbackSrc;
            if (fallback && image.src !== fallback) {
                image.src = fallback;
                if (image.dataset.fallbackRemoveClass) image.classList.remove(image.dataset.fallbackRemoveClass);
            }
        }, true);

        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-action]').forEach((element) => {
                if (element.matches('button, a')) return;
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
            });
            ['legalModal', 'testimonialLightbox'].forEach((id) => {
                const modal = document.getElementById(id);
                if (!modal) return;
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
            });
        });
