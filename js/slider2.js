// This is the JS file for the 1 App, 3 Modes Slider

const tabs = document.querySelectorAll('.slider-tab');
const slides = document.querySelectorAll('.slide');
let currSlide = null;
let prevSlide = null;
let slideDelay = getComputedStyle(document.querySelector('.slide')).getPropertyValue('--_slide-transition');
slideDelay = parseFloat(slideDelay);

const appText = 'Made with convenience and ease of use in mind, FlashApp gives you the power of a bank in the palm of your hand.';
const cashText = 'Tailored for merchants, FlashCash can turn any store into an ATM.';
const payText = 'Turn your device into a cash register! FlashPay makes it simple for anyone to open up a store front anywhere.';
const defaultText = 'Flash lets you do business at lightning speed! Experience the ease with which you can move money around the world. Sell products and services globally to anyone, all from your smartphone.';
const textArray = [appText, cashText, payText, defaultText];

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
      animName = 'top-up';
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
  setTimeout(() => {
    slides[num].style.zIndex = '0';
  }, slideDelay);
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
  changeMsgText(num);
}
function changeMsgText(num) {
  $('.slider-msg p').text(textArray[num]);
}

function tabSelect(num) {
  if (num == currSlide) {
    removeActiveTab(num);
    currSlide = prevSlide = null;
    changeMsgText(textArray.length-1);
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
      slides[num].style.zIndex = '1';
      slides[num].classList.add('active');
      tabs[num].classList.add('active');
      expandSlide(num);
    }, slideDelay);
  } else {
    slides[num].style.zIndex = '1';
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