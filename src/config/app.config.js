// symbols for fetching from data-sources
export const SYMBOLS = ['URTH', 'GOVT', 'GLD', 'NEIXCTAT'];

// 3 default portfolio simulations
export let DEFAULT_SIMS_OPTIONS = [
  { strategy: 'equalWeight' },
  { strategy: 'minimumVariance' },
  { weights: [0.6, 0.4, 0, 0] },
];

// refresh database at 1am
export const dbRefreshTime = '01:00:00';

export default {
  SYMBOLS,
  DEFAULT_SIMS_OPTIONS,
};
