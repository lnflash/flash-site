/**
 * KOTC Cinematic Landing Page
 * Boot Sequence → Video Reveal → Main Content
 */

(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    bootDuration: 4500,      // Total boot sequence time
    typingSpeed: 30,         // ms per character
    lineDelay: 600,          // ms between lines
    videoFadeIn: 800,        // ms for video fade in
    skipButtonDelay: 3000,   // ms before skip button appears
    glitchDuration: 150      // ms for glitch effect
  };

  // Boot sequence messages
  const BOOT_MESSAGES = [
    { text: '> VAULT PROTOCOL v2.1.40 INITIALIZING...', delay: 0 },
    { text: '> ESTABLISHING ENCRYPTED P2P CONNECTION...', delay: 700 },
    { text: '> SCANNING CARIBBEAN COORDINATES...', delay: 1400 },
    { text: '> DECRYPTING SATOSHI ARCHIVE FRAGMENTS...', delay: 2100 },
    { text: '> 7 KEYS DETECTED — VAULT SEALED', delay: 2800, style: 'warning' },
    { text: '> SIGNAL ACQUIRED ■■■ TRANSMISSION INCOMING', delay: 3500, style: 'highlight', glitch: true }
  ];

  // ===== DOM ELEMENTS =====
  let bootScreen, videoScreen, mainScreen;
  let bootMessages, progressFill, progressText;
  let video, skipBtn, unmuteIndicator;

  // ===== STATE =====
  let currentLine = 0;
  let progress = 0;
  let isVideoPlaying = false;
  let hasInteracted = false;

  // ===== INITIALIZATION =====
  function init() {
    // Get DOM elements
    bootScreen = document.getElementById('boot-screen');
    videoScreen = document.getElementById('video-screen');
    mainScreen = document.getElementById('main-screen');
    bootMessages = document.getElementById('boot-messages');
    progressFill = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    video = document.getElementById('trailer-video');
    skipBtn = document.getElementById('skip-btn');
    unmuteIndicator = document.getElementById('unmute-indicator');

    // Start boot sequence
    startBootSequence();
    
    // Event listeners
    if (skipBtn) {
      skipBtn.addEventListener('click', skipToMain);
    }
    
    if (video) {
      video.addEventListener('ended', onVideoEnd);
      video.addEventListener('click', toggleMute);
    }
    
    if (unmuteIndicator) {
      unmuteIndicator.addEventListener('click', unmute);
    }
    
    // Track user interaction for autoplay
    document.addEventListener('click', () => { hasInteracted = true; }, { once: true });
    document.addEventListener('touchstart', () => { hasInteracted = true; }, { once: true });
  }

  // ===== BOOT SEQUENCE =====
  function startBootSequence() {
    // Start progress bar animation
    animateProgress();
    
    // Display boot messages with typing effect
    displayBootMessages();
    
    // Schedule transition to video
    setTimeout(transitionToVideo, CONFIG.bootDuration);
  }

  function displayBootMessages() {
    BOOT_MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        addBootLine(msg.text, msg.style, msg.glitch);
      }, msg.delay);
    });
  }

  function addBootLine(text, style, shouldGlitch) {
    const line = document.createElement('div');
    line.className = 'boot-line';
    if (style) line.classList.add(style);
    
    bootMessages.appendChild(line);
    
    // Trigger glitch effect
    if (shouldGlitch) {
      triggerGlitch();
    }
    
    // Typing effect
    typeText(line, text, () => {
      line.classList.add('visible');
      line.classList.remove('typing');
    });
  }

  function typeText(element, text, callback) {
    let i = 0;
    element.classList.add('typing', 'visible');
    
    function type() {
      if (i < text.length) {
        element.textContent = text.substring(0, i + 1);
        i++;
        setTimeout(type, CONFIG.typingSpeed);
      } else {
        if (callback) callback();
      }
    }
    
    type();
  }

  function animateProgress() {
    const startTime = Date.now();
    const duration = CONFIG.bootDuration - 500; // Leave room for final transition
    
    function update() {
      const elapsed = Date.now() - startTime;
      progress = Math.min((elapsed / duration) * 100, 100);
      
      if (progressFill) {
        progressFill.style.width = progress + '%';
      }
      if (progressText) {
        progressText.textContent = Math.floor(progress) + '%';
      }
      
      if (progress < 100) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  function triggerGlitch() {
    const container = document.querySelector('.boot-container');
    if (container) {
      container.classList.add('glitch');
      container.setAttribute('data-text', 'SIGNAL ACQUIRED');
      
      // Flash effect
      container.style.filter = 'brightness(2)';
      setTimeout(() => {
        container.style.filter = '';
      }, 50);
      
      // Screen shake
      document.body.style.transform = 'translate(-2px, 2px)';
      setTimeout(() => {
        document.body.style.transform = 'translate(2px, -2px)';
      }, 50);
      setTimeout(() => {
        document.body.style.transform = '';
        container.classList.remove('glitch');
      }, CONFIG.glitchDuration);
    }
  }

  // ===== VIDEO TRANSITION =====
  function transitionToVideo() {
    // Fade out boot screen
    bootScreen.classList.add('fade-out');
    
    setTimeout(() => {
      // Show video screen
      videoScreen.classList.add('visible');
      
      // Add cinematic letterbox after a moment
      setTimeout(() => {
        videoScreen.classList.add('cinematic');
      }, 300);
      
      // Try to play video
      playVideo();
      
      // Show skip button after delay
      setTimeout(() => {
        if (skipBtn) skipBtn.classList.add('visible');
      }, CONFIG.skipButtonDelay);
      
    }, 800);
  }

  function playVideo() {
    if (!video) {
      // No video element, go straight to main
      setTimeout(skipToMain, 1000);
      return;
    }
    
    // Try to play with sound first
    video.muted = false;
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Video is playing with sound
        isVideoPlaying = true;
      }).catch(error => {
        // Autoplay with sound failed, try muted
        console.log('Autoplay with sound failed, trying muted...');
        video.muted = true;
        video.play().then(() => {
          isVideoPlaying = true;
          // Show unmute indicator
          if (unmuteIndicator) {
            unmuteIndicator.classList.add('visible');
          }
        }).catch(err => {
          console.log('Video autoplay failed completely:', err);
          // Show play button or skip to main
          skipToMain();
        });
      });
    }
  }

  function toggleMute() {
    if (video) {
      video.muted = !video.muted;
      if (!video.muted && unmuteIndicator) {
        unmuteIndicator.classList.remove('visible');
      }
    }
  }

  function unmute() {
    if (video) {
      video.muted = false;
      if (unmuteIndicator) {
        unmuteIndicator.classList.remove('visible');
      }
    }
  }

  function onVideoEnd() {
    transitionToMain();
  }

  // ===== MAIN CONTENT TRANSITION =====
  function skipToMain() {
    if (video) {
      video.pause();
    }
    transitionToMain();
  }

  function transitionToMain() {
    // Fade out video screen
    videoScreen.classList.add('fade-out');
    
    setTimeout(() => {
      // Show main screen
      mainScreen.classList.add('visible');
    }, 500);
  }

  // ===== UTILITY FUNCTIONS =====
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // ===== EASTER EGG CONSOLE =====
  function showConsoleEasterEgg() {
    const styles = {
      title: 'background: linear-gradient(90deg, #28fe14, #00ffff); color: #000; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 4px;',
      text: 'color: #28fe14; font-size: 14px;',
      gold: 'color: #F6C453; font-size: 16px; font-weight: bold;'
    };
    
    console.log('%c⚡ KEYS OF THE CARIBBEAN ⚡', styles.title);
    console.log('%c\n"The rabbit hole opens for those who know Satoshi\'s address..."', styles.gold);
    console.log('%c\nSearch wisely: satoshin@getflash.io', styles.text);
    console.log('%c\n7 stages. 7 keys. 1 vault. $5,000+ in Bitcoin.', styles.text);
    console.log('%cAre you ready to begin the hunt? 🏴‍☠️\n', styles.text);
  }

  // ===== START =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      showConsoleEasterEgg();
    });
  } else {
    init();
    showConsoleEasterEgg();
  }

})();
