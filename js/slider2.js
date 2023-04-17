const tabs = document.querySelectorAll('.slider-tab');
const slides = document.querySelectorAll('.slide');
let currSlide = null;

for (let i=0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', tabSelect.bind(null, i), false);
}
for (let i=0; i < slides.length; i++) {
  slides[i].addEventListener('click', tabSelect.bind(null, i), false);
}

function tabSelect(num) {
  if (num == currSlide) {
    removeActiveTab();
  } else {
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
    removeActiveTab();
    setTimeout(() => {
      slides[num].classList.add('active');
      tabs[num].classList.add('active');
    }, 400);
  } else {
    slides[num].classList.add('active');
    tabs[num].classList.add('active');
  }
}
function removeActiveTab() {
  slides.forEach(slide => {
    slide.classList.remove('active');
  });
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
}