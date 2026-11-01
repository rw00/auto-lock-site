/* ==========================================================================
   Auto Lock & Focus — Streamlined Script
   - Smooth entrance & scroll triggers
   - Live auto-revert timer countdown
   - Mindful breathing visualizer (Inhale / Hold / Exhale / Pause)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. SCROLL ANIMATION OBSERVER ([data-scroll-animate])
    // ==========================================================================
    const scrollObserverOptions = {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);

    document.querySelectorAll('[data-scroll-animate]').forEach(el => {
        scrollObserver.observe(el);
    });

    // ==========================================================================
    // 2. AUTO-REVERT COUNTDOWN TIMER SIMULATOR
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
    // 3. MINDFUL BREATHING VISUALIZER (4-4-4-4 Box Breathing)
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

});
