/* ==========================================================================
   Auto Lock & Focus — Script
   - Smooth scroll-triggered entrance animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
});
