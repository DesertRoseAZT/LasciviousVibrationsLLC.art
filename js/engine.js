/* ══════════════════════════════════════════════════════════════
   PRETTY LITTLE NIGHTMARES — SWEET DECAY ENGINE
   Lascivious Vibrations LLC © 2026
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─── GLOBAL STATE ───
  const state = {
    currentRealm: 'veil',
    transitioning: false,
    mouseX: 0,
    mouseY: 0,
    audioStarted: false,
    audioMuted: true,
    currentSection: null
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
      const newType = type || 'decay-dust';
      if (newType === this.type && this.particles.length > 0) return;

      // Mark existing particles for fade-out instead of instant clear
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i]._fading = true;
        this.particles[i].life = Math.min(this.particles[i].life, 40);
      }

      this.type = newType;
      const count = this.getCount();
      // Stagger new particle creation for seamless blend
      for (let i = 0; i < count; i++) {
        const p = this.createParticle();
        p.opacity = 0;
        p._fadeIn = true;
        p._fadeDelay = i * 2; // stagger frames
        this.particles.push(p);
      }
    }

    getCount() {
      const counts = {
        'decay-dust': 60,
        'golden-hope': 45,
        'teeth-float': 50,
        'moth-wings': 40,
        'thorn-lollipop': 35,
        'candy-breath': 55,
        'smile-shards': 45,
        'element-drift': 30,
        'velvet-dust': 50,
        'ritual-smoke': 40,
        'alchemy-sparks': 55,
        'porcelain-dust': 45
      };
      return counts[this.type] || 50;
    }

    createParticle() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const base = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        life: Math.random() * 300 + 100,
        maxLife: 400,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      base._targetOpacity = base.opacity; // store for fade-in blending

      switch (this.type) {
        case 'teeth-float':
          base.size = Math.random() * 4 + 2;
          base.vy = -Math.random() * 0.4 - 0.1;
          base.vx = (Math.random() - 0.5) * 0.2;
          base.color = [255, 245, 238];
          base.shape = 'triangle';
          break;
        case 'smile-shards':
          base.size = Math.random() * 5 + 1;
          base.vy = Math.random() * 0.3 + 0.1;
          base.vx = (Math.random() - 0.5) * 0.5;
          base.color = [194, 116, 137];
          base.shape = 'shard';
          break;
        case 'element-drift':
          base.size = Math.random() * 3 + 2;
          base.vy = (Math.random() - 0.5) * 0.15;
          base.vx = (Math.random() - 0.5) * 0.15;
          base.color = [200, 180, 220];
          base.shape = 'circle';
          base.opacity = Math.random() * 0.3 + 0.1;
          break;
        case 'velvet-dust':
          base.size = Math.random() * 2 + 1;
          base.vy = Math.random() * 0.2 + 0.05;
          base.color = [139, 69, 89];
          base.shape = 'circle';
          break;
        case 'moth-wings':
          base.size = Math.random() * 6 + 3;
          base.vy = (Math.random() - 0.5) * 0.2;
          base.vx = Math.sin(base.phase) * 0.5;
          base.color = [180, 140, 160];
          base.shape = 'moth';
          break;
        case 'thorn-lollipop':
          base.size = Math.random() * 3 + 1.5;
          base.vy = -Math.random() * 0.3;
          base.color = [220, 80, 120];
          base.shape = 'diamond';
          break;
        case 'golden-hope':
          base.size = Math.random() * 3 + 1;
          base.vy = -Math.random() * 0.3 - 0.1;
          base.color = [255, 215, 120];
          base.shape = 'circle';
          base.opacity = Math.random() * 0.4 + 0.1;
          break;
        case 'ritual-smoke':
          base.size = Math.random() * 8 + 3;
          base.vy = -Math.random() * 0.2 - 0.05;
          base.vx = (Math.random() - 0.5) * 0.3;
          base.color = [100, 60, 120];
          base.shape = 'smoke';
          base.opacity = Math.random() * 0.15 + 0.05;
          break;
        case 'alchemy-sparks':
          base.size = Math.random() * 2 + 1;
          base.vy = (Math.random() - 0.5) * 0.6;
          base.vx = (Math.random() - 0.5) * 0.6;
          base.color = [100, 200, 255];
          base.shape = 'spark';
          base.opacity = Math.random() * 0.6 + 0.2;
          break;
        case 'porcelain-dust':
          base.size = Math.random() * 2 + 0.5;
          base.vy = Math.random() * 0.15 + 0.05;
          base.color = [240, 230, 220];
          base.shape = 'circle';
          base.opacity = Math.random() * 0.3 + 0.05;
          break;
        case 'candy-breath':
          base.size = Math.random() * 4 + 2;
          base.vy = -Math.random() * 0.2;
          base.color = [255, 150, 200];
          base.shape = 'circle';
          break;
        default: // decay-dust
          base.size = Math.random() * 2 + 0.5;
          base.vy = (Math.random() - 0.5) * 0.2;
          base.color = [194, 116, 137];
          base.shape = 'circle';
          break;
      }
      return base;
    }

    update() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const mx = state.mouseX;
      const my = state.mouseY;

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life--;
        p.phase += 0.01;
        p.rotation += p.rotationSpeed;

        // Mouse influence
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 0.02;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Drift
        p.x += p.vx + Math.sin(p.phase) * 0.15;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.1;

        // Dampen
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Fade based on life
        // Handle fade-in for new blended particles
        if (p._fadeIn) {
          if (p._fadeDelay > 0) { p._fadeDelay--; continue; }
          p.opacity = Math.min(p.opacity + 0.015, p._targetOpacity || 0.3);
          if (p.opacity >= (p._targetOpacity || 0.3)) { p._fadeIn = false; }
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = p.opacity * (lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1);

        // Draw
        const [r, g, b] = p.color || [194, 116, 137];
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, alpha);
        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);

        switch (p.shape) {
          case 'triangle':
            this.ctx.beginPath();
            this.ctx.moveTo(0, -p.size);
            this.ctx.lineTo(-p.size * 0.6, p.size * 0.5);
            this.ctx.lineTo(p.size * 0.6, p.size * 0.5);
            this.ctx.closePath();
            this.ctx.fill();
            break;
          case 'shard':
            this.ctx.beginPath();
            this.ctx.moveTo(0, -p.size);
            this.ctx.lineTo(p.size * 0.3, 0);
            this.ctx.lineTo(0, p.size * 0.6);
            this.ctx.lineTo(-p.size * 0.3, 0);
            this.ctx.closePath();
            this.ctx.fill();
            break;
          case 'diamond':
            this.ctx.beginPath();
            this.ctx.moveTo(0, -p.size);
            this.ctx.lineTo(p.size * 0.5, 0);
            this.ctx.lineTo(0, p.size);
            this.ctx.lineTo(-p.size * 0.5, 0);
            this.ctx.closePath();
            this.ctx.fill();
            break;
          case 'moth':
            this.ctx.beginPath();
            this.ctx.ellipse(-p.size * 0.4, 0, p.size * 0.5, p.size * 0.25, -0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(p.size * 0.4, 0, p.size * 0.5, p.size * 0.25, 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'smoke':
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(p.size * 0.5, -p.size * 0.3, p.size * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'spark':
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = alpha * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            break;
          default: // circle
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            break;
        }
        this.ctx.restore();

        // Recycle dead or offscreen particles
        if (p.life <= 0 || p.x < -50 || p.x > this.canvas.width + 50 || p.y < -50 || p.y > this.canvas.height + 50) {
          this.particles[i] = this.createParticle();
          // Respawn at edges
          if (Math.random() < 0.5) {
            this.particles[i].x = Math.random() < 0.5 ? -10 : this.canvas.width + 10;
            this.particles[i].y = Math.random() * this.canvas.height;
          } else {
            this.particles[i].x = Math.random() * this.canvas.width;
            this.particles[i].y = Math.random() < 0.5 ? -10 : this.canvas.height + 10;
          }
        }
      }
    }
  }

  // ─── AUDIO ENGINE ───
  // Soft unsettling ambient soundscapes with per-realm uniqueness
  // and barely-audible stoic subliminal affirmations
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.realmGain = null;
      this.subGain = null;
      this.nodes = [];
      this.currentRealm = null;
      this.cursorGain = null;
      this.cursorOsc = null;
      this._melodyIntervals = [];
      this._subliminalInterval = null;
      this._subliminalIndex = 0;

      // Stoic subliminal affirmations
      this.subliminals = [
        'be the change you want to see in the world',
        'be the best person you can be',
        'see the light in the dark',
        'accept what you cannot change',
        'worry only about what you can control',
        'be humble',
        'act like we live in this world together',
        'the obstacle is the way',
        'waste no more time arguing what a good person should be',
        'it is not what happens to you but how you react',
        'we suffer more in imagination than in reality',
        'the best revenge is not to be like your enemy',
        'you have power over your mind not outside events',
        'choose not to be harmed and you will not feel harmed'
      ];
    }

    init() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2;
      this.masterGain.connect(this.ctx.destination);

      this.realmGain = this.ctx.createGain();
      this.realmGain.gain.value = 0;
      this.realmGain.connect(this.masterGain);

      // Subliminal channel - barely audible
      this.subGain = this.ctx.createGain();
      this.subGain.gain.value = 0.015; // Nearly inaudible
      this.subGain.connect(this.masterGain);

      // Cursor hover sound channel
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
      if (this._melodyIntervals) {
        this._melodyIntervals.forEach(id => clearInterval(id));
        this._melodyIntervals = [];
      }
      if (this._subliminalInterval) {
        clearInterval(this._subliminalInterval);
        this._subliminalInterval = null;
      }
      if (this.realmGain) {
        this.realmGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      }
    }

    // Create a sustained drone note
    createDrone(freq, type, gain, detuneAmount) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      if (detuneAmount) osc.detune.value = detuneAmount;
      g.gain.value = gain || 0.1;
      osc.connect(g);
      g.connect(this.realmGain);
      osc.start();
      this.nodes.push(osc, g);
      return { osc, gain: g };
    }

    // Create an LFO to modulate a parameter
    createLFO(freq, amount, target) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = freq;
      lfoGain.gain.value = amount;
      lfo.connect(lfoGain);
      lfoGain.connect(target);
      lfo.start();
      this.nodes.push(lfo, lfoGain);
      return lfo;
    }

    // Subliminal whisper system using oscillator-encoded speech patterns
    startSubliminals() {
      if (this._subliminalInterval) return;
      this._subliminalInterval = setInterval(() => {
        if (!this.ctx || state.audioMuted) return;
        this.whisperSubliminal();
      }, 12000 + Math.random() * 8000); // Every 12-20 seconds
    }

    whisperSubliminal() {
      if (!this.ctx) return;
      const msg = this.subliminals[this._subliminalIndex % this.subliminals.length];
      this._subliminalIndex++;

      // Create a breathy whisper effect using filtered noise + gentle tonal pattern
      const now = this.ctx.currentTime;
      const duration = 3 + msg.length * 0.08;

      // Noise-based whisper texture
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Modulated white noise that mimics speech rhythm
        const t = i / this.ctx.sampleRate;
        const wordIndex = Math.floor(t * 3);
        const syllableEnv = Math.sin(t * Math.PI * 2 * (2 + wordIndex * 0.3)) * 0.5 + 0.5;
        data[i] = (Math.random() * 2 - 1) * syllableEnv * 0.4;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      // Bandpass to make it sound like whispered speech
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2000 + Math.random() * 1000;
      bp.Q.value = 1.5;

      const whisperGain = this.ctx.createGain();
      whisperGain.gain.setValueAtTime(0, now);
      whisperGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
      whisperGain.gain.linearRampToValueAtTime(0.06, now + duration - 0.8);
      whisperGain.gain.linearRampToValueAtTime(0, now + duration);

      source.connect(bp);
      bp.connect(whisperGain);
      whisperGain.connect(this.subGain);
      source.start(now);
      source.stop(now + duration);

      this.nodes.push(source, bp, whisperGain);

      // Also add a very faint tonal element
      const subOsc = this.ctx.createOscillator();
      const subOscGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.value = 100 + Math.random() * 50;
      subOscGain.gain.setValueAtTime(0, now);
      subOscGain.gain.linearRampToValueAtTime(0.03, now + 0.5);
      subOscGain.gain.linearRampToValueAtTime(0, now + duration);
      subOsc.connect(subOscGain);
      subOscGain.connect(this.subGain);
      subOsc.start(now);
      subOsc.stop(now + duration);
      this.nodes.push(subOsc, subOscGain);
    }

    setRealm(realmId) {
      if (!this.ctx) return;
      this.stopAll();
      this.currentRealm = realmId;
      if (state.audioMuted) return;

      // Fade in realm audio
      this.realmGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.8);

      // Start subliminals
      this.startSubliminals();

      // Route to realm-specific soundscape
      const profiles = {
        'veil': () => this.soundscapeVeil(),
        'gateway': () => this.soundscapeGateway(),
        'world-drop001': () => this.soundscapePrettyWithTeeth(),
        'world-drop002': () => this.soundscapeRitualToolkit(),
        'world-drop003': () => this.soundscapeAlchemy(),
        'world-drop004': () => this.soundscapeSweetDecay(),
        'drops': () => this.soundscapeGateway(),
        'btc': () => this.soundscapeSanctuary(),
        'btc-videos': () => this.soundscapeSanctuary(),
        'btc-blog-1': () => this.soundscapeSanctuary(),
        'btc-blog-2': () => this.soundscapeSanctuary(),
        'community': () => this.soundscapeCommunity(),
        'the-static': () => this.soundscapeStatic(),
        'about': () => this.soundscapeSanctuary()
      };

      (profiles[realmId] || profiles['veil'])();
    }

    // ═══ VEIL (Homepage) ═══
    // Deep, low drone. Barely there. Like something breathing in the dark.
    soundscapeVeil() {
      // Sub-bass breath
      const d1 = this.createDrone(55, 'sine', 0.12);
      this.createLFO(0.08, 8, d1.osc.frequency);

      // High spectral shimmer
      const d2 = this.createDrone(880, 'sine', 0.02, 5);
      this.createLFO(0.05, 3, d2.osc.frequency);

      // Ghostly harmonics
      this.createDrone(220, 'triangle', 0.03, -3);
      this.createDrone(330, 'sine', 0.015, 7);

      // Slow decay-whisper texture
      const d4 = this.createDrone(440, 'sine', 0.008);
      this.createLFO(0.02, 20, d4.osc.frequency);
    }

    // ═══ GATEWAY ═══
    // Multi-layered, slightly more active. Four frequencies hinting at four worlds.
    soundscapeGateway() {
      this.createDrone(65, 'sine', 0.08);
      // Four world hints — each a different note
      this.createDrone(164.81, 'triangle', 0.025, 3); // E3 — World I
      this.createDrone(196.00, 'triangle', 0.020, -5); // G3 — World II
      this.createDrone(246.94, 'triangle', 0.018, 7); // B3 — World III
      this.createDrone(293.66, 'triangle', 0.015, -3); // D4 — World IV

      // Slow sweep
      const sweep = this.createDrone(300, 'sawtooth', 0.01);
      this.createLFO(0.03, 100, sweep.osc.frequency);

      // Heartbeat-like low pulse
      const pulse = this.createDrone(40, 'sine', 0.06);
      this.createLFO(0.8, 0.05, pulse.gain.gain);
    }

    // ═══ WORLD I: PRETTY WITH TEETH ═══
    // Detuned music box. Uncanny lullaby. Something sweet gone wrong.
    soundscapePrettyWithTeeth() {
      // Detuned music box base
      this.createDrone(523.25, 'sine', 0.04, 8); // C5 slightly sharp
      this.createDrone(659.25, 'sine', 0.03, -12); // E5 slightly flat — dissonance
      this.createDrone(783.99, 'triangle', 0.02, 5); // G5

      // Sub-bass unease
      this.createDrone(55, 'sine', 0.08);
      const unease = this.createDrone(110, 'sawtooth', 0.015);
      this.createLFO(0.1, 5, unease.osc.frequency);

      // Ticking / heartbeat texture
      const tick = this.createDrone(1200, 'square', 0.005);
      this.createLFO(4, 0.004, tick.gain.gain);

      // Creepy melody fragments
      const melodyNotes = [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 554.37, 523.25];
      let noteIdx = 0;
      const melodyInterval = setInterval(() => {
        if (!this.ctx || state.audioMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = melodyNotes[noteIdx % melodyNotes.length] * (Math.random() < 0.2 ? 1.003 : 1); // occasional detune
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.035, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(g);
        g.connect(this.realmGain);
        osc.start(now);
        osc.stop(now + 1.5);
        this.nodes.push(osc, g);
        noteIdx++;
      }, 2500 + Math.random() * 1500);
      this._melodyIntervals.push(melodyInterval);
    }

    // ═══ WORLD II: RITUAL TOOLKIT ═══
    // Dark ceremonial drone. Deep resonance. Like being inside a cathedral of shadow.
    soundscapeRitualToolkit() {
      // Organ-like drones
      this.createDrone(65.41, 'sine', 0.10); // C2
      this.createDrone(130.81, 'triangle', 0.05); // C3
      this.createDrone(196.00, 'sine', 0.04, -8); // G3 — slightly flat, ominous

      // Choral texture
      const choir1 = this.createDrone(261.63, 'sine', 0.02);
      this.createLFO(0.15, 3, choir1.osc.frequency); // vibrato
      const choir2 = this.createDrone(329.63, 'sine', 0.015, 5);
      this.createLFO(0.17, 4, choir2.osc.frequency);

      // Low rumble
      this.createDrone(30, 'sine', 0.06);

      // Ceremonial bell tones
      const bellNotes = [523.25, 659.25, 392.00, 493.88];
      let bellIdx = 0;
      const bellInterval = setInterval(() => {
        if (!this.ctx || state.audioMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = bellNotes[bellIdx % bellNotes.length];
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.04, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(g);
        g.connect(this.realmGain);
        osc.start(now);
        osc.stop(now + 3);
        this.nodes.push(osc, g);
        bellIdx++;
      }, 4000 + Math.random() * 3000);
      this._melodyIntervals.push(bellInterval);
    }

    // ═══ WORLD III: ALCHEMY OF WORLDS ═══
    // Vast. Cosmic. Dimensional shifting. Sounds that feel impossibly large.
    soundscapeAlchemy() {
      // Deep cosmic drone
      this.createDrone(40, 'sine', 0.10);
      this.createDrone(80, 'triangle', 0.04, 3);

      // Dimensional shimmer — high frequencies with wide LFO
      const dim1 = this.createDrone(1046.50, 'sine', 0.015);
      this.createLFO(0.07, 50, dim1.osc.frequency);
      const dim2 = this.createDrone(1318.51, 'sine', 0.01, -10);
      this.createLFO(0.05, 30, dim2.osc.frequency);

      // Gravity pulse
      const gravity = this.createDrone(60, 'sine', 0.06);
      this.createLFO(0.25, 0.04, gravity.gain.gain);

      // Crystalline arpeggios — like stars forming
      const crystalNotes = [880, 1108.73, 1318.51, 1567.98, 1318.51, 1108.73];
      let crystalIdx = 0;
      const crystalInterval = setInterval(() => {
        if (!this.ctx || state.audioMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = crystalNotes[crystalIdx % crystalNotes.length];
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.02, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(g);
        g.connect(this.realmGain);
        osc.start(now);
        osc.stop(now + 2);
        this.nodes.push(osc, g);
        crystalIdx++;
      }, 1500 + Math.random() * 1000);
      this._melodyIntervals.push(crystalInterval);
    }

    // ═══ WORLD IV: SWEET DECAY ═══
    // The most layered. Corrupted innocence. Music box meets requiem.
    soundscapeSweetDecay() {
      // Warm but unsettling base
      this.createDrone(73.42, 'sine', 0.09); // D2
      this.createDrone(146.83, 'triangle', 0.04, -5); // D3 slightly flat

      // Corrupted lullaby texture
      const lull1 = this.createDrone(293.66, 'sine', 0.025, 10); // D4 sharp
      this.createLFO(0.12, 5, lull1.osc.frequency);
      const lull2 = this.createDrone(349.23, 'sine', 0.02, -8); // F4 flat
      this.createLFO(0.09, 4, lull2.osc.frequency);

      // Childhood distortion — detuned fifth
      this.createDrone(440, 'sine', 0.015, 15);
      this.createDrone(660, 'sine', 0.01, -20);

      // Music box melody — slower, more mournful
      const decayNotes = [293.66, 349.23, 440, 349.23, 293.66, 261.63, 246.94, 261.63];
      let decayIdx = 0;
      const decayInterval = setInterval(() => {
        if (!this.ctx || state.audioMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = decayNotes[decayIdx % decayNotes.length] * (1 + (Math.random() - 0.5) * 0.005);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.03, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(g);
        g.connect(this.realmGain);
        osc.start(now);
        osc.stop(now + 2.5);
        this.nodes.push(osc, g);
        decayIdx++;
      }, 3000 + Math.random() * 2000);
      this._melodyIntervals.push(decayInterval);

      // Crying/whimpering texture — very high, very faint
      const cry = this.createDrone(3000, 'sine', 0.003);
      const cryLfo = this.ctx.createOscillator();
      const cryLfoG = this.ctx.createGain();
      cryLfo.frequency.value = 5;
      cryLfoG.gain.value = 200;
      cryLfo.connect(cryLfoG);
      cryLfoG.connect(cry.osc.frequency);
      cryLfo.start();
      this.nodes.push(cryLfo, cryLfoG);
    }

    // ═══ BE THE CHANGE — SANCTUARY ═══
    // Warmer. Golden. Still haunting but with hope underneath.
    soundscapeSanctuary() {
      // Warm drone
      this.createDrone(110, 'sine', 0.08); // A2
      this.createDrone(220, 'sine', 0.04); // A3

      // Major tonality — hope
      this.createDrone(277.18, 'sine', 0.025); // C#4
      this.createDrone(329.63, 'triangle', 0.02); // E4

      // Golden shimmer
      const shimmer = this.createDrone(880, 'sine', 0.01);
      this.createLFO(0.06, 10, shimmer.osc.frequency);

      // Gentle pulse — like a calm heartbeat
      const pulse = this.createDrone(55, 'sine', 0.04);
      this.createLFO(0.5, 0.03, pulse.gain.gain);

      // Harp-like tones
      const harpNotes = [440, 554.37, 659.25, 880, 659.25, 554.37];
      let harpIdx = 0;
      const harpInterval = setInterval(() => {
        if (!this.ctx || state.audioMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = harpNotes[harpIdx % harpNotes.length];
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.025, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(g);
        g.connect(this.realmGain);
        osc.start(now);
        osc.stop(now + 2);
        this.nodes.push(osc, g);
        harpIdx++;
      }, 3500 + Math.random() * 2000);
      this._melodyIntervals.push(harpInterval);
    }

    // ═══ COMMUNITY ═══
    // Collective resonance. Multiple frequencies merging.
    soundscapeCommunity() {
      this.soundscapeSanctuary(); // Base sanctuary sound
      // Add collective texture — multiple voices
      this.createDrone(174.61, 'sine', 0.015); // F3
      this.createDrone(207.65, 'sine', 0.012, 3); // Ab3
      const breath = this.createDrone(300, 'triangle', 0.008);
      this.createLFO(0.2, 0.006, breath.gain.gain);
    }

    // ═══ THE STATIC ═══
    // Deliberately uncomfortable. Interference patterns. Resolution through discomfort.
    soundscapeStatic() {
      // Interference drone
      this.createDrone(100, 'sawtooth', 0.03);
      this.createDrone(101.5, 'sawtooth', 0.03); // Beating frequency

      // Resolution tone underneath
      this.createDrone(110, 'sine', 0.05);

      // Static texture
      const staticNode = this.createDrone(60, 'square', 0.01);
      this.createLFO(0.3, 20, staticNode.osc.frequency);

      // Clarity emerging
      const clarity = this.createDrone(440, 'sine', 0.02);
      this.createLFO(0.03, 2, clarity.osc.frequency);
    }

    // Cursor hover sound
    playCursorEcho(x, y) {
      if (!this.ctx || state.audioMuted) return;
      if (!this.cursorOsc) {
        this.cursorOsc = this.ctx.createOscillator();
        this.cursorOsc.type = 'sine';
        this.cursorOsc.frequency.value = 800;
        this.cursorOsc.connect(this.cursorGain);
        this.cursorOsc.start();
        this.nodes.push(this.cursorOsc);
      }
      const freq = 400 + (y / window.innerHeight) * 600;
      this.cursorOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
      this.cursorGain.gain.setTargetAtTime(0.015, this.ctx.currentTime, 0.05);
      this.cursorGain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.1, 0.15);
    }

    // Per-section intensity modulation — called by section observer
    setSectionIntensity(level) {
      if (!this.ctx || !this.realmGain) return;
      // level: 0.0 (baseline) → 1.0 (max intensity)
      const clamped = Math.max(0, Math.min(1, level));
      const baseGain = 0.25;
      const maxGain = 0.55;
      const target = baseGain + clamped * (maxGain - baseGain);
      this.realmGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.8);
    }

    // Scroll-depth intensity — melody deepens as user scrolls further into realm
    setScrollIntensity(depth) {
      if (!this.ctx || !this.realmGain) return;
      // depth: 0.0 (top) → 1.0 (bottom)
      // Subtle: adds up to 30% more gain at full scroll
      const scrollBoost = depth * 0.08;
      const currentBase = this.realmGain.gain.value || 0.25;
      // Don't override section intensity, just layer a subtle boost
      const boosted = Math.min(0.6, currentBase + scrollBoost);
      this.realmGain.gain.setTargetAtTime(boosted, this.ctx.currentTime, 1.2);

      // Also modulate subliminal whisper intensity with scroll depth
      if (this.subliminalGain) {
        const whisperBase = 0.015;
        const whisperMax = 0.04;
        const whisperTarget = whisperBase + depth * (whisperMax - whisperBase);
        this.subliminalGain.gain.setTargetAtTime(whisperTarget, this.ctx.currentTime, 1.0);
      }
    }

    toggleMute() {
      state.audioMuted = !state.audioMuted;
      if (state.audioMuted) {
        this.stopAll();
        document.body.classList.add('audio-muted');
      } else {
        document.body.classList.remove('audio-muted');
        this.setRealm(this.currentRealm || state.currentRealm);
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
      this.transitionText = this.transitionOverlay ? this.transitionOverlay.querySelector('.transition-text') : null;
      this.setupEventListeners();
      this.initNavigation();
      this.setupSectionObserver();
    }

    setupEventListeners() {
      // Navigation links
      this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetRealmId = link.dataset.navigate;
          this.navigateTo(targetRealmId);
        });
      });

      // Enter button
      const enterBtn = document.getElementById('enter-crown');
      if (enterBtn) {
        enterBtn.addEventListener('click', () => {
          this.navigateTo('gateway');
        });
      }

      // Audio toggle
      const audioToggle = document.getElementById('audio-toggle');
      if (audioToggle) {
        audioToggle.addEventListener('click', () => {
          this.audioEngine.init();
          this.audioEngine.toggleMute();
          audioToggle.textContent = state.audioMuted ? '🔇' : '🔊';
        });
      }

      // Mobile nav toggle (hamburger)
      const navToggle = document.querySelector('.nav-toggle');
      if (navToggle) {
        navToggle.addEventListener('click', () => {
          const navLinks = document.querySelector('.nav-links');
          navLinks.classList.toggle('open');
          navToggle.classList.toggle('open');
        });
      }

      // Close mobile nav on link click
      document.querySelectorAll('.nav-link').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelector('.nav-links').classList.remove('open');
          const toggle = document.querySelector('.nav-toggle');
          if (toggle) toggle.classList.remove('open');
        });
      });

      // Video modal handling
      document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
          const videoId = card.dataset.videoId;
          this.openVideoModal(videoId);
        });
      });

      const closeBtn = document.querySelector('.video-modal .close-button');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeVideoModal());
      }

      const videoModal = document.getElementById('video-modal');
      if (videoModal) {
        videoModal.addEventListener('click', (e) => {
          if (e.target.id === 'video-modal') this.closeVideoModal();
        });
      }

      // Hash navigation
      window.addEventListener('hashchange', () => this.handleHashChange());

      // Mouse tracking
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

    // Observe sections within realm pages for per-section particle/sound changes
    setupSectionObserver() {
      const sections = document.querySelectorAll('.realm-section');
      if (sections.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const section = entry.target;
            const sectionParticles = section.dataset.sectionParticles;
            if (sectionParticles && sectionParticles !== state.currentSection) {
              state.currentSection = sectionParticles;
              this.particleEngine.setType(sectionParticles);
            }

            // Per-section audio intensification
            const sectionAudio = section.dataset.sectionAudio;
            if (sectionAudio) {
              this.audioEngine.setSectionIntensity(parseFloat(sectionAudio));
            }
          }
        });
      }, { threshold: [0.3] });

      sections.forEach(section => observer.observe(section));

      // Scroll-based intensity: melody deepens as user scrolls further into a realm
      this.setupScrollIntensity();
    }

    // Progressive audio intensification on scroll depth within a realm
    setupScrollIntensity() {
      let lastIntensityUpdate = 0;
      const realmContainer = document;

      realmContainer.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastIntensityUpdate < 200) return; // throttle
        lastIntensityUpdate = now;

        const activeRealm = document.querySelector('.realm.active');
        if (!activeRealm) return;

        const scrollTop = activeRealm.scrollTop || 0;
        const scrollHeight = activeRealm.scrollHeight || 1;
        const clientHeight = activeRealm.clientHeight || 1;
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll <= 0) return;

        // 0.0 at top → 1.0 at bottom
        const scrollDepth = Math.min(1, scrollTop / maxScroll);
        this.audioEngine.setScrollIntensity(scrollDepth);
      }, true); // capture phase to catch realm scroll
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
      state.currentSection = null;

      if (this.transitionOverlay && this.transitionText) {
        this.transitionOverlay.classList.add('active');
        this.transitionText.textContent = this.getTransitionText(targetRealmId);

        setTimeout(() => {
          this.performTransition(targetRealmId);
          setTimeout(() => {
            this.transitionOverlay.classList.remove('active');
            state.transitioning = false;
          }, 600);
        }, 600);
      } else {
        // Fallback without overlay
        this.performTransition(targetRealmId);
        setTimeout(() => {
          state.transitioning = false;
        }, 400);
      }
    }

    performTransition(targetRealmId) {
      this.deactivateRealm(state.currentRealm);
      this.activateRealm(targetRealmId);
      document.body.dataset.realm = targetRealmId;
      this.audioEngine.setRealm(targetRealmId);

      const targetEl = document.getElementById(`realm-${targetRealmId}`);
      if (targetEl) {
        const particleType = targetEl.dataset.particles || 'decay-dust';
        this.particleEngine.setType(particleType);
      }
      window.location.hash = targetRealmId;
    }

    activateRealm(realmId) {
      const targetRealm = document.getElementById(`realm-${realmId}`);
      if (targetRealm) {
        targetRealm.classList.add('active');
        state.currentRealm = realmId;
        targetRealm.scrollTop = 0;

        // Reveal-on-view animation
        setTimeout(() => {
          targetRealm.querySelectorAll('.rv').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80);
          });
        }, 200);
      }
    }

    deactivateRealm(realmId) {
      const currentRealm = document.getElementById(`realm-${realmId}`);
      if (currentRealm) {
        currentRealm.classList.remove('active');
        currentRealm.querySelectorAll('.rv').forEach(el => el.classList.remove('visible'));
      }
    }

    getTransitionText(realmId) {
      const texts = {
        'veil': 'RETURNING TO THE VEIL',
        'gateway': 'ENTERING THE GATEWAY',
        'world-drop001': 'DESCENDING INTO PRETTY WITH TEETH',
        'world-drop002': 'ENTERING THE RITUAL',
        'world-drop003': 'COLLAPSING INTO ALCHEMY',
        'world-drop004': 'FALLING INTO SWEET DECAY',
        'drops': 'VIEWING THE SIGILS',
        'btc': 'ENTERING THE HEART',
        'btc-videos': 'LOADING TRANSMISSIONS',
        'btc-blog-1': 'READING THE SIGNAL',
        'btc-t-001': 'READING TRANSMISSION 001',
        'btc-t-002': 'READING TRANSMISSION 002',
        'btc-t-003': 'READING TRANSMISSION 003',
        'btc-t-004': 'READING TRANSMISSION 004',
        'btc-t-005': 'READING TRANSMISSION 005',
        'btc-t-006': 'READING TRANSMISSION 006',
        'btc-blog-2': 'OPENING THE DARK CANVAS',
        'community': 'JOINING THE COLLECTIVE',
        'the-static': 'CONFRONTING THE STATIC',
        'about': 'ACCESSING ORIGIN FILE'
      };
      return texts[realmId] || 'CROSSING OVER';
    }

    openVideoModal(videoId) {
      const modal = document.getElementById('video-modal');
      const player = document.getElementById('video-player');
      if (modal && player && videoId && !videoId.startsWith('VIDEO_ID')) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.classList.add('active');
      }
    }

    closeVideoModal() {
      const modal = document.getElementById('video-modal');
      const player = document.getElementById('video-player');
      if (modal) modal.classList.remove('active');
      if (player) player.src = '';
    }
  }

  // ─── CAROUSEL ENGINE ───
  class CarouselEngine {
    constructor() {
      this.carousel = document.querySelector('.homepage-carousel');
      if (this.carousel) {
        this.horses = this.carousel.querySelectorAll('.carousel-horse');
        this.glitchOverlay = this.carousel.querySelector('.carousel-glitch-overlay');
        this.mistOverlay = this.carousel.querySelector('.carousel-mist-overlay');
        this.animateCarousel();
      }
    }

    animateCarousel() {
      if (!this.carousel) return;

      let rotation = 0;
      const rotationSpeed = 0.005;
      let lastGlitch = Date.now();

      const update = () => {
        rotation += rotationSpeed;
        this.carousel.style.transform = `translateX(-50%) rotateY(${rotation}deg)`;

        // Stutter effect
        if (Math.random() < 0.01) {
          rotation += (Math.random() - 0.5) * 5;
        }

        // Glitch effect
        if (this.glitchOverlay && Date.now() - lastGlitch > 3000) {
          this.glitchOverlay.style.opacity = 0.2 + Math.random() * 0.3;
          setTimeout(() => {
            if (this.glitchOverlay) this.glitchOverlay.style.opacity = 0;
          }, 50 + Math.random() * 150);
          lastGlitch = Date.now() + Math.random() * 5000;
        }

        requestAnimationFrame(update);
      };
      update();
    }
  }

  // ─── CURSOR TRAIL ───
  const cursorTrail = document.createElement('div');
  cursorTrail.id = 'cursor-trail';
  document.body.appendChild(cursorTrail);

  const TRAIL_LENGTH = 5;
  const echoes = [];
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const echo = document.createElement('div');
    echo.className = 'cursor-echo';
    document.body.appendChild(echo);
    echoes.push(echo);
  }
  let echoIndex = 0;
  let lastEchoTime = 0;

  function updateCursor(e) {
    cursorTrail.style.left = e.clientX + 'px';
    cursorTrail.style.top = e.clientY + 'px';

    if (Date.now() - lastEchoTime > 50) {
      const echo = echoes[echoIndex];
      echo.style.left = e.clientX + 'px';
      echo.style.top = e.clientY + 'px';
      echo.style.opacity = 0.6;
      echo.style.transform = 'scale(1)';
      setTimeout(() => {
        echo.style.opacity = 0;
        echo.style.transform = 'scale(2)';
      }, 10);
      echoIndex = (echoIndex + 1) % TRAIL_LENGTH;
      lastEchoTime = Date.now();
    }

    // Hover state
    const target = e.target.closest('a, button, [data-navigate], .gateway-card, .drop-card, .video-card, .blog-card, .progression-stage, .element-category, .bg-card');
    if (target) {
      cursorTrail.classList.add('hover');
    } else {
      cursorTrail.classList.remove('hover');
    }
  }

  document.addEventListener('mousemove', updateCursor);

  // ─── MAIN INIT ───
  let particleEngine, audioEngine, navigationEngine, carouselEngine;

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
    carouselEngine = new CarouselEngine();

    // Initial particle setup
    const currentRealmEl = document.getElementById(`realm-${state.currentRealm}`);
    if (currentRealmEl) {
      particleEngine.setType(currentRealmEl.dataset.particles || 'decay-dust');
    }

    animate();

    // Cursor echo styles
    const style = document.createElement('style');
    style.innerHTML = `
      .cursor-echo {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(194,116,137,0.6);
        pointer-events: none;
        z-index: 99998;
        opacity: 0;
        transform: scale(0);
        transition: opacity 0.4s, transform 0.4s;
      }
    `;
    document.head.appendChild(style);

    // Initial mute state
    if (state.audioMuted) {
      document.body.classList.add('audio-muted');
    }

    // Community form handler
    const communityForm = document.getElementById('community-post-form');
    if (communityForm) {
      communityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('post-name').value.trim();
        const type = document.getElementById('post-type').value;
        const content = document.getElementById('post-content').value.trim();
        if (!name || !content) return;

        const feed = document.getElementById('community-feed');
        if (feed) {
          const post = document.createElement('div');
          post.className = 'feed-post feed-post-new';
          const typeLabels = { written: 'TRANSMISSION', art: 'ARTWORK', video: 'VIDEO', story: 'STORY' };
          post.innerHTML = `
            <span class="feed-author">${name.replace(/</g, '&lt;')}</span>
            <span class="feed-type">${typeLabels[type] || 'TRANSMISSION'}</span>
            <p class="feed-content">"${content.replace(/</g, '&lt;')}"</p>
          `;
          feed.appendChild(post);
          setTimeout(() => post.classList.add('visible'), 10);

          // Clear form
          document.getElementById('post-name').value = '';
          document.getElementById('post-content').value = '';
          document.getElementById('post-link').value = '';
        }
      });
    }
  });

})();
