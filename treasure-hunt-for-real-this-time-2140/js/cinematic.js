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
  let enterScreen, enterBtn, skipIntroBtn;
  let bootScreen, videoScreen, mainScreen;
  let bootMessages, progressFill, progressText;
  let video, skipBtn, muteBtn;
  let bgMusic;

  // ===== STATE =====
  let currentLine = 0;
  let progress = 0;
  let isVideoPlaying = false;
  let hasInteracted = false;
  let bgMusicStarted = false;
  let musicFadingIn = false;
  const TARGET_VOLUME = 0.1;

  // Use AudioEngine from KOTC Terminal (audio-engine.js)
  function playKeystroke() {
    if (typeof AudioEngine !== 'undefined' && AudioEngine.initialized) {
      AudioEngine.playKeyClick();
    }
  }
  
  async function playTransitionSound() {
    if (typeof AudioEngine !== 'undefined' && AudioEngine.initialized) {
      await AudioEngine.resume();
      const now = AudioEngine.context.currentTime;
      AudioEngine.playCinematicHit(now);
      AudioEngine.createNoise(0.3, now, 0.2);
    }
  }

  function startBackgroundMusic() {
    if (bgMusicStarted || !bgMusic) return;
    
    bgMusic.volume = TARGET_VOLUME;
    bgMusic.loop = true;
    
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        bgMusicStarted = true;
        console.log('[KOTC] Background music started');
      }).catch(err => {
        console.log('[KOTC] Background music autoplay blocked, retrying on next interaction');
        document.addEventListener('click', retryBackgroundMusic, { once: true });
        document.addEventListener('touchstart', retryBackgroundMusic, { once: true });
      });
    }
  }

  function retryBackgroundMusic() {
    if (bgMusicStarted || !bgMusic) return;
    bgMusic.play().then(() => {
      bgMusicStarted = true;
      console.log('[KOTC] Background music started on retry');
    }).catch(() => {});
  }

  function fadeInMusic(duration) {
    if (!bgMusic || !bgMusicStarted || musicFadingIn) return;
    musicFadingIn = true;
    
    const startVolume = bgMusic.volume;
    const startTime = Date.now();
    
    function fade() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      bgMusic.volume = startVolume + (TARGET_VOLUME - startVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        musicFadingIn = false;
      }
    }
    
    requestAnimationFrame(fade);
  }

  function onVideoTimeUpdate() {
    if (!video || !bgMusic || !bgMusicStarted || musicFadingIn) return;
    
    const timeRemaining = video.duration - video.currentTime;
    if (timeRemaining <= 10 && timeRemaining > 0) {
      fadeInMusic(timeRemaining * 1000);
      video.removeEventListener('timeupdate', onVideoTimeUpdate);
    }
  }

  // ===== INITIALIZATION =====
  function init() {
    enterScreen = document.getElementById('enter-screen');
    enterBtn = document.getElementById('enter-btn');
    bootScreen = document.getElementById('boot-screen');
    videoScreen = document.getElementById('video-screen');
    mainScreen = document.getElementById('main-screen');
    bootMessages = document.getElementById('boot-messages');
    progressFill = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    video = document.getElementById('trailer-video');
    skipBtn = document.getElementById('skip-btn');
    muteBtn = document.getElementById('mute-btn');
    bgMusic = document.getElementById('bg-music');

    if (enterBtn) {
      enterBtn.addEventListener('click', startExperience);
    }
    
    skipIntroBtn = document.getElementById('skip-intro-btn');
    if (skipIntroBtn) {
      skipIntroBtn.addEventListener('click', skipIntro);
    }
    
    if (skipBtn) {
      skipBtn.addEventListener('click', skipToMain);
    }
    
    if (video) {
      video.addEventListener('ended', onVideoEnd);
    }
    
    if (muteBtn) {
      muteBtn.addEventListener('click', toggleMute);
    }
  }
  
  function skipIntro() {
    hasInteracted = true;
    
    startBackgroundMusic();
    
    if (enterScreen) {
      enterScreen.classList.add('hidden');
    }
    
    if (bootScreen) {
      bootScreen.classList.add('fade-out');
    }
    
    if (videoScreen) {
      videoScreen.classList.add('fade-out');
    }
    
    mainScreen.classList.add('visible');
    setTimeout(initVolumeControls, 100);
  }

  function startExperience() {
    hasInteracted = true;
    
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.init();
      AudioEngine.resume();
    }
    
    startBackgroundMusic();
    
    if (enterScreen) {
      enterScreen.classList.add('hidden');
    }
    
    startBootSequence();
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
      setTimeout(skipToMain, 1000);
      return;
    }
    
    if (bgMusic && bgMusicStarted) {
      bgMusic.volume = 0;
    }
    
    video.muted = false;
    updateMuteButton();
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isVideoPlaying = true;
        video.addEventListener('timeupdate', onVideoTimeUpdate);
      }).catch(error => {
        console.log('Autoplay with sound failed, trying muted...');
        video.muted = true;
        updateMuteButton();
        video.play().then(() => {
          isVideoPlaying = true;
          video.addEventListener('timeupdate', onVideoTimeUpdate);
        }).catch(err => {
          console.log('Video autoplay failed completely:', err);
          skipToMain();
        });
      });
    }
  }

  function toggleMute() {
    if (video) {
      video.muted = !video.muted;
      updateMuteButton();
    }
  }

  function updateMuteButton() {
    if (muteBtn) {
      if (video && video.muted) {
        muteBtn.classList.add('muted');
      } else {
        muteBtn.classList.remove('muted');
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
    videoScreen.classList.add('fade-out');
    
    if (bgMusic && bgMusicStarted && bgMusic.volume < TARGET_VOLUME) {
      fadeInMusic(2000);
    }
    
    setTimeout(() => {
      mainScreen.classList.add('visible');
      initVolumeControls();
    }, 500);
  }

  // ===== VOLUME CONTROLS =====
  function initVolumeControls() {
    const musicMuteBtn = document.getElementById('music-mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    if (musicMuteBtn) {
      musicMuteBtn.addEventListener('click', toggleBgMusicMute);
      updateMusicMuteButton();
    }
    
    if (volumeSlider && bgMusic) {
      volumeSlider.value = bgMusic.volume * 100;
      volumeSlider.addEventListener('input', onVolumeChange);
    }
  }

  function toggleBgMusicMute() {
    if (!bgMusic) return;
    bgMusic.muted = !bgMusic.muted;
    updateMusicMuteButton();
  }

  function updateMusicMuteButton() {
    const musicMuteBtn = document.getElementById('music-mute-btn');
    if (musicMuteBtn && bgMusic) {
      musicMuteBtn.classList.toggle('muted', bgMusic.muted);
    }
  }

  function onVolumeChange(e) {
    if (!bgMusic) return;
    const volume = e.target.value / 100;
    bgMusic.volume = volume;
    bgMusic.muted = volume === 0;
    updateMusicMuteButton();
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
