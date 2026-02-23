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
  'WS#######....####D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  gravityZones: [{ x: 8 * 48, y: 8 * 48, w: 4 * 48, h: 4 * 48 }],
  traps: [
    { type: 'reverse_gravity', area: { x: 8 * 48, y: 8 * 48, w: 4 * 48, h: 4 * 48 } },
    { type: 'teleport_spike' }
  ]
};
