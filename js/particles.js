/* ═══════════════════════════════════════════════════════════
   VOID PARTICLE SYSTEM — Layer 1
   The site breathes. The universe is always moving.
   Lightweight canvas-based particle system.
   ═══════════════════════════════════════════════════════════ */

class VoidParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.particleCount = 80;
    this.fogPoints = [];
    this.frameCount = 0;
    
    // Realm color config (will be updated)
    this.realmColor = { r: 180, g: 140, b: 232 }; // default violet
    this.targetColor = { r: 180, g: 140, b: 232 };
    
    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }
  
  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }
  
  init() {
    // Create particles (stars/dust)
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.1 - 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }
    
    // Create fog points
    this.fogPoints = [];
    for (let i = 0; i < 5; i++) {
      this.fogPoints.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 300 + 200,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.03 + 0.01,
      });
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      if (this.particles.length < 20) this.init();
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }
  
  setRealmColor(r, g, b) {
    this.targetColor = { r, g, b };
  }
  
  lerpColor() {
    const speed = 0.02;
    this.realmColor.r += (this.targetColor.r - this.realmColor.r) * speed;
    this.realmColor.g += (this.targetColor.g - this.realmColor.g) * speed;
    this.realmColor.b += (this.targetColor.b - this.realmColor.b) * speed;
  }
  
  animate() {
    this.frameCount++;
    this.lerpColor();
    
    const { ctx, width, height } = this;
    const { r, g, b } = this.realmColor;
    
    // Clear with slight trail (creates motion blur effect)
    ctx.fillStyle = 'rgba(5, 2, 8, 0.15)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw fog (every 2nd frame for performance)
    if (this.frameCount % 2 === 0) {
      for (const fog of this.fogPoints) {
        fog.x += fog.speedX;
        fog.y += fog.speedY;
        
        // Wrap around
        if (fog.x < -fog.radius) fog.x = width + fog.radius;
        if (fog.x > width + fog.radius) fog.x = -fog.radius;
        if (fog.y < -fog.radius) fog.y = height + fog.radius;
        if (fog.y > height + fog.radius) fog.y = -fog.radius;
        
        const gradient = ctx.createRadialGradient(
          fog.x, fog.y, 0,
          fog.x, fog.y, fog.radius
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fog.opacity})`);
        gradient.addColorStop(1, 'rgba(5, 2, 8, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(fog.x - fog.radius, fog.y - fog.radius, fog.radius * 2, fog.radius * 2);
      }
    }
    
    // Draw particles
    for (const p of this.particles) {
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;
      
      // Mouse influence (subtle push)
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200 * 0.02;
        p.x -= dx * force;
        p.y -= dy * force;
      }
      
      // Wrap around
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
      
      // Pulsing opacity
      const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
      
      // Glow for larger particles
      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.1})`;
        ctx.fill();
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize on load
window.voidParticles = null;
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('void-canvas');
  if (canvas) {
    window.voidParticles = new VoidParticles(canvas);
  }
});
