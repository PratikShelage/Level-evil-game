import { createTrapsFromDefs } from './traps.js';

export const TILE_SIZE = 48;
export const TILES = {
  EMPTY: 0,
  FLOOR: 1,
  WALL: 2,
  SPIKE: 3,
  DOOR: 4,
  SPAWN: 5,
  FAKE: 6,
  CEILING: 7,
  GRAVITY_ZONE: 8
};

export class Level {
  constructor(definition) {
    this.definition = definition;
    this.cols = definition.cols;
    this.rows = definition.rows;
    this.tiles = definition.tiles.slice();
    this.spawn = this.findTile(TILES.SPAWN) || { x: TILE_SIZE * 1.5, y: TILE_SIZE * 10 };
    this.door = this.findTile(TILES.DOOR) || { x: TILE_SIZE * 18, y: TILE_SIZE * 11 };
    this.gravityZones = definition.gravityZones || [];
    this.traps = createTrapsFromDefs(definition.traps || [], this);
  }

  reset() {
    this.tiles = this.definition.tiles.slice();
    this.traps = createTrapsFromDefs(this.definition.traps || [], this);
    this.door = this.findTile(TILES.DOOR) || this.door;
  }

  getTile(col, row) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return TILES.WALL;
    return this.tiles[row * this.cols + col];
  }

  setTile(col, row, value) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return;
    this.tiles[row * this.cols + col] = value;
  }

  isSolid(tile) {
    return [TILES.FLOOR, TILES.WALL, TILES.CEILING].includes(tile);
  }

  findTile(target) {
    const idx = this.tiles.indexOf(target);
    if (idx < 0) return null;
    const col = idx % this.cols;
    const row = Math.floor(idx / this.cols);
    return { x: col * TILE_SIZE, y: row * TILE_SIZE, col, row };
  }

  resolvePlayerX(player) {
    const box = player.getAABB();
    const startCol = Math.floor(box.x / TILE_SIZE);
    const endCol = Math.floor((box.x + box.w) / TILE_SIZE);
    const startRow = Math.floor(box.y / TILE_SIZE);
    const endRow = Math.floor((box.y + box.h - 1) / TILE_SIZE);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        if (!this.isSolid(this.getTile(col, row))) continue;
        const tileLeft = col * TILE_SIZE;
        const tileRight = tileLeft + TILE_SIZE;
        if (player.vx > 0) player.x = tileLeft - player.width + player.hitboxInset;
        else if (player.vx < 0) player.x = tileRight - player.hitboxInset;
        player.vx = 0;
      }
    }
  }

  resolvePlayerY(player) {
    const box = player.getAABB();
    const startCol = Math.floor(box.x / TILE_SIZE);
    const endCol = Math.floor((box.x + box.w - 1) / TILE_SIZE);
    const startRow = Math.floor(box.y / TILE_SIZE);
    const endRow = Math.floor((box.y + box.h) / TILE_SIZE);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        if (!this.isSolid(this.getTile(col, row))) continue;
        const tileTop = row * TILE_SIZE;
        const tileBottom = tileTop + TILE_SIZE;
        if (player.vy > 0) {
          player.y = tileTop - player.height + player.hitboxInset;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = tileBottom - player.hitboxInset;
          player.vy = 0;
        }
      }
    }
  }

  updateTraps(dt, player, gameState) {
    for (const trap of this.traps) trap.update(dt, player, this, gameState);
  }

  checkHazards(player) {
    const box = player.getAABB();
    const corners = [
      [box.x, box.y + box.h],
      [box.x + box.w, box.y + box.h],
      [box.x + box.w * 0.5, box.y + box.h]
    ];

    for (const [x, y] of corners) {
      const tile = this.getTile(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
      if (tile === TILES.SPIKE) return true;
    }

    for (const trap of this.traps) {
      if (trap.isLethalTo?.(box, player)) return true;
    }
    return false;
  }

  checkDoor(player) {
    const box = player.getAABB();
    return box.x < this.door.x + TILE_SIZE && box.x + box.w > this.door.x && box.y < this.door.y + TILE_SIZE && box.y + box.h > this.door.y;
  }

  inReverseGravity(player) {
    return this.gravityZones.some((zone) => player.x + player.width > zone.x && player.x < zone.x + zone.w && player.y + player.height > zone.y && player.y < zone.y + zone.h);
  }
}
