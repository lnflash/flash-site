// This is the JS file for the lightning animations

// Canvas lightning animation based on code by Sooraj (PS),
// found at https://dev.to/soorajsnblaze333/make-it-flash-lightning-with-canvas-43nh

// Check dark mode state
let darkMode = false;
const checkMode = () => {
  if (sessionStorage.getItem('theme')== 'light') {
    return false;
  }
  return true;
}

const cvsStorm = document.getElementById('lightning-storm');
const ctxStorm = cvsStorm.getContext('2d');

const lightningStrikeOffset = 6;
const lightningStrikeLength = 100;
const lightningBoltLength = 30;
const lightningThickness = 3;
let canvasHeight = cvsStorm.height;
let canvasWidth = cvsStorm.width;
let height;
let width;

// Canvas Resizing
function resizeCanvas() {
  height = canvasHeight = document.getElementById('pg-download').offsetHeight;
  width = canvasWidth = document.body.offsetWidth;
  cvsStorm.setAttribute('height', height);
  cvsStorm.setAttribute('width', width);
}
$(window).on('resize', function(){
  resizeCanvas();
});
resizeCanvas();

// window.onload = () => {

  // Storm Animation

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
    ctxStorm.clearRect(rectX, rectY, rectWidth, rectHeight);
    ctxStorm.beginPath();
  }

  const line = function(start, end, thickness, opacity) {
    const lightningForDarkMode = `rgba(255, 255, 255, ${opacity})`;
    const lightningForLightMode = `rgba(0, 0, 0, ${opacity})`;
    let strokeStyle = lightningForLightMode;
    darkMode = checkMode();
    darkMode ? strokeStyle = lightningForDarkMode : strokeStyle = lightningForLightMode;
    ctxStorm.beginPath();
    ctxStorm.moveTo(start.x, start.y);
    ctxStorm.lineTo(end.x, end.y);
    ctxStorm.lineWidth = thickness;
    ctxStorm.strokeStyle = strokeStyle;
    ctxStorm.shadowBlur = 0;
    ctxStorm.shadowColor = "#bd9df2";
    ctxStorm.stroke();
    ctxStorm.closePath();
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

  let interval = 3000;
  let lightning = [];

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

  setup();
  requestAnimationFrame(animate);
  setInterval(function() {
    let delay = timing();
    setTimeout(() => {
      createLightning();
    }, delay);
  }, interval);
// }