import { TILES, TILE_SIZE } from '../level.js';

const map = {
  '.': TILES.EMPTY,
  '#': TILES.FLOOR,
  'W': TILES.WALL,
  '^': TILES.SPIKE,
  'D': TILES.DOOR,
  'S': TILES.SPAWN,
  'F': TILES.FAKE,
  'C': TILES.CEILING
};

export function fromAscii(rows) {
  const cols = rows[0].length;
  const tiles = rows.join('').split('').map((ch) => map[ch] ?? TILES.EMPTY);
  return { cols, rows: rows.length, tiles };
}

export const t = (c, r) => [c, r];
export const px = (c, r) => ({ x: c * TILE_SIZE, y: r * TILE_SIZE });
