import Types from './interface/types';

/**
 * Collection of easing functions.
 */
const Easing: { [name: string]: Types.EaseFunction; } = {
  linear: (ratio: number): number => {
    return ratio;
  },
  quadOut: (ratio: number): number => {
    return ratio * (2 - ratio);
  }
}

export default Easing;
