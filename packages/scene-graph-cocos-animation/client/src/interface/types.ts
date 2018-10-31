declare namespace CocosAnimationClientTypes {
  type AnimationFrameProperty = {
    [key: string]: number;
  };

  type AnimationFrame = {
    frame: number;
    value: number | AnimationFrameProperty;
    curve?: number[] | string;
  };

  type AnimationCurveData = {
    keyFrames: AnimationFrame[]
  };

  type Animation = {
    url: string;
    sample: number;
    speed: number;
    curves: {
      [key: string]: AnimationCurveData;
    };
  };
}

export default CocosAnimationClientTypes;
