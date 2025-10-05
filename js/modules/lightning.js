// This is the JS file for the lightning animations

// Check dark mode state
let darkMode = false;
const checkMode = () => {
  if (sessionStorage.getItem("theme") == "light") {
    return false;
  }
  return true;
};

// Canvas lightning animation based on a combination of two methods:
// "Make it Flash" by Sooraj (PS), found at https://dev.to/soorajsnblaze333/make-it-flash-lightning-with-canvas-43nh
// "Create lightnings with JavaScript and HTML5" by Balint, found at https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas

const cvsStorm = document.getElementById("lightning-storm");
const ctxStorm = cvsStorm.getContext("2d");

let canvasVisible = true;
let canvasHeight = cvsStorm.height;
let canvasWidth = cvsStorm.width;

const minSegmentHeight = 5;
let groundHeight = canvasHeight;
const lightningThickness = 5;
const roughness = 2;
let maxDifference = canvasWidth / 5;
let opacity = 1;

let lightningInterval;
const stormInterval = 4500;
const strikeInterval = 8000;
let lightning = [];
let lightningSplit = [];
let hasFork = false;

function resizeCanvas() {
  let stormCvsHeight = window.screen.height;
  let stormCvsWidth = document.body.offsetWidth;

  cvsStorm.setAttribute("height", stormCvsHeight);
  cvsStorm.setAttribute("width", stormCvsWidth);
  canvasHeight = stormCvsHeight;
  canvasWidth = stormCvsWidth;
  groundHeight = canvasHeight;
  maxDifference = canvasWidth / 5;
}
resizeCanvas();

// Lightning Animation
function getRandomInteger(min, max) {
  const buffer = new Uint32Array(1);
  window.crypto.getRandomValues(buffer);
  let random = buffer[0] / (0xffffffff + 1);
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(random * (max - min + 1)) + min;
}
function timing() {
  return (Math.floor(Math.random() * 8) + 1) * 500;
}

function clearCanvas() {
  ctxStorm.clearRect(0, 0, canvasWidth, canvasHeight);
  ctxStorm.beginPath();
}

function draw(ln, spl, opacity) {
  const colorLight = `hsla(180, 80%, 80%, ${opacity})`;
  const colorDark = `hsla(187, 100%, 89%, ${opacity})`;
  const shadowLight = "hsl(180, 80%, 80%)";
  const shadowDark = "hsl(187, 100%, 89%)";
  let color;
  let shadowColor;
  darkMode = checkMode();
  darkMode ? (color = colorDark) : (color = colorLight);
  darkMode ? (shadowColor = shadowDark) : (shadowColor = shadowLight);
  line(ln, color, shadowColor);
  if (spl.length > 0) {
    line(spl, color, shadowColor);
  }
}
function line(ln, color, shadowColor) {
  ctxStorm.strokeStyle = color;
  ctxStorm.shadowColor = shadowColor;
  ctxStorm.globalCompositeOperation = "lighter";
  ctxStorm.shadowBlur = 15;
  ctxStorm.beginPath();
  ctxStorm.lineWidth = lightningThickness;
  for (var i = 0; i < ln.length; i++) {
    ctxStorm.lineTo(ln[i].x, ln[i].y);
  }
  ctxStorm.stroke();
}

function forkChance() {
  const chance = 0.3;
  if (Math.random() <= chance) {
    return true;
  }
  return false;
}

function render() {
  lightning = createLightning();
  opacity = 1;
  hasFork = forkChance();
  lightningSplit = []; // reset the lightning split
  if (hasFork) {
    // choose where the lightning splits from main branch
    const minStart = lightning.length * 0.4;
    const maxStart = lightning.length * 0.7;
    splitTop = lightning[getRandomInteger(minStart, maxStart)];
    lightningSplit = createSplit(splitTop.x, splitTop.y);
  }
  // draw the lightning
  draw(lightning, lightningSplit, opacity);

  // Easter egg messages
  // Uncomment to enable random console messages

  const logMessages = [
    "code for the rabbit hole is 69420",
    "you are not alone",
    "there is no spoon",
    "wake up, sons and daughters",
    "the cake is a lie",
    "the answer is 42",
    "dont panic",
    "are you lost?",
    "you are not lost",
    "we are all Satoshi",
    "the revolution is decentralized",
    "who the cap fit",
    "we gotta chase dem crazy",
    "you cant run away from yourself",
    "the truth is out there",
    "one one cocoa full basket",
    "yes i am a pirate",
    "i love you too",
  ];
  const logMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
  console.log(logMessage);
}

function createLightning() {
  let top = { x: getRandomInteger(2, canvasWidth - 2), y: 0 };
  let segmentHeight = groundHeight - top.y;
  lightning = [];
  // Starting point of the lightning strike
  lightning.push({ x: top.x, y: top.y });
  // Ending point of the lightning strike
  lightning.push({ x: Math.random() * (canvasWidth - 100) + 50, y: groundHeight });
  let currDiff = maxDifference;
  while (segmentHeight > minSegmentHeight) {
    let newSegments = [];
    for (let i = 0; i < lightning.length - 1; i++) {
      const start = lightning[i];
      const end = lightning[i + 1];
      const midX = (start.x + end.x) / 2;
      const newX = midX + (Math.random() * 2 - 1) * currDiff;
      newSegments.push(start, { x: newX, y: (start.y + end.y) / 2 });
    }
    // Add the ending point to the segment array
    newSegments.push(lightning.pop());
    // Update the lightning strike with the new segments;
    lightning = newSegments;

    currDiff /= roughness;
    segmentHeight /= 2;
  }
  return lightning;
}
function createSplit(x, y) {
  let top = { x: x, y: y };
  let segmentHeight = groundHeight - top.y;
  lightningSplit = [];
  // Starting point of the lightning strike fork
  lightningSplit.push({ x: top.x, y: top.y });
  // Ending point of the lightning strike fork
  lightningSplit.push({ x: Math.random() * (canvasWidth - 100) + 50, y: groundHeight });
  let currDiff = maxDifference;
  while (segmentHeight > minSegmentHeight) {
    let newSegments = [];
    for (let i = 0; i < lightningSplit.length - 1; i++) {
      const start = lightningSplit[i];
      const end = lightningSplit[i + 1];
      const midX = (start.x + end.x) / 2;
      const newX = midX + (Math.random() * 2 - 1) * currDiff;
      newSegments.push(start, { x: newX, y: (start.y + end.y) / 2 });
    }
    // Add the ending point to the segment array
    newSegments.push(lightningSplit.pop());
    // Update the lightning strike with the new segments;
    lightningSplit = newSegments;

    currDiff /= roughness;
    segmentHeight /= 2;
  }
  return lightningSplit;
}

const animate = function () {
  // Fade out the lightning strike
  clearCanvas();
  opacity -= 0.01;
  draw(lightning, lightningSplit, opacity);
  requestAnimationFrame(animate);
};

function startLightning(interval) {
  clearInterval(lightningInterval);
  lightningInterval = setInterval(function () {
    let delay = timing();
    setTimeout(() => {
      render();
    }, delay);
  }, interval);
}

// Switching canvas based on which canvas is in viewport
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.target == cvsStorm) {
        canvasVisible = entry.isIntersecting;
      }
    });
    chooseCanvas();
  },
  { threshold: [0.05] }
);

function chooseCanvas() {
  let stormVisible = canvasVisible;

  if (stormVisible) {
    startLightning(stormInterval);
  } else {
    return;
  }
}
