/* ==========================================================================
   Auto Lock & Focus — Streamlined Script
   - Smooth entrance & scroll triggers
   - Samsung Digital Wellbeing 2-wheel vertical drum picker (Hours & Minutes)
   - Switchly & Lock giant disable button simulator
   - Spread-out canvas radial gauges (93%, 81%, 86%)
   - Live auto-revert timer countdown
   - Mindful breathing visualizer (Inhale/Hold/Exhale/Pause)
   - Interactive lock screen checkpoint with live clock
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. SCROLL ANIMATION OBSERVER ([data-scroll-animate])
    // ==========================================================================
    const scrollObserverOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // If entry has a canvas inside, trigger gauge animation
                const gaugeCanvas = entry.target.querySelector('canvas[id^="chart-stat-"]');
                if (gaugeCanvas) {
                    triggerGaugeAnimation(gaugeCanvas.id);
                }

                observer.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);

    document.querySelectorAll('[data-scroll-animate]').forEach(el => {
        scrollObserver.observe(el);
    });

    // ==========================================================================
    // 2. ANIMATED DONUT/ARC GAUGE CHARTS (93%, 81%, 86%)
    // ==========================================================================
    const statsConfig = {
        'chart-stat-93': { target: 93, elementId: 'val-93', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)' },
        'chart-stat-81': { target: 81, elementId: 'val-81', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
        'chart-stat-86': { target: 86, elementId: 'val-86', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.45)' }
    };

    const animatedGauges = new Set();

    function triggerGaugeAnimation(canvasId) {
        if (animatedGauges.has(canvasId)) return;
        animatedGauges.add(canvasId);

        const canvas = document.getElementById(canvasId);
        const config = statsConfig[canvasId];
        if (!canvas || !config) return;

        animateGauge(canvas, config.target, config.elementId, config.color, config.glow);
    }

    function animateGauge(canvas, targetPercent, valDisplayId, strokeColor, glowColor) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 120;
        
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = 46;
        const lineWidth = 9;

        let currentPercent = 0;
        const duration = 1300; // ms
        const startTime = performance.now();
        const displayEl = document.getElementById(valDisplayId);

        function renderFrame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            currentPercent = easeProgress * targetPercent;

            ctx.clearRect(0, 0, size, size);

            // 1. Background Track Arc
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            // 2. Animated Progress Arc
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (Math.PI * 2 * (currentPercent / 100));

            ctx.save();
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            if (displayEl) {
                displayEl.innerText = `${Math.round(currentPercent)}%`;
            }

            if (progress < 1) {
                requestAnimationFrame(renderFrame);
            }
        }

        requestAnimationFrame(renderFrame);
    }

    // Initialize blank background tracks
    Object.keys(statsConfig).forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const size = 120;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            ctx.scale(dpr, dpr);
            
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 46, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 9;
            ctx.stroke();
        }
    });

    // ==========================================================================
    // 3. SAMSUNG DIGITAL WELLBEING VERTICAL 2-WHEEL DRUM PICKER
    // ==========================================================================
    const hoursItemsContainer = document.getElementById('hours-items');
    const minutesItemsContainer = document.getElementById('minutes-items');
    const pickerFeedback = document.getElementById('picker-feedback');
    const flick3hBtn = document.getElementById('flick-3h');
    const flick23hBtn = document.getElementById('flick-23h');

    let currentSelectedHour = 0;
    let currentSelectedMinute = 30;
    const itemHeight = 38; // px

    if (hoursItemsContainer && minutesItemsContainer) {
        // Populate Hours: 0 to 23
        for (let h = 0; h <= 23; h++) {
            const div = document.createElement('div');
            div.className = `wheel-item ${h === 0 ? 'active' : ''}`;
            div.innerText = `${h}h`;
            div.dataset.value = h;
            div.addEventListener('click', () => scrollToHour(h));
            hoursItemsContainer.appendChild(div);
        }

        // Populate Minutes: 00 to 55 (5-minute steps)
        const minuteSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        minuteSteps.forEach((m) => {
            const div = document.createElement('div');
            div.className = `wheel-item ${m === 30 ? 'active' : ''}`;
            div.innerText = `${m < 10 ? '0' + m : m}m`;
            div.dataset.value = m;
            div.addEventListener('click', () => scrollToMinute(m));
            minutesItemsContainer.appendChild(div);
        });

        function scrollToHour(hour) {
            currentSelectedHour = hour;
            const offset = -(hour * itemHeight);
            hoursItemsContainer.style.transform = `translateY(${offset}px)`;

            hoursItemsContainer.querySelectorAll('.wheel-item').forEach(el => {
                el.classList.toggle('active', parseInt(el.dataset.value) === hour);
            });

            updatePickerFeedback();
        }

        function scrollToMinute(minute) {
            currentSelectedMinute = minute;
            const minuteSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            const index = minuteSteps.indexOf(minute);
            if (index !== -1) {
                const offset = -(index * itemHeight);
                minutesItemsContainer.style.transform = `translateY(${offset}px)`;

                minutesItemsContainer.querySelectorAll('.wheel-item').forEach(el => {
                    el.classList.toggle('active', parseInt(el.dataset.value) === minute);
                });
            }

            updatePickerFeedback();
        }

        function updatePickerFeedback() {
            if (!pickerFeedback) return;
            const formattedMin = currentSelectedMinute < 10 ? '0' + currentSelectedMinute : currentSelectedMinute;
            
            if (currentSelectedHour === 0 && currentSelectedMinute <= 30) {
                pickerFeedback.innerHTML = `Set to ${currentSelectedHour}h ${formattedMin}m. Notice how easy it is to scroll upward.`;
                pickerFeedback.className = "picker-feedback-bar";
            } else if (currentSelectedHour >= 20) {
                pickerFeedback.innerHTML = `🚨 <strong>Spun to ${currentSelectedHour}h ${formattedMin}m!</strong> Literally turning the vertical wheel to 23 hours in two seconds. Limit destroyed.`;
                pickerFeedback.className = "picker-feedback-bar danger-feedback";
            } else if (currentSelectedHour >= 3) {
                pickerFeedback.innerHTML = `⚠️ <strong>Spun to ${currentSelectedHour}h ${formattedMin}m.</strong> With one effortless flick, you granted hours of screen time.`;
                pickerFeedback.className = "picker-feedback-bar danger-feedback";
            } else {
                pickerFeedback.innerHTML = `Set to ${currentSelectedHour}h ${formattedMin}m. Giving up takes zero effort.`;
                pickerFeedback.className = "picker-feedback-bar danger-feedback";
            }
        }

        // Quick flick buttons
        if (flick3hBtn) {
            flick3hBtn.addEventListener('click', () => {
                scrollToHour(3);
                scrollToMinute(0);
            });
        }

        if (flick23hBtn) {
            flick23hBtn.addEventListener('click', () => {
                scrollToHour(23);
                scrollToMinute(55);
            });
        }

        // Initial default scroll positions (0h 30m)
        scrollToHour(0);
        scrollToMinute(30);

        // Support mouse wheel scrolling on hours drum
        const hoursDrum = document.getElementById('hours-drum');
        if (hoursDrum) {
            hoursDrum.addEventListener('wheel', (e) => {
                e.preventDefault();
                let next = currentSelectedHour + (e.deltaY > 0 ? 1 : -1);
                next = Math.max(0, Math.min(23, next));
                scrollToHour(next);
            }, { passive: false });
        }

        // Support mouse wheel scrolling on minutes drum
        const minutesDrum = document.getElementById('minutes-drum');
        if (minutesDrum) {
            minutesDrum.addEventListener('wheel', (e) => {
                e.preventDefault();
                const minuteSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                let idx = minuteSteps.indexOf(currentSelectedMinute);
                idx = idx + (e.deltaY > 0 ? 1 : -1);
                idx = Math.max(0, Math.min(minuteSteps.length - 1, idx));
                scrollToMinute(minuteSteps[idx]);
            }, { passive: false });
        }
    }

    // ==========================================================================
    // 4. SWITCHLY & LOCK: GIANT DISABLE BUTTON SIMULATOR
    // ==========================================================================
    const disableBtn = document.getElementById('demo-disable-btn');
    const disableFeedback = document.getElementById('disable-feedback');

    if (disableBtn && disableFeedback) {
        disableBtn.addEventListener('click', () => {
            disableBtn.style.transform = 'scale(0.96)';
            setTimeout(() => { disableBtn.style.transform = 'scale(1)'; }, 150);

            disableFeedback.innerHTML = `❌ <strong>Limits Disabled!</strong> One tap completely disarms the blocker during a weak moment. Friction is gone.`;
            disableFeedback.className = "picker-feedback-bar danger-feedback";

            setTimeout(() => {
                disableFeedback.innerHTML = `Auto Lock & Focus has <em>no</em> easy disable button — mindful friction keeps you honest.`;
            }, 3500);
        });
    }

    // ==========================================================================
    // 5. AUTO-REVERT COUNTDOWN TIMER SIMULATOR
    // ==========================================================================
    const timerDisplay = document.getElementById('revert-live-timer');
    const progressBar = document.getElementById('revert-progress-bar');
    
    if (timerDisplay && progressBar) {
        let totalSeconds = 120;
        let remaining = 119;

        setInterval(() => {
            remaining--;
            if (remaining < 0) {
                remaining = 120;
            }

            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            const formattedSecs = secs < 10 ? `0${secs}` : secs;

            if (remaining === 0) {
                timerDisplay.innerText = `🔒 Limit auto-reverted! App re-locked.`;
                timerDisplay.style.color = '#34d399';
            } else {
                timerDisplay.innerText = `0${mins}:${formattedSecs} remaining`;
                timerDisplay.style.color = '#a5b4fc';
            }

            const percent = (remaining / totalSeconds) * 100;
            progressBar.style.width = `${percent}%`;
        }, 1000);
    }

    // ==========================================================================
    // 6. MINDFUL BREATHING VISUALIZER (4-4-4-4 Box Breathing)
    // ==========================================================================
    const breathingText = document.getElementById('breathing-text');
    const breathingRing = document.getElementById('breathing-ring');
    const toggleBreathingBtn = document.getElementById('toggle-breathing-btn');

    if (breathingText && breathingRing && toggleBreathingBtn) {
        let isBreathingActive = true;
        const cycleStages = [
            { text: "Inhale...", duration: 4000 },
            { text: "Hold...", duration: 4000 },
            { text: "Exhale...", duration: 4000 },
            { text: "Pause...", duration: 4000 }
        ];

        let currentStageIdx = 0;
        let breathingTimerId = null;

        function runBreathingCycle() {
            if (!isBreathingActive) return;

            const stage = cycleStages[currentStageIdx];
            breathingText.innerText = stage.text;

            breathingTimerId = setTimeout(() => {
                currentStageIdx = (currentStageIdx + 1) % cycleStages.length;
                runBreathingCycle();
            }, stage.duration);
        }

        runBreathingCycle();

        toggleBreathingBtn.addEventListener('click', () => {
            isBreathingActive = !isBreathingActive;
            if (isBreathingActive) {
                toggleBreathingBtn.innerText = "Pause";
                breathingRing.style.animationPlayState = 'running';
                runBreathingCycle();
            } else {
                toggleBreathingBtn.innerText = "Resume";
                breathingRing.style.animationPlayState = 'paused';
                clearTimeout(breathingTimerId);
                breathingText.innerText = "Paused";
            }
        });
    }

    // ==========================================================================
    // 7. LOCK SCREEN CHECKPOINT SIMULATOR
    // ==========================================================================
    const livePhoneClock = document.getElementById('live-phone-clock');
    const lockBePresentBtn = document.getElementById('lock-be-present-btn');
    const lockQuickTaskBtn = document.getElementById('lock-quick-task-btn');
    const lockResultMsg = document.getElementById('lock-result-msg');

    function updateClock() {
        if (!livePhoneClock) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        livePhoneClock.innerText = `${hours}:${formattedMinutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 30000);

    if (lockBePresentBtn && lockResultMsg) {
        lockBePresentBtn.addEventListener('click', () => {
            lockResultMsg.innerHTML = `<span style="color: #6ee7b7; font-weight: 700;">🌿 Phone put down!</span> You broke the unconscious reflex. Stay mindful!`;
        });
    }

    if (lockQuickTaskBtn && lockResultMsg) {
        lockQuickTaskBtn.addEventListener('click', () => {
            lockResultMsg.innerHTML = `<span style="color: #a5b4fc; font-weight: 700;">⏱️ 1-Minute Task Active.</span> Re-locks automatically when the task finishes.`;
        });
    }

});
