import { fromAscii } from './levelUtils.js';

const base = fromAscii([
  'WWWWWWWWWWWWWWWWWWWW',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'W..................W',
  'WS#######....#####DW',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  traps: [
    { type: 'door_troll', moves: [{ x: 14 * 48, y: 10 * 48 }, { x: 16 * 48, y: 12 * 48 }], trigger: { type: 'proximity', distance: 120 } },
    { type: 'fake_floor', area: { x: 8 * 48, y: 12 * 48, w: 4 * 48, h: 48 }, tiles: [[8, 12], [9, 12], [10, 12], [11, 12]] }
  ]
};
