// This is the JS file for the 1 App, 3 Modes Slider

const tabs = document.querySelectorAll('.slider-tab');
const slides = document.querySelectorAll('.slide');
let currSlide = null;
let prevSlide = null;
let slideDelay = getComputedStyle(document.querySelector('.slide')).getPropertyValue('--_slide-transition');
slideDelay = parseFloat(slideDelay);

const appText = 'Made with convenience and ease of use in mind, Flash gives you the power of a bank in the palm of your hand';
const payText = 'Increase your revenue stream and global reach with Flash Business. Contact us to set up a Flash Business account today';
const cashText = 'Turn your mobile device, or any internet browser into a cash register. Sell anything, anywhere, anytime with Flash Pay';
const defaultText = 'Select one of the boxes to learn more about the many features of Flash';
const textArray = [appText, cashText, payText, defaultText];
const colorArray = ['rgba(255, 242, 0, 0.5)', 'rgba(65, 173, 73, 0.5)', 'rgba(241, 164, 60, 0.5)', 'rgba(255, 255, 255, 0.5)'];
const defaultColor = 'rgba(255, 255, 255, 0.0)';


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
    changeSliderMsgBgColor(num);

    // Scroll to the clicked tab.
    var container = document.querySelector('.slider-tabs');
    var scrollLeft = tabs[num].offsetLeft - container.offsetLeft;
    scrollLeft -= (container.offsetWidth - tabs[num].offsetWidth) / 2;
    container.scrollLeft = scrollLeft;
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
      changeSliderMsgBgColor(num);
    }, slideDelay);
  } else {
    slides[num].style.zIndex = '1';
    slides[num].classList.add('active');
    tabs[num].classList.add('active');
    expandSlide(num);
    changeSliderMsgBgColor(num);
  }
}
function changeSliderMsgBgColor(num) {
  const sliderMsg = document.querySelector('.slider-msg');
  sliderMsg.style.background = `radial-gradient(circle, ${colorArray[num]}, transparent)`;
}
function resetSliderMsgBgColor() {
  const sliderMsg = document.querySelector('.slider-msg');
  sliderMsg.style.background = `radial-gradient(circle, ${defaultColor}, transparent)`;
}
function removeActiveTab(num) {
  collapseSlide(num);
  slides.forEach(slide => {
    slide.classList.remove('active');
  });
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  resetSliderMsgBgColor();
}