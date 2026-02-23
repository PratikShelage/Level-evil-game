export class Player {
  constructor(spawn) {
    this.width = 16;
    this.height = 24;
    this.hitboxInset = 2;
    this.maxSpeed = 190;
    this.acceleration = 1200;
    this.deceleration = 1500;
    this.gravity = 1100;
    this.jumpVelocity = 430;
    this.maxFallSpeed = 640;
    this.coyoteTime = 0.08;
    this.jumpBufferTime = 0.1;
    this.reset(spawn);
  }

  reset(spawn) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpHeld = false;
    this.externalVX = 0;
  }

  getAABB() {
    return {
      x: this.x + this.hitboxInset,
      y: this.y + this.hitboxInset,
      w: this.width - this.hitboxInset * 2,
      h: this.height - this.hitboxInset
    };
  }

  update(dt, input, level) {
    const desired = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (desired !== 0) {
      this.vx += desired * this.acceleration * dt;
    } else {
      const decel = this.deceleration * dt;
      if (Math.abs(this.vx) <= decel) this.vx = 0;
      else this.vx -= Math.sign(this.vx) * decel;
    }
    this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

    this.coyoteTimer = this.onGround ? this.coyoteTime : Math.max(0, this.coyoteTimer - dt);
    if (input.jumpPressed) this.jumpBufferTimer = this.jumpBufferTime;
    else this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = -this.jumpVelocity;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.jumpHeld = true;
      return { jumped: true };
    }

    if (!input.jump && this.vy < 0 && this.jumpHeld) {
      this.vy *= 0.58;
      this.jumpHeld = false;
    }

    this.vy += this.gravity * dt;
    this.vy = Math.min(this.vy, this.maxFallSpeed);

    this.x += (this.vx + this.externalVX) * dt;
    level.resolvePlayerX(this);

    this.y += this.vy * dt;
    this.onGround = false;
    level.resolvePlayerY(this);
    this.externalVX = 0;

    return { jumped: false };
  }
}
