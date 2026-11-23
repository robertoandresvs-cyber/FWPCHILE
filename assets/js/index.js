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

        // Lógica del Cuestionario Molecular (Asistente de Precisión con Animación de Carga)
        let quizAnswers = {};
        
        function nextQuizStep(step, data) {
            quizAnswers = { ...quizAnswers, ...data };
            
            const currentStepEl = document.getElementById(`quiz-step-${step - 1}`);
            if (currentStepEl) currentStepEl.classList.add('hidden');
            
            const nextStepEl = document.getElementById(`quiz-step-${step}`);
            if (nextStepEl) nextStepEl.classList.remove('hidden');
        }

        function finishQuiz(data) {
            quizAnswers = { ...quizAnswers, ...data };
            
            // Ocultar paso 3 y mostrar estado de carga animado
            document.getElementById('quiz-step-3').classList.add('hidden');
            const loader = document.getElementById('quiz-loading');
            loader.classList.remove('hidden');
            
            setTimeout(() => {
                // Ocultar cargador tras 2 segundos de simulación analítica
                loader.classList.add('hidden');
                
                let recommendation = {
                    name: "🌿 BIENESTAR INTEGRAL",
                    targetId: "protocol-integral",
                    filterKey: "integral",
                    desc: "Tu perfil biológico indica la conveniencia de una cobertura completa. El Protocolo de Bienestar Integral combina soporte nootrópico diurno con reposición estructural de colágeno Peptan® y balance para tu microbiota intestinal.",
                    alts: [
                        { name: "⚡ ENERGÍA 24/7", targetId: "protocol-energy", desc: "Aporte y enfoque constante." },
                        { name: "✨ BELLEZA DESDE ADENTRO", targetId: "protocol-beauty", desc: "Nutrición estructural y elástica." }
                    ]
                };

                if (quizAnswers.goal === 'energy' || quizAnswers.symptom === 'fatigue') {
                    recommendation = {
                        name: "⚡ ENERGÍA 24/7",
                        targetId: "protocol-energy",
                        filterKey: "energia",
                        desc: "La asimilación de energía celular es clave. El Protocolo de Energía 24/7 aportará un flujo constante de vitalidad mental libre de picos de agitación, regulando el descanso circadiano nocturno.",
                        alts: [
                            { name: "🌿 BIENESTAR INTEGRAL", targetId: "protocol-integral", desc: "Soporte biológico de amplio espectro." },
                            { name: "🌱 REINICIO 30 DÍAS", targetId: "protocol-men", desc: "Reset celular y digestivo profundo." }
                        ]
                    };
                } else if (quizAnswers.goal === 'digestive' || quizAnswers.symptom === 'bloating') {
                    recommendation = {
                        name: "🔥 PÉRDIDA DE PESO INTELIGENTE",
                        targetId: "protocol-detox",
                        filterKey: "peso",
                        desc: "Tu flora intestinal se verá sumamente respaldada por la combinación de probióticos y fibra soluble activa de LIV junto al estímulo del metabolismo diurno y termogénesis de 24BURN.",
                        alts: [
                            { name: "🌱 REINICIO 30 DÍAS", targetId: "protocol-men", desc: "Reseteo metabólico y estructural." },
                            { name: "🌿 BIENESTAR INTEGRAL", targetId: "protocol-integral", desc: "Soporte fisiológico integral." }
                        ]
                    };
                } else if (quizAnswers.goal === 'structural' || quizAnswers.symptom === 'aging') {
                    recommendation = {
                        name: "✨ BELLEZA DESDE ADENTRO",
                        targetId: "protocol-beauty",
                        filterKey: "belleza",
                        desc: "Tu organismo se beneficiará óptimamente de la reposición de péptidos bioactivos de colágeno Peptan® de RENÖVA+, apoyando la elasticidad celular, cabello, piel, uñas y salud articular.",
                        alts: [
                            { name: "💜 MUJER +35", targetId: "protocol-women", desc: "Equilibrio hormonal y estructural." },
                            { name: "🌿 BIENESTAR INTEGRAL", targetId: "protocol-integral", desc: "Nutrición biológica completa." }
                        ]
                    };
                }

                window.activeQuizRecommendationId = recommendation.targetId;
                window.activeQuizFilterKey = recommendation.filterKey;

                // Renderizar los resultados
                document.getElementById('quiz-rec-title').innerText = recommendation.name;
                document.getElementById('quiz-recommended-description').innerText = recommendation.desc;
                
                // Renderizar las alternativas "También podrían interesarte"
                const altsContainer = document.getElementById('quiz-alternatives-container');
                altsContainer.innerHTML = '';
                recommendation.alts.forEach(alt => {
                    altsContainer.innerHTML += `
                        <button data-action="scrollToProtocolDirect('${alt.targetId}')" class="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 text-left transition-all w-full flex justify-between items-center group">
                            <div>
                                <span class="block font-black text-xs text-white uppercase tracking-wider">${alt.name}</span>
                                <span class="text-[10px] text-gray-400 block">${alt.desc}</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-500 group-hover:text-emerald-400 transition-colors text-xs"></i>
                        </button>
                    `;
                });

                document.getElementById('quiz-result').classList.remove('hidden');
            }, 2000);
        }

        function scrollToProtocol() {
            if (window.activeQuizFilterKey) {
                selectObjective(window.activeQuizFilterKey);
            }
            const el = document.getElementById(window.activeQuizRecommendationId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function scrollToProtocolDirect(id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function restartQuiz() {
            quizAnswers = {};
            document.getElementById('quiz-result').classList.add('hidden');
            document.getElementById('quiz-loading').classList.add('hidden');
            document.getElementById('quiz-step-1').classList.remove('hidden');
            document.getElementById('quiz-step-2').classList.add('hidden');
            document.getElementById('quiz-step-3').classList.add('hidden');
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
            nextQuizStep,
            finishQuiz,
            scrollToProtocol,
            restartQuiz,
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
