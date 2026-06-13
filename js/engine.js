(function () {
  'use strict';

  // ─── STATE ───
  const state = {
    currentRealm: 'veil',
    audioStarted: false,
    audioMuted: true,
    mouseX: 0,
    mouseY: 0,
    transitioning: false
  };

  // ─── PARTICLE ENGINE ───
  class ParticleEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.type = 'decay-dust';
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    setType(type) {
      if (type === 'none') {
        this.particles = [];
        this.type = type;
        return;
      }
      this.type = type;
      this.particles = [];
      let count;
      switch (type) {
        case 'decay-dust':
          count = 120;
          break;
        case 'candy-breath':
          count = 90;
          break;
        case 'moth-wings':
          count = 70;
          break;
        case 'thorn-lollipop':
          count = 80;
          break;
        case 'teeth-float':
          count = 60; // Fewer, larger particles for teeth
          break;
        case 'golden-hope':
          count = 100;
          break;
        case 'ethereal-wisps':
          count = 50; // Subtle wisps
          break;
        default:
          count = 100;
      }
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(type));
      }
    }

    createParticle(type) {
      const w = this.canvas.width, h = this.canvas.height;
      const base = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: Math.random(),
        size: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.005,
        opacity: 0.2 + Math.random() * 0.4
      };

      switch (type) {
        case 'decay-dust':
          base.color = `rgba(184,154,90,${base.opacity})`;
          base.vy = -0.15 - Math.random() * 0.5;
          base.size = 1 + Math.random() * 3;
          break;
        case 'candy-breath':
          const colors_cb = ['rgba(212,160,192,', 'rgba(194,116,137,', 'rgba(212,80,107,'];
          base.color = colors_cb[Math.floor(Math.random() * colors_cb.length)] + (0.3 + Math.random() * 0.3) + ')';
          base.pulseRate = 0.01 + Math.random() * 0.02;
          base.baseSize = 2 + Math.random() * 5;
          base.size = base.baseSize;
          break;
        case 'moth-wings':
          base.color = `rgba(160,60,90,${base.opacity})`;
          base.wingPhase = Math.random() * Math.PI * 2;
          base.wingSpeed = 0.03 + Math.random() * 0.05;
          base.size = 2.5 + Math.random() * 4;
          base.flutter = Math.random() * 3;
          break;
        case 'thorn-lollipop':
          base.color = `rgba(180,140,60,${base.opacity})`;
          base.vy = 0.2 + Math.random() * 0.5;
          base.drip = Math.random();
          base.size = 1.5 + Math.random() * 3.5;
          break;
        case 'teeth-float':
          base.color = `rgba(232,221,208,${0.4 + Math.random() * 0.3})`; // Bone white
          base.size = 5 + Math.random() * 10; // Larger for teeth
          base.shape = Math.random() > 0.5 ? 'tooth' : 'smile';
          base.rotation = Math.random() * Math.PI * 2;
          base.rotationSpeed = (Math.random() - 0.5) * 0.02;
          base.pulseRate = 0.05 + Math.random() * 0.05;
          base.baseOpacity = base.opacity;
          break;
        case 'golden-hope':
          base.color = `rgba(184,154,90,${0.3 + Math.random() * 0.4})`; // Aged gold
          base.size = 2 + Math.random() * 4;
          base.vx = (Math.random() - 0.5) * 0.1;
          base.vy = -0.05 - Math.random() * 0.2; // Gently float upwards
          base.pulseRate = 0.02 + Math.random() * 0.03;
          base.baseOpacity = base.opacity;
          break;
        case 'ethereal-wisps':
          base.color = `rgba(232,221,208,${0.1 + Math.random() * 0.2})`; // Whisper white
          base.size = 3 + Math.random() * 6;
          base.vx = (Math.random() - 0.5) * 0.2;
          base.vy = (Math.random() - 0.5) * 0.2;
          base.driftX = (Math.random() - 0.5) * 0.05;
          base.driftY = (Math.random() - 0.5) * 0.05;
          base.baseOpacity = base.opacity;
          break;
      }
      return base;
    }

    update() {
      if (this.type === 'none') return;
      const w = this.canvas.width, h = this.canvas.height;
      const t = Date.now() * 0.001;

      this.ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx + Math.sin(t + p.phase) * 0.15;
        p.y += p.vy + Math.cos(t + p.phase) * 0.08;

        // Mouse influence
        const dx = state.mouseX - p.x;
        const dy = state.mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= dx * 0.005;
          p.y -= dy * 0.005;
        }

        // Wrap
        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = h + p.size;
        if (p.y > h + p.size) p.y = -p.size;

        // Type-specific behavior and drawing
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;

        switch (this.type) {
          case 'candy-breath':
            p.size = p.baseSize + Math.sin(t * p.pulseRate * 60) * 1;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'moth-wings':
            p.wingPhase += p.wingSpeed;
            p.x += Math.sin(p.wingPhase) * p.flutter;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'thorn-lollipop':
            p.size = p.size * (1 + Math.sin(t * 2 + p.drip * 10) * 0.05);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'teeth-float':
            p.rotation += p.rotationSpeed;
            p.opacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(t * p.pulseRate)); // Fade in/out
            this.ctx.globalAlpha = p.opacity;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            if (p.shape === 'tooth') {
              this.drawTooth(this.ctx, p.size);
            } else {
              this.drawSmile(this.ctx, p.size);
            }
            this.ctx.restore();
            break;
          case 'golden-hope':
            p.opacity = p.baseOpacity * (0.8 + 0.2 * Math.sin(t * p.pulseRate)); // Gentle pulse
            this.ctx.globalAlpha = p.opacity;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'ethereal-wisps':
            p.x += p.driftX * Math.sin(t * 0.5 + p.phase);
            p.y += p.driftY * Math.cos(t * 0.5 + p.phase);
            p.opacity = p.baseOpacity * (0.6 + 0.4 * Math.sin(t * 0.3 + p.phase)); // Slow fade
            this.ctx.globalAlpha = p.opacity;
            this.ctx.beginPath();
            this.ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.phase, 0, Math.PI * 2);
            this.ctx.fill();
            break;
          default: // decay-dust
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            this.ctx.fill();
            break;
        }

        // Glow halos for larger particles (existing logic, adjusted for new types)
        if (p.size > 2 && this.type !== 'teeth-float' && this.type !== 'ethereal-wisps') {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const glowColor = this.type === 'moth-wings' ? 'rgba(160,60,90,0.06)'
            : this.type === 'candy-breath' ? 'rgba(212,160,192,0.05)'
            : this.type === 'decay-dust' ? 'rgba(184,154,90,0.04)'
            : this.type === 'golden-hope' ? 'rgba(184,154,90,0.08)'
            : 'rgba(180,140,60,0.05)';
          this.ctx.fillStyle = glowColor;
          this.ctx.globalAlpha = 0.5; // Ensure glow is subtle
          this.ctx.fill();
        }
      }
      this.ctx.globalAlpha = 1; // Reset global alpha
    }

    drawTooth(ctx, size) {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, size);
      ctx.lineTo(-size * 0.7, size);
      ctx.closePath();
      ctx.fill();
    }

    drawSmile(ctx, size) {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI, false);
      ctx.lineTo(size * 0.8, size * 0.5);
      ctx.lineTo(-size * 0.8, size * 0.5);
      ctx.closePath();
      ctx.fill();

      // Draw multiple small teeth for the 'too many teeth' effect
      const numTeeth = 5 + Math.floor(Math.random() * 3);
      const toothWidth = size * 0.2;
      const startX = -size * 0.7;
      for (let i = 0; i < numTeeth; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * (toothWidth * 1.2), size * 0.5);
        ctx.lineTo(startX + i * (toothWidth * 1.2) + toothWidth * 0.5, size * 0.8);
        ctx.lineTo(startX + i * (toothWidth * 1.2) - toothWidth * 0.5, size * 0.8);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // ─── AUDIO ENGINE ───
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.realmGain = null;
      this.nodes = [];
      this.currentRealm = null;
      this.cursorGain = null;
      this.cursorOsc = null;
    }

    init() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25;
      this.masterGain.connect(this.ctx.destination);
      this.realmGain = this.ctx.createGain();
      this.realmGain.gain.value = 0;
      this.realmGain.connect(this.masterGain);

      // Cursor echo setup
      this.cursorGain = this.ctx.createGain();
      this.cursorGain.gain.value = 0;
      this.cursorGain.connect(this.masterGain);

      state.audioStarted = true;
    }

    stopAll() {
      this.nodes.forEach(n => {
        try { n.stop(); } catch (e) { }
        try { n.disconnect(); } catch (e) { }
      });
      this.nodes = [];
      // Clear melody loops
      if (this._melodyIntervals) {
        this._melodyIntervals.forEach(id => clearInterval(id));
        this._melodyIntervals = [];
      }
      if (this.realmGain) {
        this.realmGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      }
    }

    createOsc(freq, type, detune, gainVal) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune || 0;
      gain.gain.value = gainVal || 0.05;
      osc.connect(gain);
      gain.connect(this.realmGain);
      osc.start();
      this.nodes.push(osc);
      return { osc, gain };
    }

    createNoise(gainVal) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = this.ctx.createGain();
      gain.gain.value = gainVal || 0.01;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.realmGain);
      source.start();
      this.nodes.push(source);
      return { source, gain, filter };
    }

    // Creates a haunting looping melody from an array of frequencies
    createMelody(notes, type, gainVal, noteLength) {
      const totalDuration = notes.length * noteLength;
      const playMelody = () => {
        if (this.currentRealm === null) return;
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type || 'sine';
          osc.frequency.value = freq;
          gain.gain.value = 0;
          osc.connect(gain);
          gain.connect(this.realmGain);
          const startTime = this.ctx.currentTime + (i * noteLength);
          // Gentle fade in and out for each note
          gain.gain.setTargetAtTime(gainVal, startTime, 0.15);
          gain.gain.setTargetAtTime(0, startTime + noteLength * 0.7, 0.2);
          osc.start(startTime);
          osc.stop(startTime + noteLength);
          this.nodes.push(osc);
        });
      };
      playMelody();
      // Loop the melody
      const loopInterval = setInterval(() => {
        if (this.nodes.length === 0) {
          clearInterval(loopInterval);
          return;
        }
        playMelody();
      }, totalDuration * 1000);
      // Store interval reference for cleanup
      this._melodyIntervals = this._melodyIntervals || [];
      this._melodyIntervals.push(loopInterval);
    }

    // Map realm IDs to audio profiles
    getAudioProfile(realm) {
      const map = {
        'veil': 'veil',
        'gateway': 'gateway',
        'world-drop001': 'pretty-teeth',
        'world-drop002': 'gothic-romance',
        'world-drop003': 'alchemy',
        'world-drop004': 'childhood-distortion',
        'drops': 'gateway',
        'btc': 'sanctuary',
        'btc-videos': 'sanctuary',
        'btc-blog-1': 'sanctuary',
        'btc-blog-2': 'sanctuary',
        'community': 'sanctuary',
        'the-static': 'sanctuary',
        'about': 'sanctuary'
      };
      return map[realm] || 'veil';
    }

    setRealm(realm) {
      if (!this.ctx) return;
      const profile = this.getAudioProfile(realm);
      if (this.currentRealm === realm && this.nodes.length > 0) return;
      this.currentRealm = realm;
      this.stopAll();

      setTimeout(() => {
        if (this.currentRealm !== realm) return;
        this.realmGain.gain.setTargetAtTime(1, this.ctx.currentTime, 1.5);

        switch (profile) {
          case 'veil':
            // Haunting melodic whisper — distant music box lullaby descending
            this.createMelody([293.7, 261.6, 220, 196, 174.6], 'sine', 0.012, 1.8);
            // Soft spectral choir pad (no drone)
            this.createOsc(330, 'sine', 0, 0.008);
            this.createOsc(392, 'sine', -3, 0.005);
            // Distant muffled cries — haunting vocal-like filter sweep
            { const cry = this.createNoise(0.003);
              cry.filter.type = 'bandpass';
              cry.filter.frequency.value = 800;
              cry.filter.Q.value = 12;
              const cryLfo = this.ctx.createOscillator();
              cryLfo.frequency.value = 0.08;
              const cryLfoG = this.ctx.createGain();
              cryLfoG.gain.value = 300;
              cryLfo.connect(cryLfoG);
              cryLfoG.connect(cry.filter.frequency);
              cryLfo.start();
              this.nodes.push(cryLfo); }
            break;

          case 'gateway':
            // Haunting single piano melody — questioning, slow, deliberate
            this.createMelody([220, 262, 247, 220, 196], 'triangle', 0.015, 2.2);
            // Ethereal glass harmonics
            this.createOsc(880, 'sine', 0, 0.003);
            this.createOsc(1108, 'sine', 5, 0.002);
            break;

          case 'pretty-teeth':
            // DROP001: Seductive broken music box — haunting melodic shimmer
            this.createMelody([523.25, 587.33, 659.25, 523.25, 493.88, 440], 'sine', 0.01, 1.4);
            // Ghostly harp arpeggios
            this.createOsc(784, 'sine', 0, 0.004);
            { const harp = this.createOsc(659.25, 'triangle', 0, 0);
              const harpLfo = this.ctx.createOscillator();
              harpLfo.frequency.value = 0.4;
              const harpLfoG = this.ctx.createGain();
              harpLfoG.gain.value = 0.006;
              harpLfo.connect(harpLfoG);
              harpLfoG.connect(harp.gain.gain);
              harpLfo.start();
              this.nodes.push(harpLfo); }
            break;

          case 'gothic-romance':
            // DROP002: Weeping cello melody + mournful piano
            this.createMelody([196, 220, 261.6, 247, 220, 196, 174.6], 'sawtooth', 0.008, 2.5);
            // Piano tears — descending minor notes
            this.createMelody([329.6, 311.1, 293.7, 261.6], 'triangle', 0.005, 3.0);
            // Soft wind through cathedral (gentle, not harsh)
            { const wind = this.createNoise(0.006);
              wind.filter.type = 'bandpass';
              wind.filter.frequency.value = 400;
              wind.filter.Q.value = 2;
              const wLfo = this.ctx.createOscillator();
              wLfo.frequency.value = 0.06;
              const wLfoG = this.ctx.createGain();
              wLfoG.gain.value = 0.004;
              wLfo.connect(wLfoG);
              wLfoG.connect(wind.gain.gain);
              wLfo.start();
              this.nodes.push(wLfo); }
            break;

          case 'alchemy':
            // DROP003: Cosmic glass bells + ethereal descending scale
            this.createMelody([880, 784, 659.25, 587.33, 523.25, 440], 'sine', 0.006, 2.8);
            // Crystalline shimmer — high harmonics pulsing gently
            this.createOsc(1318.5, 'sine', 0, 0.002);
            { const crystal = this.createOsc(1760, 'sine', 8, 0);
              const cLfo = this.ctx.createOscillator();
              cLfo.frequency.value = 0.2;
              const cLfoG = this.ctx.createGain();
              cLfoG.gain.value = 0.003;
              cLfo.connect(cLfoG);
              cLfoG.connect(crystal.gain.gain);
              cLfo.start();
              this.nodes.push(cLfo); }
            break;

          case 'childhood-distortion':
            // DROP004: Broken music box melody — sugar plum fairy nightmare
            this.createMelody([659.25, 622.25, 587.33, 523.25, 493.88, 440, 392], 'sine', 0.006, 1.6);
            // Haunting children's lullaby — high delicate notes
            this.createMelody([784, 880, 784, 659.25], 'triangle', 0.004, 2.4);
            // Creaking — gentle spectral texture (not harsh)
            { const creak = this.createNoise(0.004);
              creak.filter.type = 'bandpass';
              creak.filter.frequency.value = 1200;
              creak.filter.Q.value = 8;
              const mLfo = this.ctx.createOscillator();
              mLfo.frequency.value = 0.3;
              const mLfoG = this.ctx.createGain();
              mLfoG.gain.value = 400;
              mLfo.connect(mLfoG);
              mLfoG.connect(creak.filter.frequency);
              mLfo.start();
              this.nodes.push(mLfo); }
            break;

          case 'sanctuary':
            // Warm hopeful melody — gentle ascending piano
            this.createMelody([261.6, 293.7, 329.6, 392, 440], 'sine', 0.012, 3.0);
            // Soft harmonic glow
            this.createOsc(523.25, 'sine', 0, 0.006);
            this.createOsc(659.25, 'sine', 2, 0.004);
            break;
        }

        // Subliminal positivity layer (gentle harmonic, not binaural buzz)
        if (profile !== 'sanctuary') {
          this.createOsc(396, 'sine', 0, 0.002);
          this.createOsc(528, 'sine', 0, 0.0015);
        }
      }, 300);
    }

    cursorEcho(x, y) {
      if (!this.ctx || state.audioMuted) return;
      const freq = 200 + (y / window.innerHeight) * 400;

      if (!this.cursorOsc) {
        this.cursorOsc = this.ctx.createOscillator();
        this.cursorOsc.type = 'sine';
        this.cursorOsc.frequency.value = freq;
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = (x / window.innerWidth) * 2 - 1;
        this.cursorOsc.connect(this.cursorGain);
        this.cursorGain.connect(panner);
        panner.connect(this.masterGain);
        this.cursorOsc.start();
      }

      this.cursorOsc.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.05);
      this.cursorGain.gain.linearRampToValueAtTime(0.005, this.ctx.currentTime + 0.01);
      this.cursorGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    }

    toggleMute() {
      state.audioMuted = !state.audioMuted;
      if (state.audioMuted) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        document.body.classList.add('audio-muted');
      } else {
        this.masterGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.1);
        document.body.classList.remove('audio-muted');
        // Restart audio for current realm if it was muted
        this.setRealm(state.currentRealm);
      }
    }
  }

  // ─── NAVIGATION ENGINE ───
  class NavigationEngine {
    constructor(particleEngine, audioEngine) {
      this.particleEngine = particleEngine;
      this.audioEngine = audioEngine;
      this.realms = document.querySelectorAll('.realm');
      this.navLinks = document.querySelectorAll('[data-navigate]');
      this.transitionOverlay = document.getElementById('transition-overlay');
      this.transitionText = this.transitionOverlay.querySelector('.transition-text');
      this.setupEventListeners();
      this.initNavigation();
    }

    setupEventListeners() {
      this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetRealmId = link.dataset.navigate;
          this.navigateTo(targetRealmId);
        });
      });

      document.getElementById('enter-crown').addEventListener('click', () => {
        this.navigateTo('gateway');
      });

      document.getElementById('audio-toggle').addEventListener('click', () => {
        this.audioEngine.init(); // Ensure audio context is started on first interaction
        this.audioEngine.toggleMute();
      });

      // Video modal handling
      document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
          const videoId = card.dataset.videoId;
          this.openVideoModal(videoId);
        });
      });

      document.querySelector('.video-modal .close-button').addEventListener('click', () => {
        this.closeVideoModal();
      });

      document.getElementById('video-modal').addEventListener('click', (e) => {
        if (e.target.id === 'video-modal') {
          this.closeVideoModal();
        }
      });

      window.addEventListener('hashchange', () => this.handleHashChange());
      window.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
      });
    }

    initNavigation() {
      const initialHash = window.location.hash.substring(1);
      const initialRealm = initialHash || 'veil';
      this.activateRealm(initialRealm);
      document.body.dataset.realm = initialRealm;
      this.audioEngine.setRealm(initialRealm);
    }

    handleHashChange() {
      const targetRealmId = window.location.hash.substring(1);
      if (targetRealmId && targetRealmId !== state.currentRealm) {
        this.navigateTo(targetRealmId);
      } else if (!targetRealmId && state.currentRealm !== 'veil') {
        this.navigateTo('veil');
      }
    }

    navigateTo(targetRealmId) {
      if (state.transitioning || targetRealmId === state.currentRealm) return;

      state.transitioning = true;
      this.transitionOverlay.classList.add('active');
      this.transitionText.textContent = this.getTransitionText(targetRealmId);

      setTimeout(() => {
        this.deactivateRealm(state.currentRealm);
        this.activateRealm(targetRealmId);
        document.body.dataset.realm = targetRealmId;
        this.audioEngine.setRealm(targetRealmId);
        this.particleEngine.setType(document.getElementById(`realm-${targetRealmId}`).dataset.particles || 'decay-dust');
        window.location.hash = targetRealmId;

        setTimeout(() => {
          this.transitionOverlay.classList.remove('active');
          state.transitioning = false;
        }, 600); // Transition out duration

      }, 600); // Transition in duration
    }

    activateRealm(realmId) {
      const targetRealm = document.getElementById(`realm-${realmId}`);
      if (targetRealm) {
        targetRealm.classList.add('active');
        state.currentRealm = realmId;
        this.revealElements(targetRealm);
        targetRealm.scrollTop = 0; // Scroll to top on realm activation
      }
    }

    deactivateRealm(realmId) {
      const currentRealm = document.getElementById(`realm-${realmId}`);
      if (currentRealm) {
        currentRealm.classList.remove('active');
        this.resetElements(currentRealm);
      }
    }

    revealElements(parent) {
      parent.querySelectorAll('.rv').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.08}s`;
        el.classList.add('revealed');
      });
    }

    resetElements(parent) {
      parent.querySelectorAll('.rv').forEach(el => {
        el.classList.remove('revealed');
        el.style.transitionDelay = ''; // Reset delay
      });
    }

    getTransitionText(realmId) {
      const texts = {
        'veil': 'RETURNING TO THE VEIL',
        'gateway': 'ENTERING THE GATEWAY',
        'world-drop001': 'DESCENDING INTO PRETTY WITH TEETH',
        'world-drop002': 'UNEARTHING THE RITUAL TOOLKIT',
        'world-drop003': 'COLLAPSING INTO ALCHEMY OF WORLDS',
        'world-drop004': 'AWAKENING PRETTY LITTLE NIGHTMARES',
        'drops': 'CONSULTING THE SIGILS',
        'btc': 'SEEKING THE HEART OF CHANGE',
        'btc-videos': 'VIEWING TRANSMISSIONS',
        'btc-blog-1': 'READING TRANSMISSIONS',
        'btc-blog-2': 'EXPLORING THE DARK CANVAS',
        'community': 'JOINING THE COLLECTIVE',
        'the-static': 'ANSWERING THE INTERFERENCE',
        'about': 'UNVEILING ORIGINS'
      };
      return texts[realmId] || 'SHIFTING REALITIES';
    }

    openVideoModal(videoId) {
      const videoModal = document.getElementById('video-modal');
      const videoPlayer = document.getElementById('video-player');
      videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      videoModal.classList.add('active');
    }

    closeVideoModal() {
      const videoModal = document.getElementById('video-modal');
      const videoPlayer = document.getElementById('video-player');
      videoPlayer.src = ''; // Stop video playback
      videoModal.classList.remove('active');
    }
  }

  // ─── CURSOR ECHO ───
  const cursorTrail = document.getElementById('cursor-trail');
  let trailElements = [];
  const TRAIL_LENGTH = 15;

  function createTrailElement() {
    const el = document.createElement('div');
    el.className = 'cursor-echo';
    document.body.appendChild(el);
    return el;
  }

  for (let i = 0; i < TRAIL_LENGTH; i++) {
    trailElements.push(createTrailElement());
  }

  let echoIndex = 0;
  let lastEchoTime = 0;
  const ECHO_INTERVAL = 50; // ms

  function updateCursor(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;

    cursorTrail.style.left = `${e.clientX}px`;
    cursorTrail.style.top = `${e.clientY}px`;
    cursorTrail.classList.add('visible');

    if (Date.now() - lastEchoTime > ECHO_INTERVAL) {
      const echo = trailElements[echoIndex];
      echo.style.left = `${e.clientX}px`;
      echo.style.top = `${e.clientY}px`;
      echo.style.opacity = 1;
      echo.style.transform = 'scale(1)';
      echo.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
      setTimeout(() => {
        echo.style.opacity = 0;
        echo.style.transform = 'scale(2)';
      }, 10);
      echoIndex = (echoIndex + 1) % TRAIL_LENGTH;
      lastEchoTime = Date.now();
    }

    // Check for hoverable elements
    const target = e.target.closest('a, button, [data-navigate], .gateway-card, .drop-card, .video-card, .blog-card');
    if (target) {
      cursorTrail.classList.add('hover');
    } else {
      cursorTrail.classList.remove('hover');
    }
  }

  document.addEventListener('mousemove', updateCursor);

  // ─── MAIN ANIMATION LOOP ───
  let particleEngine, audioEngine, navigationEngine;

  function animate() {
    requestAnimationFrame(animate);
    if (particleEngine) {
      particleEngine.update();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    particleEngine = new ParticleEngine(document.getElementById('particle-canvas'));
    audioEngine = new AudioEngine();
    navigationEngine = new NavigationEngine(particleEngine, audioEngine);

    // Initial particle setup based on current realm
    particleEngine.setType(document.getElementById(`realm-${state.currentRealm}`).dataset.particles || 'decay-dust');

    animate();

    // Add cursor echo elements to CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .cursor-echo {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(194,116,137,0.6); /* decay-pink */
        pointer-events: none;
        z-index: 99998;
        opacity: 0;
        transform: scale(0);
      }
    `;
    document.head.appendChild(style);

    // Initial audio mute state
    if (state.audioMuted) {
      document.body.classList.add('audio-muted');
    }
  });

})();

  // ─── CAROUSEL ENGINE ───
  class CarouselEngine {
    constructor() {
      this.carousel = document.querySelector(".homepage-carousel");
      if (this.carousel) {
        this.horses = this.carousel.querySelectorAll(".carousel-horse");
        this.glitchOverlay = this.carousel.querySelector(".carousel-glitch-overlay");
        this.mistOverlay = this.carousel.querySelector(".carousel-mist-overlay");
        this.animateCarousel();
      }
    }

    animateCarousel() {
      if (!this.carousel) return;

      let rotation = 0;
      const rotationSpeed = 0.005; // Slower rotation
      const glitchInterval = 3000; // Glitch every 3 seconds
      let lastGlitch = Date.now();

      const update = () => {
        rotation += rotationSpeed;
        this.carousel.style.transform = `translateX(-50%) rotateY(${rotation}deg)`;

        // Stuttering effect
        if (Math.random() < 0.01) { // Small chance to stutter
          rotation += (Math.random() - 0.5) * 5; // Jump rotation slightly
        }

        // Glitch effect
        if (Date.now() - lastGlitch > glitchInterval) {
          this.glitchOverlay.style.opacity = 0.2 + Math.random() * 0.3;
          setTimeout(() => {
            this.glitchOverlay.style.opacity = 0;
          }, 50 + Math.random() * 150); // Short glitch duration
          lastGlitch = Date.now() + Math.random() * 5000; // Next glitch in 3-8 seconds
        }

        requestAnimationFrame(update);
      };
      update();
    }
  }

  // ─── MAIN ANIMATION LOOP ───
  let particleEngine, audioEngine, navigationEngine, carouselEngine;

  function animate() {
    requestAnimationFrame(animate);
    if (particleEngine) {
      particleEngine.update();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    particleEngine = new ParticleEngine(document.getElementById("particle-canvas"));
    audioEngine = new AudioEngine();
    navigationEngine = new NavigationEngine(particleEngine, audioEngine);
    carouselEngine = new CarouselEngine(); // Initialize carousel engine

    // Initial particle setup based on current realm
    particleEngine.setType(document.getElementById(`realm-${state.currentRealm}`).dataset.particles || "decay-dust");

    animate();

    // Add cursor echo elements to CSS
    const style = document.createElement("style");
    style.innerHTML = `
      .cursor-echo {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(194,116,137,0.6); /* decay-pink */
        pointer-events: none;
        z-index: 99998;
        opacity: 0;
        transform: scale(0);
      }
    `;
    document.head.appendChild(style);

    // Initial audio mute state
    if (state.audioMuted) {
      document.body.classList.add("audio-muted");
    }
  });

})();
