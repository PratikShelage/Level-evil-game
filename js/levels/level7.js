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
  'WS###....####....D.W',
  'W##################W',
  'WWWWWWWWWWWWWWWWWWWW'
]);

export default {
  ...base,
  traps: [
    { type: 'saw', from: { x: 6 * 48, y: 11.5 * 48 }, to: { x: 9 * 48, y: 11.5 * 48 }, speed: 1.4, radius: 16, trigger: { type: 'proximity', distance: 180 } },
    { type: 'saw', from: { x: 12 * 48, y: 11.5 * 48 }, to: { x: 15 * 48, y: 11.5 * 48 }, speed: 2, radius: 16, trigger: { type: 'reach_x', distance: 10 * 48 } }
  ]
};
