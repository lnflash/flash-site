// Product Carousel Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize carousel
  const track = document.querySelector(".carousel-track");

  // Exit early if carousel doesn't exist on this page
  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".product-card"));
  const nextButton = document.querySelector(".next-btn");
  const prevButton = document.querySelector(".prev-btn");
  const indicators = document.querySelectorAll(".indicator");

  // Set up initial state
  let currentIndex = 0;
  let cardWidth = cards[0].getBoundingClientRect().width;
  let cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight);
  let cardsPerView = getCardsPerView();
  let autoRotateInterval;

  // Responsive handling
  function getCardsPerView() {
    if (window.innerWidth >= 1024) {
      return 4; // Desktop: show all cards
    } else if (window.innerWidth >= 768) {
      return 2; // Tablet: show 2 cards
    } else {
      return 1; // Mobile: show 1 card
    }
  }

  // Update card positioning
  function updateCarousel() {
    const maxIndex = cards.length - cardsPerView;
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    cardWidth = cards[0].getBoundingClientRect().width;
    cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight);

    const offset = currentIndex * (cardWidth + cardMargin * 2);
    track.style.transform = `translateX(-${offset}px)`;

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });
  }

  // Move to next slide
  function moveToNextSlide() {
    if (currentIndex < cards.length - cardsPerView) {
      currentIndex++;
      updateCarousel();
    } else {
      // Loop back to the beginning
      currentIndex = 0;
      updateCarousel();
    }
  }

  // Move to previous slide
  function moveToPrevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    } else {
      // Loop to the end
      currentIndex = cards.length - cardsPerView;
      updateCarousel();
    }
  }

  // Start auto-rotation
  function startAutoRotate() {
    stopAutoRotate(); // Clear any existing interval
    autoRotateInterval = setInterval(moveToNextSlide, 5000);
  }

  // Stop auto-rotation
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
    }
  }

  // Handle window resize
  function handleResize() {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      updateCarousel();
    }
  }

  // Set up event listeners
  nextButton.addEventListener("click", () => {
    moveToNextSlide();
    stopAutoRotate();
    startAutoRotate();
  });

  prevButton.addEventListener("click", () => {
    moveToPrevSlide();
    stopAutoRotate();
    startAutoRotate();
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
      stopAutoRotate();
      startAutoRotate();
    });
  });

  window.addEventListener("resize", handleResize);

  // Setup touch events for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoRotate();
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoRotate();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - go to next slide
      moveToNextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - go to previous slide
      moveToPrevSlide();
    }
  }

  // Initialize carousel
  updateCarousel();
  startAutoRotate();

  // Pause auto-rotation when hovering over carousel
  const carouselContainer = document.querySelector(".carousel-container");
  carouselContainer.addEventListener("mouseenter", stopAutoRotate);
  carouselContainer.addEventListener("mouseleave", startAutoRotate);
});

// Add the script tag to the HTML file - add this before the closing </body> tag
// <script src="js/productCarousel.js"></script>
