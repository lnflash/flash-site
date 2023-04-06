// This is the JS file for the slider on the about page

const sliderContainer = document.querySelector('.slider-container');
const tabs = document.querySelectorAll('.slider-tab');
const slides = document.querySelectorAll('.slide');
const sliderInterval = 2800;
const animDuration = 600;
let currSlide = 0;
let prevSlide = tabs.length - 1;
let intvl;
let timeout;

for (let i=0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', tabSelect.bind(null, i), false);
}

tabs[0].classList.add('active');
slides[0].style.left = '0';
timeout = setTimeout(() => {
  animateSlider();
  slides[0].style.left = "";
  intvl = setInterval(animateSlider, sliderInterval);
}, sliderInterval - animDuration);

function animateSlider(nextSlide, right) {
  if (!nextSlide) {
    nextSlide = currSlide + 1 < slides.length ? currSlide + 2 : 1;
  }
  nextSlide--;
  slides[prevSlide].style.animationName = "";
  if (!right) {
    slides[nextSlide].style.animationName = "leftNext";
    slides[currSlide].style.animationName = "leftCurr";
  } else {
    slides[nextSlide].style.animationName = "rightNext";
    slides[currSlide].style.animationName = "rightCurr";
  }
  // Fix overlay issues for oversized images
  slides[nextSlide].style.zIndex = '1';
  slides[currSlide].style.zIndex = '0';
  prevSlide = currSlide;
  currSlide = nextSlide;

  tabs[currSlide].classList.add('active');
  tabs[prevSlide].classList.remove('active');
}

function tabSelect(num) {
  if (num == currSlide) {
    return false;
  }
  clearTimeout(timeout);
  clearInterval(intvl);
  if (num > currSlide) {
    animateSlider(num + 1);
  } else {
    animateSlider(num + 1, true);
  }
  intvl = setInterval(animateSlider, sliderInterval);
}

// ! Stop animation on smaller screens.