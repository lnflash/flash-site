// This is the JS file for the lightning animations

// Check dark mode state
let darkMode = false;
const checkMode = () => {
  if (sessionStorage.getItem('theme')== 'light') {
    return false;
  }
  return true;
}

// Canvas lightning animation based a combination of two methods:
// "Make it Flash" by Sooraj (PS), found at https://dev.to/soorajsnblaze333/make-it-flash-lightning-with-canvas-43nh
// "Create lightnings with JavaScript and HTML5" by Balint, found at https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas

const cvsStorm = document.getElementById('lightning-storm');
const ctxStorm = cvsStorm.getContext('2d');
const cvsMtn = document.getElementById('mtn-lightning');
const ctxMtn = cvsMtn.getContext('2d');
const cvsCnt = document.getElementById('lightning-contact');
const ctxCnt = cvsCnt.getContext('2d');
let currentCvs = cvsStorm;
let currentCtx = ctxStorm;
let canvasPositions = [true, false, false];
let canvasHeight = cvsStorm.height;
let canvasWidth = cvsStorm.width;

const minSegmentHeight = 5;
let groundHeight = canvasHeight - 20;
const lightningThickness = 5;
const roughness = 2;
let maxDifference = canvasWidth / 5;
let opacity = 1;

let lightningInterval;
const stormInterval = 4500;
const strikeInterval = 8000;
let lightning = [];

function resizeCanvas() {
  let stormCvsHeight = document.getElementById('pg-download').offsetHeight;
  let stormCvsWidth = document.body.offsetWidth;
  let mtnCvsHeight = document.getElementById('about-modes').offsetHeight;
  let mtnCvsWidth = document.getElementById('mtn-img-container').offsetWidth;
  let cntCvsHeight = document.getElementById('forms-bg').offsetHeight;
  let cntCvsWidth = document.getElementById('forms-bg').offsetWidth;

  cvsStorm.setAttribute('height', stormCvsHeight);
  cvsStorm.setAttribute('width', stormCvsWidth);
  cvsMtn.setAttribute('height', mtnCvsHeight);
  cvsMtn.setAttribute('width', mtnCvsWidth);
  cvsCnt.setAttribute('height', cntCvsHeight);
  cvsCnt.setAttribute('width', cntCvsWidth);
  changeCanvas(currentCvs, currentCtx);
}
resizeCanvas();

function changeCanvas(canvas, context) {
  currentCvs = canvas;
  currentCtx = context;
  canvasHeight = canvas.height;
  canvasWidth = canvas.width;
  groundHeight = canvasHeight;
  maxDifference = canvasWidth / 5;
}
changeCanvas(cvsStorm, ctxStorm);

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
  currentCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  currentCtx.beginPath();
}

function draw(lightning, opacity) {
  const colorLight = `hsla(180, 80%, 80%, ${opacity})`;
  const colorDark = `hsla(187, 100%, 89%, ${opacity})`;
  const shadowLight = "hsl(180, 80%, 80%)";
  const shadowDark = "hsl(187, 100%, 89%)";
  let color;
  let shadowColor;
  darkMode = checkMode();
  darkMode ? color = colorDark : color = colorLight;
  darkMode ? shadowColor = shadowDark : shadowColor = shadowLight;
  currentCtx.strokeStyle = color;
  currentCtx.shadowColor = shadowColor;
  currentCtx.globalCompositeOperation = "lighter";
  currentCtx.shadowBlur = 15;
  currentCtx.beginPath();
  currentCtx.lineWidth = lightningThickness;
  for (var i = 0; i < lightning.length; i++) {
    currentCtx.lineTo(lightning[i].x, lightning[i].y);
  }
  currentCtx.stroke();
}

// class Lightning {
//   constructor(x1, y1, x2, y2, thickness, opacity) {
//     this.start = createVector(x1, y1);
//     this.end = createVector(x2, y2);
//     this.thickness = thickness;
//     this.opacity = opacity;
//   }
//   draw() {
//     return line(this.start, this.end, this.thickness, this.opacity);
//   }
// }

function render() {
  var lightning = createLightning();
  opacity = 1;
  draw(lightning, opacity);
}

function createLightning() {
  let top = {x: getRandomInteger(2, canvasWidth - 2), y: 0}
  let segmentHeight = groundHeight - top.y;
  lightning = [];
  // Starting point of the lightning strike
  lightning.push({x: top.x, y: top.y});
  // Ending point of the lightning strike
  lightning.push({x: Math.random() * (canvasWidth - 100) + 50, y: groundHeight});
  let currDiff = maxDifference;
  while (segmentHeight > minSegmentHeight) {
    var newSegments = [];
    for (let i = 0; i < lightning.length - 1; i++) {
      const start = lightning[i];
      const end = lightning[i + 1];
      const midX = (start.x + end.x) / 2;
      const newX = midX + (Math.random() * 2 - 1) * currDiff;
      newSegments.push(start, {x: newX, y: (start.y + end.y) / 2});
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

const animate = function() {
  // Fade out the lightning strike
  clearCanvas();

  opacity -= 0.01;
  draw(lightning, opacity);
  requestAnimationFrame(animate);
}

function startLightning(interval) {
  clearInterval(lightningInterval);
  lightningInterval = setInterval(function() {
    let delay = timing();
    setTimeout(() => {
      render();
    }, delay);
  }, interval);
}

// Switching canvas based on which canvas is in viewport
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry => {
    if(entry.target == cvsStorm) {
      canvasPositions[0] = entry.isIntersecting;
    }
    if(entry.target == cvsMtn) {
      canvasPositions[1] = entry.isIntersecting;
    }
    if(entry.target == cvsCnt) {
      canvasPositions[2] = entry.isIntersecting;
    }
  });
  chooseCanvas();
}, {threshold: [0.05]});

// observer.observe(cvsStorm);
// observer.observe(cvsMtn);
// observer.observe(cvsCnt);

function chooseCanvas() {
  let stormVisible = canvasPositions[0];
  let mtnVisible = canvasPositions[1];
  let cntVisible = canvasPositions[2];

  // console.log('Storm Visible? ' + stormVisible + ' Mtn Visible? ' + mtnVisible);

  if(stormVisible && mtnVisible) {
    changeCanvas(cvsStorm, ctxStorm);
    startLightning(stormInterval);
  } else if (stormVisible && !mtnVisible) {
    changeCanvas(cvsStorm, ctxStorm);
    startLightning(stormInterval);
  } else if (!stormVisible && mtnVisible) {
    changeCanvas(cvsMtn, ctxMtn);
    startLightning(strikeInterval);
  } else if (cntVisible) {
    changeCanvas(cvsCnt, ctxCnt);
    startLightning(strikeInterval);
  } else {
    return;
  }
}
