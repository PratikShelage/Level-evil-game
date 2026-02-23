import { fromAscii, t } from './levelUtils.js';

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
  'WS###..###..###..D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  gravityZones: [{ x: 6 * 48, y: 7 * 48, w: 3 * 48, h: 3 * 48 }],
  traps: [
    { type: 'collapsing_floor', tiles: [t(5, 12), t(6, 12), t(9, 12), t(10, 12), t(13, 12), t(14, 12)], trigger: { type: 'reach_x', distance: 4 * 48, telegraph: 250 } },
    { type: 'door_troll', moves: [{ x: 15 * 48, y: 10 * 48 }, { x: 12 * 48, y: 8 * 48 }, { x: 17 * 48, y: 12 * 48 }] },
    { type: 'saw', from: { x: 4 * 48, y: 11.5 * 48 }, to: { x: 16 * 48, y: 11.5 * 48 }, speed: 1.8, radius: 17, trigger: { type: 'reach_x', distance: 4 * 48 } },
    { type: 'teleport_spike' },
    { type: 'reverse_gravity', area: { x: 6 * 48, y: 7 * 48, w: 3 * 48, h: 3 * 48 } }
  ]
};
