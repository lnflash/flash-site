// Timeline Carousel Initialization

document.addEventListener('DOMContentLoaded', function() {
    // Check if timeline swiper exists
    const timelineSwiper = document.querySelector('.timeline-swiper');

    if (!timelineSwiper) return;

    // Initialize Timeline Swiper
    new Swiper('.timeline-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: false,
        grabCursor: true,

        // Navigation arrows
        navigation: {
            nextEl: '.timeline-nav-btn.swiper-button-next',
            prevEl: '.timeline-nav-btn.swiper-button-prev',
        },

        // Pagination
        pagination: {
            el: '.timeline-pagination',
            clickable: true,
            dynamicBullets: true,
        },

        // Keyboard control
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },

        // Responsive breakpoints
        breakpoints: {
            // When window width is >= 640px
            640: {
                slidesPerView: 1.5,
                spaceBetween: 20,
            },
            // When window width is >= 768px
            768: {
                slidesPerView: 2,
                spaceBetween: 24,
            },
            // When window width is >= 1024px
            1024: {
                slidesPerView: 2.5,
                spaceBetween: 30,
            },
            // When window width is >= 1280px
            1280: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },

        // Autoplay (optional - can be disabled)
        autoplay: {
            delay: 5000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
        },

        // Effect
        effect: 'slide',
        speed: 600,
    });
});
