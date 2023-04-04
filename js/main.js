// Mobile Navigation
const openNavIcon = document.getElementById('open-nav');
const mainNav = document.getElementById('main-nav');
const closeNavIcon = document.getElementById('close-nav');

function changeMobileNavState() {
  if (mainNav.dataset.mobState === 'closed') {
    mainNav.dataset.mobState = 'open';
  } else {
    mainNav.dataset.mobState = 'closed';
  }
}

// Dark Mode Toggle
const modeContainer = document.getElementById('darkmode');
const modeSwitch = document.getElementById('dark-switch');
const footerHeight = document.querySelector('footer').offsetHeight;
const padding = window.getComputedStyle(document.documentElement).getPropertyValue('--padding-gen').replace('px', '');

function changeTheme(value) {
  if (value == 'light') {
    document.querySelector('body').classList.remove('dark-mode');
    document.querySelector('body').classList.add('light-mode');
    sessionStorage.setItem("theme", 'light');
  } else {
    document.querySelector('body').classList.remove('light-mode');
    document.querySelector('body').classList.add('dark-mode');
    sessionStorage.setItem("theme", 'dark');
  }
}
function checkThemePreference() {
  if(window.matchMedia("(prefers-color-scheme:dark)").matches) {
    changeTheme('dark');
    modeSwitch.checked = true;
  }
  if(window.matchMedia("(prefers-color-scheme:light)").matches) {
    changeTheme('light');
    modeSwitch.checked = false;
  }
}

// Accordion (FAQ Page)


window.onload = () => {
  // ****** Start-up Functions ******
  if (sessionStorage.getItem('theme')) {
    changeTheme(sessionStorage.getItem('theme'));
  } else {
    checkThemePreference();
  }
  if (window.innerWidth < 800) {
    mainNav.ariaHidden = true;
  }

  // ****** Event Listeners ******
  // Dark Mode Changing
  modeSwitch.addEventListener('change', ()=>{
    if(modeSwitch.checked) {
      changeTheme('dark');
    } else {
      changeTheme('light');
    }
  });
  // Stop Dark Mode switch from sticking to bottom of screen when footer appears
  window.addEventListener("scroll", ()=>{
    let limit = document.body.scrollHeight - window.innerHeight - footerHeight - modeContainer.offsetHeight - (padding * 3);
    let scroll = window.scrollY;
    if (scroll > limit) {
      modeContainer.style.position = 'relative';
    } else {
      modeContainer.style.position = 'fixed';
    }
  });
  
  // Mobile Navigation Open and Closing
  openNavIcon.addEventListener('click', changeMobileNavState);
  closeNavIcon.addEventListener('click', changeMobileNavState);
}