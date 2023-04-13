// This is the JS file for the lightning animations

// Check dark mode state
let darkMode = false;
const checkMode = () => {
  if (sessionStorage.getItem('theme')== 'light') {
    return false;
  }
  return true;
}

// Canvas lightning animation based on code by Sooraj (PS),
// found at https://dev.to/soorajsnblaze333/make-it-flash-lightning-with-canvas-43nh

const cvsStorm = document.getElementById('lightning-storm');
const ctxStorm = cvsStorm.getContext('2d');
const cvsMtn = document.getElementById('mtn-lightning');
const ctxMtn = cvsMtn.getContext('2d');
const cvsCnt = document.getElementById('lightning-contact');
const ctxCnt = cvsCnt.getContext('2d');
let currentCvs = cvsStorm;
let currentCtx = ctxStorm;
let canvasPositions = [true, false, false];

const lightningStrikeOffset = 8;
const lightningStrikeLength = 400;
const lightningBoltLength = 8;
const lightningThickness = 4;
let lightningInterval;
let canvasHeight = cvsStorm.height;
let canvasWidth = cvsStorm.width;
let height;
let width;

const stormInterval = 4500;
const strikeInterval = 8000;
// let interval = stormInterval;
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
// $(window).on('resize', function(){
//   resizeCanvas();
// });
resizeCanvas();

function changeCanvas(canvas, context) {
  currentCvs = canvas;
  currentCtx = context;
  height = canvasHeight = canvas.height;
  width = canvasWidth = canvas.width;
}
changeCanvas(cvsStorm, ctxStorm);

// Lightning Animation

const createVector = function(x, y) { return { x, y } }

const getRandomFloat = function(min, max) {
  const random = Math.random() * (max - min + 1) + min;
  return random;
}

const getRandomInteger = function(min, max) {
  return Math.floor(getRandomFloat(min, max)); 
}

const clearCanvas = function(x, y, height, width) {
  rectX = x || 0;
  rectY = y || 0;
  rectHeight = height || canvasHeight;
  rectWidth = width || canvasWidth;
  currentCtx.clearRect(rectX, rectY, rectWidth, rectHeight);
  currentCtx.beginPath();
}

const line = function(start, end, thickness, opacity) {
  const lightningForDarkMode = `rgba(255, 255, 255, ${opacity})`;
  const lightningForLightMode = `rgba(198, 248, 255, ${opacity})`;
  let strokeStyle = lightningForLightMode;
  darkMode = checkMode();
  darkMode ? strokeStyle = lightningForDarkMode : strokeStyle = lightningForLightMode;
  currentCtx.beginPath();
  currentCtx.moveTo(start.x, start.y);
  currentCtx.lineTo(end.x, end.y);
  currentCtx.lineWidth = thickness;
  currentCtx.strokeStyle = strokeStyle;
  currentCtx.shadowBlur = 20;
  currentCtx.shadowColor = "#C6F8FF";
  currentCtx.stroke();
  currentCtx.closePath();
}

class Lightning {
  constructor(x1, y1, x2, y2, thickness, opacity) {
    this.start = createVector(x1, y1);
    this.end = createVector(x2, y2);
    this.thickness = thickness;
    this.opacity = opacity;
  }
  draw() {
    return line(this.start, this.end, this.thickness, this.opacity);
  }
}

const timing = function() {
  return (Math.floor(Math.random() * 8) + 1) * 500;
}

const createLightning = function() {
  lightning = [];
  // interval = timing();
  let lightningX1 = getRandomInteger(2, canvasWidth - 2);
  let lightningX2 = getRandomInteger(lightningX1 - lightningStrikeOffset, lightningX1 + lightningStrikeOffset);
  lightning[0] = new Lightning(lightningX1, 0, lightningX2, lightningBoltLength, lightningThickness, 1);
  for (let l = 1; l < lightningStrikeLength; l++) {
    // if l = ? then run function to get random number
    // if number is less than 3 then fork the lightning.
    // let f = 1
    //fx1 = lx1, fy1 = lastBolt.end.y, etc.
    // do another push with f values?
    let lastBolt = lightning[l - 1];
    let lx1 = lastBolt.end.x;
    let lx2 = getRandomInteger(lx1 - lightningStrikeOffset, lx1 + lightningStrikeOffset);
    lightning.push(new Lightning(
      lx1, 
      lastBolt.end.y, 
      lx2, 
      lastBolt.end.y + lightningBoltLength, 
      lastBolt.thickness, 
      lastBolt.opacity
    ));
  }
}

const setup = function() {
  createLightning();
  for (let i = 0 ; i < lightning.length ; i++) {
    lightning[i].draw();
  }
}

const animate = function() {
  clearCanvas();

  for (let i = 0 ; i < lightning.length ; i++) {
    lightning[i].opacity -= 0.01;
    lightning[i].thickness -= 0.05;
    if (lightning[i].thickness <= 2) {
      lightning[i].end.y -= 0.05;
    }
    lightning[i].draw();
  }

  requestAnimationFrame(animate);
}

// setup();
// requestAnimationFrame(animate);
// setInterval(function() {
//   let delay = timing();
//   setTimeout(() => {
//     createLightning();
//   }, delay);
// }, interval);

function startLightning(interval) {
  clearInterval(lightningInterval);
  lightningInterval = setInterval(function() {
    let delay = timing();
    setTimeout(() => {
      createLightning();
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
