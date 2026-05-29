/* ═══════════════════════════════════════════════════════════════
   PRETTY LITTLE NIGHTMARES — SWEET DECAY ENGINE v2
   Particles · Audio · Navigation · Cursor · Transitions
   ═══════════════════════════════════════════════════════════════ */

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
      const count = type === 'decay-dust' ? 120 : type === 'candy-breath' ? 90 : type === 'moth-wings' ? 70 : 80;
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
        speed: 0.002 + Math.random() * 0.005
      };

      if (type === 'decay-dust') {
        base.color = `rgba(184,154,90,${0.25 + Math.random() * 0.35})`;
        base.vy = -0.15 - Math.random() * 0.5;
        base.size = 1 + Math.random() * 3;
      } else if (type === 'candy-breath') {
        const colors = ['rgba(212,160,192,', 'rgba(194,116,137,', 'rgba(212,80,107,'];
        base.color = colors[Math.floor(Math.random() * colors.length)] + (0.3 + Math.random() * 0.3) + ')';
        base.pulseRate = 0.01 + Math.random() * 0.02;
        base.baseSize = 2 + Math.random() * 5;
        base.size = base.baseSize;
      } else if (type === 'moth-wings') {
        base.color = `rgba(160,60,90,${0.3 + Math.random() * 0.35})`;
        base.wingPhase = Math.random() * Math.PI * 2;
        base.wingSpeed = 0.03 + Math.random() * 0.05;
        base.size = 2.5 + Math.random() * 4;
        base.flutter = Math.random() * 3;
      } else if (type === 'thorn-lollipop') {
        base.color = `rgba(180,140,60,${0.2 + Math.random() * 0.3})`;
        base.vy = 0.2 + Math.random() * 0.5;
        base.drip = Math.random();
        base.size = 1.5 + Math.random() * 3.5;
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
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Type-specific behavior
        if (this.type === 'candy-breath') {
          p.size = p.baseSize + Math.sin(t * p.pulseRate * 60) * 1;
        } else if (this.type === 'moth-wings') {
          p.wingPhase += p.wingSpeed;
          p.x += Math.sin(p.wingPhase) * p.flutter;
        } else if (this.type === 'thorn-lollipop') {
          p.size = p.size * (1 + Math.sin(t * 2 + p.drip * 10) * 0.05);
        }

        // Draw
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();

        // Glow halos for larger particles
        if (p.size > 2) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const glowColor = this.type === 'moth-wings' ? 'rgba(160,60,90,0.06)'
            : this.type === 'candy-breath' ? 'rgba(212,160,192,0.05)'
            : this.type === 'decay-dust' ? 'rgba(184,154,90,0.04)'
            : 'rgba(180,140,60,0.05)';
          this.ctx.fillStyle = glowColor;
          this.ctx.fill();
        }
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
            // Low drone + distant echoes + faint soft screams
            this.createOsc(55, 'sine', 0, 0.06);
            this.createOsc(55.5, 'sine', 5, 0.04);
            this.createOsc(82.5, 'sine', -3, 0.02);
            this.createNoise(0.008);
            // Faint muffled cries (high filtered noise with LFO)
            { const cry = this.createNoise(0.004);
              cry.filter.type = 'bandpass';
              cry.filter.frequency.value = 600;
              cry.filter.Q.value = 8;
              const cryLfo = this.ctx.createOscillator();
              cryLfo.frequency.value = 0.12;
              const cryLfoG = this.ctx.createGain();
              cryLfoG.gain.value = 400;
              cryLfo.connect(cryLfoG);
              cryLfoG.connect(cry.filter.frequency);
              cryLfo.start();
              this.nodes.push(cryLfo); }
            break;

          case 'gateway':
            // Drone + questioning piano note
            this.createOsc(55, 'sine', 0, 0.05);
            this.createOsc(110, 'triangle', 0, 0.015);
            this.createNoise(0.004);
            // Single questioning note (A3)
            { const q = this.createOsc(220, 'sine', 0, 0);
              const lfo = this.ctx.createOscillator();
              lfo.frequency.value = 0.15;
              const lfoGain = this.ctx.createGain();
              lfoGain.gain.value = 0.02;
              lfo.connect(lfoGain);
              lfoGain.connect(q.gain.gain);
              lfo.start();
              this.nodes.push(lfo); }
            break;

          case 'pretty-teeth':
            // DROP001: seductive, invasive, magnetic pink horror
            this.createOsc(65, 'sine', 0, 0.04);
            this.createOsc(130, 'triangle', 7, 0.015);
            this.createOsc(195, 'sine', -5, 0.008);
            this.createNoise(0.005);
            // Invasive music box shimmer
            { const mb = this.createOsc(523.25, 'sine', 0, 0);
              const mbLfo = this.ctx.createOscillator();
              mbLfo.frequency.value = 0.3;
              const mbLfoG = this.ctx.createGain();
              mbLfoG.gain.value = 0.008;
              mbLfo.connect(mbLfoG);
              mbLfoG.connect(mb.gain.gain);
              mbLfo.start();
              this.nodes.push(mbLfo); }
            break;

          case 'gothic-romance':
            // DROP002: Cello bellows + piano weeps + tombstone wind
            this.createOsc(65.4, 'sawtooth', 0, 0.015);  // cello-like
            this.createOsc(130.8, 'sawtooth', 3, 0.008);
            this.createOsc(98, 'sine', 0, 0.03);
            // Piano weeping
            this.createOsc(261.6, 'triangle', 0, 0.006);
            this.createOsc(329.6, 'sine', -2, 0.004);
            // Wind through tombstones
            { const wind = this.createNoise(0.012);
              wind.filter.frequency.value = 300;
              const wLfo = this.ctx.createOscillator();
              wLfo.frequency.value = 0.08;
              const wLfoG = this.ctx.createGain();
              wLfoG.gain.value = 0.008;
              wLfo.connect(wLfoG);
              wLfoG.connect(wind.gain.gain);
              wLfo.start();
              this.nodes.push(wLfo); }
            break;

          case 'alchemy':
            // DROP003: Cosmic dread, dimensional collapse, Escher geometry
            this.createOsc(48, 'sine', 0, 0.05);
            this.createOsc(72, 'sine', 6, 0.03);
            this.createOsc(96, 'triangle', -4, 0.015);
            // Cosmic shimmer
            this.createOsc(440, 'sine', 0, 0.003);
            this.createOsc(554.4, 'sine', 8, 0.002);
            // Deep space noise
            { const space = this.createNoise(0.008);
              space.filter.frequency.value = 120; }
            break;

          case 'childhood-distortion':
            // DROP004: Broken music box + children's laughter frequency + creaking
            this.createOsc(55, 'sine', 0, 0.04);
            // Music box broken melody (sugar plum fairy nightmare)
            this.createOsc(392, 'sine', 0, 0.004);
            this.createOsc(523.25, 'triangle', 15, 0.003);
            this.createOsc(659.25, 'sine', -10, 0.002);
            // Creaking doors (filtered noise)
            { const creak = this.createNoise(0.008);
              creak.filter.type = 'bandpass';
              creak.filter.frequency.value = 800;
              creak.filter.Q.value = 5;
              const mLfo = this.ctx.createOscillator();
              mLfo.frequency.value = 0.5;
              const mLfoG = this.ctx.createGain();
              mLfoG.gain.value = 500;
              mLfo.connect(mLfoG);
              mLfoG.connect(creak.filter.frequency);
              mLfo.start();
              this.nodes.push(mLfo); }
            // Children giggling frequency
            { const giggle = this.createNoise(0.003);
              giggle.filter.type = 'bandpass';
              giggle.filter.frequency.value = 2000;
              giggle.filter.Q.value = 3;
              const gLfo = this.ctx.createOscillator();
              gLfo.frequency.value = 3;
              const gLfoG = this.ctx.createGain();
              gLfoG.gain.value = 0.002;
              gLfo.connect(gLfoG);
              gLfoG.connect(giggle.gain.gain);
              gLfo.start();
              this.nodes.push(gLfo); }
            break;

          case 'sanctuary':
            // Warm, calm, hopeful pad
            this.createOsc(110, 'sine', 0, 0.03);
            this.createOsc(165, 'sine', 2, 0.015);
            this.createOsc(220, 'sine', -1, 0.008);
            break;
        }

        // Subliminal layer (barely audible binaural tones for Be The Change)
        if (profile !== 'sanctuary') {
          this.createOsc(40, 'sine', 0, 0.003);
          this.createOsc(40.5, 'sine', 0, 0.003);
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

      this.cursorOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
      this.cursorGain.gain.setTargetAtTime(0.005, this.ctx.currentTime, 0.05);
      this.cursorGain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.05, 0.3);
    }

    setMuted(muted) {
      if (!this.masterGain) return;
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.25, this.ctx.currentTime, 0.3);
    }
  }

  // ─── NAVIGATION ENGINE ───
  class NavigationEngine {
    constructor(particles, audio) {
      this.particles = particles;
      this.audio = audio;
      this.setupListeners();
    }

    setupListeners() {
      // Data-navigate links
      document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-navigate]');
        if (!el) return;
        e.preventDefault();
        const target = el.dataset.navigate;
        if (target !== state.currentRealm) {
          this.navigate(target);
        }
      });

      // Enter the Realm button (homepage)
      const enter = document.getElementById('enter-crown');
      if (enter) {
        enter.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigate('gateway');
        });
      }

      // Video thumbnails
      document.addEventListener('click', (e) => {
        const thumb = e.target.closest('.video-thumb');
        if (!thumb) return;
        const videoId = thumb.dataset.videoId;
        const modal = document.getElementById('video-modal');
        const frame = document.getElementById('modal-video-frame');
        if (modal && frame) {
          frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allowfullscreen allow="autoplay"></iframe>`;
          modal.classList.add('active');
        }
      });

      // Video modal close
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('video-modal-close') || e.target.classList.contains('video-modal')) {
          const modal = document.getElementById('video-modal');
          if (modal) {
            modal.classList.remove('active');
            const frame = document.getElementById('modal-video-frame');
            if (frame) frame.innerHTML = '';
          }
        }
      });

      // Audio toggle
      const audioBtn = document.getElementById('audio-toggle');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          if (!state.audioStarted) {
            this.audio.init();
            state.audioMuted = false;
            audioBtn.textContent = '🔊';
            this.audio.setRealm(state.currentRealm);
          } else {
            state.audioMuted = !state.audioMuted;
            audioBtn.textContent = state.audioMuted ? '🔇' : '🔊';
            this.audio.setMuted(state.audioMuted);
            if (!state.audioMuted) {
              this.audio.setRealm(state.currentRealm);
            }
          }
        });
      }

      // Mobile nav toggle
      const navToggle = document.querySelector('.nav-toggle');
      if (navToggle) {
        navToggle.addEventListener('click', () => {
          document.querySelector('.nav-links')?.classList.toggle('open');
        });
      }
      document.querySelectorAll('.nav-link').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelector('.nav-links')?.classList.remove('open');
        });
      });
    }

    navigate(targetRealm) {
      if (state.transitioning) return;
      state.transitioning = true;

      // Transition texts
      const texts = {
        'veil': 'RETURNING TO THE VEIL',
        'gateway': 'APPROACHING THE GATEWAY',
        'world-drop001': 'DESCENDING INTO PRETTY WITH TEETH',
        'world-drop002': 'ENTERING THE RITUAL TOOLKIT',
        'world-drop003': 'FALLING INTO THE ALCHEMY OF WORLDS',
        'world-drop004': 'THE NIGHTMARES ARE WAITING',
        'drops': 'OPENING THE ARCHIVE',
        'btc': 'ENTERING THE SANCTUARY',
        'btc-videos': 'LOADING TRANSMISSIONS',
        'btc-blog-1': 'TUNING THE FREQUENCY',
        'btc-blog-2': 'OPENING THE DARK CANVAS',
        'community': 'CONNECTING TO THE COLLECTIVE',
        'the-static': 'ANSWERING THE INTERFERENCE',
        'about': 'ACCESSING ORIGIN FILE'
      };

      // Create inline overlay
      const overlay = document.getElementById('transition-overlay');
      if (overlay) {
        const textEl = overlay.querySelector('.transition-text');
        if (textEl) textEl.textContent = texts[targetRealm] || 'CROSSING OVER';
        overlay.classList.add('active');
      }

      setTimeout(() => {
        // Deactivate current
        document.querySelectorAll('.realm.active').forEach(r => {
          r.classList.remove('active');
          // Reset reveal animations
          r.querySelectorAll('.rv.revealed').forEach(el => el.classList.remove('revealed'));
        });

        // Activate target
        const target = document.getElementById('realm-' + targetRealm);
        if (target) {
          target.classList.add('active');
          target.scrollTop = 0;
          state.currentRealm = targetRealm;
          document.body.dataset.realm = targetRealm;

          // Set particles
          const pType = target.dataset.particles || 'decay-dust';
          this.particles.setType(pType);

          // Set audio
          if (state.audioStarted && !state.audioMuted) {
            this.audio.setRealm(targetRealm);
          }

          // Show/hide nav
          const mainNav = document.getElementById('main-nav');
          if (mainNav) mainNav.classList.toggle('nav-hidden', targetRealm === 'veil');

          // Update URL
          history.pushState(null, '', '#' + targetRealm);

          // Trigger reveal animations
          this.revealElements(target);
        }

        setTimeout(() => {
          if (overlay) overlay.classList.remove('active');
          state.transitioning = false;
        }, 600);
      }, 700);
    }

    revealElements(container) {
      const elements = container.querySelectorAll('.rv:not(.revealed)');
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('revealed');
        }, 100 + i * 80);
      });
    }
  }

  // ─── NIGHTMARE SKY ───
  class NightmareSky {
    constructor() {
      this.canvas = document.getElementById('sky-canvas');
      if (!this.canvas || !this.canvas.getContext) return;
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return;
      this.stars = [];
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.generateStars();
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    generateStars() {
      this.stars = [];
      for (let i = 0; i < 150; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 1.5,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.005 + Math.random() * 0.02
        });
      }
    }

    update(realm) {
      if (!this.canvas || !this.ctx) return;
      const skyOpacity = {
        'veil': 0.15, 'gateway': 0.2,
        'world-drop001': 0.25, 'world-drop002': 0.5,
        'world-drop003': 0.6, 'world-drop004': 0.45,
        'drops': 0.2
      };
      const op = skyOpacity[realm] || 0;
      this.canvas.style.opacity = op;
      if (op === 0) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const t = Date.now() * 0.001;

      for (const star of this.stars) {
        star.twinkle += star.speed;
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        const color = realm === 'world-drop003' ? `rgba(100,130,200,${alpha})`
          : realm === 'world-drop002' ? `rgba(160,80,100,${alpha})`
          : realm === 'veil' ? `rgba(184,154,90,${alpha * 0.6})`
          : realm === 'gateway' ? `rgba(160,140,180,${alpha * 0.7})`
          : realm === 'world-drop001' ? `rgba(212,160,192,${alpha * 0.8})`
          : realm === 'drops' ? `rgba(140,120,180,${alpha * 0.6})`
          : `rgba(180,160,100,${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x + Math.sin(t + star.twinkle) * 0.5, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      }
    }
  }

  // ─── INIT ───
  function init() {
    // Create missing elements
    // Transition overlay
    if (!document.getElementById('transition-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'transition-overlay';
      overlay.innerHTML = '<span class="transition-text">CROSSING OVER</span>';
      document.body.appendChild(overlay);
    }

    // Cursor trail
    if (!document.getElementById('cursor-trail')) {
      const trail = document.createElement('div');
      trail.id = 'cursor-trail';
      document.body.appendChild(trail);
    }

    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const particles = new ParticleEngine(canvas);
    const audio = new AudioEngine();
    const nav = new NavigationEngine(particles, audio);
    const sky = new NightmareSky();

    // Start with veil particles
    particles.setType('decay-dust');

    // Initial reveal for veil
    const veil = document.getElementById('realm-veil');
    if (veil) {
      setTimeout(() => {
        veil.querySelectorAll('.rv').forEach((el, i) => {
          setTimeout(() => el.classList.add('revealed'), 100 + i * 100);
        });
      }, 500);
    }

    // Cursor system
    const trail = document.getElementById('cursor-trail');
    let lastEchoTime = 0;

    document.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;

      if (trail) {
        trail.style.left = (e.clientX - 10) + 'px';
        trail.style.top = (e.clientY - 10) + 'px';
        trail.classList.add('visible');
      }

      const now = Date.now();
      if (now - lastEchoTime > 100) {
        lastEchoTime = now;
        audio.cursorEcho(e.clientX, e.clientY);
      }
    });

    document.addEventListener('mouseleave', () => {
      if (trail) trail.classList.remove('visible');
    });

    // Hover effects on interactive elements
    document.addEventListener('mouseenter', (e) => {
      if (e.target.closest('a, button, [data-navigate], .gateway-card, .drop-card, .video-thumb, .btn-descend, .btn-sanctuary, .btn-section, .drop004-section-card')) {
        trail?.classList.add('hover');
      }
    }, true);
    document.addEventListener('mouseleave', (e) => {
      if (e.target.closest('a, button, [data-navigate], .gateway-card, .drop-card, .video-thumb, .btn-descend, .btn-sanctuary, .btn-section, .drop004-section-card')) {
        trail?.classList.remove('hover');
      }
    }, true);

    // Scroll reveals
    function handleScroll() {
      const active = document.querySelector('.realm.active');
      if (!active) return;
      const vh = window.innerHeight;
      active.querySelectorAll('.rv:not(.revealed)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.85) {
          el.classList.add('revealed');
        }
      });
    }

    document.querySelectorAll('.realm').forEach(realm => {
      realm.addEventListener('scroll', handleScroll);
    });
    window.addEventListener('scroll', handleScroll);

    // Animation loop
    function animate() {
      try { particles.update(); } catch (e) {}
      try { sky.update(state.currentRealm); } catch (e) {}
      requestAnimationFrame(animate);
    }
    animate();

    // Check hash on load
    const hash = window.location.hash.slice(1);
    if (hash && hash !== 'veil') {
      setTimeout(() => nav.navigate(hash), 100);
    }

    // First interaction starts audio context (but muted)
    document.addEventListener('click', function firstClick() {
      if (!state.audioStarted) {
        audio.init();
        audio.setMuted(true);
      }
      document.removeEventListener('click', firstClick);
    }, { once: true });
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
