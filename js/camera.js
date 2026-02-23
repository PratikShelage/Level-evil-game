export class Camera {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.shakeTime = 0;
    this.intensity = 0;
  }

  shake(intensity = 5, duration = 0.08) {
    this.intensity = Math.max(this.intensity, intensity);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  update(dt) {
    this.shakeTime = Math.max(0, this.shakeTime - dt);
  }

  getOffset() {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() * 2 - 1) * this.intensity,
      y: (Math.random() * 2 - 1) * this.intensity
    };
  }
}
