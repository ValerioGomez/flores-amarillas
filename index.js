/* ==========================================================
   Apple-Inspired Clean & Organic Engine - Para Naida 🌼🌿
   Day/Night • Stars • Green Leaves & Yellow Petals • Easter Egg WhatsApp
   ========================================================== */

(function () {
    "use strict";

    // ==========================================================
    // 1. MODO DÍA / NOCHE (Automático por hora + Switch manual)
    // ==========================================================
    const themeToggleBtn = document.getElementById("themeToggle");
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    function applyTheme(isDay) {
        if (isDay) {
            document.body.classList.remove("theme-night");
            document.body.classList.add("theme-day");
            if (metaThemeColor) metaThemeColor.setAttribute("content", "#f9fbf7");
        } else {
            document.body.classList.remove("theme-day");
            document.body.classList.add("theme-night");
            if (metaThemeColor) metaThemeColor.setAttribute("content", "#07070b");
        }
        try {
            localStorage.setItem("flower_theme", isDay ? "day" : "night");
        } catch (e) {}
    }

    const currentHour = new Date().getHours();
    let isDay = currentHour >= 6 && currentHour < 18;
    applyTheme(isDay);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            isDay = !isDay;
            applyTheme(isDay);
        });
    }

    // ==========================================================
    // 2. FÍSICA: Giroscopio, Viento y Agitación
    // ==========================================================
    let windX = 0;
    let windY = 0;
    let shakeVelocity = 0;
    let isSensorsActive = false;

    function handleOrientation(event) {
        if (event.gamma !== null) {
            windX = Math.max(-2.5, Math.min(2.5, event.gamma * 0.05));
        }
        if (event.beta !== null) {
            windY = Math.max(-1, Math.min(1.5, (event.beta - 45) * 0.03));
        }
    }

    let lastX = null, lastY = null, lastZ = null;
    let lastTime = 0;
    const SHAKE_THRESHOLD = 18;

    function handleMotion(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const currentTime = Date.now();
        if ((currentTime - lastTime) > 100) {
            const diffTime = currentTime - lastTime;
            lastTime = currentTime;

            if (lastX !== null) {
                const deltaX = Math.abs(acc.x - lastX);
                const deltaY = Math.abs(acc.y - lastY);
                const deltaZ = Math.abs(acc.z - lastZ);
                const speed = ((deltaX + deltaY + deltaZ) / diffTime) * 10000;

                if (speed > SHAKE_THRESHOLD * 25) {
                    triggerShakeBurst();
                }
            }

            lastX = acc.x;
            lastY = acc.y;
            lastZ = acc.z;
        }
    }

    function triggerShakeBurst() {
        shakeVelocity = 8;
        if (navigator.vibrate) navigator.vibrate(30);
    }

    function initMotionSensors() {
        if (isSensorsActive) return;
        isSensorsActive = true;

        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === "granted") {
                        window.addEventListener("deviceorientation", handleOrientation, true);
                        window.addEventListener("devicemotion", handleMotion, true);
                    }
                })
                .catch(() => {});
        } else {
            window.addEventListener("deviceorientation", handleOrientation, true);
            window.addEventListener("devicemotion", handleMotion, true);
        }
    }

    let lastMouseX = 0;
    window.addEventListener("mousemove", (e) => {
        const diff = e.clientX - lastMouseX;
        windX = Math.max(-2, Math.min(2, diff * 0.08));
        lastMouseX = e.clientX;
        setTimeout(() => { windX *= 0.9; }, 150);
    });

    // ==========================================================
    // 3. CANVAS DUAL: Estrellas, Hojas Verdes, Pétalos y Chispas
    // ==========================================================
    const bgCanvas = document.getElementById("canvas-bg");
    const bgCtx = bgCanvas.getContext("2d");

    const cardCanvas = document.getElementById("canvas-card");
    const cardCtx = cardCanvas ? cardCanvas.getContext("2d") : null;

    let dpr = window.devicePixelRatio || 1;
    let bgW = 0, bgH = 0;
    let cardW = 0, cardH = 0;

    function resizeCanvases() {
        dpr = window.devicePixelRatio || 1;
        bgW = window.innerWidth;
        bgH = window.innerHeight;

        bgCanvas.width = bgW * dpr;
        bgCanvas.height = bgH * dpr;
        bgCanvas.style.width = bgW + "px";
        bgCanvas.style.height = bgH + "px";
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (cardCanvas && cardCanvas.parentElement) {
            const rect = cardCanvas.parentElement.getBoundingClientRect();
            cardW = rect.width;
            cardH = rect.height;
            cardCanvas.width = cardW * dpr;
            cardCanvas.height = cardH * dpr;
            cardCanvas.style.width = cardW + "px";
            cardCanvas.style.height = cardH + "px";
            if (cardCtx) cardCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }

    window.addEventListener("resize", resizeCanvases);
    resizeCanvases();

    // Estrellas titilantes en el cielo de fondo
    class StarParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * bgW;
            this.y = Math.random() * bgH;
            this.size = Math.random() * 1.5 + 0.5;
            this.maxAlpha = Math.random() * 0.75 + 0.25;
            this.pulseSpeed = Math.random() * 0.03 + 0.015;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.pulse += this.pulseSpeed;
        }

        draw(ctx) {
            const alpha = (Math.sin(this.pulse) * 0.5 + 0.5) * this.maxAlpha;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.restore();
        }
    }

    // Pétalo amarillo
    class PetalParticle {
        constructor(isInsideCard = false) {
            this.isCard = isInsideCard;
            this.reset(true);
        }

        reset(initial = false) {
            const boundW = this.isCard ? cardW : bgW;
            const boundH = this.isCard ? cardH : bgH;

            this.x = Math.random() * boundW;
            this.y = initial ? Math.random() * boundH : -25;
            this.size = this.isCard ? (Math.random() * 5 + 4) : (Math.random() * 9 + 8);
            this.speedY = (Math.random() * 0.7 + 0.6) * (this.isCard ? 0.7 : 1);
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = (Math.random() - 0.5) * 0.025;
            this.swayFreq = Math.random() * 0.02 + 0.01;
            this.swayAmp = Math.random() * 1.5 + 0.8;
            this.opacity = this.isCard ? (Math.random() * 0.4 + 0.25) : (Math.random() * 0.5 + 0.45);
            this.color = Math.random() > 0.35 ? "#fed330" : "#f7b731";
            this.burstVx = 0;
            this.burstVy = 0;
        }

        applyBurst() {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 6 + 3;
            this.burstVx = Math.cos(angle) * force;
            this.burstVy = Math.sin(angle) * force;
        }

        update() {
            const boundW = this.isCard ? cardW : bgW;
            const boundH = this.isCard ? cardH : bgH;

            if (Math.abs(this.burstVx) > 0.05) this.burstVx *= 0.92;
            else this.burstVx = 0;

            if (Math.abs(this.burstVy) > 0.05) this.burstVy *= 0.92;
            else this.burstVy = 0;

            this.y += this.speedY + windY + this.burstVy;
            this.x += Math.sin(this.y * this.swayFreq) * this.swayAmp + this.speedX + windX + this.burstVx;
            this.angle += this.angularSpeed;

            if (this.y > boundH + 30 || this.x < -30 || this.x > boundW + 30) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.opacity;

            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size * 0.7, -this.size * 0.3, this.size * 0.4, this.size * 0.65);
            ctx.quadraticCurveTo(0, this.size, -this.size * 0.4, this.size * 0.65);
            ctx.quadraticCurveTo(-this.size * 0.7, -this.size * 0.3, 0, -this.size);
            ctx.closePath();

            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    // Hoja verde botánica (Toques verdes naturales)
    class LeafParticle {
        constructor(isInsideCard = false) {
            this.isCard = isInsideCard;
            this.reset(true);
        }

        reset(initial = false) {
            const boundW = this.isCard ? cardW : bgW;
            const boundH = this.isCard ? cardH : bgH;

            this.x = Math.random() * boundW;
            this.y = initial ? Math.random() * boundH : -25;
            this.size = this.isCard ? (Math.random() * 4 + 3.5) : (Math.random() * 7 + 6);
            this.speedY = (Math.random() * 0.65 + 0.5) * (this.isCard ? 0.65 : 1);
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = (Math.random() - 0.5) * 0.02;
            this.swayFreq = Math.random() * 0.015 + 0.008;
            this.swayAmp = Math.random() * 1.8 + 0.9;
            this.opacity = this.isCard ? (Math.random() * 0.35 + 0.2) : (Math.random() * 0.5 + 0.35);
            this.color = Math.random() > 0.4 ? "#26de81" : "#2ed573";
            this.burstVx = 0;
            this.burstVy = 0;
        }

        applyBurst() {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 6 + 3;
            this.burstVx = Math.cos(angle) * force;
            this.burstVy = Math.sin(angle) * force;
        }

        update() {
            const boundW = this.isCard ? cardW : bgW;
            const boundH = this.isCard ? cardH : bgH;

            if (Math.abs(this.burstVx) > 0.05) this.burstVx *= 0.92;
            else this.burstVx = 0;

            if (Math.abs(this.burstVy) > 0.05) this.burstVy *= 0.92;
            else this.burstVy = 0;

            this.y += this.speedY + windY + this.burstVy;
            this.x += Math.sin(this.y * this.swayFreq) * this.swayAmp + this.speedX + windX + this.burstVx;
            this.angle += this.angularSpeed;

            if (this.y > boundH + 30 || this.x < -30 || this.x > boundW + 30) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.opacity;

            // Dibujar silueta estilizada de hoja verde
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 1.2);
            ctx.quadraticCurveTo(this.size * 0.6, -this.size * 0.2, 0, this.size * 1.2);
            ctx.quadraticCurveTo(-this.size * 0.6, -this.size * 0.2, 0, -this.size * 1.2);
            ctx.closePath();

            ctx.fillStyle = this.color;
            ctx.fill();

            // Nervio central de la hoja
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 0.9);
            ctx.lineTo(0, this.size * 0.9);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 0.6;
            ctx.stroke();

            ctx.restore();
        }
    }

    // Chispas y luciérnagas doradas ascendiendo
    class SparkleParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * bgW;
            this.y = initial ? Math.random() * bgH : bgH + 10;
            this.size = Math.random() * 2.2 + 0.8;
            this.speedY = -(Math.random() * 0.45 + 0.25);
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.alpha = Math.random() * 0.7 + 0.3;
            this.pulse = Math.random() * Math.PI;
            this.pulseSpeed = Math.random() * 0.035 + 0.02;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + (windX * 0.3);
            this.pulse += this.pulseSpeed;

            if (this.y < -15) this.reset();
        }

        draw(ctx) {
            const currentAlpha = Math.max(0, Math.sin(this.pulse)) * this.alpha;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(254, 211, 48, ${currentAlpha})`;
            ctx.shadowColor = "#fed330";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }

    // Colecciones de partículas
    const stars = [];
    const bgPetals = [];
    const bgLeaves = [];
    const bgSparks = [];
    const cardPetals = [];
    const cardLeaves = [];

    const TOTAL_STARS = 45;
    const TOTAL_BG_PETALS = Math.min(20, Math.floor(window.innerWidth / 18));
    const TOTAL_BG_LEAVES = Math.min(12, Math.floor(window.innerWidth / 28));
    const TOTAL_SPARKS = Math.min(28, Math.floor(window.innerWidth / 14));
    const TOTAL_CARD_PETALS = 8;
    const TOTAL_CARD_LEAVES = 4;

    for (let i = 0; i < TOTAL_STARS; i++) stars.push(new StarParticle());
    for (let i = 0; i < TOTAL_BG_PETALS; i++) bgPetals.push(new PetalParticle(false));
    for (let i = 0; i < TOTAL_BG_LEAVES; i++) bgLeaves.push(new LeafParticle(false));
    for (let i = 0; i < TOTAL_SPARKS; i++) bgSparks.push(new SparkleParticle());
    for (let i = 0; i < TOTAL_CARD_PETALS; i++) cardPetals.push(new PetalParticle(true));
    for (let i = 0; i < TOTAL_CARD_LEAVES; i++) cardLeaves.push(new LeafParticle(true));

    function animationLoop() {
        if (shakeVelocity > 0.5) {
            bgPetals.forEach(p => p.applyBurst());
            bgLeaves.forEach(l => l.applyBurst());
            cardPetals.forEach(p => p.applyBurst());
            cardLeaves.forEach(l => l.applyBurst());
            shakeVelocity = 0;
        }

        // Render fondo (Estrellas en modo noche)
        bgCtx.clearRect(0, 0, bgW, bgH);

        if (document.body.classList.contains("theme-night")) {
            for (let i = 0; i < stars.length; i++) {
                stars[i].update();
                stars[i].draw(bgCtx);
            }
        }

        for (let i = 0; i < bgSparks.length; i++) {
            bgSparks[i].update();
            bgSparks[i].draw(bgCtx);
        }
        for (let i = 0; i < bgLeaves.length; i++) {
            bgLeaves[i].update();
            bgLeaves[i].draw(bgCtx);
        }
        for (let i = 0; i < bgPetals.length; i++) {
            bgPetals[i].update();
            bgPetals[i].draw(bgCtx);
        }

        // Render micro-elementos dentro del contenedor
        if (cardCtx && cardW > 0) {
            cardCtx.clearRect(0, 0, cardW, cardH);
            for (let i = 0; i < cardLeaves.length; i++) {
                cardLeaves[i].update();
                cardLeaves[i].draw(cardCtx);
            }
            for (let i = 0; i < cardPetals.length; i++) {
                cardPetals[i].update();
                cardPetals[i].draw(cardCtx);
            }
        }

        requestAnimationFrame(animationLoop);
    }
    requestAnimationFrame(animationLoop);

    // ==========================================================
    // 4. NARRATIVA CINÉTICA (Letra por letra)
    // ==========================================================
    const STORY_PHRASES = [
        "Feliz 21 de septiembre, Naida. 💛",
        "Iba a robarte flores amarillas del parque...",
        "...pero el jardinero me vio feo y corría más rápido. 🏃‍♂️💨",
        "Así que te programé unas que nunca se marchitan.",
        "Y que siempre estarán aquí para sacarte una sonrisa. ✨",
        "Desliza abajo para abrir tu sorpresa especial. 🌼"
    ];

    const storyTextEl = document.getElementById("storyText");
    const storyBoxEl = document.getElementById("storyBox");
    const storyDotsEl = document.getElementById("storyDots");
    let currentStoryIndex = 0;
    let storyInterval = null;

    if (storyDotsEl) {
        storyDotsEl.innerHTML = "";
        STORY_PHRASES.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = `story-dot ${idx === 0 ? "active" : ""}`;
            storyDotsEl.appendChild(dot);
        });
    }

    function spawnTextDissolvePetals(rect) {
        const container = document.getElementById("touch-particles");
        if (!container || !rect) return;

        const count = 7;
        const emojis = ["✨", "🌼", "🌿", "💛", "🍃"];
        for (let i = 0; i < count; i++) {
            const span = document.createElement("span");
            span.className = "text-petal-burst";
            span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const startX = rect.left + Math.random() * rect.width;
            const startY = rect.top + Math.random() * rect.height;
            const vx = (Math.random() - 0.5) * 55;
            const vy = -(Math.random() * 45 + 15);
            const rot = (Math.random() - 0.5) * 60;

            span.style.left = `${startX}px`;
            span.style.top = `${startY}px`;
            span.style.setProperty("--vx", `${vx}px`);
            span.style.setProperty("--vy", `${vy}px`);
            span.style.setProperty("--rot", `${rot}deg`);

            container.appendChild(span);
            setTimeout(() => span.remove(), 1200);
        }
    }

    function renderKineticPhrase(text) {
        if (!storyTextEl) return;
        storyTextEl.innerHTML = "";

        const words = text.split(" ");
        let charCounter = 0;

        words.forEach((word) => {
            const wordSpan = document.createElement("span");
            wordSpan.className = "story-word";

            const chars = Array.from(word);
            chars.forEach((char) => {
                const charSpan = document.createElement("span");
                charSpan.className = "story-char";
                charSpan.textContent = char;
                charSpan.style.setProperty("--char-idx", charCounter);
                charCounter++;
                wordSpan.appendChild(charSpan);
            });

            storyTextEl.appendChild(wordSpan);
        });
    }

    function showStorySlide(index) {
        if (!storyTextEl) return;

        const existingChars = storyTextEl.querySelectorAll(".story-char");
        existingChars.forEach((ch) => {
            ch.classList.add("story-char--exit");
        });

        const rect = storyTextEl.getBoundingClientRect();
        spawnTextDissolvePetals(rect);

        setTimeout(() => {
            currentStoryIndex = index % STORY_PHRASES.length;
            renderKineticPhrase(STORY_PHRASES[currentStoryIndex]);

            const dots = storyDotsEl ? storyDotsEl.querySelectorAll(".story-dot") : [];
            dots.forEach((d, idx) => {
                d.classList.toggle("active", idx === currentStoryIndex);
            });
        }, 280);
    }

    if (storyTextEl) {
        renderKineticPhrase(STORY_PHRASES[0]);
    }

    function startStoryTimer() {
        if (storyInterval) clearInterval(storyInterval);
        storyInterval = setInterval(() => {
            showStorySlide(currentStoryIndex + 1);
        }, 4600);
    }
    startStoryTimer();

    if (storyBoxEl) {
        storyBoxEl.addEventListener("click", () => {
            initMotionSensors();
            showStorySlide(currentStoryIndex + 1);
            startStoryTimer();
        });
    }

    // ==========================================================
    // 5. SLIDER CON BARRA AMARILLA DE AVANCE
    // ==========================================================
    const sliderTrack = document.getElementById("sliderTrack");
    const sliderThumb = document.getElementById("sliderThumb");
    const sliderLabel = document.getElementById("sliderLabel");
    const sliderProgressBar = document.getElementById("sliderProgressBar");

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let maxDistance = 0;
    let isUnlocked = false;

    function updateMaxDistance() {
        if (sliderTrack && sliderThumb) {
            maxDistance = sliderTrack.clientWidth - sliderThumb.clientWidth - 8;
        }
    }
    updateMaxDistance();
    window.addEventListener("resize", updateMaxDistance);

    function onPointerDown(e) {
        if (isUnlocked) return;
        initMotionSensors();

        isDragging = true;
        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        sliderThumb.style.transition = "none";
        if (sliderProgressBar) sliderProgressBar.style.transition = "none";
        sliderThumb.setPointerCapture?.(e.pointerId);
    }

    function onPointerMove(e) {
        if (!isDragging || isUnlocked) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const delta = clientX - startX;

        currentX = Math.max(0, Math.min(delta, maxDistance));
        sliderThumb.style.transform = `translateX(${currentX}px)`;

        const thumbWidth = sliderThumb ? sliderThumb.clientWidth : 44;
        const fillWidth = currentX + thumbWidth;
        if (sliderProgressBar) {
            sliderProgressBar.style.width = `${Math.min(sliderTrack.clientWidth, fillWidth)}px`;
        }

        const progress = currentX / maxDistance;
        if (sliderLabel) {
            sliderLabel.style.opacity = Math.max(0, 1 - progress * 1.6);
        }
    }

    function onPointerUp() {
        if (!isDragging || isUnlocked) return;
        isDragging = false;

        const progress = currentX / maxDistance;

        if (progress >= 0.82) {
            triggerUnlock();
        } else {
            sliderThumb.style.transition = "transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            sliderThumb.style.transform = "translateX(0px)";

            if (sliderProgressBar) {
                sliderProgressBar.style.transition = "width 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                sliderProgressBar.style.width = "0px";
            }

            if (sliderLabel) {
                sliderLabel.style.transition = "opacity 0.25s ease";
                sliderLabel.style.opacity = "1";
            }
            currentX = 0;
        }
    }

    function triggerUnlock() {
        isUnlocked = true;
        sliderThumb.style.transition = "transform 0.25s ease-out";
        sliderThumb.style.transform = `translateX(${maxDistance}px)`;

        if (sliderProgressBar) {
            sliderProgressBar.style.transition = "width 0.25s ease-out";
            sliderProgressBar.style.width = "100%";
        }

        if (navigator.vibrate) navigator.vibrate([30, 45, 30]);

        const rect = sliderThumb.getBoundingClientRect();
        spawnTextDissolvePetals({
            left: rect.left - 20,
            top: rect.top - 20,
            width: rect.width + 40,
            height: rect.height + 40
        });

        // Transición lenta, cinematográfica y desvanecedora hacia flower.html
        setTimeout(() => {
            const card = document.getElementById("appleCard");
            if (card) {
                card.style.transition = "opacity 1.3s cubic-bezier(0.22, 1, 0.36, 1), transform 1.3s cubic-bezier(0.22, 1, 0.36, 1), filter 1.3s ease";
                card.style.opacity = "0";
                card.style.filter = "blur(14px)";
                card.style.transform = "scale(0.92) translateY(-20px)";
            }

            const canvasBgEl = document.getElementById("canvas-bg");
            if (canvasBgEl) {
                canvasBgEl.style.transition = "opacity 1.3s ease";
                canvasBgEl.style.opacity = "0";
            }

            document.body.style.transition = "opacity 1.3s ease, background 1.3s ease";
            document.body.style.opacity = "0";

            setTimeout(() => {
                const destination = isDay ? "flower.html" : "flower-noche.html";
                window.location.href = destination;
            }, 1300); // 1.3 segundos de desvanecimiento suave y lento
        }, 200);
    }

    if (sliderThumb) {
        sliderThumb.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
    }

    // ==========================================================
    // 6. CORAZONES CONTINUOS DESDE VALERIO & EASTER EGG (DOBLE CLIC A WHATSAPP)
    // ==========================================================
    const signatureBox = document.getElementById("signatureBox");
    const valerioEasterEgg = document.getElementById("valerioEasterEgg");

    function spawnSignatureHeart() {
        if (!signatureBox) return;
        const rect = signatureBox.getBoundingClientRect();
        const container = document.getElementById("touch-particles");
        if (!container) return;

        const span = document.createElement("span");
        span.className = "signature-floating-heart";
        const hearts = ["💛", "💚", "✨", "💛"];
        span.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const heartX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
        const heartY = rect.top;
        const offsetX = (Math.random() - 0.5) * 40;

        span.style.left = `${heartX}px`;
        span.style.top = `${heartY}px`;
        span.style.setProperty("--offset-x", `${offsetX}px`);

        container.appendChild(span);
        setTimeout(() => span.remove(), 2200);
    }

    // Emitir corazones periódicamente
    setInterval(spawnSignatureHeart, 2600);

    // Easter Egg: Al hacer DOBLE CLIC (Double Tap) en Valerio, redirige a WhatsApp
    let clickCount = 0;
    let clickResetTimer = null;

    if (valerioEasterEgg) {
        valerioEasterEgg.addEventListener("click", (e) => {
            clickCount++;
            clearTimeout(clickResetTimer);

            // Generar ráfaga de corazones
            for (let i = 0; i < 4; i++) {
                setTimeout(spawnSignatureHeart, i * 80);
            }

            // Reiniciar contador si no hace el doble clic en 480ms
            clickResetTimer = setTimeout(() => {
                clickCount = 0;
            }, 480);

            // Doble clic / Double tap rápido
            if (clickCount >= 2) {
                clickCount = 0;
                if (navigator.vibrate) navigator.vibrate([40, 50]);

                // Ráfaga grande de celebración
                const rect = valerioEasterEgg.getBoundingClientRect();
                spawnTextDissolvePetals(rect);

                setTimeout(() => {
                    // Redirigir a WhatsApp de Valerio con el mensaje exacto
                    const msg = encodeURIComponent("HOLA VALERIO ACEPTO 😊");
                    window.location.href = `https://wa.me/51931537331?text=${msg}`;
                }, 280);
            }
        });
    }

    // Toques generales en pantalla
    window.addEventListener("pointerdown", (e) => {
        if (e.target.closest("#sliderTrack") || e.target.closest("#themeToggle") || e.target.closest("#signatureBox")) return;
        initMotionSensors();

        const container = document.getElementById("touch-particles");
        if (!container) return;

        const emojis = ["✨", "💛", "🌿", "🌼"];
        const span = document.createElement("span");
        span.className = "text-petal-burst";
        span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        span.style.left = `${e.clientX}px`;
        span.style.top = `${e.clientY}px`;
        span.style.setProperty("--vx", `${(Math.random() - 0.5) * 30}px`);
        span.style.setProperty("--vy", `${-(Math.random() * 35 + 10)}px`);
        span.style.setProperty("--rot", `${(Math.random() - 0.5) * 50}deg`);

        container.appendChild(span);
        setTimeout(() => span.remove(), 900);
    });

})();
