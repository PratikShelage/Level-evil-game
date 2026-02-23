import { fromAscii, px } from './levelUtils.js';

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
  'W.........^^^^.....W',
  'WS########....###D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  traps: [
    { type: 'falling_ceiling', ...px(8, 1), w: 48 * 2, h: 32, trigger: { type: 'reach_x', distance: 7 * 48, telegraph: 220 } },
    { type: 'falling_ceiling', ...px(12, 1), w: 48 * 2, h: 32, trigger: { type: 'reach_x', distance: 11 * 48, telegraph: 220 } }
  ]
};
