import AnimationFrame from './AnimationFrame';

export default interface NodeAnimation {
  url: string;
  sample: number;
  speed: number;
  curves: {
    [key: string]: AnimationFrame[]
  };
}
