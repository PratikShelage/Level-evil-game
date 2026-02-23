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
  'WS##.##.##.##.##.D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  traps: [
    { type: 'collapsing_floor', tiles: [t(3, 12), t(6, 12), t(9, 12), t(12, 12), t(15, 12)], trigger: { type: 'step_on', telegraph: 240 } }
  ]
};
