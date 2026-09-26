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

        // Meta Pixel: Detección y rastreo automático de clics a pasarelas de Mercado Pago
        document.addEventListener("DOMContentLoaded", function() {
            document.body.addEventListener("click", function(event) {
                const targetLink = event.target.closest("a");
                if (targetLink && targetLink.href) {
                    const url = targetLink.href;
                    if (url.includes("mpago.la") || url.includes("mpago.li") || url.includes("mercadopago")) {
                        FWP_ANALYTICS.track('InitiateCheckout', { checkout_url: url }, { dedupeKey: `checkout-${url}` });
                    }
                }
            });
        });

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

        // Base de Datos de Canastas Mayoristas
        const CALCULATOR_PACKS = {
            "35": [
                {
                    id: "c35-1",
                    name: "Pack Puramente RENÖVA+",
                    totalQty: 7,
                    priceRegular: 419916, 
                    pricePack: 240500,
                    savings: 179416,
                    roi: "74.6%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Puro RENOVA+ con 35% de descuento por $240.500. Por favor ayúdame con el pedido.",
                    items: [
                        { name: "RENÖVA+", qty: 7, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" }
                    ]
                },
                {
                    id: "c35-2",
                    name: "Pack Mixto 24BURN + RENÖVA+",
                    totalQty: 9,
                    priceRegular: 439092, 
                    pricePack: 240500,
                    savings: 198592,
                    roi: "82.5%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Mixto (6 24BURN + 3 RENOVA+) con 35% de descuento por $240.500. Por favor ayúdame.",
                    items: [
                        { name: "24BURN", qty: 6, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "RENÖVA+", qty: 3, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" }
                    ]
                },
                {
                    id: "c35-3",
                    name: "Pack Triple Sinergia",
                    totalQty: 9,
                    priceRegular: 427092, 
                    pricePack: 240500,
                    savings: 186592,
                    roi: "77.5%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Triple Sinergia (6 24BURN + 2 RENOVA+ + 1 EBOOST) con 35% de descuento por $240.500.",
                    items: [
                        { name: "24BURN", qty: 6, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "RENÖVA+", qty: 2, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "EBOOST", qty: 1, color: "orange", img: "MOCKUP%20Productos/MOCKUP_EBOOST.png", height: "120px" }
                    ]
                },
                {
                    id: "c35-4",
                    name: "Pack Completo Mixto 9",
                    totalQty: 9,
                    priceRegular: 477492, 
                    pricePack: 265200,
                    savings: 212292,
                    roi: "80.0%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Completo (3 24BURN + 3 LIV + 2 RENOVA+ + 1 EBOOST) con 35% de descuento por $265.200.",
                    items: [
                        { name: "24BURN", qty: 3, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "LIV", qty: 3, color: "green", img: "MOCKUP%20Productos/MOCKUP_LIV.png", height: "140px" }, 
                        { name: "RENÖVA+", qty: 2, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "EBOOST", qty: 1, color: "orange", img: "MOCKUP%20Productos/MOCKUP_EBOOST.png", height: "120px" }
                    ]
                }
            ],
            "40": [
                {
                    id: "c40-1",
                    name: "Pack Puro RENÖVA+ 15",
                    totalQty: 15,
                    priceRegular: 899820, 
                    pricePack: 456500,
                    savings: 443320,
                    roi: "97.1%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Puro RENOVA+ con 40% de descuento (15 unidades) por $456.500.",
                    items: [
                        { name: "RENÖVA+", qty: 15, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" }
                    ]
                },
                {
                    id: "c40-2",
                    name: "Pack Dual 10 24BURN + 8 RENÖVA+",
                    totalQty: 18,
                    priceRegular: 911784, 
                    pricePack: 462500,
                    savings: 449284,
                    roi: "97.1%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Dual (10 24BURN + 8 RENOVA+) con 40% de descuento por $462.500.",
                    items: [
                        { name: "24BURN", qty: 10, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "RENÖVA+", qty: 8, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" }
                    ]
                },
                {
                    id: "c40-3",
                    name: "Pack Mayorista Completo 18",
                    totalQty: 18,
                    priceRegular: 937784, 
                    pricePack: 493000,
                    savings: 444784,
                    roi: "90.2%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Mayorista Mixto 18 (5 24BURN + 4 RENOVA+ + 4 EBOOST + 5 LIV) con 40% de descuento por $493.000.",
                    items: [
                        { name: "24BURN", qty: 5, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "RENÖVA+", qty: 4, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "EBOOST", qty: 4, color: "orange", img: "MOCKUP%20Productos/MOCKUP_EBOOST.png", height: "120px" },
                        { name: "LIV", qty: 5, color: "green", img: "MOCKUP%20Productos/MOCKUP_LIV.png", height: "140px" }
                    ]
                },
                {
                    id: "c40-4",
                    name: "Pack Fuerza Activa 18",
                    totalQty: 18,
                    priceRegular: 863784, 
                    pricePack: 438422,
                    savings: 425362,
                    roi: "97.0%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Fuerza Activa 18 (10 24BURN + 4 RENOVA+ + 4 EBOOST) con 40% de descuento por $438.422.",
                    items: [
                        { name: "24BURN", qty: 10, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "RENÖVA+", qty: 4, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "EBOOST", qty: 4, color: "orange", img: "MOCKUP%20Productos/MOCKUP_EBOOST.png", height: "120px" }
                    ]
                }
            ],
            "50": [
                {
                    id: "c50-1",
                    name: "Pack Puro RENÖVA+ 36",
                    totalQty: 36,
                    priceRegular: 2159568, 
                    pricePack: 906500,
                    savings: 1253068,
                    roi: "138.2%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Puro RENOVA+ con 50% de descuento (36 unidades) por $906.500.",
                    items: [
                        { name: "RENÖVA+", qty: 36, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" }
                    ]
                },
                {
                    id: "c50-2",
                    name: "Pack Mixto Rendimiento 40",
                    totalQty: 40,
                    priceRegular: 1943520, 
                    pricePack: 816500,
                    savings: 1127020,
                    roi: "138.0%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Mixto Rendimiento (10 RENOVA+ + 20 24BURN + 10 EBOOST) con 50% de descuento por $816.500.",
                    items: [
                        { name: "RENÖVA+", qty: 10, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "24BURN", qty: 20, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "EBOOST", qty: 10, color: "orange", img: "MOCKUP%20Productos/MOCKUP_EBOOST.png", height: "120px" }
                    ]
                },
                {
                    id: "c50-3",
                    name: "Pack Dual Max 40",
                    totalQty: 40,
                    priceRegular: 2063520, 
                    pricePack: 866500,
                    savings: 1197020,
                    roi: "138.1%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Dual Max (20 RENOVA+ + 20 24BURN) con 50% de descuento por $866.500.",
                    items: [
                        { name: "RENÖVA+", qty: 20, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "24BURN", qty: 20, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" }
                    ]
                },
                {
                    id: "c50-4",
                    name: "Pack Sinergia Total 40",
                    totalQty: 40,
                    priceRegular: 2111520, 
                    pricePack: 936500,
                    savings: 1175020,
                    roi: "125.4%",
                    whatsappMsg: "¡Hola! Deseo adquirir el Pack Sinergia Total (10 EBOOST + 10 RENOVA+ + 10 24BURN + 10 LIV) con 50% de descuento por $936.500.",
                    items: [
                        { name: "EBOOST", qty: 10, color: "orange", img: "MOCKUP%20Productos/MOCKUP_EBOOST.png", height: "120px" },
                        { name: "RENÖVA+", qty: 10, color: "purple", img: "MOCKUP%20Productos/MOCKUP_DOYPACK_REN%C3%93VA%2B.png", height: "140px" },
                        { name: "24BURN", qty: 10, color: "lime", img: "MOCKUP%20Productos/MOCKUP_24BURN.png", height: "130px" },
                        { name: "LIV", qty: 10, color: "green", img: "MOCKUP%20Productos/MOCKUP_LIV.png", height: "140px" }
                    ]
                }
            ]
        };

        let currentDiscountTier = "50"; 
        let activePackId = "c50-2"; 

        function setCalcDiscountTier(tier) {
            currentDiscountTier = tier;
            
            const tiers = ["35", "40", "50"];
            tiers.forEach(t => {
                const btn = document.getElementById(`tier-btn-${t}`);
                if (t === tier) {
                    btn.className = "py-3 text-xs font-black rounded-xl transition-all duration-300 text-white bg-emerald-600 shadow-lg";
                } else {
                    btn.className = "py-3 text-xs font-black rounded-xl transition-all duration-300 text-gray-400 hover:text-white";
                }
            });

            renderPacksList();
            
            if (CALCULATOR_PACKS[tier] && CALCULATOR_PACKS[tier].length > 0) {
                selectActivePack(CALCULATOR_PACKS[tier][0].id);
            }
        }

        function renderPacksList() {
            const listContainer = document.getElementById("calc-packs-list");
            listContainer.innerHTML = "";

            const packs = CALCULATOR_PACKS[currentDiscountTier] || [];
            packs.forEach(pack => {
                const isActive = pack.id === activePackId;
                const activeClass = isActive 
                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/5" 
                    : "border-white/5 bg-black/20 text-gray-400 hover:border-white/20 hover:text-white";

                const itemsSummary = pack.items.map(i => `${i.qty}x ${i.name}`).join(" + ");

                listContainer.innerHTML += `
                    <button data-action="selectActivePack('${pack.id}')" class="w-full text-left p-4 rounded-2xl border transition-all duration-300 flex justify-between items-center ${activeClass}">
                        <div class="pr-3">
                            <span class="text-xs font-black block text-emerald-400 uppercase tracking-wider mb-1">${pack.name}</span>
                            <span class="text-[11px] text-gray-400 block truncate max-w-[280px] font-mono">${itemsSummary}</span>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-[10px] text-gray-500 block uppercase font-bold">VALOR PACK</span>
                            <span class="text-sm font-black text-white font-mono">$${pack.pricePack.toLocaleString('es-CL')}</span>
                        </div>
                    </button>
                `;
            });
        }

        function selectActivePack(packId) {
            activePackId = packId;
            renderPacksList(); 

            const pack = CALCULATOR_PACKS[currentDiscountTier].find(p => p.id === packId);
            if (!pack) return;

            document.getElementById("calc-active-pack-title").innerText = pack.name;
            document.getElementById("calc-active-pack-qty").innerText = `${pack.totalQty} Productos`;

            const drawerItemsContainer = document.getElementById("calc-drawer-items-container");
            drawerItemsContainer.innerHTML = "";

            // Inyectar representaciones visuales agrupadas
            pack.items.forEach((item) => {
                let glowClass = "";
                let floatClass = "";
                let translationClass = "";
                
                if (item.name.includes("RENÖVA")) {
                    glowClass = "glow-rva-img";
                    floatClass = "animate-float-1";
                } else if (item.name.includes("LIV")) {
                    glowClass = "glow-liv-img";
                    floatClass = "animate-float-2";
                } else if (item.name.includes("24BURN")) {
                    glowClass = "glow-burn-img";
                    floatClass = "animate-float-3";
                    translationClass = "translate-y-[12px]"; // El 24BURN se baja para coincidir con la base de los doypacks
                } else if (item.name.includes("EBOOST")) {
                    glowClass = "glow-eboost-img";
                    floatClass = "animate-float-1";
                } else {
                    glowClass = "glow-b24-img";
                    floatClass = "animate-float-2";
                }

                drawerItemsContainer.innerHTML += `
                    <div class="relative flex flex-col items-center justify-end select-none shrink-0 overflow-visible z-10 p-2 drawer-item-animate self-end">
                        <img src="${item.img}" 
                             style="height: ${item.height};"
                             class="object-contain shrink-0 transition-transform duration-300 origin-bottom hover:scale-110 ${floatClass} ${glowClass} ${translationClass} self-end mb-1" 
                             alt="${item.name}"
                             data-image-fallback="renova">
                        <div class="bg-emerald-500 text-black font-black font-mono text-[10px] px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.4)] z-20">
                            x${item.qty}
                        </div>
                    </div>
                `;
            });

            // Actualizar listado físico del desglose de la caja
            const inventoryList = document.getElementById("calc-drawer-inventory-list");
            inventoryList.innerHTML = "";
            pack.items.forEach(item => {
                let badgeColorClass = "";
                if (item.name.includes("RENÖVA")) badgeColorClass = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                else if (item.name.includes("LIV")) badgeColorClass = "text-green-400 bg-green-500/10 border-green-500/20";
                else if (item.name.includes("24BURN")) badgeColorClass = "text-lime-400 bg-lime-500/10 border-lime-500/20";
                else if (item.name.includes("EBOOST")) badgeColorClass = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                else badgeColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

                inventoryList.innerHTML += `
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border shrink-0 font-mono ${badgeColorClass}">
                            ${item.qty}
                        </span>
                        <div>
                            <span class="text-xs font-bold text-white block font-sans">${item.name}</span>
                            <span class="text-[9px] text-gray-500 uppercase font-semibold">Tecnología de Precisión</span>
                        </div>
                    </div>
                `;
            });

            // Totales e indicadores financieros
            document.getElementById("calc-val-retail").innerText = `$${pack.priceRegular.toLocaleString('es-CL')}`;
            document.getElementById("calc-val-savings").innerText = `$${pack.savings.toLocaleString('es-CL')}`;
            document.getElementById("calc-val-pack").innerText = `$${pack.pricePack.toLocaleString('es-CL')}`;
            document.getElementById("calc-roi-percentage").innerText = `+${pack.roi} ROI`;

            const whatsappBtn = document.getElementById("calc-order-whatsapp-btn");
            whatsappBtn.setAttribute("href", FWP_WHATSAPP.toUrl(pack.whatsappMsg));
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
                    
                    dynamicImg.src = "MOCKUP%20Productos/Emprende%20.png";
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
                    <p class="text-xs text-gray-400 mb-4 font-mono">Última actualización: 18 de julio de 2026</p>
                    <p>En fwpchile.lat queremos que compres con confianza. Aquí explicamos cómo funcionan los cambios, las devoluciones y los reembolsos, respetando la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</p>
                    <p>Al tratarse de compras a distancia, tienes derecho a poner término anticipado a la compra dentro de un plazo de 10 días corridos contados desde la recepción del producto, conforme al artículo 3° bis de la Ley N° 19.496, siempre que el producto se encuentre sin uso, en buen estado y con su embalaje original.</p>
                `
            },
            envios: {
                title: "Política de Envíos",
                content: `
                    <p class="text-xs text-gray-400 mb-4 font-mono">Última actualización: 18 de julio de 2026</p>
                    <p>En fwpchile.lat el envío es gratis a todo Chile. A continuación detallamos cómo funcionan nuestros despachos.</p>
                    <p>Los pedidos se procesan dentro de las primeras 24 horas hábiles y se despachan de forma prioritaria de norte a sur.</p>
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
            setCalcDiscountTier("50"); 
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
            setCalcDiscountTier,
            filterTestimonials,
            openTestimonialLightbox,
            closeTestimonialLightbox,
            scrollToProtocolDirect,
            selectActivePack,
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
