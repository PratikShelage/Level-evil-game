export class ParticleSystem {
  constructor() {
    this.items = [];
  }

  spawnDeath(x, y) {
    for (let i = 0; i < 11; i += 1) {
      const angle = (Math.PI * 2 * i) / 11 + Math.random() * 0.4;
      const speed = 80 + Math.random() * 180;
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.2,
        size: 2 + Math.random() * 3,
        maxLife: 0.6
      });
    }
  }

  update(dt) {
    this.items = this.items.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 450 * dt;
      return p.life > 0;
    });
  }
}
