/* ==========================================================================
   Auto Lock-in — Script
   - Smooth scroll-triggered entrance animations
   - Fluid scroll-driven phone mockup rotation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Entrance Animations via IntersectionObserver
    initEntranceAnimations();

    // 2. Smooth Scroll-Driven Phone Mockup Rotation
    initPhoneScrollRotation();
});

/**
 * Trigger fade-in entrance transitions as sections scroll into view.
 */
function initEntranceAnimations() {
    const animatedElements = document.querySelectorAll('[data-scroll-animate]');

    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(el => el.classList.add('animated'));
        return;
    }

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
    });

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });
}

/**
 * Beautiful, fluid physics-based rotation for phone screenshot mockups on scroll.
 * Uses requestAnimationFrame with linear interpolation (lerp) for buttery 60/120fps motion.
 */
function initPhoneScrollRotation() {
    // Respect reduced-motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const phoneElements = document.querySelectorAll('.phone-scroll-rotate');
    if (!phoneElements.length) return;

    // Track state for each phone element
    const phoneStates = Array.from(phoneElements).map(el => {
        const intensity = parseFloat(el.dataset.rotateIntensity || '4.5');
        const offset = parseFloat(el.dataset.rotateOffset || '0');
        const direction = el.dataset.rotateDirection === 'reverse' ? -1 : 1;
        
        return {
            el,
            intensity,
            offset,
            direction,
            currentRotZ: 0,
            currentRotY: 0,
            targetRotZ: 0,
            targetRotY: 0
        };
    });

    let isTicking = false;
    let isLoopRunning = false;

    function updateTargets() {
        const viewportHeight = window.innerHeight;

        phoneStates.forEach(state => {
            const rect = state.el.getBoundingClientRect();
            // Distance of element's vertical center from the viewport center
            const elementCenterY = rect.top + rect.height / 2;
            const normalized = (elementCenterY - viewportHeight / 2) / (viewportHeight / 2);
            
            // Clamp within reasonable viewport bounds (-1.3 to +1.3)
            const clamped = Math.max(-1.3, Math.min(1.3, normalized));

            // Calculate target angles (slight, elegant rotation)
            state.targetRotZ = (clamped * state.intensity * state.direction) + state.offset;
            state.targetRotY = clamped * (state.intensity * 0.45) * state.direction;
        });

        if (!isLoopRunning) {
            isLoopRunning = true;
            requestAnimationFrame(renderLoop);
        }

        isTicking = false;
    }

    function renderLoop() {
        let hasPendingDelta = false;
        const lerpFactor = 0.1; // Smooth dampening factor

        phoneStates.forEach(state => {
            const diffZ = state.targetRotZ - state.currentRotZ;
            const diffY = state.targetRotY - state.currentRotY;

            if (Math.abs(diffZ) > 0.005 || Math.abs(diffY) > 0.005) {
                state.currentRotZ += diffZ * lerpFactor;
                state.currentRotY += diffY * lerpFactor;
                hasPendingDelta = true;
            } else {
                state.currentRotZ = state.targetRotZ;
                state.currentRotY = state.targetRotY;
            }

            state.el.style.transform = `perspective(1000px) rotateZ(${state.currentRotZ.toFixed(2)}deg) rotateY(${state.currentRotY.toFixed(2)}deg)`;
        });

        if (hasPendingDelta) {
            requestAnimationFrame(renderLoop);
        } else {
            isLoopRunning = false;
        }
    }

    function onScrollOrResize() {
        if (!isTicking) {
            requestAnimationFrame(updateTargets);
            isTicking = true;
        }
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Initial position evaluation
    updateTargets();
}
