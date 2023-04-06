/* 
* This JS file contains:
* 1. Mobile Navigation functions
* 2. Dark Mode Toggle functions
* 3. Accordion functions
* 4. Contact & Waitlist Form functions
*/

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
const accordion = document.querySelector('.accordion');
function changeTab(activeTab) {
  const heads = activeTab.parentElement.querySelectorAll('.accordion-head');
  const tabs = document.querySelectorAll('.accordion-tab');
  const answers = activeTab.parentElement.querySelectorAll('.accordion-body');
  heads.forEach(head => {
    head.setAttribute('aria-expanded', false);
  });
  tabs.forEach(tab => {
    tab.dataset.active = 'inactive';
  });
  answers.forEach(answer => {
    answer.setAttribute('hidden', '');
  });
  activeTab.dataset.active = 'active';
  activeTab.querySelector('.accordion-head').setAttribute('aria-expanded', true);
  activeTab.querySelector('.accordion-body').removeAttribute('hidden');
}

// Contact & Waitlist Forms
const sendMsgBtn = document.getElementById('send-msg-btn');
const signUpBtn = document.getElementById('sign-up-btn');
function checkEmpty(val) {
  if(val.length == 0 || val == " ") {
    return false;
  }
  return true;
}
function nameCheck(val) {
  let pattern = /^[a-z ,.'-]+$/i;
  if (pattern.test(val)) {
    return true;
  }
  return false;
}
function emailCheck(val) {
  let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (pattern.test(val)) {
    return true;
  }
  return false;
}
function highlightError(input, pass) {
  if (!pass) {
    input.style.borderColor = 'var(--flash-red)';
    if (input.classList.contains('c-msg')) {
      input.placeholder = "You haven't typed a message!";
      input.classList.add('error');
    }
  } else {
    input.style.borderColor = 'var(--text-colour)';
    if (input.classList.contains('c-msg')) {
      input.placeholder = "";
      input.classList.remove('error');
    }
  }
}
function patternCheck(form) {
  let fieldset = [];
  let values = [];
  let pass = true;
  let noError = true;
  const cName = document.getElementById('c-name');
  const cEmail = document.getElementById('c-email');
  const cMsg = document.getElementById('c-msg');
  const wEmail = document.getElementById('w-email');
  if (form == 'msg') {
    fieldset = [
      {checker: nameCheck(cName.value), error: cName},
      {checker: emailCheck(cEmail.value), error: cEmail},
      {checker: checkEmpty(cMsg.value), error: cMsg}
    ];
    values = [
      {name: cName.value},
      {email: cEmail.value},
      {msg: cMsg.value}
    ];
  } else {
    fieldset = fieldset = [
      {checker: emailCheck(wEmail.value), error: wEmail}
    ];
    values = wEmail.value;
  }
  fieldset.forEach(field => {
    pass = field.checker;
    if (pass == false) {
      noError = false;
      highlightError(field.error, pass);
      console.log(field.error);
    } else {
      highlightError(field.error, pass);
    }
  });
  return [noError, values];
}
function sendMsg(values) {
  const name = values.name;
  const email = values.email;
  const msg = values.email;
  let sendMsg = $.ajax({
    url: ".assets/services/sendMessage.php",
    type: "POST",
    data: {
      user: name,
      email: email,
      msg: msg
    },
    dataType: "json"
  });
  sendMsg.fail(function (jqXHR, textStatus) {
    console.error("Something went wrong! (sendMsg)" + textStatus);
    // Add failure notice
  });
  sendMsg.done(function (data) {
    if (data.error.id == 0) {
      $('.contact-form .formfields').css('display', 'none');
      $('.success-msg').css('display', 'block');
    }
  });
}
function addToWaitlist(values) {
  const email = values;
  let sendMsg = $.ajax({
    url: ".assets/services/addToWaitlist.php",
    type: "POST",
    data: {
      email: email
    },
    dataType: "json"
  });
  sendMsg.fail(function (jqXHR, textStatus) {
    console.error("Something went wrong! (sendMsg)" + textStatus);
    // Add failure notice
  });
  sendMsg.done(function (data) {
    if (data.error.id == 0) {
      $('.waitlist-form .formfields').css('display', 'none');
      $('.success-waitlist').css('display', 'block');
    }
  });
}


  // ****** Start-up Functions ******
function loadScreen() {
  $('section').hide();
  progressBar = document.querySelector('.progress-bar');
  progressBar.style.setProperty('--_animation-name', 'page-load');
  setTimeout(() => {
    $('section').fadeIn();
    $('#loading-screen').fadeOut('fast');
  }, 2000);
}

if (sessionStorage.getItem('theme')) {
  changeTheme(sessionStorage.getItem('theme'));
} else {
  checkThemePreference();
}
if (window.innerWidth < 800) {
  mainNav.ariaHidden = true;
}

window.onload = () => {
  loadScreen();

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
  $('.nav-link').click(()=>{changeMobileNavState()});

  // Accordion
  accordion.addEventListener('click', (e)=>{
    const activeTab = e.target.closest('.accordion-tab');
    if (!activeTab) return;
    changeTab(activeTab);
  });
  // Send Message
  sendMsgBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const checkResult = patternCheck('msg');
    if (checkResult[0]) {
      sendMsg(checkResult[1]);
    }
  });
  signUpBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const checkResult = patternCheck('waitlist');
    if (checkResult[0]) {
      addToWaitlist(checkResult[1]);
    }
  });
}