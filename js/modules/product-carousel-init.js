/**
 * Product Carousel Swiper Initialization
 * Initializes the Swiper carousel for the products showcase section
 */

// Initialize Swiper for Products Carousel
document.addEventListener('DOMContentLoaded', function () {
  const productsSwiper = new Swiper('.products-swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    initialSlide: 0,
    loop: true,
    loopAdditionalSlides: 2,
    speed: 600,
    longSwipesRatio: 0.3,
    threshold: 10,
    coverflowEffect: {
      rotate: 15,
      stretch: 0,
      depth: 250,
      modifier: 1,
      slideShadows: true,
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    mousewheel: {
      forceToAxis: true,
      sensitivity: 1,
      releaseOnEdges: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20,
        coverflowEffect: {
          rotate: 8,
          depth: 150,
          modifier: 1,
        }
      },
      768: {
        slidesPerView: 'auto',
        spaceBetween: 30,
        coverflowEffect: {
          rotate: 12,
          depth: 200,
          modifier: 1,
        }
      },
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 40,
        coverflowEffect: {
          rotate: 15,
          depth: 250,
          modifier: 1,
        }
      }
    },
    on: {
      init: function () {
        // Ensure carousel starts centered
        this.update();
        this.slideTo(this.activeIndex, 0);

        // Add smooth entrance animation
        const slides = document.querySelectorAll('.products-swiper .swiper-slide');
        slides.forEach((slide, index) => {
          slide.style.opacity = '0';
          slide.style.transform = 'translateY(30px)';
          setTimeout(() => {
            slide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            slide.style.opacity = '1';
            slide.style.transform = 'translateY(0)';
          }, 300 + (index * 150));
        });
      },
      slideChangeTransitionStart: function () {
        // Add smooth transition class
        const slides = document.querySelectorAll('.products-swiper .swiper-slide');
        slides.forEach(slide => {
          slide.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        });
      },
      slideChangeTransitionEnd: function () {
        // Optional: Add analytics or custom behavior
        console.log('Active product:', this.realIndex);
      },
      transitionEnd: function () {
        // Ensure smooth state after transition
        this.update();
      }
    }
  });

  // Pause autoplay when user scrolls away from products section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        productsSwiper.autoplay.start();
      } else {
        productsSwiper.autoplay.stop();
      }
    });
  }, { threshold: 0.3 });

  const productsSection = document.getElementById('pg-products');
  if (productsSection) observer.observe(productsSection);

  // Improve touch responsiveness
  const swiperContainer = document.querySelector('.products-swiper');
  if (swiperContainer) {
    swiperContainer.addEventListener('touchstart', function () {
      productsSwiper.params.speed = 400;
    }, { passive: true });

    swiperContainer.addEventListener('touchend', function () {
      setTimeout(() => {
        productsSwiper.params.speed = 600;
      }, 300);
    }, { passive: true });
  }
});
