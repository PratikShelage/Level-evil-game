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
  'WS##..##..##..##.D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  traps: [
    { type: 'collapsing_floor', tiles: [t(4, 12), t(7, 12), t(10, 12), t(13, 12)], trigger: { type: 'step_on', telegraph: 220 } },
    { type: 'popup_spike', x: 9 * 48, y: 12 * 48, trigger: { type: 'reach_x', distance: 8 * 48, telegraph: 180 } },
    { type: 'falling_ceiling', x: 11 * 48, y: 1 * 48, w: 96, h: 30, trigger: { type: 'reach_x', distance: 10 * 48, telegraph: 200 } },
    { type: 'saw', from: { x: 15 * 48, y: 11.5 * 48 }, to: { x: 17 * 48, y: 11.5 * 48 }, speed: 2, radius: 15, trigger: { type: 'proximity', distance: 150 } }
  ]
};
