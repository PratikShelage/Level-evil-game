import { TILE_SIZE, TILES } from './level.js';

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

class BaseTrap {
  constructor(def) {
    this.def = def;
    this.triggered = false;
    this.active = false;
    this.timer = 0;
    this.telegraphTimer = 0;
  }

  attemptTrigger(player) {
    const t = this.def.trigger || { type: 'timer', delay: 0, telegraph: 0 };
    if (this.triggered) return;
    if (t.type === 'timer') {
      this.timer += player.dt;
      if (this.timer >= (t.distance ?? 1)) this.triggered = true;
      return;
    }
    const p = player.box;
    const area = this.def.area || { x: this.def.x, y: this.def.y, w: this.def.w || TILE_SIZE, h: this.def.h || TILE_SIZE };
    if (t.type === 'proximity') {
      const cx = area.x + area.w / 2;
      const cy = area.y + area.h / 2;
      const px = p.x + p.w / 2;
      const py = p.y + p.h / 2;
      if (Math.hypot(cx - px, cy - py) <= t.distance) this.triggered = true;
    } else if (t.type === 'reach_x' && p.x >= t.distance) this.triggered = true;
    else if (t.type === 'reach_y' && p.y >= t.distance) this.triggered = true;
    else if (t.type === 'step_on') {
      if (overlaps(p, area)) this.triggered = true;
    }
  }

  update(dt, player, level, gameState) {
    const info = { box: player.getAABB(), dt };
    this.attemptTrigger(info);
    if (!this.triggered) return;
    const trigger = this.def.trigger || {};
    if (!this.active) {
      this.telegraphTimer += dt;
      if (this.telegraphTimer >= (trigger.telegraph || 0) / 1000) {
        this.active = true;
        gameState.onTrapActivate?.(this);
      }
      return;
    }
    this.updateActive(dt, player, level, gameState);
  }
}

class CollapsingFloorTrap extends BaseTrap {
  constructor(def) {
    super(def);
    this.tiles = def.tiles;
    this.falling = [];
  }

  updateActive(dt, player, level, gameState) {
    if (this.falling.length === 0) {
      for (const [c, r] of this.tiles) {
        if (level.getTile(c, r) !== TILES.EMPTY) {
          level.setTile(c, r, TILES.EMPTY);
          this.falling.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, vy: 0 });
        }
      }
      gameState.onFloorCollapse?.();
    }
    for (const item of this.falling) {
      item.vy += 1200 * dt;
      item.y += item.vy * dt;
    }
  }
}

class PopUpSpikeTrap extends BaseTrap {
  constructor(def) { super(def); this.progress = 0; }
  updateActive(dt) { this.progress = Math.min(1, this.progress + dt * 6); }
  isLethalTo(box) {
    if (!this.active) return false;
    const h = (this.def.h || TILE_SIZE) * this.progress;
    return overlaps(box, { x: this.def.x + 8, y: this.def.y + TILE_SIZE - h, w: (this.def.w || TILE_SIZE) - 16, h });
  }
}

class FallingCeilingTrap extends BaseTrap {
  constructor(def) { super(def); this.y = def.y; this.vy = 0; }
  updateActive(dt) { this.vy += 1600 * dt; this.y += this.vy * dt; }
  isLethalTo(box) { return this.active && overlaps(box, { x: this.def.x, y: this.y, w: this.def.w, h: this.def.h }); }
}

class MovingWallTrap extends BaseTrap {
  constructor(def) { super(def); this.x = def.x; this.dir = def.dir ?? 1; }
  updateActive(dt, player) {
    this.x += this.dir * this.def.speed * dt;
    if (this.x < this.def.minX || this.x > this.def.maxX) this.dir *= -1;
    const wall = { x: this.x, y: this.def.y, w: this.def.w, h: this.def.h };
    if (overlaps(player.getAABB(), wall)) player.x += this.dir * this.def.speed * dt;
  }
  isLethalTo(box) { return this.active && overlaps(box, { x: this.x, y: this.def.y, w: this.def.w, h: this.def.h }); }
}

class SurpriseSawTrap extends BaseTrap {
  constructor(def) { super(def); this.progress = 0; }
  updateActive(dt) { this.progress = Math.min(1, this.progress + dt * this.def.speed); }
  getPosition() {
    return {
      x: this.def.from.x + (this.def.to.x - this.def.from.x) * this.progress,
      y: this.def.from.y + (this.def.to.y - this.def.from.y) * this.progress
    };
  }
  isLethalTo(box) {
    if (!this.active) return false;
    const p = this.getPosition();
    return overlaps(box, { x: p.x - this.def.radius + 2, y: p.y - this.def.radius + 2, w: this.def.radius * 2 - 4, h: this.def.radius * 2 - 4 });
  }
}

class FloorShiftTrap extends BaseTrap {
  constructor(def) { super(def); this.offset = 0; this.dir = 1; }
  updateActive(dt, player) {
    this.offset += this.dir * this.def.speed * dt;
    if (Math.abs(this.offset) > this.def.range) this.dir *= -1;
    const platform = { x: this.def.x + this.offset, y: this.def.y, w: this.def.w, h: this.def.h };
    const p = player.getAABB();
    const standing = p.y + p.h <= platform.y + 8 && p.y + p.h >= platform.y - 8 && p.x + p.w > platform.x && p.x < platform.x + platform.w;
    if (standing) player.externalVX = this.dir * this.def.speed;
  }
}

class TeleportSpikeTrap extends BaseTrap {
  constructor(def) { super(def); this.target = null; }
  update(dt, player, level, gameState) {
    if (!this.triggered && player.vy > 90) this.triggered = true;
    if (!this.triggered) return;
    if (!this.target) {
      const landingX = player.x + player.vx * 0.25;
      const col = Math.max(0, Math.min(level.cols - 1, Math.floor((landingX + player.width / 2) / TILE_SIZE)));
      const row = Math.min(level.rows - 1, Math.floor((player.y + player.height + 90) / TILE_SIZE));
      this.target = { x: col * TILE_SIZE, y: row * TILE_SIZE };
      this.telegraphTimer = 0;
      gameState.onTrapTelegraph?.(this);
      return;
    }
    this.telegraphTimer += dt;
    if (this.telegraphTimer >= 0.2) this.active = true;
  }
  isLethalTo(box) { return this.active && this.target && overlaps(box, { x: this.target.x + 8, y: this.target.y + 10, w: TILE_SIZE - 16, h: TILE_SIZE - 10 }); }
}

class DoorTrollTrap extends BaseTrap {
  constructor(def) { super(def); this.used = 0; }
  update(dt, player, level) {
    const doorBox = { x: level.door.x, y: level.door.y, w: TILE_SIZE, h: TILE_SIZE };
    if (this.used < this.def.moves.length && overlaps(player.getAABB(), { x: doorBox.x - 26, y: doorBox.y - 26, w: doorBox.w + 52, h: doorBox.h + 52 })) {
      const move = this.def.moves[this.used];
      level.door.x = move.x;
      level.door.y = move.y;
      this.used += 1;
    }
  }
}

class ReverseGravityTrap extends BaseTrap {
  update(dt, player) {
    if (overlaps(player.getAABB(), this.def.area)) player.gravity = -1100;
    else player.gravity = 1100;
  }
}

class FakeFloorTrap extends BaseTrap {
  update(dt, player, level) {
    if (overlaps(player.getAABB(), this.def.area)) {
      for (const [c, r] of this.def.tiles) level.setTile(c, r, TILES.EMPTY);
      this.triggered = true;
      this.active = true;
    }
  }
}

const types = {
  collapsing_floor: CollapsingFloorTrap,
  popup_spike: PopUpSpikeTrap,
  falling_ceiling: FallingCeilingTrap,
  moving_wall: MovingWallTrap,
  saw: SurpriseSawTrap,
  floor_shift: FloorShiftTrap,
  teleport_spike: TeleportSpikeTrap,
  door_troll: DoorTrollTrap,
  reverse_gravity: ReverseGravityTrap,
  fake_floor: FakeFloorTrap
};

export function createTrapsFromDefs(defs) {
  return defs.map((def) => new (types[def.type] || BaseTrap)(def));
}
