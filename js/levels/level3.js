import { fromAscii, t, px } from './levelUtils.js';

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
  traps: [
    { type: 'collapsing_floor', tiles: [t(8, 12), t(9, 12), t(10, 12), t(11, 12)], trigger: { type: 'step_on', telegraph: 280 } },
    { type: 'popup_spike', ...px(13, 12), trigger: { type: 'proximity', distance: 110, telegraph: 200 } },
    { type: 'popup_spike', ...px(14, 12), trigger: { type: 'proximity', distance: 110, telegraph: 200 } }
  ]
};
