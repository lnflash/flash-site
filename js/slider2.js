// This is the JS file for the 1 App, 3 Modes Slider

const tabs = document.querySelectorAll('.slider-tab');
const slides = document.querySelectorAll('.slide');
let currSlide = null;
let prevSlide = null;
let slideDelay = getComputedStyle(document.querySelector('.slide')).getPropertyValue('--_slide-transition');
slideDelay = parseFloat(slideDelay);

for (let i=0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', tabSelect.bind(null, i), false);
}
for (let i=0; i < slides.length; i++) {
  slides[i].addEventListener('click', tabSelect.bind(null, i), false);
}

function collapseSlide(num) {
  let animName;
  switch (num) {
    case 0:
      animName = 'top-up'
      break;
    case 1:
      animName = 'mid-in'
      break;
    case 2:
      animName = 'btm-down'
      break;
  
    default:
      break;
  }
  slides[num].style.animationName = animName;
}
function expandSlide(num) {
  let animName;
  switch (num) {
    case 0:
      animName = 'top-down'
      break;
    case 1:
      animName = 'mid-out'
      break;
    case 2:
      animName = 'btm-up'
      break;
  
    default:
      break;
  }
  slides[num].style.animationName = animName;
}

function tabSelect(num) {
  if (num == currSlide) {
    removeActiveTab(num);
    currSlide = prevSlide = null;
  } else {
    prevSlide = currSlide;
    currSlide = num;
    setActiveTab(num);
  }
}

function checkActiveTab() {
  let check = false;
  slides.forEach(slide => {
    if (slide.classList.contains('active')) {
      check = true;
    };
  });
  return check;
}
function setActiveTab(num) {
  const isTabActive = checkActiveTab();
  if (isTabActive) {
    removeActiveTab(prevSlide);
    setTimeout(() => {
      slides[num].classList.add('active');
      tabs[num].classList.add('active');
      expandSlide(num);
    }, slideDelay);
  } else {
    slides[num].classList.add('active');
    tabs[num].classList.add('active');
    expandSlide(num);
  }
}
function removeActiveTab(num) {
  collapseSlide(num);
  slides.forEach(slide => {
    slide.classList.remove('active');
  });
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
}