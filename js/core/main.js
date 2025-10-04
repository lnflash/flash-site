/*
 * This JS file contains:
 * 1. Navigation functions
 * 2. About Card Handling functions
 * 3. Accordion functions
 * 4. Contact Form functions
 * 5. Startup functions
 * 6. Dark Mode Toggle functions
 * 7. Event Listeners
 * 8. Animations
 */

// Navigation - Will be initialized after components load
let openNavIcon, mainNav, closeNavIcon, navLinks, pages;
let currentNav = 0;
let prevNav = currentNav;
let mobileMenuListenersAttached = false;

// Initialize navigation elements after components are loaded
function initNavigationElements() {
  // Only initialize if not already initialized
  if (mainNav) return;

  openNavIcon = document.getElementById("open-nav");
  mainNav = document.getElementById("main-nav");
  closeNavIcon = document.getElementById("close-nav");
  navLinks = document.querySelectorAll(".nav-link");
  pages = document.querySelectorAll(".page");
}

function changeMobileNavState() {
  if (!mainNav) return;

  if (mainNav.dataset.mobState === "closed") {
    mainNav.dataset.mobState = "open";
  } else {
    mainNav.dataset.mobState = "closed";
  }
}

// Cards (About Page)
const cards = document.querySelectorAll('.card');
let currCard = null;
let prevCard = null;
const appText = 'Bitcoin gives you the power of a bank in the palm of your hand, without the need for a bank account.';
const cardsText = 'Flash Cards let you earn rewards and spend your rewards anywhere without needing a phone or internet connection.';
const pointsText = 'Contact us to add a Flash Point of Sale & rewards system to your business and start accepting Flash in minutes.';
const textArray = [appText, cardsText, pointsText];
let playBorderAnim;

for (let i=0; i < cards.length; i++) {
  cards[i].addEventListener('click', cardSelect.bind(null, i), false);
}

function changeMsgText(num) {
  $(".card-msg p").text(textArray[num]);
}
function changeMsgAnim(num) {
  const c = document.querySelector(".card-msg-container");
  let d = window.getComputedStyle(c).getPropertyValue("--_border-anim-duration");
  // Clear previous timeout animation
  clearTimeout(playBorderAnim);

  // Change duration in CSS, not here
  let sliderDuration = parseFloat(d);
  duration = parseFloat(d) * 1000;
  // Border Animation
  playBorderAnim = setTimeout(() => {
    $(".card-msg-container").addClass("play");
    setTimeout(() => {
      $(".card-msg-container").removeClass("play");
    }, duration);
  }, 300);

  // Border Animation Calcs
  let containerWidth = msgBorderCalcs(c);

  // Slider Animation
  const sliderDefaultPos = window.getComputedStyle(c).getPropertyValue("--_slider-default-position");
  let sliderWidth = window.getComputedStyle(c).getPropertyValue("--_slider-width");
  const sliderDelay = .4;
  const wiperWidth = parseFloat(sliderWidth) * 3 + parseFloat(sliderDefaultPos);
  sliderDuration = sliderDuration - sliderDelay * 2;
  sliderStart = .3;
  gsap.set("#wiper", {
    x: containerWidth - wiperWidth,
    width: containerWidth
  });
  gsap.set("#slider-n", {
    x: containerWidth - parseFloat(sliderDefaultPos) - parseFloat(sliderWidth)
  });
  gsap.set("#slider-g", {
    x: containerWidth - parseFloat(sliderDefaultPos) - parseFloat(sliderWidth) * 1.8
  });
  gsap.set("#slider-y", {
    x: containerWidth - parseFloat(sliderDefaultPos) - parseFloat(sliderWidth) * 2.8
  });
  let sliderAnim = gsap.timeline();
  sliderAnim.to("#wiper", {
    duration: sliderDuration,
    ease: "power1.in",
    x: 0
  })
  .call(changeMsgText, [num])
  .to("#wiper", {
    duration: 1,
    delay: sliderDelay * 2,
    ease: "power1.in",
    x: -containerWidth
  })
  .set("#wiper", {x: containerWidth - wiperWidth})
  .to("#slider-y", {
    duration: sliderDuration,
    ease: "power1.in",
    x: 0 - sliderWidth * 2,
    opacity: 0
  }, sliderStart)
  .set("#slider-y", {x: containerWidth + sliderWidth, opacity: 1}, ">")
  .to("#slider-y", {
    duration: 1,
    x: containerWidth - parseFloat(sliderDefaultPos) - parseFloat(sliderWidth) * 2.8
  }, ">")
  .to("#slider-g", {
    duration: sliderDuration,
    ease: "power1.in",
    x: 0 - sliderWidth * 2,
    opacity: 0
  }, sliderStart + sliderDelay)
  .set("#slider-g", {x: containerWidth + sliderWidth, opacity: 1}, ">")
  .to("#slider-g", {
    duration: 1,
    x: containerWidth - parseFloat(sliderDefaultPos) - parseFloat(sliderWidth) * 1.8
  }, ">")
  .to("#slider-n", {
    duration: sliderDuration,
    ease: "power1.in",
    x: 0 - sliderWidth * 2,
    opacity: 0
  }, sliderStart + sliderDelay * 2)
  .set("#slider-n", {x: containerWidth + sliderWidth, opacity: 1}, ">")
  .to("#slider-n", {
    duration: 1,
    x: containerWidth - parseFloat(sliderDefaultPos) - parseFloat(sliderWidth)
  }, ">")
}
function msgBorderCalcs(cont) {
  // Calculate SVG dash attributes for animation
  const mWidth = cont.offsetWidth;
  const mHeight = cont.offsetHeight;
  const mBorderRadius = window.getComputedStyle(cont).getPropertyValue("--_border-radius");
  const mPerimeter = 2 * mWidth + 2 * mHeight - (8 - 2 * Math.PI) * parseFloat(mBorderRadius);

  const borderLength = mPerimeter * .5; // length of the moving line
  const borderGap = mPerimeter - borderLength; // gap between dashes to ensure only 1 line is visible
  const dashOffset = mWidth * .65 * -1; // position the dash line
  const dashFinalOffset = (mPerimeter + -dashOffset) * -1; //end position of dash line - FOR ANIMATION ONLY
  cont.style.setProperty("--_dash-array", `${borderLength} ${borderGap}`);
  cont.style.setProperty("--_dash-offset", dashOffset);
  cont.style.setProperty("--_dash-final-offset", dashFinalOffset);
  return mWidth;
}
function cardSelect(num) {
  if (cards.length > 0) {
    if (num != currCard) {
      prevCard = currCard;
      currCard = num;
      setActiveCard(num);
  
      // Scroll to the clicked tab.
      var container = document.querySelector('.cards');
      var scrollLeft = cards[num].offsetLeft - container.offsetLeft;
      scrollLeft -= (container.offsetWidth - cards[num].offsetWidth) / 2;
      container.scrollLeft = scrollLeft;
    }
  }
}
function checkActiveCard() {
  let check = false;
  cards.forEach(card => {
    if (card.classList.contains('active')) {
      check = true;
    };
  });
  return check;
}
function setActiveCard(num) {
  const isCardActive = checkActiveCard();
  if (isCardActive) {
    if (!cards[num].classList.contains('active')) {
      removeActiveCard();
      cards[num].classList.add('active');
      changeMsgAnim(num);
    } else {
      changeMsgAnim(num);
    }
  } else {
    cards[num].classList.add('active');
    changeMsgAnim(num);
  }
}
function removeActiveCard() {
  cards.forEach(card => {
    card.classList.remove('active');
  });
}

// Accordion (FAQ Page)
const accordion = document.querySelector(".accordion");
function changeTab(activeTab) {
  const heads = activeTab.parentElement.querySelectorAll(".accordion-head");
  const tabs = document.querySelectorAll(".accordion-tab");
  const answers = activeTab.parentElement.querySelectorAll(".accordion-body");
  heads.forEach((head) => {
    head.setAttribute("aria-expanded", false);
  });
  tabs.forEach((tab) => {
    tab.dataset.active = "inactive";
    tab.querySelector(".accordion-body").style.maxHeight = null;
  });
  answers.forEach((answer) => {
    answer.setAttribute("aria-hidden", true);
  });
  activeTab.dataset.active = "active";
  activeTab.querySelector(".accordion-head").setAttribute("aria-expanded", true);
  activeTab.querySelector(".accordion-body").setAttribute("aria-hidden", false);
  let tabHeight = activeTab.querySelector(".accordion-body").scrollHeight + "px";
  $(activeTab).find(".accordion-body").css("maxHeight", tabHeight);
}
function closeTab(activeTab) {
  activeTab.querySelector(".accordion-head").setAttribute("aria-expanded", false);
  activeTab.dataset.active = "inactive";
  activeTab.querySelector(".accordion-body").style.maxHeight = null;
  activeTab.querySelector(".accordion-body").setAttribute("aria-hidden", true);
}

// Contact Form
const sendMsgBtn = document.getElementById("send-msg-btn");
const errMsgBtn = document.getElementById("close-error-msg");
const errWtlBtn = document.getElementById("close-error-wtlist");
function checkEmpty(val) {
  if (val.length == 0 || val == " ") {
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
    input.style.borderColor = "var(--flash-red)";
    if (input.classList.contains("c-msg")) {
      input.placeholder = "You haven't typed a message!";
      input.classList.add("error");
    }
  } else {
    input.style.borderColor = "var(--text-colour)";
    if (input.classList.contains("c-msg")) {
      input.placeholder = "";
      input.classList.remove("error");
    }
  }
}
function patternCheck() {
  let fieldset = [];
  let values = [];
  let pass = true;
  let noError = true;
  const cName = document.getElementById("c-name");
  const cEmail = document.getElementById("c-email");
  const cMsg = document.getElementById("c-msg");

  fieldset = [
    { checker: nameCheck(cName.value), error: cName },
    { checker: emailCheck(cEmail.value), error: cEmail },
    { checker: checkEmpty(cMsg.value), error: cMsg },
  ];
  values = [{ name: cName.value }, { email: cEmail.value }, { msg: cMsg.value }];

  fieldset.forEach((field) => {
    pass = field.checker;
    if (pass == false) {
      noError = false;
      highlightError(field.error, pass);
    } else {
      highlightError(field.error, pass);
    }
  });
  return [noError, values];
}
function sendMsg(values) {
  const name = values[0].name;
  const email = values[1].email;
  const msg = values[2].msg;
  let sendMsg = $.ajax({
    url: "./assets/services/sendMessage.php",
    type: "POST",
    data: {
      user: name,
      email: email,
      msg: msg,
    },
    dataType: "json",
  });
  sendMsg.fail(function (jqXHR, textStatus) {
    console.error("Something went wrong! (sendMsg)" + textStatus);
    $(".error-msg").fadeIn("fast");
  });
  sendMsg.done(function (data) {
    if (data.error.id == 0) {
      $(".contact-form .formfields").css("display", "none");
      $(".success-msg").css("display", "block");
    }
  });
}

// ****** Start-up Functions ******
// Hide nav list items from screen readers if nav is collapsed on small screens
if (window.innerWidth < 800 && mainNav) {
  mainNav.setAttribute("aria-hidden", true);
}
// Add banner video source depending on browser
// ! Necessary to do this in JS because Firefox on Android would play
// ! .mov instead of .webm when both were listed as <source> elements 
// ! and mov transparency does not work on Firefox
function addVidSource() {
  const movSource = '<source src="assets/video/out.mov" type="video/quicktime">';
  const webmSource = '<source src="assets/video/out.webm" type="video/webm">';
  let safariAgent = navigator.userAgent.toLowerCase().indexOf('safari/') > -1;
  let chromeAgent = navigator.userAgent.indexOf("Chrome") > -1; 
  if ((chromeAgent) && (safariAgent)) safariAgent = false;  
  if (safariAgent) {
    $("#bannerVideo").html(movSource);
  } else {
    $("#bannerVideo").html(webmSource);
  }
}
addVidSource();

// Initialize FAQ
function initializeAccordion() {
  const accordion = document.querySelector(".accordion");
  if (accordion !== null) {
    accordion.addEventListener("click", (e) => {
      const activeTab = e.target.closest(".accordion-tab");
      const headClick = e.target.closest(".accordion-head");
      if (!activeTab) return;
      if (activeTab.dataset.active == "inactive") {
        changeTab(activeTab);
      } else {
        // Only close the tab if they click on the tab head
        if (!headClick) return;
        closeTab(activeTab);
      }
    });
  }
}
// Debounce setup
// https://webdesign.tutsplus.com/tutorials/javascript-debounce-and-throttle--cms-36783
let debounceTimer;
const debounce = (callback, time, param) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time, param);
}
// Set width of About section dividers
function setDividerWidth() {
  const bodyWidth = document.querySelector("body").offsetWidth;
  const containerWidth = document.querySelector(".container").offsetWidth;
  let width = (bodyWidth - containerWidth) / 2 + containerWidth;
  $(".divider").css('--_divider-width', `${width}px`);
}
setDividerWidth(); // Run initially once


// Add globe to about section
const globe = document.getElementById('flash-globe');
if (globe !== null) {
  insertGlobe();
}

// Dark Mode Controls and SVG Handling
// Dark Mode Declarations
const darkTheme = "dark";
const lightTheme = "light";
let theme = darkTheme;
const yellow = "#fff200";
const purple = "#5C42AD";
const green = "#41ad49";
// Globe Declarations
let globeStrokes;
let globeFills;
if (globe !== null) {
  globeStrokes = globe.querySelectorAll(".stroke");
  globeFills = globe.querySelectorAll(".fill");
}
// Lightbulb Declarations
const lightbulb = document.getElementById('lightbulb');
const bulbStrokes = lightbulb.querySelectorAll(".stroke");
const bulbFills = lightbulb.querySelectorAll(".fill");
// Email Icon Declaration
let emailStrokes;
const emailIcon = document.getElementById("icon-email");
if (emailIcon !== null) {
  emailStrokes = emailIcon.querySelectorAll("path");
}

// Dark Mode Toggle
function changeTheme(value) {
  let dmText = document.getElementById("darkmode-text");
  const htmlElement = document.documentElement;
  const bodyElement = document.querySelector("body");
  const root = document.querySelector(':root');

  if (value == lightTheme) {
    theme = lightTheme;
    // New system (for rewards page and newer pages)
    htmlElement.classList.remove("dark-theme");
    root.style.setProperty("--bg-body", "#fff");
    // Old system (for existing pages)
    bodyElement.classList.remove("dark-mode");
    bodyElement.classList.add("light-mode");

    if (dmText !== null) {
      $(dmText).text("Off");
    }
    localStorage.setItem("theme", "light");
  } else {
    theme = darkTheme;
    // New system (for rewards page and newer pages)
    htmlElement.classList.add("dark-theme");
    root.style.setProperty("--bg-body", "#000");
    // Old system (for existing pages)
    bodyElement.classList.remove("light-mode");
    bodyElement.classList.add("dark-mode");

    if (dmText !== null) {
      $(dmText).text("On");
    }
    localStorage.setItem("theme", "dark");
  }
  changeSVGGlobe(theme);
  changeLightbulb(theme);
  changeEmailIcon(theme);
}
// Remember theme preference
if (localStorage.getItem("theme")) {
  changeTheme(localStorage.getItem("theme"));
} else {
  changeTheme("dark");
}

// Globe
function changeSVGGlobe(value) {
  if (globe !== null) {
    let bgColour = window.getComputedStyle(document.body).getPropertyValue('--bg-body');
    let transitionTime = window.getComputedStyle(document.body).getPropertyValue('--_dark-transition');
    if (value == darkTheme) {
      globeStrokes.forEach(stroke => {
        stroke.style.stroke = yellow;
        stroke.style.transition = `stroke ${transitionTime}`;
      });
    } else {
      globeStrokes.forEach(stroke => {
        stroke.style.stroke = purple;
        stroke.style.transition = `stroke ${transitionTime}`;
      });
    }
    globeFills.forEach(fill => {
      fill.style.fill = bgColour;
      fill.style.transition = `fill ${transitionTime}`;
    });
  }
}
// Lightbulb
function changeLightbulb(value) {
  let bgColour = window.getComputedStyle(document.body).getPropertyValue('--bg-body');
  if (value == darkTheme) {
    bulbStrokes.forEach(stroke => {
      stroke.style.stroke = "#fff";
    });
  } else {
    bulbStrokes.forEach(stroke => {
      stroke.style.stroke = "#000";
    });
  }
  bulbFills.forEach(fill => {
    fill.style.fill = bgColour;
  });
}
// Email Icon
function changeEmailIcon(value) {
  if (emailIcon !== null) {
    if (value == darkTheme) {
      emailStrokes.forEach(stroke => {
        stroke.style.stroke = "#fff";
      });
    } else {
      emailStrokes.forEach(stroke => {
        stroke.style.stroke = "#000";
      });
    }
  }
}

// Listen for components loaded event (for pages using component-loader)
document.addEventListener('componentsLoaded', () => {
  initNavigationElements();
  attachMobileMenuListeners();
});

// Attach mobile menu listeners - called after components load
function attachMobileMenuListeners() {
  // Prevent double-attaching
  if (mobileMenuListenersAttached) return;

  // Mobile Navigation Open and Closing
  if (openNavIcon) {
    openNavIcon.addEventListener("click", changeMobileNavState);
  }
  if (closeNavIcon) {
    closeNavIcon.addEventListener("click", changeMobileNavState);
  }

  mobileMenuListenersAttached = true;
}

window.onload = () => {
  // Initialize navigation elements (must be first since components are now loaded)
  // Call again in case componentsLoaded already fired
  initNavigationElements();

  // Register GSAP Plugins
  gsap.registerPlugin(MotionPathPlugin);
  // Set About Card Message
  cardSelect(0);

  // Faq Fetch
  if (document.getElementById('faq') !== null) {
    let faqContent = new AddFaq("./js/faq.json", document.querySelector(".accordion"));
    initializeAccordion();
  }

  // ****** Event Listeners ******
  // Dark Mode Changing
  $('.darkmode-switch').click(function() {
    const currTheme = theme == darkTheme ? lightTheme : darkTheme;
    changeTheme(currTheme);
  });
  const dmSwitch = document.querySelectorAll(".darkmode-switch");
  dmSwitch.forEach(dm => {
    dm.onpointerenter = () => {
      if (theme == darkTheme) {
        bulbStrokes.forEach(stroke => {
          stroke.style.stroke = yellow;
        });
      } else {
        bulbStrokes.forEach(stroke => {
          stroke.style.stroke = green;
        });
        bulbFills.forEach(fill => {
          fill.style.fill = "#000";
        });
      }
    }
    dm.onpointerleave = () => {
      changeLightbulb(theme);
    }
  });

  // Resize Events
  window.addEventListener("resize", () => {
    if (pages != null) {
      debounce(setDividerWidth, 500);
      resizeCanvas();
      cardSelect(0);
    }
  });

  // Scroll Events
  if (pages.length > 0) {
    window.addEventListener("scroll", () => {
      // Change Active Navigation Link
      if (window.scrollY <= pages[0].offsetHeight / 2) {
        prevNav = currentNav;
        currentNav = 0;
      } else {
        for (let i = 1; i < pages.length; i++) {
          if (window.scrollY >= pages[i].offsetTop - pages[i].offsetHeight / 2) {
            prevNav = currentNav;
            currentNav = i;
          }
        }
      }
      if (currentNav != prevNav) {
        for (let i = 0; i < navLinks.length; i++) {
          navLinks[i].classList.remove("active");
          if (i === currentNav) {
            navLinks[i].classList.add("active");
          }
        }
      }
    });
  }
  const aboutPage = document.getElementById("pg-about");
  let gObs = false;
  const globeObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        if(gObs == false) {
          gObs = true;
          globeAnimations();
        }
      }
    });
  }, {threshold: [0.05]});
  if (aboutPage !== null) {
    globeObserver.observe(aboutPage);
  }

  // Attach mobile menu event listeners
  attachMobileMenuListeners();

  // Close mobile menu when clicking non-dropdown nav links
  $(".nav-link:not(.dropdown-trigger)").click(() => {
    if (mainNav) {
      changeMobileNavState();
    }
  });

  // Dropdown Menu Toggle for Mobile
  const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // On mobile (screens ≤ 799px), toggle dropdown on click
      if (window.innerWidth <= 799) {
        e.preventDefault();
        const parentDropdown = trigger.closest('.nav-dropdown');
        const isActive = parentDropdown.classList.contains('active');

        // Close all other dropdowns
        document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
          dropdown.classList.remove('active');
        });

        // Toggle current dropdown
        if (!isActive) {
          parentDropdown.classList.add('active');
        }
      }
    });
  });

  // Close dropdowns when clicking non-dropdown nav links on mobile
  document.querySelectorAll('.nav-link:not(.dropdown-trigger)').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    });
  });

  // Close mobile menu when clicking dropdown links
  document.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 799 && mainNav && mainNav.dataset.mobState === "open") {
        changeMobileNavState();
      }
    });
  });

  // Send Message
  if (sendMsgBtn !== null) {
    sendMsgBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const checkResult = patternCheck("msg");
      if (checkResult[0]) {
        sendMsg(checkResult[1]);
      }
    });
  }
  // Close Form Error
  if (errMsgBtn !== null) {
    errMsgBtn.addEventListener("click", (e) => {
      e.preventDefault();
      $(".error-msg").fadeOut("fast");
    });
  }

  // ****** Animations ******
  // Lightning Animation Start-up
  if (document.getElementById("lightning-storm") !== null) {
    observer.observe(cvsStorm);
    requestAnimationFrame(animate);
    startLightning(stormInterval);
  }

  // Globe Animations
  gsap.set("#ticker_user", {transformOrigin: "left top"});
  gsap.set("#user", {transformOrigin: "center center"});
  gsap.set("#ticker_merchant", {transformOrigin: "left bottom"});
  gsap.set("#merchant", {transformOrigin: "center center"});

  let bubbleRun = gsap.timeline({repeat: 1, yoyo: true, onComplete: playTicker, onCompleteParams: [true]});
  let boltFloat = gsap.timeline({repeat: -1, repeatRefresh: true, yoyo: true});
  let tickerFloat = gsap.timeline();
  tickerFloat.pause();

  function globeAnimations() {
    // Stop the observer after first time globe enters viewport
    if (gObs) {
      globeObserver.unobserve(aboutPage);
    }
    // Animations
    bubbleRun.to("#bubble_dollar", {
      duration: 1.2,
      ease: "power2.inOut",
      motionPath: {
        path: "#dollar_path",
        align: "#dollar_path",
        alignOrigin: [0.35, 0.3],
      }
    })
    .to("#bubble_bitcoin", {
      duration: 1.2,
      ease: "power2.inOut",
      motionPath: {
        path: "#bitcoin_path",
        align: "#bitcoin_path",
        alignOrigin: [0.5, 0.25]
      }
    }, "<.5");
    
    boltFloat.to("#bolt", {
      duration: 1,
      x: "random(-50, -20, 5)",
      y: "random(-50, -20, 5)",
      ease: "power1.inOut"
    })
    .to("#bolt", {
      duration: 1,
      x: "random(50, 20, 5)",
      y: "random(20, 50, 5)",
      ease: "power1.inOut"
    });
    
    const tickerDuration = 2;
    tickerFloat.to("#ticker_user", {
      duration: tickerDuration,
      rotation: 180,
      ease: "power1.inOut"
    })
    .to("#user", {
      duration: tickerDuration,
      rotation: -180,
      ease: "power1.inOut"
    }, 0)
    .to("#ticker_merchant", {
      duration: tickerDuration,
      rotation: 180,
      ease: "power1.inOut"
    }, "<.4")
    .to("#merchant", {
      duration: tickerDuration,
      rotation: -180,
      ease: "power1.inOut"
    }, "<")
    .to("#ticker_merchant", {
      duration: tickerDuration,
      rotation: 0,
      ease: "power1.inOut"
    })
    .to("#merchant", {
      duration: tickerDuration,
      rotation: 0,
      ease: "power1.inOut"
    }, "<")
    .to("#ticker_user", {
      duration: tickerDuration,
      rotation: 0,
      ease: "power1.inOut"
    }, "<.4")
    .to("#user", {
      duration: tickerDuration,
      rotation: 0,
      ease: "power1.inOut"
    }, "<")
    .call(playTicker, [false]);
  }

  function playTicker(state) {
    if (state) {
      tickerFloat.play();
      playBubbleRun(false);
    } else {
      tickerFloat.pause(0);
      playBubbleRun(true);
    }
  }
  function playBubbleRun(state) {
    state ? bubbleRun.restart() : bubbleRun.pause(0);
  }
};