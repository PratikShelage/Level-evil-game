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
  'W..................W',
  'WS#######^^^^###.D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  traps: [
    { type: 'moving_wall', ...px(5, 11), w: 48, h: 96, speed: 140, minX: 4 * 48, maxX: 10 * 48, trigger: { type: 'reach_x', distance: 5 * 48 } }
  ]
};
