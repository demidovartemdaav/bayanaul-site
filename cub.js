/**
 * cub.js — Рыжий котёнок-рысь (standalone виджет)
 * =========================================================================
 * Пушистый рыжий котёнок с пятнышками, кисточками на ушах, белым воротником.
 * Сидит в правом нижнем углу, следит глазами за курсором.
 *
 * Поведение:
 *   - Сидит в углу (не бегает)
 *   - Следит глазами за курсором (зрачки двигаются)
 *   - Моргает каждые 3-5с
 *   - Реагирует на кнопки сайта → лёгкий подпрыг
 *   - Клик по котёнку → пузырь с сообщением
 *   - Бездействие 5с → зевает
 *
 * API (через window.cub):
 *   cub.say("Мяу!")           — показать пузырь
 *   cub.notify("Сообщение")   — добавить уведомление (бейдж)
 *   cub.setSectionTips({...}) — подсказки по секциям
 *
 * Подключение: <script src="cub.js"></script>
 * =========================================================================
 */
(function () {
    "use strict";
    if (window.Cub) { return; }

    // =====================================================================
    // СТИЛИ
    // =====================================================================
    var STYLES = ''
        + '#cub-container{position:fixed;bottom:20px;right:20px;z-index:9999;width:72px;height:72px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}'
        + '.cub{width:100%;height:100%;filter:drop-shadow(0 4px 8px rgba(0,0,0,.2));transition:transform .2s ease}'
        + '.cub:hover{transform:scale(1.06)}'
        + '.cub--happy{animation:cub-happy .5s ease}'
        + '@keyframes cub-happy{0%,100%{transform:translateY(0) scale(1)}30%{transform:translateY(-8px) scale(1.1)}60%{transform:translateY(0) scale(.95)}}'
        + '.cub--yawn{animation:cub-yawn 1s ease}'
        + '@keyframes cub-yawn{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.92) translateY(2px)}}'
        + '.cub--surprised{animation:cub-surprised .5s ease}'
        + '@keyframes cub-surprised{0%,100%{transform:scale(1)}50%{transform:scale(1.15) translateY(-4px)}}'
        + '.cub--thinking{animation:cub-thinking 2s ease-in-out infinite}'
        + '@keyframes cub-thinking{0%,100%{transform:rotate(0)}50%{transform:rotate(3deg)}}'
        + '.cub-ear--left{transform-origin:22px 18px;animation:cub-ear-twitch 5s ease-in-out infinite}'
        + '.cub-ear--right{transform-origin:50px 18px;animation:cub-ear-twitch 5s ease-in-out infinite 1.5s}'
        + '@keyframes cub-ear-twitch{0%,92%,100%{transform:rotate(0)}94%{transform:rotate(-8deg)}96%{transform:rotate(4deg)}}'
        + '.cub-tail{transform-origin:58px 44px;animation:cub-tail-swish 2s ease-in-out infinite}'
        + '@keyframes cub-tail-swish{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}'
        + '.cub-bubble{position:fixed;bottom:102px;right:20px;z-index:9999;max-width:260px;min-width:180px;background:#fff;border:2px solid #ea580c;border-radius:16px;padding:14px 18px;box-shadow:0 8px 24px rgba(234,88,12,.2);font-size:14px;line-height:1.5;color:#1f2937;opacity:0;transform:translateY(10px) scale(.9);pointer-events:none;transition:opacity .25s,transform .25s;font-family:system-ui,-apple-system,sans-serif}'
        + '.cub-bubble--visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}'
        + '.cub-bubble::after{content:"";position:absolute;bottom:-10px;right:28px;width:0;height:0;border:10px solid transparent;border-top-color:#ea580c;border-bottom:0}'
        + '.cub-bubble::before{content:"";position:absolute;bottom:-7px;right:30px;width:0;height:0;border:8px solid transparent;border-top-color:#fff;border-bottom:0;z-index:1}'
        + '.cub-bubble__title{font-weight:600;color:#ea580c;margin-bottom:4px;font-size:13px;text-transform:uppercase;letter-spacing:.5px}'
        + '.cub-bubble__body{color:#374151}'
        + '.cub-bubble__close{position:absolute;top:6px;right:8px;background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer;padding:2px 6px;line-height:1}'
        + '.cub-bubble__close:hover{color:#ea580c}'
        + '.cub-bubble__wa{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;padding:8px 14px;background:#25D366;color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;font-family:system-ui,-apple-system,sans-serif;transition:background .2s}'
        + '.cub-bubble__wa:hover{background:#1ebe5d}'
        + '.cub-bubble__wa svg{width:16px;height:16px;flex-shrink:0}'
        + '.cub-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:#ef4444;color:#fff;border-radius:50%;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.2);animation:cub-badge-pulse 1.5s ease-in-out infinite;font-family:system-ui,sans-serif}'
        + '@keyframes cub-badge-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}'
        + '.cub-pupil{transition:cx .1s linear,cy .1s linear}'
        + '@media(max-width:480px){#cub-container{width:64px;height:64px;bottom:16px;right:16px}.cub-bubble{max-width:calc(100vw - 40px);right:16px;bottom:90px}}'
        + '@media(prefers-reduced-motion:reduce){.cub,.cub-tail,.cub-ear--left,.cub-ear--right{transition:none!important;animation:none!important}}';

    var styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // =====================================================================
    // SVG КОТЁНКА-РЫСИ
    // Рыжая шерсть с пятнами, белый воротник, кисточки на ушах,
    // большие янтарные глаза, пушистый хвост с тёмным кончиком
    // =====================================================================
    var CUB_SVG = ''
        + '<svg class="cub" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">'
        // Тень
        + '<ellipse cx="36" cy="68" rx="24" ry="3" fill="rgba(0,0,0,0.12)"/>'
        // Хвост (с тёмным кончиком, виляет)
        + '<g class="cub-tail">'
        +   '<path d="M 56 46 Q 68 42 66 28" stroke="#c2410c" stroke-width="10" stroke-linecap="round" fill="none"/>'
        +   '<path d="M 56 46 Q 64 44 62 34" stroke="#ea580c" stroke-width="7" stroke-linecap="round" fill="none"/>'
        +   '<ellipse cx="66" cy="28" rx="5" ry="6" fill="#1a1a1a"/>'
        + '</g>'
        // Тело (сидит)
        + '<ellipse cx="36" cy="52" rx="22" ry="16" fill="#ea580c"/>'
        + '<ellipse cx="36" cy="52" rx="22" ry="16" fill="url(#cubShine)"/>'
        // Пятна на теле
        + '<circle cx="24" cy="50" r="2.5" fill="#92400e" opacity="0.55"/>'
        + '<circle cx="30" cy="56" r="3" fill="#92400e" opacity="0.55"/>'
        + '<circle cx="42" cy="52" r="2.5" fill="#92400e" opacity="0.55"/>'
        + '<circle cx="48" cy="57" r="2" fill="#92400e" opacity="0.55"/>'
        + '<circle cx="20" cy="56" r="2" fill="#92400e" opacity="0.55"/>'
        // Белый воротник на груди
        + '<ellipse cx="36" cy="56" rx="12" ry="8" fill="#fef3c7"/>'
        + '<ellipse cx="36" cy="56" rx="10" ry="6" fill="#fff"/>'
        // Лапы (передние)
        + '<ellipse cx="26" cy="64" rx="6" ry="5" fill="#ea580c"/>'
        + '<ellipse cx="46" cy="64" rx="6" ry="5" fill="#ea580c"/>'
        // Голова (большая, круглая)
        + '<circle cx="36" cy="30" r="20" fill="#ea580c"/>'
        + '<circle cx="36" cy="30" r="20" fill="url(#cubShine)"/>'
        // Пятна на лбу
        + '<circle cx="28" cy="22" r="2" fill="#92400e" opacity="0.5"/>'
        + '<circle cx="44" cy="22" r="2" fill="#92400e" opacity="0.5"/>'
        + '<circle cx="36" cy="18" r="1.5" fill="#92400e" opacity="0.5"/>'
        // Уши с кисточками
        + '<g class="cub-ear--left">'
        +   '<path d="M 20 20 L 16 6 L 28 14 Z" fill="#ea580c"/>'
        +   '<path d="M 22 18 L 20 10 L 26 14 Z" fill="#fbbf24"/>'
        +   // Кисточки
        +   '<line x1="17" y1="6" x2="16" y2="1" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>'
        +   '<line x1="18" y1="5" x2="19" y2="0" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>'
        + '</g>'
        + '<g class="cub-ear--right">'
        +   '<path d="M 52 20 L 56 6 L 44 14 Z" fill="#ea580c"/>'
        +   '<path d="M 50 18 L 52 10 L 46 14 Z" fill="#fbbf24"/>'
        +   '<line x1="55" y1="6" x2="56" y2="1" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>'
        +   '<line x1="54" y1="5" x2="53" y2="0" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>'
        + '</g>'
        // Белая мордочка
        + '<ellipse cx="36" cy="36" rx="12" ry="9" fill="#fff7ed"/>'
        // Большие янтарные глаза
        + '<ellipse class="cub-eye cub-eye--left" cx="28" cy="30" rx="5" ry="6" fill="#f59e0b"/>'
        + '<ellipse class="cub-eye cub-eye--right" cx="44" cy="30" rx="5" ry="6" fill="#f59e0b"/>'
        // Блики в глазах
        + '<ellipse cx="26" cy="28" rx="1.5" ry="2" fill="#fef3c7" opacity="0.6"/>'
        + '<ellipse cx="42" cy="28" rx="1.5" ry="2" fill="#fef3c7" opacity="0.6"/>'
        // Зрачки (двигаются за курсором)
        + '<ellipse class="cub-pupil cub-pupil--left" cx="28" cy="30" rx="2" ry="5" fill="#1a1a1a"/>'
        + '<ellipse class="cub-pupil cub-pupil--right" cx="44" cy="30" rx="2" ry="5" fill="#1a1a1a"/>'
        // Нос
        + '<path d="M 34 35 L 38 35 L 36 38 Z" fill="#ec4899"/>'
        // Рот (улыбка)
        + '<path class="cub-mouth" d="M 36 38 Q 32 42 28 40" stroke="#1a1a1a" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
        + '<path class="cub-mouth" d="M 36 38 Q 40 42 44 40" stroke="#1a1a1a" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
        // Усы
        + '<line x1="24" y1="36" x2="14" y2="34" stroke="#1a1a1a" stroke-width="0.6"/>'
        + '<line x1="24" y1="38" x2="14" y2="38" stroke="#1a1a1a" stroke-width="0.6"/>'
        + '<line x1="24" y1="40" x2="14" y2="42" stroke="#1a1a1a" stroke-width="0.6"/>'
        + '<line x1="48" y1="36" x2="58" y2="34" stroke="#1a1a1a" stroke-width="0.6"/>'
        + '<line x1="48" y1="38" x2="58" y2="38" stroke="#1a1a1a" stroke-width="0.6"/>'
        + '<line x1="48" y1="40" x2="58" y2="42" stroke="#1a1a1a" stroke-width="0.6"/>'
        // Градиент
        + '<defs>'
        +   '<radialGradient id="cubShine" cx="0.35" cy="0.3" r="0.6">'
        +     '<stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>'
        +     '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>'
        +   '</radialGradient>'
        + '</defs>'
        + '</svg>';

    // =====================================================================
    // КОНТЕНТ
    // =====================================================================
    var GREETINGS = [
        "Привет! Я Рысенок. Подскажу, что посмотреть в Баянауле.",
        "Мяу! Тут туры по Баянаулу. Кликни на меня — расскажу!",
        "О, привет! Я местный, знаю все лучшие маршруты."
    ];

    var RANDOM_PHRASES = [
        "Озеро Жасыбай — самое чистое в Баянауле!",
        "Туры каждый выходной. Бронируйте заранее!",
        "От 15 000 ₸ — трансфер, гид и обед включены.",
        "Оплата через Kaspi Red или QR — удобно!",
        "Пещера Коныр-Аулие — обязательна к посещению!",
        "Озеро Торайгыр тише и безлюднее Жасыбая.",
        "Выезд из Павлодара в 7:00, возврат к 22:00.",
        "Бронируйте в WhatsApp: +7 776 919 14 02.",
        "Скала «Баянаул» — лучшая точка для фото!",
        "Туры однодневные — без ночёвки, комфортно."
    ];

    var IDLE_PHRASES = [
        "Хотите увидеть горы? Скролльте вниз!",
        "Бронируйте тур — места разбирают быстро!",
        "Кликните на меня — подскажу по турам!",
        "Расписание туров ниже на странице."
    ];

    var DEFAULT_SECTION_TIPS = {};

    // WhatsApp-ссылка для кнопки в пузыре (можно переопределить через cub.setWhatsApp(url))
    var WA_LINK = "https://wa.me/77769191402?text=" + encodeURIComponent("Здравствуйте! Интересуют туры в Баянаул из Павлодара 🍂");
    var WA_ICON = '<svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';

    // =====================================================================
    // КЛАСС CUB
    // =====================================================================
    function Cub() {
        this.container = document.createElement("div");
        this.container.id = "cub-container";
        this.container.setAttribute("aria-hidden", "true");
        this.container.innerHTML = CUB_SVG;
        document.body.appendChild(this.container);

        this.cub = this.container.querySelector(".cub");
        this.pupilLeft = this.container.querySelector(".cub-pupil--left");
        this.pupilRight = this.container.querySelector(".cub-pupil--right");
        this.eyeLeft = this.container.querySelector(".cub-eye--left");
        this.eyeRight = this.container.querySelector(".cub-eye--right");

        // Состояние
        this._bubble = null;
        this._badge = null;
        this._notifications = [];
        this._sectionTips = Object.assign({}, DEFAULT_SECTION_TIPS);
        this._clickCount = 0;
        this._lastActivityTime = Date.now();
        this._currentSection = null;

        this._emotion = "neutral";
        this._isTyping = false;
        this._lastScrollY = window.scrollY;

        this._initEyes();
        this._initBlinking();
        this._initClick();
        this._initButtonWatcher();
        this._initScrollWatcher();
        this._initInputWatcher();
        this._initIdleDetector();
        this._initSectionTracker();
        this._initPeriodicChat();
    }

    // =====================================================================
    // ГЛАЗА — следят за курсором
    // =====================================================================
    Cub.prototype._initEyes = function () {
        var self = this;
        var lastUpdate = 0;
        document.addEventListener("mousemove", function (e) {
            self._lastActivityTime = Date.now();
            var now = Date.now();
            if (now - lastUpdate < 50) { return; }
            lastUpdate = now;
            self._updatePupils(e.clientX, e.clientY);
        }, { passive: true });
        document.addEventListener("touchmove", function (e) {
            self._lastActivityTime = Date.now();
            if (e.touches.length > 0) {
                self._updatePupils(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
    };

    Cub.prototype._updatePupils = function (mouseX, mouseY) {
        var rect = this.container.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var dx = mouseX - centerX;
        var dy = mouseY - centerY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxOffset = 2.5;
        var offset = Math.min(dist / 60, 1) * maxOffset;
        var nx = dist > 0 ? dx / dist : 0;
        var ny = dist > 0 ? dy / dist : 0;
        // Центры глаз: левый 28,30; правый 44,30
        this.pupilLeft.setAttribute("cx", (28 + nx * offset).toFixed(1));
        this.pupilLeft.setAttribute("cy", (30 + ny * offset).toFixed(1));
        this.pupilRight.setAttribute("cx", (44 + nx * offset).toFixed(1));
        this.pupilRight.setAttribute("cy", (30 + ny * offset).toFixed(1));
    };

    // =====================================================================
    // МОРГАНИЕ
    // =====================================================================
    Cub.prototype._initBlinking = function () {
        var self = this;
        function blink() {
            if (!self.cub) { return; }
            self.eyeLeft.setAttribute("ry", "0.5");
            self.eyeRight.setAttribute("ry", "0.5");
            self.pupilLeft.setAttribute("ry", "0.2");
            self.pupilRight.setAttribute("ry", "0.2");
            setTimeout(function () {
                self.eyeLeft.setAttribute("ry", "6");
                self.eyeRight.setAttribute("ry", "6");
                self.pupilLeft.setAttribute("ry", "5");
                self.pupilRight.setAttribute("ry", "5");
            }, 130);
            setTimeout(blink, 3000 + Math.random() * 2500);
        }
        setTimeout(blink, 2000);
    };

    // =====================================================================
    // ЭМОЦИИ — меняют форму глаз и анимацию
    // =====================================================================
    Cub.prototype.setEmotion = function (emotion) {
        this._emotion = emotion;
        // Сбрасываем классы анимаций
        this.cub.classList.remove("cub--happy", "cub--yawn",
                                  "cub--surprised", "cub--thinking");
        switch (emotion) {
            case "happy":
                this.eyeLeft.setAttribute("ry", "5");
                this.eyeRight.setAttribute("ry", "5");
                this.pupilLeft.setAttribute("ry", "4");
                this.pupilRight.setAttribute("ry", "4");
                this.cub.classList.add("cub--happy");
                break;
            case "surprised":
                this.eyeLeft.setAttribute("ry", "7");
                this.eyeRight.setAttribute("ry", "7");
                this.pupilLeft.setAttribute("ry", "6");
                this.pupilRight.setAttribute("ry", "6");
                this.cub.classList.add("cub--surprised");
                break;
            case "sad":
                this.eyeLeft.setAttribute("ry", "4");
                this.eyeRight.setAttribute("ry", "4");
                this.pupilLeft.setAttribute("ry", "3");
                this.pupilRight.setAttribute("ry", "3");
                break;
            case "thinking":
                this.eyeLeft.setAttribute("ry", "6");
                this.eyeRight.setAttribute("ry", "3");
                this.cub.classList.add("cub--thinking");
                break;
            case "sleeping":
                this.eyeLeft.setAttribute("ry", "0.5");
                this.eyeRight.setAttribute("ry", "0.5");
                this.pupilLeft.setAttribute("ry", "0.2");
                this.pupilRight.setAttribute("ry", "0.2");
                break;
            default: // neutral
                this.eyeLeft.setAttribute("ry", "6");
                this.eyeRight.setAttribute("ry", "6");
                this.pupilLeft.setAttribute("ry", "5");
                this.pupilRight.setAttribute("ry", "5");
        }
        // Возвращаем neutral через 2с (кроме sleeping/thinking)
        if (emotion !== "neutral" && emotion !== "sleeping" && emotion !== "thinking") {
            var self = this;
            setTimeout(function () {
                if (self._emotion === emotion) { self.setEmotion("neutral"); }
            }, 2000);
        }
    };

    // =====================================================================
    // КЛИК ПО КОТЁНКУ → ПУЗЫРЬ
    // =====================================================================
    Cub.prototype._initClick = function () {
        var self = this;
        this.container.addEventListener("click", function () {
            self._lastActivityTime = Date.now();
            self._onClick();
        });
    };

    Cub.prototype._onClick = function () {
        this._clickCount++;
        this.setEmotion("happy");

        // Если есть уведомления — показываем первое
        if (this._notifications.length > 0) {
            var notif = this._notifications.shift();
            this._showBubble("Уведомление", notif, 5000);
            this._updateBadge();
            return;
        }
        // Первый клик — приветствие
        if (this._clickCount === 1) {
            this._showBubble("Привет!", GREETINGS[Math.floor(Math.random() * GREETINGS.length)], 5000);
            return;
        }
        // Чередуем подсказку/фразу
        if (this._clickCount % 2 === 0 && this._currentSection && this._sectionTips[this._currentSection]) {
            this._showBubble("Подсказка", this._sectionTips[this._currentSection], 5000);
        } else {
            this._showBubble("Рысёнок говорит", RANDOM_PHRASES[Math.floor(Math.random() * RANDOM_PHRASES.length)], 4000);
        }
    };

    // =====================================================================
    // ПУЗЫРЬ
    // =====================================================================
    Cub.prototype._showBubble = function (title, body, duration) {
        this._hideBubble();
        var bubble = document.createElement("div");
        bubble.className = "cub-bubble";
        bubble.innerHTML = '<button class="cub-bubble__close" aria-label="Закрыть">×</button>'
            + '<div class="cub-bubble__title">' + this._escape(title) + '</div>'
            + '<div class="cub-bubble__body">' + this._escape(body) + '</div>'
            + '<a href="' + WA_LINK + '" target="_blank" rel="noopener" class="cub-bubble__wa">'
            + WA_ICON + 'Забронировать в WhatsApp</a>';
        document.body.appendChild(bubble);
        this._bubble = bubble;
        var self = this;
        bubble.querySelector(".cub-bubble__close").addEventListener("click", function (e) {
            e.stopPropagation();
            self._hideBubble();
        });
        // Клик по кнопке WhatsApp — считаем активностью
        bubble.querySelector(".cub-bubble__wa").addEventListener("click", function () {
            self._lastActivityTime = Date.now();
        });
        requestAnimationFrame(function () { bubble.classList.add("cub-bubble--visible"); });
        if (duration) {
            this._bubbleTimer = setTimeout(function () { self._hideBubble(); }, duration);
        }
    };

    Cub.prototype._hideBubble = function () {
        if (this._bubbleTimer) { clearTimeout(this._bubbleTimer); this._bubbleTimer = null; }
        if (this._bubble) {
            var b = this._bubble;
            b.classList.remove("cub-bubble--visible");
            setTimeout(function () { if (b.parentNode) { b.parentNode.removeChild(b); } }, 250);
            this._bubble = null;
        }
    };

    Cub.prototype._escape = function (str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    };

    // =====================================================================
    // РЕАКЦИЯ НА КЛИК ВО ВЬЮПОРТ → ПОДПРЫГ
    // Любой клик по странице (кроме клика по самому котёнку)
    // =====================================================================
    Cub.prototype._initButtonWatcher = function () {
        var self = this;
        // Автоматически снимаем класс после завершения анимации
        this.cub.addEventListener("animationend", function () {
            self.cub.classList.remove("cub--happy", "cub--yawn",
                                      "cub--surprised", "cub--thinking");
        });
        document.addEventListener("click", function (e) {
            self._lastActivityTime = Date.now();
            // Если клик по самому котёнку — не реагируем (это обработает _initClick)
            if (e.target.closest && e.target.closest("#cub-container")) { return; }
            // Любой другой клик по странице — радуемся
            self.setEmotion("happy");
        });
    };

    // =====================================================================
    // РЕАКЦИЯ НА СКРОЛЛ → УДИВЛЕНИЕ
    // =====================================================================
    Cub.prototype._initScrollWatcher = function () {
        var self = this;
        var lastTime = Date.now();
        var lastY = window.scrollY;
        window.addEventListener("scroll", function () {
            self._lastActivityTime = Date.now();
            var now = Date.now();
            var dy = Math.abs(window.scrollY - lastY);
            var dt = now - lastTime;
            lastTime = now;
            lastY = window.scrollY;
            // Быстрый скролл (> 800px/s)
            if (dt > 0 && (dy / dt) * 1000 > 800) {
                self.setEmotion("surprised");
            }
        }, { passive: true });
    };

    // =====================================================================
    // РЕАКЦИЯ НА ВВОД → ЗАДУМЧИВОСТЬ
    // =====================================================================
    Cub.prototype._initInputWatcher = function () {
        var self = this;
        var typingTimer = null;
        document.addEventListener("input", function (e) {
            self._lastActivityTime = Date.now();
            var target = e.target;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                self._isTyping = true;
                self.setEmotion("thinking");
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function () {
                    self._isTyping = false;
                    self.setEmotion("neutral");
                }, 2000);
            }
        });
    };

    // =====================================================================
    // ПЕРИОДИЧЕСКИЕ СЛУЧАЙНЫЕ РЕПЛИКИ (раз в 30-60с)
    // =====================================================================
    Cub.prototype._initPeriodicChat = function () {
        var self = this;
        function sayRandom() {
            var idleTime = Date.now() - self._lastActivityTime;
            // Только если пользователь активен и нет пузыря
            if (idleTime < 30000 && !self._bubble) {
                if (Math.random() < 0.4) {
                    self._showBubble("Рысёнок",
                        RANDOM_PHRASES[Math.floor(Math.random() * RANDOM_PHRASES.length)], 3000);
                }
            }
            setTimeout(sayRandom, 30000 + Math.random() * 30000);
        }
        setTimeout(sayRandom, 45000);
    };

    // =====================================================================
    // БЕЗДЕЙСТВИЕ → ЗЕВАЕТ
    // =====================================================================
    Cub.prototype._initIdleDetector = function () {
        var self = this;
        ["mousemove", "click", "scroll", "touchstart", "keydown"].forEach(function (evt) {
            document.addEventListener(evt, function () {
                self._lastActivityTime = Date.now();
            }, { passive: true });
        });
        this._idleTimerId = setInterval(function () { self._checkIdle(); }, 1000);
    };

    Cub.prototype._checkIdle = function () {
        var idleTime = Date.now() - this._lastActivityTime;
        // 5с — зевает
        if (idleTime >= 5000 && idleTime < 5500) {
            this.cub.classList.remove("cub--yawn");
            void this.cub.offsetWidth;
            this.cub.classList.add("cub--yawn");
            if (Math.random() < 0.5) {
                this._showBubble("Рысёнок", IDLE_PHRASES[Math.floor(Math.random() * IDLE_PHRASES.length)], 2500);
            }
        }
        // 15с — засыпает
        if (idleTime >= 15000 && idleTime < 15500 && this._emotion !== "sleeping") {
            this.setEmotion("sleeping");
            this._showBubble("Рысёнок", "Zzz...", 3000);
        }
    };

    // =====================================================================
    // ОТСТЕЖКА АКТИВНОЙ СЕКЦИИ
    // =====================================================================
    Cub.prototype._initSectionTracker = function () {
        var self = this;
        if (!("IntersectionObserver" in window)) { return; }
        var sections = document.querySelectorAll("[data-section]");
        if (sections.length === 0) { return; }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    self._currentSection = entry.target.getAttribute("data-section");
                }
            });
        }, { rootMargin: "-40% 0px -40% 0px" });
        sections.forEach(function (s) { observer.observe(s); });
        this._sectionObserver = observer;
    };

    // =====================================================================
    // API
    // =====================================================================
    Cub.prototype.notify = function (message) {
        this._notifications.push(message);
        this._updateBadge();
    };

    Cub.prototype.setSectionTips = function (tips) {
        this._sectionTips = Object.assign(this._sectionTips, tips);
    };

    Cub.prototype.say = function (body, title, duration) {
        this._showBubble(title || "Рысёнок", body, duration || 4000);
    };
    // setEmotion уже определён выше как метод прототипа

    /**
     * Изменить WhatsApp-ссылку в кнопке пузыря.
     * @param {string} url — полная ссылка (https://wa.me/...)
     */
    Cub.prototype.setWhatsApp = function (url) {
        WA_LINK = url;
    };

    Cub.prototype._updateBadge = function () {
        if (this._badge) { this._badge.parentNode.removeChild(this._badge); this._badge = null; }
        if (this._notifications.length > 0) {
            var badge = document.createElement("div");
            badge.className = "cub-badge";
            badge.textContent = this._notifications.length;
            this.container.appendChild(badge);
            this._badge = badge;
        }
    };

    // =====================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =====================================================================
    function init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () { window.cub = new Cub(); });
        } else {
            window.cub = new Cub();
        }
    }

    window.Cub = Cub;
    init();
})();
