/**
 * KEY TERMINAL OS - Audio Engine
 * Cinematic synthesized sound effects using Web Audio API
 * 
 * No external files needed - all sounds are generated programmatically
 */

const AudioEngine = {
    context: null,
    masterGain: null,
    initialized: false,
    
    /**
     * Initialize the audio context (must be called after user interaction)
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.context.destination);
            this.initialized = true;
            console.log('[AudioEngine] Initialized');
        } catch (e) {
            console.warn('[AudioEngine] Web Audio API not supported:', e);
        }
    },
    
    /**
     * Resume audio context if suspended (browser autoplay policy)
     */
    async resume() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    },
    
    /**
     * Create an oscillator with envelope
     */
    createOscillator(type, frequency, startTime, duration, gainValue = 0.3) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = type;
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        return { osc, gain };
    },
    
    /**
     * Create noise generator
     */
    createNoise(duration, startTime, gainValue = 0.1) {
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(gainValue, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start(startTime);
        noise.stop(startTime + duration);
        
        return noise;
    },
    
    /**
     * Create reverb effect
     */
    createReverb(duration = 2) {
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        const convolver = this.context.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    },
    
    // ==========================================
    // SUCCESS SOUND - Cinematic Victory
    // ==========================================
    
    /**
     * Play the success/victory sound
     * Rising sweep + digital unlock + ethereal pad + sparkle
     */
    async playSuccess() {
        if (!this.initialized) this.init();
        await this.resume();
        
        const now = this.context.currentTime;
        
        // Layer 1: Rising sweep (0-1s)
        this.playSweep(now, 1.2, 200, 1200, 'sine', 0.15);
        
        // Layer 2: Digital "unlock" clicks (0.3s, 0.5s, 0.7s)
        this.playUnlockClick(now + 0.3);
        this.playUnlockClick(now + 0.5);
        this.playUnlockClick(now + 0.7);
        
        // Layer 3: Major chord pad (0.5-2.5s)
        this.playChord(now + 0.5, 2.0, [523.25, 659.25, 783.99], 0.08); // C5, E5, G5
        
        // Layer 4: Higher chord resolution (1.0-2.5s)
        this.playChord(now + 1.0, 1.5, [659.25, 783.99, 1046.50], 0.06); // E5, G5, C6
        
        // Layer 5: Sparkle arpeggio (0.8-1.8s)
        this.playSparkle(now + 0.8);
        
        // Layer 6: Sub bass hit (0.5s)
        this.playSubBass(now + 0.5, 0.8, 60);
        
        // Layer 7: Cinematic impact (0.5s)
        this.playCinematicHit(now + 0.5);
        
        // Layer 8: Final shimmer (1.5-2.5s)
        this.playShimmer(now + 1.5, 1.0);
    },
    
    playSweep(startTime, duration, startFreq, endFreq, type = 'sine', gain = 0.2) {
        const osc = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.1);
        gainNode.gain.setValueAtTime(gain, startTime + duration - 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    },
    
    playUnlockClick(startTime) {
        // High-pitched click
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(2000, startTime);
        osc.frequency.exponentialRampToValueAtTime(800, startTime + 0.05);
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + 0.1);
        
        // Add a subtle ring
        const ring = this.context.createOscillator();
        const ringGain = this.context.createGain();
        
        ring.type = 'sine';
        ring.frequency.value = 1500;
        
        ringGain.gain.setValueAtTime(0.1, startTime);
        ringGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        
        ring.connect(ringGain);
        ringGain.connect(this.masterGain);
        
        ring.start(startTime);
        ring.stop(startTime + 0.2);
    },
    
    playChord(startTime, duration, frequencies, gain = 0.1) {
        frequencies.forEach(freq => {
            const osc = this.context.createOscillator();
            const gainNode = this.context.createGain();
            const filter = this.context.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.3);
            gainNode.gain.setValueAtTime(gain, startTime + duration - 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    },
    
    playSparkle(startTime) {
        const notes = [1318.51, 1567.98, 2093.00, 2637.02, 3135.96]; // E6, G6, C7, E7, G7
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteStart = startTime + i * 0.12;
            gain.gain.setValueAtTime(0, noteStart);
            gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(noteStart);
            osc.stop(noteStart + 0.5);
        });
    },
    
    playSubBass(startTime, duration, frequency) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    },
    
    playCinematicHit(startTime) {
        // Low impact
        const impact = this.context.createOscillator();
        const impactGain = this.context.createGain();
        
        impact.type = 'sine';
        impact.frequency.setValueAtTime(150, startTime);
        impact.frequency.exponentialRampToValueAtTime(40, startTime + 0.3);
        
        impactGain.gain.setValueAtTime(0.4, startTime);
        impactGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        
        impact.connect(impactGain);
        impactGain.connect(this.masterGain);
        
        impact.start(startTime);
        impact.stop(startTime + 0.6);
        
        // Add noise burst
        this.createNoise(0.15, startTime, 0.15);
    },
    
    playShimmer(startTime, duration) {
        const frequencies = [2093, 2349, 2637, 2793, 3136]; // C7, D7, E7, F7, G7
        
        frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Slight detune for shimmer
            osc.detune.value = (Math.random() - 0.5) * 20;
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.03, startTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration + 0.1);
        });
    },
    
    // ==========================================
    // FAILURE SOUND - Rejection/Error
    // ==========================================
    
    /**
     * Play the failure/rejection sound
     * Low buzzer + digital glitch + descending tone
     */
    async playFailure() {
        if (!this.initialized) this.init();
        await this.resume();
        
        const now = this.context.currentTime;
        
        // Layer 1: Low warning buzzer (0-1s)
        this.playBuzzer(now, 0.8);
        
        // Layer 2: Descending sweep (0-0.8s)
        this.playSweep(now, 0.8, 400, 80, 'sawtooth', 0.1);
        
        // Layer 3: Digital glitch bursts
        this.playGlitchBurst(now + 0.1);
        this.playGlitchBurst(now + 0.3);
        this.playGlitchBurst(now + 0.5);
        
        // Layer 4: Error tone (minor interval)
        this.playErrorTone(now + 0.2);
        
        // Layer 5: Static noise
        this.createNoise(0.5, now + 0.2, 0.08);
        
        // Layer 6: Low impact
        this.playLowImpact(now);
    },
    
    playBuzzer(startTime, duration) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = 80;
        
        // Pulsing effect
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        lfo.frequency.value = 15;
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.setValueAtTime(0.2, startTime + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        lfo.start(startTime);
        osc.start(startTime);
        lfo.stop(startTime + duration);
        osc.stop(startTime + duration);
    },
    
    playGlitchBurst(startTime) {
        const duration = 0.08;
        
        // Random frequency square wave
        for (let i = 0; i < 3; i++) {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'square';
            osc.frequency.value = 100 + Math.random() * 2000;
            
            gain.gain.setValueAtTime(0.1, startTime + i * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.02 + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime + i * 0.02);
            osc.stop(startTime + i * 0.02 + duration);
        }
    },
    
    playErrorTone(startTime) {
        // Minor second interval - dissonant
        const frequencies = [200, 212]; // Very dissonant
        
        frequencies.forEach(freq => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + 0.7);
        });
    },
    
    playLowImpact(startTime) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, startTime);
        osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.3);
        
        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + 0.5);
    },
    
    // ==========================================
    // UTILITY SOUNDS
    // ==========================================
    
    /**
     * Play a subtle typing click
     */
    async playKeyClick() {
        if (!this.initialized) this.init();
        await this.resume();
        
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 1800 + Math.random() * 400;
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.03);
    },
    
    /**
     * Play a confirmation beep
     */
    async playBeep() {
        if (!this.initialized) this.init();
        await this.resume();
        
        const now = this.context.currentTime;
        this.createOscillator('sine', 880, now, 0.15, 0.1);
    }
};

// Export for use in terminal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
