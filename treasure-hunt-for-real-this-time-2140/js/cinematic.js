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
    glitchDuration: 150,     // ms for glitch effect
    transitionDuration: 1500 // ms for dramatic boot→video transition
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

  // ===== AUDIO CONTEXT FOR MATRIX SOUNDS =====
  let audioContext = null;
  
  function initAudio() {
    if (audioContext) return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }
  
  // Matrix-style keystroke sound
  function playKeystroke() {
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      // Random frequency for variety (like different keys)
      const baseFreq = 800 + Math.random() * 400;
      oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05);
      
      // Square wave for that digital click
      oscillator.type = 'square';
      
      // High-pass filter for crisp sound
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(500, audioContext.currentTime);
      
      // Quick attack and decay
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  }
  
  // Dramatic transition sound (whoosh + digital burst)
  function playTransitionSound() {
    if (!audioContext) return;
    
    try {
      // Create white noise for static burst
      const bufferSize = audioContext.sampleRate * 0.3;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = noiseBuffer;
      
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
      
      noiseGain.gain.setValueAtTime(0.15, audioContext.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      // Low rumble sweep
      const sweep = audioContext.createOscillator();
      const sweepGain = audioContext.createGain();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(150, audioContext.currentTime);
      sweep.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.5);
      sweepGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      sweep.connect(sweepGain);
      sweepGain.connect(audioContext.destination);
      
      noise.start(audioContext.currentTime);
      sweep.start(audioContext.currentTime);
      sweep.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silently fail
    }
  }

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
    
    // Track user interaction for autoplay and init audio
    document.addEventListener('click', () => { 
      hasInteracted = true; 
      initAudio();
    }, { once: true });
    document.addEventListener('touchstart', () => { 
      hasInteracted = true;
      initAudio();
    }, { once: true });
    
    // Try to init audio immediately (may be blocked until interaction)
    initAudio();
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
        playKeystroke();
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

  // ===== DRAMATIC VIDEO TRANSITION =====
  function transitionToVideo() {
    const container = document.querySelector('.boot-container');
    
    // Phase 1: Intense glitch and screen corruption
    bootScreen.classList.add('transmission-burst');
    if (container) {
      container.classList.add('terminal-explode');
    }
    
    // Play transition sound
    playTransitionSound();
    
    // Phase 2: Flash white and add digital particles
    setTimeout(() => {
      createDigitalParticles();
      bootScreen.classList.add('white-flash');
    }, 300);
    
    // Phase 3: Static burst
    setTimeout(() => {
      bootScreen.classList.add('static-burst');
    }, 500);
    
    // Phase 4: Fade to black then reveal video
    setTimeout(() => {
      bootScreen.classList.add('fade-out');
    }, 800);
    
    setTimeout(() => {
      videoScreen.classList.add('visible');
      
      setTimeout(() => {
        videoScreen.classList.add('cinematic');
      }, 300);
      
      playVideo();
      
      setTimeout(() => {
        if (skipBtn) skipBtn.classList.add('visible');
      }, CONFIG.skipButtonDelay);
      
    }, CONFIG.transitionDuration);
  }
  
  function createDigitalParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'digital-particles';
    bootScreen.appendChild(particleContainer);
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 0.3 + 's';
      particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
      particle.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
      particleContainer.appendChild(particle);
    }
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
